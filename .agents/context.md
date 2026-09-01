# GovOS — Global Project Context
# Read by ALL agents before any code generation task

---

## What Is GovOS?

GovOS is a **Multi-Tenant Civic Governance Operating System** (MTAS). It is deployed as a SaaS platform serving hundreds of independent government bodies (municipalities, panchayats, town corporations, urban local bodies). Each government body is a **tenant** — completely data-isolated from all others.

**Built by:** Prajna Labs × Cascade Technologies Solutions
**Version:** v1.0 MTAS
**Status:** Active Development

---

## Core Invariants — NEVER Violate These

1. **Tenant isolation is absolute.** No query should ever return data from a different tenant. `tenant_id` filters are mandatory on every database query in the backend.

2. **Nothing is hard deleted.** Every entity uses soft delete: `is_deleted = true`, `deleted_at = timestamp`. Queries always filter `WHERE is_deleted = false`.

3. **Everything is auditable.** Every CUD (Create/Update/Delete) operation generates an immutable audit log entry in OpenSearch. The audit service is called within the same transaction.

4. **JWT is the trust boundary.** The JWT token contains `tenant_id`, `user_id`, `role_id`, and optionally `ward_id`. ALL authorization decisions start with extracting these claims. A Tenant Admin can only manage their own tenant.

5. **Real-time via WebSocket, not polling.** The frontend NEVER polls for updates. It subscribes to Socket.IO rooms and reacts to events. HTTP is for CRUD. WebSocket is for live state.

6. **AI is read-only.** The AI Governance Assistant can query data but NEVER mutates it. All AI function tools are read-only operations.

---

## Service Communication Map

```
[govos-web (React)]
    │── HTTP/REST ──────────────────→ [govos-core-api (Spring Boot :8080)]
    │── WebSocket ──────────────────→ [govos-realtime (NestJS :3001)]
    │── HTTP/REST ──────────────────→ [govos-ai (FastAPI :8000)]

[govos-core-api (Spring Boot)]
    │── PostgreSQL :5432
    │── Redis :6379 ─────(publish events)──→ [govos-realtime]
    │── MinIO :9000
    │── OpenSearch :9200 (audit logs)
    │── HTTP ──(internal)─────────────────→ [govos-ai :8000]

[govos-realtime (NestJS)]
    │── Redis :6379 ─────(subscribe events)
    │── PostgreSQL :5432 (notification templates, delivery logs)
    │── MSG91, SendGrid, Twilio, FCM (external APIs)

[govos-ai (FastAPI)]
    │── PostgreSQL :5432 (read-only via asyncpg)
    │── Redis :6379 ─────(publish SLA alerts)
    │── Google Vertex AI (Gemini API)
    │── OpenSearch :9200 (document search)
    │── MinIO :9000 (document retrieval for summarization)
```

---

## Repository Topology

This root repo (`GovOS/`) is the **orchestration repository**. It contains:
- Infrastructure (Docker Compose, Nginx)
- Architecture documentation
- CI/CD pipeline definitions
- Agent configuration (this `.agents/` directory)

Each service is a **separate GitHub repository** with its own commit history:

| Service | Repo | Language | Port |
|---------|------|----------|------|
| Core API | `govos-core-api` | Java / Spring Boot | 8080 |
| Realtime | `govos-realtime` | TypeScript / NestJS | 3001 |
| AI Service | `govos-ai` | Python / FastAPI | 8000 |
| Frontend | `govos-web` | TypeScript / React | 5173 |

**Within this root repo**, each service directory (`govos-core-api/`, `govos-realtime/`, `govos-ai/`, `govos-web/`) contains the full service code. They are pushed separately as independent GitHub repos.

---

## Data Model Overview

### Core Tables (PostgreSQL — govos-core-api)
```sql
tenants          -- Root tenant entity (municipality/panchayat)
constituencies   -- Geopolitical division (belongs to tenant)
wards            -- Sub-unit of constituency, has GeoJSON boundary
departments      -- Functional unit (Public Works, Water, Sanitation...)
roles            -- SUPER_ADMIN, TENANT_ADMIN, DEPT_HEAD, OFFICER, CITIZEN, REP
users            -- All humans in the system (officers + citizens)
user_roles       -- Many-to-many user ↔ role assignment

complaints       -- Core complaint entity (CMP-{TENANT}-{YYYYMM}-{SEQ})
complaint_timeline -- Every status change, comment, assignment, escalation
complaint_attachments -- Photos, videos, documents (MinIO object keys)

citizens         -- Citizen profiles with Aadhaar hash identity
organizations    -- Civic organizations / NGOs
volunteers       -- Individual volunteers
citizen_groups   -- Community groups

assets           -- Physical infrastructure (streetlights, roads, parks...)
asset_maintenance-- Maintenance records per asset

projects         -- Municipal development projects
milestones       -- Project sub-goals with completion %
project_updates  -- Photo/document updates per milestone
contractors      -- Contractor profiles linked to projects

inward_register  -- Incoming documents (numbered inward)
outward_register -- Dispatched documents (numbered outward)
document_movements -- Peshi (file movement) tracking
```

### Notification Tables (PostgreSQL — govos-realtime)
```sql
notification_templates  -- Channel-specific templates with variables
notifications           -- Per-user notification records
notification_delivery   -- Delivery attempts, provider responses
broadcast_campaigns     -- Mass broadcast jobs
```

### Indexes (OpenSearch)
```
govos-audit-{YYYY-MM}   -- Immutable audit log (monthly rollover)
govos-documents         -- Full-text document content
govos-ai-summaries      -- AI-generated ward/project summaries
```

---

## Complaint Lifecycle

```
NEW ──→ ASSIGNED ──→ IN_PROGRESS ──→ RESOLVED ──→ CLOSED
                          │
                          └──→ REOPENED ──→ IN_PROGRESS (cycle)
```

- **NEW:** Filed by citizen or officer-assist. GPS coordinates resolved to ward by Python AI service.
- **ASSIGNED:** Python Allocation Engine assigns to optimal officer. SMS + WebSocket notification sent.
- **IN_PROGRESS:** Officer acknowledges and begins work.
- **RESOLVED:** Officer marks as resolved. Citizen notified via SMS/WhatsApp.
- **CLOSED:** Auto-closed 72 hours after RESOLVED if citizen does not reopen.
- **REOPENED:** Citizen rejects resolution. Priority upgraded. Supervisor notified.

---

## SLA Configuration

SLA deadlines are calculated per complaint as: `filed_at + department_sla_hours[priority]`

| Priority | SLA (default) |
|----------|---------------|
| CRITICAL | 4 hours |
| HIGH | 24 hours |
| MEDIUM | 72 hours |
| LOW | 168 hours (7 days) |

SLA breach flow:
1. Python AI service detects approach (75% elapsed) → publishes `sla:warning` to Redis
2. NestJS consumes → dispatches SMS + WebSocket alert to officer + supervisor
3. Python AI service detects breach (100% elapsed) → publishes `sla:breach` to Redis
4. NestJS consumes → dispatches urgent multi-channel alert + escalation

---

## Security Architecture

- **Auth:** Phone OTP (primary) via MSG91, Email+password (secondary) — Argon2id
- **MFA:** TOTP (Google Authenticator) — optional per tenant
- **JWT:** Access token 15min, Refresh token 7-day rotation, Redis blacklist on logout
- **RBAC:** Spring Security 6 `@PreAuthorize` annotations + PostgreSQL Row-Level Security
- **Inter-service:** Shared `INTERNAL_SERVICE_KEY` header, validated before processing
- **File access:** MinIO presigned URLs (time-limited), never streamed through app server

---

## AI Capabilities

| Capability | Trigger | Model |
|-----------|---------|-------|
| Complaint classification | On complaint creation | gemini-1.5-flash |
| Duplicate detection | On complaint creation | gemini-1.5-flash |
| Complaint chat | Officer/Admin chat UI | gemini-1.5-pro |
| Document summarization | On demand | gemini-1.5-pro |
| Ward daily summary | Scheduled (6am daily) | gemini-1.5-pro |
| Officer coaching | On demand, Admin view | gemini-1.5-pro |
| Asset risk assessment | On demand | gemini-1.5-flash |

---

## Development Philosophy

GovOS follows **Spec-Driven Development (SDD)**:
1. Before any feature is coded, an agent writes a spec document (schema, routes, behavior).
2. Human architect reviews and approves the spec.
3. Only then does implementation proceed.

**Never generate code that:**
- Violates tenant isolation
- Uses hard deletes
- Skips audit logging
- Exposes internal service credentials
- Stores JWT in localStorage
