-- ============================================================
-- V3: Roles, Users, Sessions
-- GovOS MTAS — Identity & Access
-- ============================================================

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id),   -- NULL = global system role
    name        VARCHAR(50) NOT NULL,
    code        VARCHAR(50) NOT NULL,           -- SUPER_ADMIN, TENANT_ADMIN, DEPT_HEAD, OFFICER, CITIZEN, REP
    description VARCHAR(255),
    is_system   BOOLEAN NOT NULL DEFAULT FALSE, -- system roles cannot be deleted
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- System roles (tenant_id = NULL, is_system = TRUE)
INSERT INTO roles (name, code, description, is_system) VALUES
    ('Super Admin',    'SUPER_ADMIN',   'Platform operator — full access to all tenants', TRUE),
    ('Tenant Admin',   'TENANT_ADMIN',  'Municipality administrator — full access within tenant', TRUE),
    ('Department Head','DEPT_HEAD',     'Department head — manages department officers and complaints', TRUE),
    ('Officer',        'OFFICER',       'Field officer — manages assigned complaints', TRUE),
    ('Representative', 'REP',           'Elected representative — constituency-level visibility', TRUE),
    ('Citizen',        'CITIZEN',       'Citizen — files complaints, tracks status', TRUE);

CREATE INDEX idx_roles_tenant ON roles(tenant_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    -- Identity
    phone           VARCHAR(15)  UNIQUE,        -- Primary identifier (E.164 format)
    email           VARCHAR(255) UNIQUE,
    password_hash   VARCHAR(255),               -- Argon2id hash (nullable if OTP-only)
    -- Profile
    full_name       VARCHAR(200) NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(500),
    -- Verification
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    aadhaar_hash    VARCHAR(64),                -- SHA-256 of Aadhaar number (raw never stored)
    -- Assignment
    ward_id         UUID REFERENCES wards(id),
    department_id   UUID REFERENCES departments(id),
    employee_code   VARCHAR(50),
    designation     VARCHAR(200),
    -- MFA
    totp_secret     VARCHAR(100),               -- Base32 TOTP secret (encrypted at rest)
    totp_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    -- Status
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    -- Soft delete + audit
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON users
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON users TO govos_admin USING (TRUE);

CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_phone ON users(phone) WHERE is_deleted = FALSE AND phone IS NOT NULL;
CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE AND email IS NOT NULL;
CREATE INDEX idx_users_ward ON users(ward_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_department ON users(department_id) WHERE is_deleted = FALSE;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deferred FK: department head
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head_officer
    FOREIGN KEY (head_officer_id) REFERENCES users(id) DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- USER_ROLES — Many-to-many user ↔ role assignment
-- ============================================================
CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    role_id     UUID NOT NULL REFERENCES roles(id),
    granted_by  UUID REFERENCES users(id),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON user_roles
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON user_roles TO govos_admin USING (TRUE);

CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id) WHERE is_active = TRUE;

-- ============================================================
-- SESSIONS — active login sessions (multi-device support)
-- ============================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    refresh_token   VARCHAR(500) NOT NULL UNIQUE,  -- hashed JWT refresh token
    device_info     JSONB,                          -- {ua, ip, device_type}
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,           -- 7-day expiry
    last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ,
    is_revoked      BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON sessions
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON sessions TO govos_admin USING (TRUE);

CREATE INDEX idx_sessions_user ON sessions(user_id) WHERE is_revoked = FALSE;
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token) WHERE is_revoked = FALSE;
CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE is_revoked = FALSE;

-- ============================================================
-- OTP_ATTEMPTS — Rate limiting and audit for OTP flows
-- (Not tenant-scoped — phone/email not yet linked to tenant on first login)
-- ============================================================
CREATE TABLE otp_attempts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier  VARCHAR(255) NOT NULL,   -- phone or email
    otp_type    VARCHAR(20)  NOT NULL,   -- LOGIN, PASSWORD_RESET, EMAIL_VERIFY
    attempts    INTEGER      NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ  NOT NULL    -- OTP validity window
);

CREATE INDEX idx_otp_attempts_identifier ON otp_attempts(identifier, otp_type);
