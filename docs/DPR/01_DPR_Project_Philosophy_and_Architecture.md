# GovOS — Detailed Project Report (DPR)
## Part 1: Project Philosophy, Architecture & Microservices Analysis

**Document Version:** 1.0
**Date:** September 15, 2026
**Project:** GovOS — Multi-Tenant Civic Governance OS
**Analysis Scope:** Full codebase — govos-core-api, govos-realtime, govos-ai, govos-web, public-landing-page

---

## 1. PROJECT PHILOSOPHY

GovOS is designed as a **Web Operating System for Civic Governance** — not merely a complaint management tool, but a full digital infrastructure for elected representatives, administrators, field officers, and citizens to interact with municipal governance in real time.

### Three Core Pillars

| Pillar | Description |
|--------|-------------|
| **MTAS** (Multi-Tenant Architecture System) | Single platform for multiple municipalities. Zero data cross-contamination via PostgreSQL RLS |
| **Event-Driven Accountability** | Every action triggers an immutable audit event. No complaint silently closed, no bypass possible |
| **AI-Augmented Governance** | Classifies, prioritizes, routes, and escalates complaints autonomously via Gemini AI |

### Governance Role Hierarchy

SUPER_ADMIN → TENANT_ADMIN → DEPT_HEAD → OFFICER
TENANT_ADMIN → REP (MLA/Councillor)
CITIZEN (unauthenticated — public portal only)

### Hexagonal (Ports & Adapters) Architecture

`
PRESENTATION LAYER    (@RestController, DTOs)
APPLICATION LAYER     (@Service, @Transactional, Use Cases, Schedulers)
DOMAIN LAYER          (Pure Java - Zero Spring/JPA/framework dependencies)
INFRASTRUCTURE LAYER  (JPA adapters, Redis, MinIO, OpenSearch, Security)
`

### Multi-Tenancy Strategy
- Database-level isolation via PostgreSQL Row-Level Security (RLS)
- Every tenant-scoped table has tenant_id UUID NOT NULL
- Spring sets: SET LOCAL app.tenant_id = '{tenantId}' at every transaction start
- govos_admin DB role bypasses RLS for SUPER_ADMIN operations

---

## 2. MICROSERVICES INVENTORY

| Service | Language/Framework | Port | Completion |
|---------|-------------------|------|------------|
| govos-core-api | Java 21 / Spring Boot 3.3 | 8080 | ~65% |
| govos-realtime | TypeScript / NestJS | 3001 | ~20% |
| govos-ai | Python 3 / FastAPI | 8000 | ~40% |
| govos-web | React 18 / Vite | 5173 | ~10% |
| public-landing-page | Next.js 16 / React 18 | 3000 | ~60% |

---

## 3. govos-core-api — BACKEND ENGINE (~65%)

**Stack:** Java 21, Spring Boot 3.3, Spring Security 6, JPA/Hibernate, Flyway, Redis, MinIO, OpenSearch, Argon2id

### Domain Modules Status

| Domain | Status | Notes |
|--------|--------|-------|
| auth | COMPLETE | JWT, OTP/Redis, sessions, Argon2id |
| complaint | COMPLETE | 10 statuses, SLA, AI classification, full lifecycle |
| officer | PARTIAL | Profile entity done, full task execution partial |
| citizen | PARTIAL | Public submit + tracking done |
| admin | PARTIAL | Audit + user management partial |
| analytics | PARTIAL | Basic aggregations only |
| directive/MLA | PARTIAL | CRUD done, enforcement logic missing |
| asset | SCHEMA ONLY | Entity exists, no service layer |
| project | SCHEMA ONLY | Entity exists, no service layer |
| document/Peshi | SCHEMA ONLY | Schema done, no service |
| integration | SCHEMA ONLY | External hub schema, adapters missing |
| outbox | COMPLETE | Transactional Outbox pattern fully implemented |
| map | STUB | Controller declared, body empty |
| sla | COMPLETE | Watchdog scheduler, policy service, escalation |

### Flyway Migrations (All 19 Applied)

| Migration | Content | Status |
|-----------|---------|--------|
| V1-V5 | Extensions, Tenants, Geography, Users, RLS, Seed | DONE |
| V6 | Complaints table | DONE |
| V7 | Assets, Projects, Documents schema | DONE |
| V8-V9 | Role fixes, Audit logs | DONE |
| V10-V12 | Demo wards, Public fields, Officer resolution | DONE |
| V13 | SLA tracking + MLA Directives | DONE |
| V14 | Dharwad constituency seed | DONE |
| V15 | M5: Verification, Rework, Citizen confirmation | DONE |
| V16 | M6: Transactional Outbox | DONE |
| V17 | M7: SLA watchdog + policies | DONE |
| V18 | M8: External Integration Hub | DONE |
| V19 | M9: Assets, Projects, Peshi governance | DONE |

### Production Gaps
- No integration tests / test containers
- OpenSearch audit publishing — TODO (records go only to DB)
- OTP SMS delivery — mock mode only (console log)
- MinIO storage — partially stubbed
- Map controller — empty body
- Asset/Project service layers — missing
- No API rate limiting in Spring

---

## 4. govos-realtime — EVENT BUS (~20%)

**Stack:** TypeScript, NestJS, Socket.IO, Redis (ioredis)

**Architecture (designed):** Spring Boot -> Redis "govos:events" -> NestJS -> Socket.IO rooms + SMS/Email/WhatsApp/Push

### Implemented
- NestJS bootstrap with CORS
- Module structure declared (auth, gateway, health, notifications, redis)
- Redis module wired
- Health endpoint

### Critical Gaps (NOT implemented)
- Redis subscriber/consumer — notifications/channels/ directory is EMPTY
- Socket.IO gateway — NOT built
- SMS (MSG91), Email (SendGrid), WhatsApp (Twilio), Push (FCM) — NONE built
- JWT validation for WebSocket — NOT built
- Room management (tenant/ward/user isolation) — NOT built

---

## 5. govos-ai — INTELLIGENCE LAYER (~40%)

**Stack:** Python 3, FastAPI, Google GenAI (Gemini 1.5 Flash/Pro), GeoPandas, asyncpg

| Endpoint | Purpose | Status |
|----------|---------|--------|
| POST /api/classify | Category + priority classification | WORKING |
| POST /api/allocate | Officer allocation | PARTIAL (ward resolution TODO) |
| GET /api/geo/ward | GPS to ward resolution | SKELETON |
| AI chat, summarization, coaching | Advanced AI features | NOT IMPLEMENTED |

### Production Gaps
- Ward resolution (GeoPandas) — TODO marked in code as "Sprint 4"
- AI chat, document summarization, ward narrative — not implemented
- No auth middleware on FastAPI
- asyncpg DB pool not set up

---

## 6. govos-web — WEB OS SHELL (~10%)

**Stack:** React 18, TypeScript, Vite, Zustand, TanStack Query, Socket.IO client

> IMPORTANT: This is NOT the active frontend. All 12 feature module directories (complaints, officers, citizens, assets, projects, documents, analytics, notifications, admin, map, auth, dashboard) contain only directory stubs — no pages, no components. The active functional frontend is public-landing-page.

---

## 7. public-landing-page — ACTIVE FRONTEND (~60%)

**Stack:** Next.js 16.2.9, TypeScript, Tailwind CSS, Framer Motion, Mapbox GL, Recharts, Cloudinary, next-intl (EN+KN)

| Portal | Route | Completion |
|--------|-------|------------|
| Public Landing Page | / | ~85% |
| Citizen Portal | /citizen/ | ~55% |
| Officer Portal | /officer/ | ~50% |
| MLA Portal | /mla/ | ~45% |
| Admin Portal | /admin/ | ~60% |
| SuperAdmin Portal | /superadmin/ | ~50% |
| Constituency | /constituency/ | ~20% |

---

## 8. DATABASE: 20 TABLES ACROSS 6 DOMAINS

| Table | Domain | RLS | Status |
|-------|--------|-----|--------|
| tenants | Multi-tenancy | No | Complete |
| constituencies | Geography | Yes | Complete |
| wards | Geography | Yes | Complete |
| departments | Org | Yes | Complete |
| roles | RBAC | No | Complete |
| users | Identity | Yes | Complete |
| user_roles | RBAC | Yes | Complete |
| sessions | Auth | Yes | Complete |
| otp_attempts | Auth | No | Complete |
| complaints | Core | Yes | Complete (9 migrations) |
| civic_assets | Infrastructure | Yes | Schema only |
| civic_projects | Infrastructure | Yes | Schema only |
| documents | Peshi | Yes | Schema only |
| document_movements | Peshi | Yes | Schema only |
| mla_directives | Governance | Yes | Schema + basic CRUD |
| audit_logs | Compliance | Yes | Schema complete |
| outbox_events | Messaging | Yes | Complete |
| integration_configs | External | Yes | Schema only |
| integration_sync_records | External | Yes | Schema only |
| sla_policies | SLA | Yes | Complete + scheduler |

---

## 9. SECURITY ARCHITECTURE

| Layer | Technology | Status |
|-------|-----------|--------|
| L1 | Nginx rate limiting | Defined, not deployed |
| L2 | Spring Security 6 — JWT, @PreAuthorize RBAC | WORKING |
| L3 | Application — tenant ID cross-check | WORKING |
| L4 | PostgreSQL RLS — mathematical isolation | WORKING |

**JWT:** 15-min access token, 7-day refresh, claims: sub/tid/rid/wid
**Password:** Argon2id (memory=65536, iter=3, parallelism=4)
**OTP:** Redis-backed, 6-digit, 5 max attempts, mock master OTP "123456" in dev

**Missing:** TOTP/MFA logic, Aadhaar verification flow, full account lockout, Nginx production hardening

---

## 10. MILESTONE COMPLETION MAP

| Milestone | Backend | DB | Frontend | Status |
|-----------|---------|-----|----------|--------|
| M1: Foundation + Auth | DONE | V1-V5 | Login pages | DONE |
| M2: Complaint Lifecycle | DONE | V6,V11,V12 | Partial | PARTIAL |
| M3: Officer Execution | DONE | V12 | Partial | PARTIAL |
| M4: AI Classification | PARTIAL | — | Not built | PARTIAL |
| M5: Verification + Rework | DONE | V15 | Partial | PARTIAL |
| M6: Transactional Outbox | DONE | V16 | N/A | DONE |
| M7: SLA Watchdog | DONE | V17 | Not built | PARTIAL |
| M8: Integration Hub | Schema only | V18 | Not built | SCHEMA |
| M9: Assets + Peshi | Schema only | V19 | Not built | SCHEMA |
| M10: Real-Time WebSocket | Outbox ready | — | Client stub | NOT BUILT |
| M11: Analytics | Basic | — | Basic charts | PARTIAL |
| M12: i18n | N/A | — | EN + Kannada | PARTIAL |
| M13: govos-web OS Shell | N/A | — | Stubs only | NOT BUILT |
| M14: Kubernetes + Deploy | Docker only | — | Not started | NOT STARTED |

---

## 11. OVERALL PRODUCTION READINESS

| Layer | Completion | Key Gap |
|-------|-----------|---------|
| Database Schema | 90% | Integration adapters, analytics tables |
| Core API Backend | 65% | Asset/Project/Doc service layers, OpenSearch, OTP delivery |
| AI Service | 40% | Ward geo-resolution, allocation, AI chat |
| Realtime Service | 20% | Entire WebSocket + notification delivery stack |
| Public Frontend | 60% | Officer task flow, SLA UI, asset/project UI |
| Web OS Frontend | 10% | All 12 feature modules are stubs |
| Infrastructure/DevOps | 25% | No K8s, no CI/CD pipeline |

**Overall Production Readiness: ~45%**
