# GovOS — Database Cleanup Audit & Pre-Migration Report
**Milestone:** M0.5 — Codebase Hardening & Cleanup
**Date:** August 29, 2026

> [!IMPORTANT]
> **Safety Guarantee:** As mandated by Milestone M0.5 rules, NO schema alterations or multi-tenant database migrations have been executed. This document provides the pre-migration audit report to ensure zero data loss during Milestone M2 execution.

---

## 1. Database Files & Schema Inventory

| Schema Source | File Path | Scope / Purpose |
| :--- | :--- | :--- |
| **Legacy Monolithic Schema** | `public-landing-page/database/schema.sql` | 20+ tables; current schema used by local Express backend |
| **Staged RLS Migration** | `01_add_tenants_and_rls.sql` | Staged script adding `tenants` table, `tenant_id` columns & RLS policies |
| **Flyway Migrations** | `govos-core-api/src/main/resources/db/migration/V1__V11` | Version-controlled Flyway scripts (`V1` to `V11`) for Spring Boot |

---

## 2. Monolithic Schema Audit Findings (`schema.sql`)

### A. Core Tables Currently Lacking `tenant_id` Isolation
The active Express backend database schema (`schema.sql`) stores records without multi-tenant boundaries:
- `users` (lacks `tenant_id` foreign key)
- `departments` (lacks `tenant_id` foreign key)
- `officers` (lacks `tenant_id` foreign key)
- `complaints` (lacks `tenant_id` foreign key)
- `complaint_history` (lacks `tenant_id` foreign key)
- `audit_log` (lacks `tenant_id` foreign key)

### B. Table & Enum Discrepancy Matrix
| Entity | Monolithic Schema (`schema.sql`) | Flyway Schema (`V2` / `V3` / `V6`) | Resolution Plan for M2 |
| :--- | :--- | :--- | :--- |
| **Users Role Enum** | `'admin', 'officer', 'citizen', 'mla'` | `'SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD', 'OFFICER', 'ROLE_REP', 'CITIZEN'` | Unify ENUM values in Flyway migration script |
| **Complaint Status** | `'submitted', 'in_progress', 'resolved', 'closed', 'escalated'` | `'SUBMITTED', 'VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'` | Unify to uppercase canonical ENUM |
| **Wards** | Text column `ward` on `complaints` | Dedicated `wards` table with GIS boundaries | Migrate text values to foreign key `ward_id` |

---

## 3. Pre-Migration Data Preservation Strategy

To prevent existing local records from becoming orphaned or throwing `NOT NULL` constraint violations when `tenant_id` is introduced in M2:

```sql
-- Step 1: Insert System Default Tenant
INSERT INTO tenants (id, name, code, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Municipality', 'DEFAULT_MUNI', 'active')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Backfill existing records before applying NOT NULL constraint
UPDATE complaints SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE departments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE officers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Step 3: Now safely enforce NOT NULL and Foreign Keys
ALTER TABLE complaints ALTER COLUMN tenant_id SET NOT NULL;
```

---

## 4. Indexing & Audit Fields Recommendations

1. **Composite Indexes for RLS Performance:**
   ```sql
   CREATE INDEX idx_complaints_tenant_status ON complaints(tenant_id, status);
   CREATE INDEX idx_complaints_tenant_ward ON complaints(tenant_id, ward_id);
   CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
   ```
2. **Audit Timestamp Consistency:**
   All tables must enforce standard audit fields:
   `is_deleted BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()`.
