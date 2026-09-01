-- ============================================================
-- V7: Assets, Projects, Documents
-- GovOS MTAS — Infrastructure & Records
-- ============================================================

-- ============================================================
-- CIVIC ASSETS
-- ============================================================
CREATE TABLE civic_assets (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    asset_id                VARCHAR(50) NOT NULL,
    name                    VARCHAR(200) NOT NULL,
    category                VARCHAR(50) NOT NULL, -- VEHICLE, BUILDING, STREETLIGHT
    status                  VARCHAR(50) NOT NULL, -- ACTIVE, MAINTENANCE, DECOMMISSIONED
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    next_maintenance_date   DATE,
    -- BaseEntity fields
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES users(id),
    updated_by              UUID REFERENCES users(id),
    UNIQUE(tenant_id, asset_id)
);

ALTER TABLE civic_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_assets FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON civic_assets USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON civic_assets TO govos_admin USING (TRUE);

CREATE INDEX idx_civic_assets_tenant ON civic_assets(tenant_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_civic_assets_updated_at
    BEFORE UPDATE ON civic_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CIVIC PROJECTS
-- ============================================================
CREATE TABLE civic_projects (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    project_id              VARCHAR(50) NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    status                  VARCHAR(50) NOT NULL, -- PLANNING, IN_PROGRESS, DELAYED, COMPLETED
    budget                  DOUBLE PRECISION,
    spent                   DOUBLE PRECISION,
    start_date              DATE,
    estimated_end_date      DATE,
    completion_percentage   INTEGER NOT NULL DEFAULT 0,
    -- BaseEntity fields
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES users(id),
    updated_by              UUID REFERENCES users(id),
    UNIQUE(tenant_id, project_id)
);

ALTER TABLE civic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_projects FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON civic_projects USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON civic_projects TO govos_admin USING (TRUE);

CREATE INDEX idx_civic_projects_tenant ON civic_projects(tenant_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_civic_projects_updated_at
    BEFORE UPDATE ON civic_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DOCUMENTS (Peshi)
-- ============================================================
CREATE TABLE documents (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    document_number         VARCHAR(50) NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    type                    VARCHAR(50) NOT NULL, -- LETTER, NOTICE, INTERNAL_MEMO, TENDER
    status                  VARCHAR(50) NOT NULL, -- DRAFT, IN_TRANSIT, DELIVERED, ARCHIVED
    current_desk            VARCHAR(255),
    received_date           DATE,
    -- BaseEntity fields
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES users(id),
    updated_by              UUID REFERENCES users(id),
    UNIQUE(tenant_id, document_number)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON documents USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON documents TO govos_admin USING (TRUE);

CREATE INDEX idx_documents_tenant ON documents(tenant_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
