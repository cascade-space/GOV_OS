# GovOS — Codebase Mind Map
## Domain → Files → Architecture Layer Reference

**Purpose:** Developer quick-reference to navigate the codebase by domain.
**Architecture Pattern:** Hexagonal (Ports & Adapters) — 4 layers per service.

---

## LAYER LEGEND

| Symbol | Layer | Location Pattern | Rules |
|--------|-------|-----------------|-------|
| [DOM] | Domain | domain/{domainName}/ | Pure Java, ZERO Spring/JPA dependencies |
| [APP] | Application | application/{domainName}/ | @Service, @Transactional, orchestrates domain |
| [INF] | Infrastructure | infrastructure/persistence/{domainName}/ | JPA adapters, Redis, MinIO |
| [PRE] | Presentation | presentation/{domainName}/ | @RestController, DTOs, filters |

---

## SERVICE 1: govos-core-api (Spring Boot)
Root: src/main/java/com/govos/core/

### DOMAIN: auth
`
[DOM] domain/auth/
  ├── User.java              — User aggregate root (id, tenantId, email, phone, roles, wardId, deptId)
  ├── UserRepository.java    — Port (interface): findByEmail, findByPhone, findByTenantId
  ├── Tenant.java            — Tenant aggregate (id, name, code, subdomain, locale, mfaRequired)
  ├── Session.java           — JWT session entity (userId, refreshTokenHash, expiresAt)
  └── Role.java              — Role entity (code: SUPER_ADMIN, TENANT_ADMIN, DEPT_HEAD, OFFICER, REP, CITIZEN)

[APP] application/auth/
  ├── AuthService.java       — Login, OTP send/verify, JWT generation, token refresh, logout
  ├── OtpService.java        — Redis OTP storage, validation, TTL, attempt counter
  └── dto/AuthDtos.java      — LoginRequest, OtpSendRequest, OtpVerifyRequest, JwtResponse, UserProfileDto

[INF] infrastructure/persistence/auth/
  ├── JpaUser.java           — @Entity mapping for users table
  ├── JpaUserRepositoryImpl.java — Adapter implementing UserRepository port
  ├── SpringDataUserRepository.java — JPA Spring Data interface
  ├── TenantJpaRepository.java — findBySubdomain, findByCode
  └── SessionJpaRepository.java — findByUserIdAndRevokedFalse, deleteExpired

[INF] infrastructure/security/
  ├── SecurityConfig.java    — Spring Security 6 filterChain, permitAll for public routes
  ├── JwtService.java        — JWT sign, parse, validate (jjwt 0.12.6)
  ├── Argon2PasswordEncoder.java — Argon2id (memory=65536, iter=3, parallel=4)
  └── RlsAspect.java         — @Around @Transactional: SET LOCAL app.tenant_id per transaction

[PRE] presentation/auth/
  ├── AuthController.java    — /api/v1/auth/** (login, otp/send, otp/verify, refresh, logout)
  └── JwtAuthFilter.java     — OncePerRequestFilter, JWT parse → SecurityContext + RLS context
`

### DOMAIN: complaint
`
[DOM] domain/complaint/
  ├── Complaint.java         — Core aggregate root (ALL business state, 40+ fields)
  │     Methods: assignTo(), startWork(), completeWork(), verifyAndClose(),
  │              requestRework(), reopenByCitizen(), markSlaWarning(), markSlaBreached(),
  │              escalateToLevel2(), autoClose(), escalateToLevel2()
  ├── ComplaintRepository.java — Port interface: save, findById, findByTenantId,
  │                              findByComplaintNumber, findByStatus, findByAssignedToId,
  │                              findByReporterMobile, findByStatusIn
  └── ComplaintStatus.java   — Enum: NEW, ASSIGNED, IN_PROGRESS, VERIFICATION_PENDING,
                               RESOLVED, CLOSED, REWORK_REQUIRED, REOPENED, DUPLICATE, CANCELLED

[APP] application/complaint/
  ├── ComplaintService.java  — createComplaint, assignComplaint, startWork, completeWork,
  │                           verifyAndClose, requestRework, confirmResolution, reopenByCitizen,
  │                           autoClose, listByTenant, listAssignedToOfficer
  ├── SlaScheduler.java      — @Scheduled(fixedDelay=60s): SLA watchdog, distributed Redis lock,
  │                           warning at 75%, breach L1, escalation L2, auto-close at 72h post-resolve
  └── (TODO: ComplaintNumberGenerator — inline in ComplaintService currently)

[INF] infrastructure/persistence/complaint/
  ├── JpaComplaint.java      — @Entity mapping for complaints table (40+ columns)
  ├── JpaComplaintRepositoryImpl.java — Adapter implementing ComplaintRepository port
  └── SpringDataComplaintRepository.java — JPA Spring Data (findByTenantId, findByStatus, etc.)

[PRE] presentation/complaint/
  ├── ComplaintController.java      — /api/v1/complaints (POST, GET, assign, start, complete,
  │                                   verify, rework, status update)
  ├── PublicComplaintController.java — /api/v1/public/complaints (no auth: submit, track,
  │                                   rate, reopen, by-mobile)
  └── ComplaintDtos.java            — CreateComplaintRequest, AssignComplaintRequest,
                                     CompleteWorkRequest, RequestReworkRequest, VerifyCloseRequest
`

### DOMAIN: sla
`
[DOM] domain/sla/ (or inline in complaint domain)
  └── SlaPolicy.java         — sla_policies table entity (tenantId, category, priority,
                               resolutionHours, escalationL1Hours, escalationL2Hours)

[APP] application/sla/
  └── SlaPolicyService.java  — resolveTarget(tenantId, category, priority) → SLA hours
                               (reads from sla_policies or defaults)

[INF] — uses JPA directly (no separate repository adapter)
`

### DOMAIN: outbox
`
[APP] application/outbox/
  └── OutboxService.java     — recordEvent(tenantId, eventType, aggregateType, aggregateId, payload)
                               Atomically writes to outbox_events within the same @Transactional

[INF] infrastructure/outbox/
  └── OutboxEventListener.java — Polls PENDING outbox events → publishes to Redis "govos:events"
                                 Marks as PUBLISHED or FAILED with retry
`

### DOMAIN: admin
`
[APP] application/admin/
  └── AuditService.java      — record(tenantId, actorId, actorType, action, entityType,
                               entityId, entityName, changesJson) → DB + (TODO: OpenSearch)

[INF] infrastructure/persistence/admin/
  ├── AuditLog.java          — @Entity audit_logs table
  └── SpringDataAuditLogRepository.java — findByTenantIdOrderByCreatedAtDesc

[PRE] presentation/admin/
  └── AdminController.java   — /api/v1/admin/** (GET audit, GET users, GET tenant config)
`

### DOMAIN: directive
`
[DOM] domain/directive/
  └── MlaDirective.java      — Entity (tenantId, complaintId, mlaName, constituency,
                               directiveType, instructionNotes, status)

[APP] application/directive/
  └── MlaDirectiveService.java — issueDirective, listByTenant, listByComplaint,
                                 listByConstituency, updateStatus

[PRE] presentation/directive/
  └── MlaDirectiveController.java — /api/v1/mla/directives
`

### DOMAIN: asset (SCHEMA ONLY — Service Layer Missing)
`
[DOM] domain/asset/
  └── CivicAsset.java        — Entity (tenantId, assetId, name, category, status, wardId,
                               deptId, installDate, manufacturer, cost, specifications JSONB)

[INF] infrastructure/persistence/asset/
  └── AssetRepository.java   — Port interface (DECLARED, no impl)

MISSING: AssetService.java, AssetController.java
`

### DOMAIN: project (SCHEMA ONLY)
`
[DOM] domain/project/
  └── CivicProject.java      — Entity (tenantId, title, status, budget, spent,
                               completionPct, sector, contractor, wardId)

MISSING: ProjectService.java, ProjectController.java
`

### DOMAIN: document/Peshi (SCHEMA ONLY)
`
[DOM] domain/document/ (if exists)
  └── Document.java          — Entity (documentNumber, title, type, status, currentDesk,
                               directiveId, complaintId, attachmentUrl, nextHearingDate)

MISSING: DocumentService.java, DocumentController.java, MovementService.java
`

---

## SERVICE 2: govos-realtime (NestJS)
Root: src/

`
[Bootstrap] main.ts              — NestFactory, CORS (localhost:5173, :3000), port 3001
[App] app.module.ts              — Imports: AuthModule, GatewayModule, HealthModule,
                                   NotificationsModule, RedisModule
[Redis] modules/redis/           — RedisModule (ioredis client setup)
[Health] modules/health/         — GET /health endpoint

[EMPTY] modules/notifications/channels/  ← CRITICAL GAP — nothing implemented
[EMPTY] modules/gateway/                 ← Socket.IO gateway NOT implemented
[EMPTY] modules/auth/                    ← JWT WebSocket auth NOT implemented
`

Key gap: Spring Boot writes outbox events to Redis "govos:events" channel.
NestJS has no subscriber listening to that channel. Events are lost.

---

## SERVICE 3: govos-ai (FastAPI)
Root: app/

`
[Entry] main.py              — FastAPI app, CORS, routers mounted
[Config] config.py           — Settings: GEMINI_API_KEY, DB_URL (asyncpg)
[Models] models/
  ├── classification.py      — ClassificationRequest, ClassificationResult (Pydantic)
  └── allocation.py          — AllocationRequest, AllocationResult (Pydantic)

[Services] services/
  ├── classify_service.py    — classify_complaint_text(): Gemini 1.5 Flash with structured
  │                           JSON output schema → {category, priority, confidence}
  │                           Fallback mode if API key not set
  └── allocation_service.py  — allocate_officer(): reads from DB, matches ward
                               TODO: ward_id resolution via GeoPandas (Sprint 4)

[Routers] routers/
  ├── classify.py            — POST /api/classify
  ├── allocate.py            — POST /api/allocate
  └── geo.py                 — GET /api/geo/ward (GPS → ward) [SKELETON]
`

---

## SERVICE 4: public-landing-page (Next.js 16)
Root: src/

`
[App Router] app/
  ├── layout.tsx             — Root layout (fonts, providers, Navbar)
  ├── page.tsx               — Public landing: Hero, Stats, HowItWorks, Categories, Testimonials
  │
  ├── citizen/               — Citizen Portal
  │   ├── report/page.tsx    — Complaint submission form (Cloudinary, Mapbox, react-hook-form)
  │   ├── track/page.tsx     — Track by complaint number / mobile
  │   ├── dashboard/page.tsx — Citizen dashboard (after login)
  │   └── login/page.tsx     — OTP login
  │
  ├── officer/               — Officer Portal
  │   ├── login/page.tsx     — OTP login
  │   ├── dashboard/page.tsx — Task list + stat cards + Mapbox
  │   ├── tasks/[id]/page.tsx — Task detail + Start/Complete/Rework actions
  │   └── history/page.tsx   — Completed task history
  │
  ├── mla/                   — MLA Portal
  │   ├── dashboard/page.tsx — Constituency heatmap + stats + directives
  │   ├── issues/page.tsx    — Complaint list filtered by constituency
  │   ├── issues/[id]/page.tsx — Issue detail + Issue Directive modal
  │   └── directives/page.tsx — Active directives list
  │
  ├── admin/                 — Admin Portal
  │   ├── login/page.tsx     — Email/OTP login
  │   ├── dashboard/page.tsx — Full stats + assignment queue + charts (Recharts)
  │   ├── complaints/page.tsx — Complaint table + filters + assign modal + verify/rework
  │   ├── analytics/page.tsx — Charts: status pie, category bar, volume line
  │   ├── officers/page.tsx  — Officer list (CRUD partial)
  │   └── settings/page.tsx  — Tenant config
  │
  ├── superadmin/            — SuperAdmin Portal
  │   ├── dashboard/page.tsx — Platform stats
  │   ├── complaints/page.tsx — Cross-tenant complaints
  │   ├── constituencies/page.tsx — Constituency management
  │   └── analytics/page.tsx — Platform analytics
  │
  └── constituency/          — Public constituency page (read-only)

[Lib] lib/
  ├── api-client.ts          — Axios instance, JWT attach, base URL config
  ├── constants.ts           — Status labels, category icons, priority colors (EN+KN)
  ├── realtime.ts            — Socket.IO client setup (connection stub — not live)
  ├── store.ts               — Zustand: auth store (user, token, isLoggedIn)
  ├── utils.ts               — formatDate, formatComplaintNumber, getSlaColor, etc.
  └── services/              — API call functions per domain (complaintsService, authService)

[Contexts] contexts/
  └── LanguageContext.tsx    — EN/KN toggle, t() translation function, useLanguage hook

[Components] components/
  ├── layout/PublicNavbar.tsx   — Top nav with language toggle + portal links
  ├── layout/PublicFooter.tsx   — Footer with social + navigation
  └── [domain-specific]         — Modals, cards, charts per feature
`

---

## DATABASE MIND MAP: Tables → Domain → RLS

`
tenants ──────────────────────── [AUTH] ─── No RLS (global lookup)
constituencies ────────────────── [GEO] ─── RLS: tenant_id
wards ─────────────────────────── [GEO] ─── RLS: tenant_id
departments ───────────────────── [ORG] ─── RLS: tenant_id
roles ─────────────────────────── [RBAC] ── No RLS (global)
users ─────────────────────────── [AUTH] ── RLS: tenant_id
user_roles ────────────────────── [RBAC] ── RLS: tenant_id
sessions ──────────────────────── [AUTH] ── RLS: tenant_id
otp_attempts ──────────────────── [AUTH] ── No RLS (phone-scoped)
complaints ────────────────────── [CORE] ── RLS: tenant_id ← Central table
mla_directives ────────────────── [GOV] ─── RLS: tenant_id
audit_logs ────────────────────── [AUDIT] ─ RLS: tenant_id
outbox_events ─────────────────── [MSGS] ── RLS: tenant_id
sla_policies ──────────────────── [SLA] ─── RLS: tenant_id
civic_assets ──────────────────── [ASSET] ─ RLS: tenant_id (Schema only)
civic_projects ────────────────── [PROJ] ── RLS: tenant_id (Schema only)
documents ─────────────────────── [PESHI] ─ RLS: tenant_id (Schema only)
document_movements ────────────── [PESHI] ─ RLS: tenant_id (Schema only)
integration_configs ───────────── [INTEG] ─ RLS: tenant_id (Schema only)
integration_sync_records ──────── [INTEG] ─ RLS: tenant_id (Schema only)
`

---

## GOVOS-WEB (React/Vite) — STUB DIRECTORY MAP

`
src/
  features/           ← ALL DIRECTORIES ARE EMPTY STUBS
    ├── admin/        ← No files
    ├── analytics/    ← No files
    ├── assets/       ← No files
    ├── auth/         ← No files
    ├── citizens/     ← No files
    ├── complaints/   ← No files
    ├── dashboard/    ← No files
    ├── documents/    ← No files
    ├── map/          ← No files
    ├── notifications/← No files
    ├── officers/     ← No files
    └── projects/     ← No files
`
govos-web is the PLANNED Web OS shell (browser-OS experience).
It has not been built. All development is in public-landing-page.
