-- ============================================================
-- V2: Tenants, Geography (Constituencies, Wards)
-- GovOS MTAS — Tenant Foundation
-- ============================================================

-- ============================================================
-- TENANTS — root entity (municipality / panchayat / ULB)
-- ============================================================
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. "MUM", "BLR"
    subdomain       VARCHAR(100) NOT NULL UNIQUE,   -- e.g. "mumbai.govos.in"
    logo_url        VARCHAR(500),
    primary_color   VARCHAR(7)   DEFAULT '#1B4FD8', -- hex color
    state           VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'Asia/Kolkata',
    locale          VARCHAR(10)  NOT NULL DEFAULT 'en-IN',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    -- SLA config (overridable per department)
    sla_critical_hours  INTEGER NOT NULL DEFAULT 4,
    sla_high_hours      INTEGER NOT NULL DEFAULT 24,
    sla_medium_hours    INTEGER NOT NULL DEFAULT 72,
    sla_low_hours       INTEGER NOT NULL DEFAULT 168,
    -- Limits
    max_sessions        INTEGER NOT NULL DEFAULT 3,
    mfa_required        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain) WHERE is_deleted = FALSE;
CREATE INDEX idx_tenants_code ON tenants(code) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CONSTITUENCIES — geopolitical division within a tenant
-- ============================================================
CREATE TABLE constituencies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20)  NOT NULL,
    boundary        GEOMETRY(MultiPolygon, 4326),  -- PostGIS GeoJSON boundary
    representative_name VARCHAR(200),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituencies FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON constituencies
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON constituencies TO govos_admin USING (TRUE);

CREATE INDEX idx_constituencies_tenant ON constituencies(tenant_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_constituencies_boundary ON constituencies USING GIST(boundary) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_constituencies_updated_at
    BEFORE UPDATE ON constituencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- WARDS — sub-unit of constituency (complaint jurisdiction)
-- ============================================================
CREATE TABLE wards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    constituency_id UUID NOT NULL REFERENCES constituencies(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20)  NOT NULL,
    boundary        GEOMETRY(MultiPolygon, 4326),  -- PostGIS GeoJSON
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON wards
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON wards TO govos_admin USING (TRUE);

CREATE INDEX idx_wards_tenant ON wards(tenant_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_wards_constituency ON wards(constituency_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_wards_updated_at
    BEFORE UPDATE ON wards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DEPARTMENTS — functional unit within a tenant
-- ============================================================
CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20)  NOT NULL,
    description     VARCHAR(500),
    head_officer_id UUID,   -- FK added after users table
    -- Per-department SLA overrides (null = use tenant default)
    sla_critical_hours  INTEGER,
    sla_high_hours      INTEGER,
    sla_medium_hours    INTEGER,
    sla_low_hours       INTEGER,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON departments
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON departments TO govos_admin USING (TRUE);

CREATE INDEX idx_departments_tenant ON departments(tenant_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
