# GovOS Phase 1 — Foundation Fix Plan

## A. Current Architecture
- **Frontend**: `govos-web` (React + Vite)
- **Legacy Backend**: `public-landing-page/backend` (Express.js, Node.js) - *Contains current active business logic.*
- **Intended Core Backend**: `govos-core-api` (Spring Boot Java) - *Currently an empty shell/stubs.*
- **Realtime**: Socket.IO exists inside the Express backend; `govos-realtime` (NestJS) is unintegrated boilerplate.
- **Database**: PostgreSQL with a monolithic schema (`schema.sql`) that completely lacks `tenant_id` isolation.

## B. Target Architecture
- **Frontend**: `govos-web` (React + Vite) — Unchanged, update API calls only.
- **Public Website**: `public-landing-page` (Next.js) — Unchanged.
- **Core Backend**: `govos-core-api` (Spring Boot Java) — Authoritative business logic, REST APIs, and strict RBAC.
- **Realtime / Event Processing**: `govos-realtime` (NestJS) — Socket.IO, event consumption, background tasks.
- **Database**: PostgreSQL — Enforced Multi-Tenancy (RLS).
- **Cache/Events**: Redis.

## C. Express → Spring Boot Migration Mapping
*See full detailed matrix in `express_to_spring_migration_matrix.md`.*
**Strategy**: Migrate one domain at a time (e.g., Auth first, then Complaints, then Officers). Do not decommission Express routes until the Spring Boot equivalent is verified by tests and frontend integration.

## D. Database Migration Strategy
1. Introduce Flyway to `govos-core-api`.
2. Baseline the current `schema.sql`.
3. Create `V2__add_tenant_id_and_rls.sql` to alter tables:
   - Add `tenant_id` to `users`, `departments`, `wards`, `complaints`, `complaint_history`, `officers`, `audit_log`, `analytics`.
   - Update Foreign Keys.
   - Introduce Row-Level Security (RLS) policies.
4. **Data Transformation**: For local dev, seed a default `tenant_id` (e.g., 'SYSTEM_DEFAULT') for existing records to prevent data loss.

## E. Multi-Tenant Strategy
**Tenant Schema**:
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
**Ownership Model**: 
`tenant` strictly owns `departments`, `wards`, `users`, `complaints`, `audit_logs`, and `notifications`. No entity can span multiple tenants except `users` with `SUPER_ADMIN` role.

## F. Authentication/RBAC Strategy
1. **Hardening**: Remove mock OTP (`123456`) and hardcoded JWT secrets (`civicpath_citizen_secret_key_2024`). Use `.env` variables injected into Spring Boot `application.yml`.
2. **Spring Security**: Implement `TenantAuthenticationToken` extending standard JWT authentication to inject `tenant_id` into the `SecurityContextHolder`.
3. **Authorization Matrix**:
   - `SUPER_ADMIN`: Cross-tenant read/write.
   - `TENANT_ADMIN`: Restricted to own `tenant_id`.
   - `OFFICER`: Restricted to own `tenant_id` AND assigned `ward_id`/`department_id`.
   - `CITIZEN`: Restricted to own `user_id`.

## G. Realtime Migration Strategy
1. Extract Socket.IO connection logic from Express.
2. Implement Socket Gateway in `govos-realtime` (NestJS) with JWT + Tenant validation on handshake.
3. Spring Boot publishes events to Redis Pub/Sub (e.g., `COMPLAINT_CREATED`, `COMPLAINT_STATUS_CHANGED`).
4. NestJS consumes Redis events and emits Socket.IO messages to specific rooms (`tenant:{id}`, `user:{id}`, `ward:{id}`).

## H. Rollback Strategy
- **Code**: All changes isolated in feature branches (e.g., `feature/m2-multi-tenant-db`).
- **Database**: Maintain `U2__rollback_tenant_id.sql` (Undo scripts) during development.
- **Backend**: Express backend remains fully intact and runnable until Milestone 6 (SLA Foundation) is complete. Frontend `.env` will dictate which API URL is used (`VITE_API_URL`).

## I. Verification Checkpoints
- **Test 1**: Tenant A user receives 403/404 when requesting Tenant B data.
- **Test 2**: Citizen successfully authenticates and submits a complaint via the new Spring Boot API.
- **Test 3**: Socket.IO client receives event pushed from Spring Boot → Redis → NestJS.

## J. Dependency Order (Milestones)
1. **M1**: Foundation Plan (Current)
2. **M2**: Database / Multi-Tenant (Flyway, Schema alterations, RLS)
3. **M3**: Auth + RBAC (Spring Security, JWT hardening, Mock OTP isolation)
4. **M4**: Spring Boot Core Migration (Porting Express Controllers to Spring Boot Services)
5. **M5**: Realtime Migration (NestJS + Redis integration)
6. **M6**: SLA Foundation (Spring Boot scheduling / Redis queues)
7. **M7**: Regression Testing
8. **M8**: Build Verification

## K. Risk Register
1. **Risk**: Existing data in local DB becomes orphaned when `tenant_id` is introduced (NOT NULL constraint fails).
   - **Mitigation**: Use a migration script that first creates a default tenant and assigns all existing rows to it before enforcing NOT NULL.
2. **Risk**: Frontend breaks due to subtle JSON payload differences between Express and Spring Boot.
   - **Mitigation**: Strict adherence to existing Express JSON response structures (e.g., `{ success: true, data: [...] }`).
3. **Risk**: Build environment issues persist (PowerShell policies, missing Maven).
   - **Mitigation**: Document exact installation commands or rely exclusively on `docker-compose` for local verification.
