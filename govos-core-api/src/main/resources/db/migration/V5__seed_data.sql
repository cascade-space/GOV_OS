-- ============================================================
-- V5: Bootstrap Seed Data
-- GovOS MTAS — Super Admin tenant + demo tenant
-- ============================================================

-- ============================================================
-- SUPER ADMIN TENANT (Prajna Labs / Cascade platform operators)
-- ============================================================
INSERT INTO tenants (id, name, code, subdomain, state, country, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'GovOS Platform (Prajna Labs)',
    'PLATFORM',
    'platform.govos.in',
    'Maharashtra',
    'India',
    TRUE
);

-- ============================================================
-- DEMO TENANT — for development and testing
-- ============================================================
INSERT INTO tenants (id, name, code, subdomain, state, country, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Mumbai Municipal Corporation (Demo)',
    'DEMO',
    'demo.govos.in',
    'Maharashtra',
    'India',
    TRUE
);

-- ============================================================
-- DEMO CONSTITUENCY
-- ============================================================
INSERT INTO constituencies (id, tenant_id, name, code)
VALUES (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'South Mumbai',
    'SOUTH-MUM'
);

-- ============================================================
-- DEMO WARD
-- ============================================================
INSERT INTO wards (id, tenant_id, constituency_id, name, code)
VALUES (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000001',
    'Colaba Ward',
    'COLABA'
);

-- ============================================================
-- DEMO DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, tenant_id, name, code, description) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000002', 
 'Public Works Department', 'PWD', 'Roads, bridges, drainage infrastructure'),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000002', 
 'Water Supply Department', 'WSD', 'Water mains, supply issues'),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000002', 
 'Solid Waste Management', 'SWM', 'Garbage collection, sanitation');

-- ============================================================
-- SUPER ADMIN USER
-- Password: Admin@GovOS2024! (Argon2id hash — replace in production)
-- ============================================================
-- Note: password_hash is a placeholder — AuthService will set it on first login
INSERT INTO users (id, tenant_id, email, phone, full_name, display_name, phone_verified, email_verified, is_active)
VALUES (
    '00000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'admin@govos.in',
    '+919999999999',
    'GovOS Super Admin',
    'Super Admin',
    TRUE,
    TRUE,
    TRUE
);

-- Assign SUPER_ADMIN role
INSERT INTO user_roles (tenant_id, user_id, role_id)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0004-000000000001',
    r.id
FROM roles r WHERE r.code = 'SUPER_ADMIN';

-- ============================================================
-- DEMO TENANT ADMIN USER
-- ============================================================
INSERT INTO users (id, tenant_id, email, phone, full_name, display_name, phone_verified, email_verified, ward_id, is_active)
VALUES (
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'admin@demo.govos.in',
    '+919888888888',
    'Demo Tenant Admin',
    'Demo Admin',
    TRUE,
    TRUE,
    NULL,
    TRUE
);

INSERT INTO user_roles (tenant_id, user_id, role_id)
SELECT 
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0004-000000000002',
    r.id
FROM roles r WHERE r.code = 'TENANT_ADMIN';

-- ============================================================
-- DEMO OFFICER USER
-- ============================================================
INSERT INTO users (id, tenant_id, email, phone, full_name, display_name, phone_verified, email_verified, ward_id, department_id, employee_code, designation, is_active)
VALUES (
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'officer@demo.govos.in',
    '+919777777777',
    'Rajesh Sharma',
    'Officer Rajesh',
    TRUE,
    TRUE,
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0003-000000000001',
    'EMP-001',
    'Junior Engineer',
    TRUE
);

INSERT INTO user_roles (tenant_id, user_id, role_id)
SELECT 
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0004-000000000003',
    r.id
FROM roles r WHERE r.code = 'OFFICER';

-- Update department head
UPDATE departments 
SET head_officer_id = '00000000-0000-0000-0004-000000000002'
WHERE id = '00000000-0000-0000-0003-000000000001';
