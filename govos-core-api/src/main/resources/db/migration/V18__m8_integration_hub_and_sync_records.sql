-- Migration V18: Milestone M8 Government Integration Hub & Authorized External Sync
-- Extends complaints with external federation metadata and establishes integration_sync_records with RLS

-- 1. Extend complaints with external tracking fields
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS external_system VARCHAR(50),
    ADD COLUMN IF NOT EXISTS external_ticket_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS integration_status VARCHAR(30) DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_external_status VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_complaints_external_ref ON complaints(tenant_id, external_system, external_ticket_id);
CREATE INDEX IF NOT EXISTS idx_complaints_integration_status ON complaints(tenant_id, integration_status);

COMMENT ON COLUMN complaints.external_system IS 'Name of external authorized government system (e.g. ICCC_MUNICIPAL, CPGRAMS)';
COMMENT ON COLUMN complaints.external_ticket_id IS 'Unique identifier issued by external government platform';
COMMENT ON COLUMN complaints.integration_status IS 'State of external federation: NONE, PENDING, SYNCED, FAILED, ORCHESTRATED';

-- 2. Tenant Integration Configuration
CREATE TABLE IF NOT EXISTS integration_configs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_system         VARCHAR(50) NOT NULL,
    is_enabled              BOOLEAN NOT NULL DEFAULT true,
    webhook_url             VARCHAR(500) NOT NULL,
    webhook_secret          VARCHAR(255) NOT NULL,
    sync_categories         VARCHAR(500) DEFAULT 'ALL', -- Comma-separated or 'ALL'
    auto_sync_on_create     BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_system UNIQUE(tenant_id, external_system)
);

CREATE INDEX IF NOT EXISTS idx_integration_configs_tenant ON integration_configs(tenant_id, external_system);

-- 3. Integration Sync Audit Records (Bi-directional Audit Trail)
CREATE TABLE IF NOT EXISTS integration_sync_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    complaint_id            UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    external_system         VARCHAR(50) NOT NULL,
    direction               VARCHAR(10) NOT NULL, -- 'OUTBOUND' or 'INBOUND'
    event_type              VARCHAR(50) NOT NULL, -- e.g. TICKET_CREATE, STATUS_UPDATE, EVIDENCE_SYNC
    external_ticket_id      VARCHAR(100),
    status                  VARCHAR(20) NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED'
    http_status             INT,
    request_payload         JSONB,
    response_payload        JSONB,
    error_message           TEXT,
    retry_count             INT NOT NULL DEFAULT 0,
    correlation_id          VARCHAR(100),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_records_complaint ON integration_sync_records(tenant_id, complaint_id);
CREATE INDEX IF NOT EXISTS idx_sync_records_ext_ticket ON integration_sync_records(external_system, external_ticket_id);
CREATE INDEX IF NOT EXISTS idx_sync_records_created ON integration_sync_records(created_at DESC);

-- 4. Enable Row-Level Security on integration tables
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integration_configs_tenant_isolation ON integration_configs;
CREATE POLICY integration_configs_tenant_isolation ON integration_configs
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
    WITH CHECK (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

DROP POLICY IF EXISTS integration_sync_records_tenant_isolation ON integration_sync_records;
CREATE POLICY integration_sync_records_tenant_isolation ON integration_sync_records
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
    WITH CHECK (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- 5. Seed default mock ICCC configuration for demo tenant
INSERT INTO integration_configs (tenant_id, external_system, is_enabled, webhook_url, webhook_secret, sync_categories, auto_sync_on_create)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'ICCC_MUNICIPAL',
    true,
    'http://localhost:8080/api/v1/mock/iccc/tickets',
    'govos_iccc_secret_key_demo_2026',
    'ALL',
    true
)
ON CONFLICT (tenant_id, external_system) DO UPDATE
SET webhook_url = EXCLUDED.webhook_url,
    webhook_secret = EXCLUDED.webhook_secret,
    is_enabled = EXCLUDED.is_enabled;
