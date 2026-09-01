-- V9: Create audit_logs table for immutable audit trail
-- Each CUD operation records an entry with actor, action, resource, and JSON payload

CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    actor_id        UUID,       -- user who performed the action (NULL for system events)
    actor_name      TEXT        NOT NULL DEFAULT 'SYSTEM',
    action          TEXT        NOT NULL,           -- e.g. COMPLAINT_CREATED, OFFICER_DELETED
    resource_type   TEXT        NOT NULL,           -- e.g. COMPLAINT, OFFICER, ASSET
    resource_id     TEXT        NOT NULL,           -- UUID or business key of the affected resource
    resource_label  TEXT,                           -- human-readable label e.g. "CMP-GV-202506-0001"
    ip_address      TEXT,
    user_agent      TEXT,
    payload         JSONB,                          -- diff or request payload snapshot
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for per-tenant audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Policy: only the owning tenant can see its audit logs
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
    USING (tenant_id::text = current_setting('app.tenant_id', true));
