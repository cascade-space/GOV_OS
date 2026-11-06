# Workflow: /scaffold:migration
# Generates a versioned Flyway database migration script

---

## Trigger
`/scaffold:migration {description}`

**Examples:**
- `/scaffold:migration add_complaint_attachments_table`
- `/scaffold:migration add_sla_deadline_to_complaints`
- `/scaffold:migration create_asset_maintenance_table`

---

## Description
Generates a properly versioned Flyway SQL migration file for the Spring Boot Core API. Every migration follows strict conventions: tenant isolation, soft delete, audit columns, RLS policy, and proper indexes.

---

## Execution Steps

### Step 1 — Determine Next Version Number
**Agent:** SpringArchitect

Scan `govos-core-api/src/main/resources/db/migration/` for existing files.
Find the highest `V{N}__` prefix. New file will be `V{N+1}__`.

### Step 2 — Generate Migration File

**File:** `src/main/resources/db/migration/V{N+1}__{description}.sql`

#### Template for New Table
```sql
-- Migration: V{N+1}__{description}
-- Author: AntiGravity IDE Agent (SpringArchitect)
-- Description: {human-readable description}

-- ============================================================
-- TABLE: {table_name}
-- ============================================================
CREATE TABLE {table_name} (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Domain-specific columns here --

    -- Soft delete
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,

    -- Audit columns
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON {table_name}
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Superuser bypass (for migrations and admin operations)
CREATE POLICY superuser_bypass ON {table_name}
    TO govos_admin
    USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
-- Primary lookup by tenant (always include)
CREATE INDEX idx_{table_name}_tenant_id
    ON {table_name}(tenant_id)
    WHERE is_deleted = FALSE;

-- Add domain-specific indexes here

-- ============================================================
-- TRIGGERS
-- ============================================================
-- Auto-update updated_at on row modification
CREATE OR REPLACE TRIGGER trg_{table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Template for Adding Column
```sql
-- Migration: V{N+1}__add_{column}_to_{table}
ALTER TABLE {table_name}
    ADD COLUMN IF NOT EXISTS {column_name} {data_type} {constraints};

-- Add index if frequently queried
CREATE INDEX IF NOT EXISTS idx_{table_name}_{column_name}
    ON {table_name}({column_name})
    WHERE is_deleted = FALSE;

COMMENT ON COLUMN {table_name}.{column_name} IS '{description}';
```

### Step 3 — Generate Corresponding JPA Entity Update
**Agent:** SpringArchitect

Update the JPA entity class to add the new column mapping with proper annotations.

## Validation Checklist
- [ ] File follows `V{N}__snake_case_description.sql` naming
- [ ] New tables have RLS enabled and policy created
- [ ] New tables have `tenant_id` foreign key
- [ ] Soft delete columns present (`is_deleted`, `deleted_at`)
- [ ] Audit columns present (`created_at`, `updated_at`, `created_by`, `updated_by`)
- [ ] At minimum one tenant index created
- [ ] Updated_at trigger attached
- [ ] JPA entity updated to match schema
- [ ] **Self-Healing Protocol:** All `CREATE TRIGGER` operations MUST be preceded by a `DROP TRIGGER IF EXISTS` to ensure idempotency and prevent `42710` (duplicate object) errors during container rebuilds.
