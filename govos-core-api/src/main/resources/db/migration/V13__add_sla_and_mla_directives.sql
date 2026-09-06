-- Migration V13: SLA Tracking, Automated Escalation, and MLA Directives
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS sla_deadline         TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sla_breached         BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sla_warning_sent     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS escalation_level     INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN complaints.sla_deadline IS 'Target resolution deadline computed from priority window';
COMMENT ON COLUMN complaints.sla_breached IS 'Flag indicating if complaint exceeded SLA deadline without resolution';
COMMENT ON COLUMN complaints.sla_warning_sent IS 'Flag indicating 75% SLA warning event dispatched';
COMMENT ON COLUMN complaints.escalation_level IS 'Escalation tier (0=normal, 1=officer warning, 2=supervisor, 3=MLA/executive)';

-- Table for MLA / Legislative Directives
CREATE TABLE IF NOT EXISTS mla_directives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    mla_name VARCHAR(255) NOT NULL,
    constituency VARCHAR(255) NOT NULL,
    directive_type VARCHAR(50) NOT NULL,
    instruction_notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mla_directives_complaint ON mla_directives(complaint_id);
CREATE INDEX IF NOT EXISTS idx_mla_directives_tenant ON mla_directives(tenant_id);

ALTER TABLE mla_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy_mla_directives ON mla_directives
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
