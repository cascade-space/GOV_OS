# GovOS — Service Ownership Matrix
**Milestone:** M0.5 — Codebase Hardening & Cleanup
**Date:** August 29, 2026

---

## 1. Architectural Service Boundaries

The GovOS platform enforces clear separation of concerns across polyglot microservices. The matrix below defines the **authoritative owner** for each domain responsibility.

| Responsibility / Domain | Authoritative Owner | Service Name | Tech Stack | Secondary / Consumers |
| :--- | :--- | :--- | :--- | :--- |
| **Web OS User Interface** | Frontend Shell | `govos-web` | React 18 / Vite / Tailwind | Browser Clients |
| **Public Landing Website** | Public Website | `public-landing-page` | Next.js 16 | Citizens, Public Traffic |
| **Core Business APIs & Auth** | Business API | `govos-core-api` | Java 21 / Spring Boot 3 | `govos-web`, `public-landing-page` |
| **Realtime Sockets & Notifications** | Realtime Bus | `govos-realtime` | Node.js / NestJS / Socket.IO | `govos-web`, Mobile apps |
| **AI Intelligence & Spatial Analysis**| AI Engine | `govos-ai` | Python 3.11 / FastAPI | `govos-core-api` |
| **Data Persistence & Isolation** | Database | PostgreSQL | PostgreSQL 16 (with RLS) | `govos-core-api`, `govos-ai` (Read) |
| **Caching & Event Pub/Sub** | Cache / Event Bus | Redis | Redis 7 | All backend microservices |
| **Audit Log Storage** | Immutable Audit | OpenSearch | OpenSearch 2 | `govos-core-api` |

---

## 2. Service-by-Service Ownership Scope

### A. `govos-web` (React Web OS Frontend)
- **Primary Owner:** User Interface, Module Routing, Zustand UI/Auth state, Desktop Windowing Layout, TanStack Query Cache management.
- **Forbidden Responsibilities:** Business logic execution, direct database access, JWT signature generation.

### B. `public-landing-page` (Next.js Portal)
- **Primary Owner:** Citizen marketing landing page, public complaint tracking portal, SEO-optimized landing content.
- **Legacy Containment:** Hosts `public-landing-page/backend` (Express.js) which temporarily serves API requests during migration.

### C. `govos-core-api` (Spring Boot Core API)
- **Primary Owner:** Authenticated REST APIs, User Management, Tenant Provisioning, Complaint CRUD, RBAC verification, Database transactions, Flyway schema migrations, Row-Level Security session variable injection (`SET LOCAL app.tenant_id`).
- **Forbidden Responsibilities:** Long-polling WebSocket connection handling, direct SMS gateway connections.

### D. `govos-realtime` (NestJS Realtime Service)
- **Primary Owner:** Socket.IO WebSocket connections, room management (`tenant:{id}`, `ward:{id}`, `user:{id}`), Redis Event Subscriber, Notification Channel Adapters (SMS via MSG91, Email via SendGrid, WhatsApp via Twilio).
- **Forbidden Responsibilities:** Primary database CUD operations, business validation rules.

### E. `govos-ai` (Python FastAPI Service)
- **Primary Owner:** GeoPandas spatial point-in-polygon ward mapping, Google Gemini LLM complaint auto-categorization, duplicate complaint detection, officer workload optimization algorithm.
- **Forbidden Responsibilities:** User password hashing, transaction state mutations.

---

## 3. Duplicate Responsibilities & Migration Resolution

During M0.5 audit, the following duplicated responsibilities were identified and mapped for resolution:

```mermaid
graph TD
    subgraph Duplicated Responsibility Identified
        ExpressAuth["Express Backend Auth<br/>(auth.controller.js)"] <--> SpringAuth["Spring Boot Auth<br/>(com.govos.core.presentation.auth)"]
        ExpressRealtime["Express Socket.IO<br/>(server.js)"] <--> NestRealtime["NestJS Socket Gateway<br/>(govos-realtime)"]
    end
    
    subgraph Resolution Plan (M4 - M5)
        SpringAuth ==>|M4 Authoritative Owner| CoreAPI["govos-core-api"]
        NestRealtime ==>|M5 Authoritative Owner| RealtimeBus["govos-realtime"]
    end
```

| Duplicated Item | Current Dual Locations | Resolution Strategy |
| :--- | :--- | :--- |
| **Authentication & JWT** | Express `auth.controller.js` vs Spring `JwtTokenProvider.java` | Spring Security 6 (`govos-core-api`) becomes sole token authority in M4. |
| **Socket.IO Gateways** | Express `server.js` vs NestJS `govos-realtime` gateway | Move all WebSocket rooms to NestJS (`govos-realtime`) in M5; publish via Redis. |
| **Database Connection Pools**| Express `knex/pg` pool vs Spring Boot HikariCP pool | Decommission Express pool once Spring Boot migration completes in M4. |
