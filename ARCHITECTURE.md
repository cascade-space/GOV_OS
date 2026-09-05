# GovOS Architecture — Living Document

---

## System Architecture Overview

GovOS is a **Web Operating System** for civic governance. It is architected as a polyglot microservices platform with strict multi-tenant data isolation, event-driven real-time communication, and AI-assisted governance capabilities.

---

## Service Boundaries

### 1. govos-core-api (Spring Boot — Hexagonal Architecture)

**Responsibility:** The primary transactional engine. Owns ALL data integrity, business rule enforcement, and CRUD operations.

**Why Spring Boot?**
- Robust Hibernate/JPA ecosystem for row-level security (RLS)
- Spring Security 6 for JWT + role-based access control
- Flyway for versioned, reproducible database migrations
- Mature enterprise patterns (Hexagonal Architecture, DI, AOP)

**Owns these domains:**
- Authentication & session management
- Multi-Tenant Architecture System (MTAS)
- Role-Based Access Control (RBAC)
- Complaints, Citizens, Assets, Projects, Officers, Documents
- Analytics aggregations
- Administration & tenant provisioning
- Audit framework (publishes to OpenSearch)

**Hexagonal Architecture Layers:**

```
domain/          ← Pure Java business rules (no Spring, no DB)
application/     ← Use cases, @Service, @Transactional
infrastructure/  ← DB adapters, MinIO, OpenSearch, Redis publishers
presentation/    ← @RestController, DTOs, request/response mapping
```

---

### 2. govos-realtime (NestJS — Event-Driven)

**Responsibility:** Real-time communication bus and multi-channel notification delivery.

**Why NestJS?**
- Node.js excels at I/O-bound, concurrent WebSocket connections
- Prevents blocking the transactional Spring Boot engine with I/O-heavy notification tasks
- Socket.IO provides battle-tested room management for tenant/ward/user scoping
- TypeScript ensures type safety across event payloads

**Event Flow:**
```
Spring Boot publishes to Redis → NestJS consumes → Socket.IO broadcast to rooms
                                                 → SMS via MSG91
                                                 → Email via SendGrid
                                                 → WhatsApp via Twilio
                                                 → Push via FCM
```

**WebSocket Room Hierarchy:**
```
tenant:{id}       ← All users in a municipality
ward:{id}         ← Officers assigned to a specific ward
user:{id}         ← Individual user notifications
```

---

### 3. govos-ai (Python FastAPI — Intelligence Layer)

**Responsibility:** AI-driven intelligence, geospatial analysis, and workload optimization.

**Why Python?**
- Native ecosystem for ML/AI (GeoPandas, shapely)
- Direct integration with Google Gen AI SDK (Vertex AI / Gemini)
- Async FastAPI for high-throughput AI request handling
- asyncpg for non-blocking PostgreSQL reads

**AI Capabilities:**
| Capability | Trigger | Model |
|-----------|---------|-------|
| Complaint classification | On complaint creation | gemini-2.0-flash |
| Duplicate detection | On complaint creation | gemini-2.0-flash |
| AI governance chat | Officer request | gemini-1.5-pro |
| Document summarization | On demand | gemini-1.5-pro |
| Ward daily narrative | 6am scheduled | gemini-1.5-pro |
| Officer coaching | Admin request | gemini-1.5-pro |
| Asset risk scoring | On demand | gemini-2.0-flash |

**Geo Intelligence:**
- Ward boundary GeoJSON fetched from Spring Boot API (cached 1hr in Redis)
- GPS coordinates resolved to Ward + Constituency using GeoPandas point-in-polygon
- OpenStreetMap as the base geographic data source

**Allocation Algorithm:**
```python
# For each incoming complaint:
# 1. Identify ward from GPS coordinates
# 2. Query available officers in that ward
# 3. Score each officer: active_ticket_count * (1 + sla_urgency_factor)
# 4. Assign to officer with lowest weighted score
# 5. Publish assignment event to Redis → NestJS → WebSocket + SMS
```

---

### 4. govos-web (React 18 — Web OS Frontend)

**Responsibility:** The only user interface. A browser-based OS shell with 11 feature modules.

**Why React 18 as a Web OS?**
- Component model maps naturally to the "application window" metaphor
- React 18 concurrent features minimize jank during heavy state updates
- Virtual DOM avoids full re-renders during window drag operations

**OS Shell Components (persistent, never unmount):**
- `AppShell` — root layout with sidebar + topbar + content area
- `Sidebar` — module navigation with role-gated items
- `TopBar` — tenant switcher, notifications bell, user menu
- `CommandPalette` — global search/command (Cmd+K)
- `NotificationTray` — real-time notification panel

**State Architecture:**
```
Zustand (client state)       TanStack Query (server state)
├── auth.store.ts            ├── useComplaintsQuery
├── ui.store.ts              ├── useCitizenQuery
└── notification.store.ts    └── useAssetQuery

Socket.IO (real-time events)
└── → Invalidates TanStack Query caches
```

---

## Data Architecture

### PostgreSQL Schema Design Principles

Every tenant-scoped table MUST have:
```sql
id          UUID    PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id   UUID    NOT NULL    REFERENCES tenants(id)
is_deleted  BOOLEAN NOT NULL    DEFAULT FALSE
deleted_at  TIMESTAMPTZ
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
created_by  UUID    REFERENCES users(id)
updated_by  UUID    REFERENCES users(id)
```

### Row-Level Security (Defense in Depth)
```sql
-- Applied to EVERY tenant-scoped table:
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON complaints
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Spring Boot sets this at EVERY transaction start:
SET LOCAL app.tenant_id = '{tenantId}';
```

### Audit Framework
All CUD operations generate immutable records in OpenSearch:
```json
{
  "action": "COMPLAINT_STATUS_CHANGED",
  "tenantId": "uuid",
  "entityId": "uuid",
  "entityType": "COMPLAINT",
  "performedBy": "uuid",
  "timestamp": "ISO8601",
  "previousValue": { "status": "ASSIGNED" },
  "newValue": { "status": "IN_PROGRESS" }
}
```

---

## Inter-Service Communication

### Synchronous (HTTP)
| Caller | Target | Purpose |
|--------|--------|---------|
| Spring Boot | FastAPI | Complaint classification, ward resolution |
| FastAPI | Spring Boot | Ward boundary GeoJSON fetch |
| Frontend | Spring Boot | All CRUD operations |
| Frontend | FastAPI | AI chat, geo lookup |

### Asynchronous (Redis pub/sub)
| Publisher | Channel | Consumer | Purpose |
|-----------|---------|----------|---------|
| Spring Boot | `govos:events` | NestJS | Complaint status changes, SLA alerts |
| FastAPI | `govos:events` | NestJS | Allocation assignments, SLA breaches |
| NestJS | — | — | Final delivery to WebSocket rooms + external channels |

### Authentication Between Services
- **JWT (external):** Frontend → Any service (validated independently per service)
- **API Key (internal):** Service → Service via `X-Service-Key` header (shared secret from env)

---

## Security Architecture

```
Layer 1: Nginx (rate limiting, route blocking)
Layer 2: Spring Security 6 (JWT validation, RBAC @PreAuthorize)
Layer 3: Application (tenant ID cross-check)
Layer 4: PostgreSQL RLS (mathematical tenant isolation)
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "tid": "tenant-uuid",
  "rid": "role-id",
  "wid": "ward-uuid (optional)",
  "iat": 1705312200,
  "exp": 1705313100  // 15 minutes
}
```

### Password Security
- Algorithm: Argon2id
- Parameters: memory=65536, iterations=3, parallelism=4
- Never BCrypt. Never MD5. Never SHA.

---

## Deployment Architecture (Production)

```
Citizens/Officers (Browser)
         │
    ┌────▼────┐
    │ CDN     │ ← Static frontend assets
    │ (Cloud  │
    │  front) │
    └────┬────┘
         │
    ┌────▼────┐
    │  Load   │
    │ Balancer│
    └────┬────┘
         │
    ┌────▼────────────────────────────┐
    │  Kubernetes Cluster             │
    │  ┌──────┐ ┌────────┐ ┌───────┐ │
    │  │Core  │ │Realtime│ │  AI   │ │
    │  │API   │ │Service │ │Service│ │
    │  │Pods  │ │Pods    │ │Pods   │ │
    │  └──┬───┘ └───┬────┘ └───┬───┘ │
    └─────┼─────────┼──────────┼─────┘
          │         │          │
    ┌─────▼─────────▼──────────▼─────┐
    │  Managed Services               │
    │  PostgreSQL | Redis | MinIO     │
    │  OpenSearch | Vertex AI         │
    └────────────────────────────────┘
```

---

## Development Workflow (Spec-Driven Development)

```
1. /gen:spec {feature}        ← Agent generates specification
2. Human reviews & approves   ← REQUIRED before coding
3. /scaffold:feature {name}   ← Agent generates all code
4. /run:tests {service}       ← Agent runs tests
5. Human reviews PR           ← Final gate before merge
```

**Key Principle:** No code is generated without an approved spec. The AI agent is guided by documentation, not assumptions.
