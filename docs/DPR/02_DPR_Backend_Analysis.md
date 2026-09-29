# GovOS — Detailed Project Report (DPR)
## Part 2: Backend Analysis — APIs, CRUD Operations, Service Layers

**Date:** September 15, 2026

---

## 1. COMPLAINT DOMAIN — FULLY IMPLEMENTED

### Complaint Lifecycle (10 Statuses)

`
NEW -> ASSIGNED -> IN_PROGRESS -> VERIFICATION_PENDING -> RESOLVED -> CLOSED
                                                        -> REWORK_REQUIRED -> IN_PROGRESS
RESOLVED -> REOPENED -> IN_PROGRESS
CLOSED (auto-close after 72h if citizen doesn't contest)
DUPLICATE (detected by AI)
`

### Complaint Entity Fields (complaints table — 40+ columns)

| Category | Fields |
|----------|--------|
| Core | id, complaint_number (CMP-{TENANT}-{YYYYMM}-{SEQ}), tenant_id, reporter_id |
| Content | title, description, category, sub_category |
| Priority/Status | priority (LOW/MEDIUM/HIGH/CRITICAL), status (10 values) |
| Location | latitude, longitude, location_address, ward_id |
| Assignment | assigned_to_id, ai_assessed_at |
| Public Portal | reporter_name, reporter_mobile, source (INTERNAL/PUBLIC) |
| Officer Resolution | resolution_notes, resolution_evidence_url, work_started_at, work_completed_at |
| Verification | resolution_latitude, resolution_longitude, distance_deviation_meters |
| Citizen Feedback | citizen_rating (1-5), citizen_feedback, rework_reason, rework_count |
| Auto-Close | resolved_at, auto_close_at |
| SLA | sla_deadline, sla_breached, sla_warning_sent, escalation_level |
| External Sync | external_system, external_ticket_id, integration_status, external_synced_at |
| Relations | asset_id (FK civic_assets), project_id (FK civic_projects) |
| Audit | created_at, updated_at, is_deleted |

### Complaint REST API Endpoints (ComplaintController + PublicComplaintController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | /api/v1/public/complaints | None | Submit complaint without account | COMPLETE |
| GET | /api/v1/public/complaints/{complaintNumber} | None | Track complaint by number | COMPLETE |
| POST | /api/v1/public/complaints/{number}/rate | None | Citizen rating + feedback | COMPLETE |
| GET | /api/v1/public/complaints/by-mobile/{mobile} | None | All complaints by mobile | COMPLETE |
| POST | /api/v1/public/complaints/{number}/reopen | None | Citizen reopen with reason | COMPLETE |
| POST | /api/v1/complaints | OFFICER/ADMIN | Create internal complaint | COMPLETE |
| GET | /api/v1/complaints | ADMIN | List all tenant complaints | COMPLETE |
| GET | /api/v1/complaints/{id} | OFFICER | Get complaint detail | COMPLETE |
| POST | /api/v1/complaints/{id}/assign | ADMIN | Assign to officer | COMPLETE |
| POST | /api/v1/complaints/{id}/start | OFFICER | Start work | COMPLETE |
| POST | /api/v1/complaints/{id}/complete | OFFICER | Complete work + evidence | COMPLETE |
| POST | /api/v1/complaints/{id}/verify | ADMIN | Verify resolution | COMPLETE |
| POST | /api/v1/complaints/{id}/rework | ADMIN | Request rework | COMPLETE |
| POST | /api/v1/complaints/{id}/status | ADMIN | Direct status update | COMPLETE |

### ComplaintService Methods (Business Logic — application layer)

| Method | Description |
|--------|-------------|
| createComplaint() | Creates complaint, calls AI for classification, generates number, records outbox event + audit |
| assignComplaint() | Assigns to officer, fires status_changed outbox event + audit |
| startWork() | Officer starts — sets work_started_at, status IN_PROGRESS |
| completeWork() | Officer completes — sets evidence URL, resolution GPS, computes distance deviation |
| verifyAndClose() | Admin verifies — status RESOLVED, sets auto_close_at (72h) |
| requestRework() | Admin requests rework — extends SLA deadline, increments rework_count |
| confirmResolution() | Citizen confirms — captures rating + feedback, status CLOSED |
| reopenByCitizen() | Citizen contests — REOPENED, priority bumped to HIGH, new 24h SLA |
| autoClose() | SLA scheduler triggers — CLOSED after 72h if no citizen contest |

### SLA Watchdog Scheduler (runs every 60 seconds)

| Check | Trigger Condition | Action |
|-------|------------------|--------|
| SLA Warning | 75% of SLA window elapsed | markSlaWarning(), fire warning event |
| SLA Breach L1 | Deadline passed | markSlaBreached(), escalation_level=1, fire breach event |
| SLA Breach L2 | 24h past deadline + L1 unresolved | escalateToLevel2(), priority=CRITICAL |
| Auto-Close | 72h past RESOLVED with no citizen contest | autoClose(), status=CLOSED |
| Rework Deadline | Officer exceeds rework SLA | Fire rework breach event |

Uses Redis distributed lock (50s TTL) to guarantee idempotency across multiple instances.

---

## 2. AUTHENTICATION DOMAIN — COMPLETE

### Auth REST API Endpoints (AuthController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | /api/v1/auth/login | None | Email/phone + password login | COMPLETE |
| POST | /api/v1/auth/otp/send | None | Send OTP to phone/email | COMPLETE |
| POST | /api/v1/auth/otp/verify | None | Verify OTP + return JWT | COMPLETE |
| POST | /api/v1/auth/refresh | Bearer | Refresh access token | COMPLETE |
| POST | /api/v1/auth/logout | Bearer | Revoke session | COMPLETE |

### OTP Service (Redis-backed)
- 6-digit random OTP stored in Redis with TTL
- Max 5 attempts before lockout
- Dev mock mode: master OTP "123456" accepted
- Real SMS delivery: TODO (not wired to MSG91)

### JWT Flow
- Access token: 15 minutes, signed HS256 with secret
- Refresh token: 7 days, stored hashed in sessions table
- JwtAuthFilter validates token + sets SecurityContext + triggers RLS aspect

### RLS Aspect
- RlsAspect intercepts every @Transactional method
- Sets SET LOCAL app.tenant_id = '{tenantId}' before any query
- Ensures PostgreSQL RLS policies activate for the duration of the transaction

---

## 3. OFFICER DOMAIN — PARTIAL

### Officer REST API (OfficerController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | /api/v1/officers/me/tasks | OFFICER | Get assigned complaints | COMPLETE |
| POST | /api/v1/officers/me/tasks/{id}/start | OFFICER | Start task | COMPLETE |
| POST | /api/v1/officers/me/tasks/{id}/complete | OFFICER | Submit completion | COMPLETE |
| GET | /api/v1/officers/{id}/profile | ADMIN | View officer profile | COMPLETE |
| GET | /api/v1/officers | ADMIN | List all officers in dept/tenant | PARTIAL |
| POST | /api/v1/officers | ADMIN | Create officer account | PARTIAL |
| PUT | /api/v1/officers/{id} | ADMIN | Update officer | MISSING |
| DELETE | /api/v1/officers/{id} | ADMIN | Deactivate officer | MISSING |

**Gap:** Full CRUD for officer management (create/update/deactivate) is incomplete.

---

## 4. ADMIN DOMAIN — PARTIAL

### Admin REST API (AdminController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | /api/v1/admin/users | TENANT_ADMIN | List all users in tenant | COMPLETE |
| POST | /api/v1/admin/users | TENANT_ADMIN | Create user | COMPLETE |
| POST | /api/v1/admin/users/{id}/roles | TENANT_ADMIN | Assign role | PARTIAL |
| GET | /api/v1/admin/departments | TENANT_ADMIN | List departments | COMPLETE |
| POST | /api/v1/admin/departments | TENANT_ADMIN | Create department | PARTIAL |
| PUT | /api/v1/admin/departments/{id} | TENANT_ADMIN | Update department | MISSING |
| DELETE | /api/v1/admin/departments/{id} | TENANT_ADMIN | Delete department | MISSING |

**Audit Service:** Records all CUD operations in audit_logs table. OpenSearch publishing is TODO.

---

## 5. MLA DIRECTIVES DOMAIN — PARTIAL

### Directive REST API (MlaDirectiveController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | /api/v1/directives | REP | Issue directive on a complaint | COMPLETE |
| GET | /api/v1/directives | REP/ADMIN | List directives for tenant | COMPLETE |
| GET | /api/v1/directives/{id} | REP/ADMIN | Get directive detail | COMPLETE |
| PUT | /api/v1/directives/{id}/status | ADMIN | Update directive status | COMPLETE |
| DELETE | /api/v1/directives/{id} | REP | Delete directive | PARTIAL |

**mla_directives table fields:** id, tenant_id, complaint_id (FK), mla_name, constituency, directive_type, instruction_notes, status (ACTIVE/COMPLETED/CANCELLED), created_at, is_deleted

**Gap:** Directive enforcement (auto-escalation when directive is issued, notifications to admin) is not implemented.

---

## 6. ANALYTICS DOMAIN — PARTIAL

### Analytics REST API (AnalyticsController)

| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | /api/v1/analytics/summary | ADMIN | Tenant-level summary stats | PARTIAL |
| GET | /api/v1/analytics/complaints/by-status | ADMIN | Complaints grouped by status | PARTIAL |
| GET | /api/v1/analytics/complaints/by-category | ADMIN | Complaints grouped by category | PARTIAL |
| GET | /api/v1/analytics/sla | ADMIN | SLA compliance metrics | MISSING |
| GET | /api/v1/analytics/officers/performance | ADMIN | Officer-level performance | MISSING |
| GET | /api/v1/analytics/wards | ADMIN | Ward-level heatmap data | MISSING |
| GET | /api/v1/analytics/time-series | ADMIN | Time-series complaint volumes | MISSING |

---

## 7. ASSET/PROJECT/DOCUMENT DOMAINS — SCHEMA ONLY

### civic_assets Table (V7 + V19)

| Field | Type | Note |
|-------|------|------|
| id | UUID | PK |
| tenant_id | UUID | FK tenants |
| asset_id | VARCHAR(50) | Human-readable ID |
| name | VARCHAR(200) | Asset name |
| category | VARCHAR(50) | VEHICLE, BUILDING, STREETLIGHT |
| status | VARCHAR(50) | ACTIVE, MAINTENANCE, DECOMMISSIONED |
| latitude/longitude | DOUBLE | GPS location |
| ward_id | UUID | FK wards (V19) |
| department_id | UUID | FK departments (V19) |
| installation_date | DATE | V19 |
| manufacturer | VARCHAR(100) | V19 |
| cost | DOUBLE | V19 |
| specifications | JSONB | V19 |
| next_maintenance_date | DATE | — |

**Status:** Schema complete. CivicAsset.java domain entity exists. AssetRepository.java exists.
**Missing:** AssetService, AssetController — no REST API endpoints for assets.

### civic_projects Table (V7 + V19)

| Field | Type | Note |
|-------|------|------|
| id | UUID | PK |
| project_id | VARCHAR(50) | Human-readable ID |
| title | VARCHAR(255) | — |
| status | VARCHAR(50) | PLANNING, IN_PROGRESS, DELAYED, COMPLETED |
| budget/spent | DOUBLE | Financial tracking |
| start_date/estimated_end_date | DATE | — |
| completion_percentage | INTEGER | 0-100 |
| ward_id, department_id | UUID | V19 |
| contractor_name | VARCHAR | V19 |
| sector | VARCHAR(50) | INFRASTRUCTURE (V19) |

**Missing:** ProjectService, ProjectController — no REST API endpoints for projects.

### documents Table (V7 + V19) — Peshi/File Management

| Field | Type | Note |
|-------|------|------|
| document_number | VARCHAR(50) | — |
| title | VARCHAR(255) | — |
| type | VARCHAR(50) | LETTER, NOTICE, INTERNAL_MEMO, TENDER |
| status | VARCHAR(50) | DRAFT, IN_TRANSIT, DELIVERED, ARCHIVED |
| current_desk | VARCHAR(255) | Who has the file |
| directive_id | UUID | FK mla_directives (V19) |
| complaint_id | UUID | FK complaints (V19) |
| attachment_url | TEXT | Cloud storage URL |
| next_hearing_date | TIMESTAMPTZ | V19 |
| hearing_summary | TEXT | V19 |

**document_movements Table:** Full custody audit ledger — from_desk, to_desk, dispatched_at, received_at, dispatch_notes.
**Missing:** DocumentService, DocumentController — no REST API for document management.

---

## 8. EXTERNAL INTEGRATION HUB — SCHEMA ONLY

### Tables (V18)
- **integration_configs:** tenant_id, external_system, webhook_url, webhook_secret, sync_categories, auto_sync_on_create
- **integration_sync_records:** complaint_id, external_system, direction (OUTBOUND/INBOUND), event_type, external_ticket_id, status (PENDING/SUCCESS/FAILED), request_payload (JSONB), response_payload (JSONB), retry_count

### Complaint External Fields (V18)
- external_system, external_ticket_id, integration_status (NONE/PENDING/SYNCED/FAILED), external_synced_at, last_external_status

**Domain Methods Implemented:**
- markExternalSyncSuccess(system, ticketId, status)
- markExternalSyncFailed(system, error)

**Missing:** IntegrationService, webhook receiver, retry mechanism, IntegrationController

---

## 9. TRANSACTIONAL OUTBOX — COMPLETE

### outbox_events Table (V16)
- id, tenant_id, event_type, aggregate_type, aggregate_id, payload (JSONB)
- status (PENDING/PUBLISHED/FAILED), retry_count, error_message, created_at, published_at

### OutboxService
- recordEvent(tenantId, eventType, aggregateType, aggregateId, payload) — called transactionally with every CRUD operation
- Guarantees at-least-once delivery even if Redis is temporarily down
- OutboxEventListener polls for PENDING events and publishes to Redis

**Used in:** complaint:created, complaint:status_changed, sla:warning, sla:breached, sla:auto_close, sla:level2_escalation

---

## 10. INFRASTRUCTURE LAYER SUMMARY

| Component | Technology | Status |
|-----------|-----------|--------|
| JPA/Hibernate | PostgreSQL + PostGIS | COMPLETE |
| Redis | Spring Data Redis + Lettuce | COMPLETE (OTP, locks, events) |
| Flyway | 19 migrations | COMPLETE |
| Security | JWT + Argon2id + RLS | COMPLETE |
| MinIO | Object storage | STUB (declared, not fully wired) |
| OpenSearch | Audit indexing | TODO (not wired) |
| Scheduling | @Scheduled SLA watchdog | COMPLETE |
| Outbox | TransactionalOutbox pattern | COMPLETE |

---

## 11. WHAT IS PENDING / WHAT NEEDS TO BE COMPLETED

### Critical Backend Work Remaining

| Priority | Item | Effort |
|----------|------|--------|
| HIGH | Asset CRUD: AssetService + AssetController | 2-3 days |
| HIGH | Project CRUD: ProjectService + ProjectController | 2-3 days |
| HIGH | Document/Peshi CRUD: DocumentService + DocumentController + custody tracking | 3-4 days |
| HIGH | Officer full CRUD: create/update/deactivate officers | 1-2 days |
| HIGH | Real OTP delivery: wire OtpService to NestJS realtime (SMS/Email) | 2 days |
| HIGH | Map/Ward boundary API: implement ward GeoJSON endpoint | 1 day |
| MEDIUM | Integration Hub service: IntegrationService + webhook receiver | 4-5 days |
| MEDIUM | OpenSearch audit publishing: AuditService -> OpenSearch | 2 days |
| MEDIUM | Advanced analytics: time-series, SLA compliance, officer performance, export | 3-4 days |
| MEDIUM | MinIO: complete StorageService for evidence photos | 1-2 days |
| MEDIUM | TOTP/MFA: implement authenticator app flow | 2 days |
| MEDIUM | Account lockout: complete enforcement logic | 1 day |
| LOW | Integration tests with TestContainers | 5+ days |
| LOW | API rate limiting in Spring (complement Nginx) | 1 day |
| LOW | Ward geospatial: wire GeoPandas AI service | 2-3 days |

### Critical Realtime Service Work Remaining

| Priority | Item | Effort |
|----------|------|--------|
| CRITICAL | Redis consumer: subscribe to govos:events | 1 day |
| CRITICAL | Socket.IO gateway: rooms (tenant/ward/user) | 2 days |
| CRITICAL | JWT validation for WebSocket connections | 1 day |
| HIGH | SMS via MSG91 | 2 days |
| HIGH | Email via SendGrid | 1 day |
| MEDIUM | WhatsApp via Twilio | 2 days |
| MEDIUM | Push via FCM | 2 days |
