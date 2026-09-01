-- ============================================================
-- V4: Row-Level Security policies + permissions
-- GovOS MTAS — Security hardening
-- ============================================================

-- ============================================================
-- PERMISSIONS table — granular resource permissions per role
-- ============================================================
CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),  -- NULL = global
    role_id         UUID NOT NULL REFERENCES roles(id),
    resource        VARCHAR(100) NOT NULL,  -- complaints, citizens, assets, projects...
    action          VARCHAR(20)  NOT NULL,  -- READ, CREATE, UPDATE, DELETE, APPROVE, EXPORT
    scope           VARCHAR(20)  NOT NULL DEFAULT 'TENANT',  -- TENANT, WARD, OWN
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, resource, action)
);

-- Default permission matrix for system roles
INSERT INTO permissions (role_id, resource, action, scope) 
SELECT r.id, p.resource, p.action, p.scope
FROM roles r
CROSS JOIN (VALUES
    -- OFFICER permissions
    ('OFFICER', 'complaints',    'READ',   'WARD'),
    ('OFFICER', 'complaints',    'UPDATE', 'OWN'),
    ('OFFICER', 'citizens',      'READ',   'WARD'),
    ('OFFICER', 'assets',        'READ',   'WARD'),
    ('OFFICER', 'assets',        'UPDATE', 'OWN'),
    ('OFFICER', 'notifications', 'READ',   'OWN'),
    -- DEPT_HEAD permissions
    ('DEPT_HEAD', 'complaints',  'READ',   'TENANT'),
    ('DEPT_HEAD', 'complaints',  'UPDATE', 'TENANT'),
    ('DEPT_HEAD', 'complaints',  'APPROVE','TENANT'),
    ('DEPT_HEAD', 'officers',    'READ',   'TENANT'),
    ('DEPT_HEAD', 'analytics',   'READ',   'TENANT'),
    -- REP permissions
    ('REP', 'complaints',        'READ',   'WARD'),
    ('REP', 'analytics',         'READ',   'WARD'),
    ('REP', 'citizens',          'READ',   'WARD'),
    ('REP', 'projects',          'READ',   'WARD'),
    -- TENANT_ADMIN permissions
    ('TENANT_ADMIN', 'complaints','READ',  'TENANT'),
    ('TENANT_ADMIN', 'complaints','UPDATE','TENANT'),
    ('TENANT_ADMIN', 'complaints','DELETE','TENANT'),
    ('TENANT_ADMIN', 'users',    'CREATE', 'TENANT'),
    ('TENANT_ADMIN', 'users',    'READ',   'TENANT'),
    ('TENANT_ADMIN', 'users',    'UPDATE', 'TENANT'),
    ('TENANT_ADMIN', 'users',    'DELETE', 'TENANT'),
    ('TENANT_ADMIN', 'admin',    'READ',   'TENANT'),
    ('TENANT_ADMIN', 'admin',    'UPDATE', 'TENANT')
) AS p(role_code, resource, action, scope)
WHERE r.code = p.role_code AND r.is_system = TRUE;

-- ============================================================
-- AUDIT_LOG table — immutable event log (supplementing OpenSearch)
-- Local PostgreSQL backup of critical events
-- ============================================================
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    action          VARCHAR(100) NOT NULL,   -- COMPLAINT_CREATED, USER_LOGIN, etc.
    entity_type     VARCHAR(50)  NOT NULL,
    entity_id       UUID,
    performed_by    UUID REFERENCES users(id),
    ip_address      INET,
    user_agent      VARCHAR(500),
    previous_value  JSONB,
    new_value       JSONB,
    metadata        JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Partition by month for performance (auto-managed by Spring Boot cleanup job)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON audit_log
    USING (tenant_id = current_tenant_id());
CREATE POLICY govos_admin_bypass ON audit_log TO govos_admin USING (TRUE);

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(performed_by, created_at DESC);

-- ============================================================
-- NOTIFICATION_TEMPLATES — driven by RealtimeEngineer service
-- but schema owned by Core API for data integrity
-- ============================================================
CREATE TABLE notification_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),  -- NULL = global default
    event_type      VARCHAR(100) NOT NULL,         -- complaint:assigned, sla:warning, etc.
    channel         VARCHAR(20)  NOT NULL,         -- SMS, EMAIL, WHATSAPP, PUSH, IN_APP
    subject         VARCHAR(255),                  -- Email subject
    body_template   TEXT NOT NULL,                 -- Template with {{variable}} placeholders
    variables       JSONB,                         -- Variable schema definition
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, event_type, channel)
);

CREATE INDEX idx_notif_templates_tenant ON notification_templates(tenant_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_notif_templates_event ON notification_templates(event_type, channel) WHERE is_active = TRUE;

CREATE TRIGGER trg_notif_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default notification templates
INSERT INTO notification_templates (event_type, channel, subject, body_template, variables) VALUES
('complaint:assigned', 'SMS', NULL, 
 'GovOS: Complaint {{complaintNumber}} has been assigned to you. Title: {{title}}. SLA: {{slaDeadline}}. Login to view details.',
 '{"complaintNumber":"string","title":"string","slaDeadline":"string"}'),
('complaint:assigned', 'IN_APP', 'New Complaint Assigned',
 'You have been assigned complaint {{complaintNumber}}: {{title}}',
 '{"complaintNumber":"string","title":"string"}'),
('complaint:resolved', 'SMS', NULL,
 'GovOS: Your complaint {{complaintNumber}} has been resolved. Reply REOPEN if not satisfied.',
 '{"complaintNumber":"string"}'),
('sla:warning', 'SMS', NULL,
 'GovOS ALERT: Complaint {{complaintNumber}} SLA deadline approaching in {{hoursRemaining}} hours. Immediate action required.',
 '{"complaintNumber":"string","hoursRemaining":"string"}'),
('sla:breach', 'SMS', NULL,
 'GovOS BREACH: Complaint {{complaintNumber}} has breached SLA. Immediate escalation required.',
 '{"complaintNumber":"string"}');
