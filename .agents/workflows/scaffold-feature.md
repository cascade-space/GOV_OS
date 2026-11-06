# Workflow: /scaffold:feature
# Slash-command automation for generating a complete feature module across frontend + backend

---

## Trigger
`/scaffold:feature {feature_name}`

**Example:** `/scaffold:feature grievance-appeals`

---

## Description
Generates a complete, production-ready feature module across all four services simultaneously. This workflow enforces the GovOS architectural patterns in every generated file.

---

## Pre-Flight Check (INVENT-LOCK™)
Before generating any files, the agent MUST verify that a specification document exists and is explicitly approved:
1. Does `docs/specs/{feature_name}-spec.md` exist?
2. Does it contain the text "Approved. Proceed with implementation" from the human architect, or was explicitly provided in context?
3. If NO to either: Halt execution and output "INVENT-LOCK TRIGGERED: Cannot scaffold without an approved specification. Run /gen:spec {feature_name} first."

### RBAC Pre-Flight Validation
- [ ] Does the specification explicitly define the `allowedRoles` for all UI components?
- [ ] Does the backend API specification list the required `@PreAuthorize` authorities?

---

## Execution Steps

### Step 1 — Generate Backend: Spring Boot Domain Layer
**Agent:** SpringArchitect
**Files to create in `govos-core-api/`:**

```
src/main/java/com/govos/core/domain/{feature}/
  ├── {Feature}.java                    — JPA entity with tenant_id, soft delete, audit fields
  ├── {Feature}Repository.java          — JPA repository interface (Port)
  ├── {Feature}Status.java              — Status enum (if lifecycle entity)
  └── {Feature}DomainService.java       — Pure domain business rules (no Spring)

src/main/java/com/govos/core/application/{feature}/
  ├── {Feature}Service.java             — Application service (use cases)
  ├── {Feature}Request.java             — Command/request DTO
  └── {Feature}Response.java            — Response DTO

src/main/java/com/govos/core/infrastructure/persistence/{feature}/
  └── {Feature}RepositoryImpl.java      — JPA adapter (Adapter)

src/main/java/com/govos/core/presentation/{feature}/
  ├── {Feature}Controller.java          — REST controller (@RestController)
  └── {Feature}Mapper.java              — Entity ↔ DTO mapper (MapStruct)
```

**Entity Template Rules:**
- Include: `id` (UUID), `tenant_id` (UUID, NOT NULL), `created_at`, `updated_at`, `created_by`, `updated_by`, `is_deleted`, `deleted_at`
- Annotate with `@SQLRestriction("is_deleted = false")`
- Use `@PrePersist` / `@PreUpdate` to set audit fields from SecurityContext

### Step 2 — Generate Backend: Flyway Migration
**Agent:** SpringArchitect
**File:** `src/main/resources/db/migration/V{next}__create_{feature}_table.sql`

```sql
-- Template:
CREATE TABLE {feature}s (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  -- feature-specific columns --
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

ALTER TABLE {feature}s ENABLE ROW LEVEL SECURITY;
ALTER TABLE {feature}s FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON {feature}s
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE INDEX idx_{feature}s_tenant ON {feature}s(tenant_id) WHERE is_deleted = FALSE;
```

### Step 3 — Generate Backend: NestJS Event Handlers (if real-time needed)
**Agent:** RealtimeEngineer
**Files to create in `govos-realtime/`:**

```
src/modules/{feature}/
  ├── {feature}.module.ts
  ├── {feature}.service.ts             — Redis event consumer
  └── {feature}.events.ts              — Event type definitions
```

**Event Template:**
```typescript
// Inbound Redis events (published by Spring Boot):
{feature}:created
{feature}:updated
{feature}:status_changed

// Outbound Socket.IO events (emitted to rooms):
{feature}:created     → room: tenant:{id}
{feature}:updated     → room: tenant:{id}
```

### Step 4 — Generate Frontend Feature Module
**Agent:** WebOSFrontend
**Files to create in `govos-web/`:**

```
src/features/{feature}/
  ├── components/
  │   ├── {Feature}List.tsx            — Data table with shadcn/ui DataTable
  │   ├── {Feature}Detail.tsx          — Detail view component
  │   ├── {Feature}Form.tsx            — Create/edit form (react-hook-form + zod)
  │   └── {Feature}Skeleton.tsx        — Loading skeleton
  ├── hooks/
  │   ├── use{Feature}Query.ts         — TanStack Query hooks (list + detail)
  │   ├── use{Feature}Mutation.ts      — TanStack Mutation hooks (create/update/delete)
  │   └── use{Feature}Realtime.ts      — Socket.IO event subscription + cache invalidation
  ├── api/
  │   └── {feature}.api.ts             — Axios API functions
  ├── types.ts                         — TypeScript types + Zod schemas
  └── index.tsx                        — Module entry point / route registration
```

**Component Rules:**
- `{Feature}List`: always has Skeleton, EmptyState, ErrorState, Pagination
- `{Feature}Form`: react-hook-form + zod validation, `<RoleGuard>` on submit button
- `use{Feature}Realtime`: registers Socket.IO listener in `useEffect`, unsubscribes on unmount

### Step 5 — Add Route Registration
**Agent:** WebOSFrontend
**File:** `src/router/routes.tsx`

Add route entry:
```tsx
{
  path: '/{feature}',
  element: <ProtectedRoute roles={['OFFICER', 'TENANT_ADMIN']}><{Feature}Module /></ProtectedRoute>
}
```

### Step 6 — Add Sidebar Navigation Entry
**Agent:** WebOSFrontend
**File:** `src/shell/Sidebar.tsx`

Add navigation item with icon and `RoleGuard`.

---

## Output Verification Checklist
- [ ] Entity has `tenant_id`, soft delete fields, audit fields
- [ ] RLS policy created in migration
- [ ] Controller routes follow `/api/v1/{feature}s` convention
- [ ] Frontend has Skeleton, EmptyState, ErrorState states
- [ ] Real-time hook subscribes to Socket.IO events
- [ ] Route is protected with appropriate roles
- [ ] All TypeScript types are explicit (no `any`)
