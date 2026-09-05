# GovOS Database Tenant Migration Design
**Milestone:** M2
**Goal:** Transform the monolithic GovOS `schema.sql` into a strict Multi-Tenant Architecture System (MTAS) using PostgreSQL Row-Level Security (RLS).

> [!WARNING]
> No destructive changes will be made to the production schema until this design is fully approved.

---

## 1. The `tenants` Table

We will introduce a core `tenants` table. 

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.1 Core Tenant Classifications
Per the requirements, we will avoid silently assigning all data to a single default tenant. We will initialize two special classifications:

1. **`SYSTEM`** (e.g., `id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'`)
   - **Usage**: Only for genuinely platform-level records (e.g., Super Admin user accounts, global `system_settings`).
2. **`LEGACY_UNASSIGNED`** (e.g., `id = '00000000-0000-0000-0000-000000000000'`)
   - **Usage**: A quarantine tenant for existing database records whose municipal ownership cannot be safely or deterministically verified. 

---

## 2. Affected Tables & Ownership Model

The `tenant_id` column (`UUID NOT NULL REFERENCES tenants(id)`) will be added to the following tables.

| Table | Ownership Model | Legacy Record Mapping Strategy | RLS Enabled? |
|-------|----------------|--------------------------------|--------------|
| `users` | Scoped to Tenant. (Super Admins scope to `SYSTEM`). | Admins -> `SYSTEM`. Others -> `LEGACY_UNASSIGNED`. | YES |
| `departments` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `officers` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `constituencies` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `mlas` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `complaints` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `complaint_attachments` | Scoped to Tenant (Denormalized for fast RLS). | Inherit from `complaints`. | YES |
| `complaint_history` | Scoped to Tenant (Denormalized). | Inherit from `complaints`. | YES |
| `comments` | Scoped to Tenant (Denormalized). | Inherit from `complaints`. | YES |
| `mla_directives` | Scoped to Tenant. | Inherit from `complaints`. | YES |
| `announcements` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `notifications` | Scoped to Tenant. | Inherit from `users`. | YES |
| `daily_statistics` | Scoped to Tenant. | All existing -> `LEGACY_UNASSIGNED`. | YES |
| `system_settings` | Scoped to `SYSTEM` (Global) OR Tenant (Overrides). | All existing -> `SYSTEM`. | YES |
| `audit_log` | Scoped to Tenant. | Inherit from `users`. | YES |

---

## 3. Foreign Key Implications & Indexes

Adding `tenant_id` to all tables means we must be careful about cross-tenant references.

**Integrity Rule**: 
A record in Table A can only reference a record in Table B if both share the same `tenant_id` (except `SYSTEM` records). 
We will enforce this logically via application logic and strictly via RLS. (We will avoid composite Foreign Keys `(id, tenant_id)` to minimize massive schema rewrites, relying instead on RLS to prevent cross-tenant joining).

**Indexing**:
Every table receiving a `tenant_id` will receive a B-Tree index to ensure tenant isolation queries are highly performant:
```sql
CREATE INDEX idx_[table]_tenant_id ON [table](tenant_id);
```

---

## 4. Row-Level Security (RLS) Policy Design

PostgreSQL RLS will be the hard barrier preventing data leakage. The application layer (Spring Boot) will be responsible for setting the context variable `app.tenant_id` at the start of every transaction.

### 4.1 Standard Tenant Policy
```sql
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON complaints
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
```
*Note: The `true` parameter in `current_setting` prevents errors if the variable is not set, defaulting to NULL and blocking access, which acts as a fail-safe.*

### 4.2 SUPER_ADMIN Access Model
`SUPER_ADMIN` users must be able to view across tenants. We will define an override policy for Super Admins based on a secondary context variable `app.is_super_admin`.

```sql
CREATE POLICY super_admin_override ON complaints
    USING (current_setting('app.is_super_admin', true) = 'true');
```
With these two policies, normal requests strictly require `app.tenant_id`, while requests authenticated with a `SUPER_ADMIN` JWT will set `app.is_super_admin = 'true'`, bypassing the tenant restriction.

---

## 5. Rollback Procedure

If the data migration fails, we must be able to revert to the exact `schema.sql` state.
The rollback script (`down.sql`) will execute the following in a single transaction:
1. `DROP POLICY` for all RLS rules.
2. `ALTER TABLE [table] DISABLE ROW LEVEL SECURITY;`
3. `ALTER TABLE [table] DROP COLUMN tenant_id;`
4. `DROP TABLE tenants CASCADE;`

---

## 6. Validation Tests

Before any Spring Boot code is written, the database migration must be validated directly via SQL assertions.

**Test Cases to be written in SQL:**
1. **Isolation Test**: Create Tenant A and Tenant B. Insert a complaint in Tenant A. Set `app.tenant_id` to Tenant B. Run `SELECT * FROM complaints`. 
   - *Expected:* Returns 0 rows.
2. **Access Test**: Set `app.tenant_id` to Tenant A. Run `SELECT * FROM complaints`. 
   - *Expected:* Returns 1 row.
3. **Super Admin Test**: Set `app.is_super_admin = 'true'` and do not set `app.tenant_id`. Run `SELECT * FROM complaints`. 
   - *Expected:* Returns all rows across all tenants.
4. **Fail-Safe Test**: Do not set any context variables. Run `SELECT * FROM complaints`. 
   - *Expected:* Returns 0 rows. (Fails closed).

---
**Next Step after Approval**: 
1. Create `V2__mtas_tenant_schema.sql` (Migration up)
2. Create `U2__mtas_tenant_schema.sql` (Migration down)
3. Create `V2_test_harness.sql` (Validation checks)
