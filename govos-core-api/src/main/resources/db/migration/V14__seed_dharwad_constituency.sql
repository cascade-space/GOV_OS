-- ============================================================
-- V14: Seed Dharwad Municipality & Assembly Constituency #71
-- Connects Spring Boot MTAS with CivicPath Public Frontend
-- ============================================================

ALTER TABLE constituencies NO FORCE ROW LEVEL SECURITY;
ALTER TABLE wards NO FORCE ROW LEVEL SECURITY;
ALTER TABLE departments NO FORCE ROW LEVEL SECURITY;

-- 1. Update Default Dev Tenant to Hubballi-Dharwad Municipal Corporation
UPDATE tenants
SET name = 'Hubballi-Dharwad Municipal Corporation (HDMC)',
    code = 'HDMC',
    subdomain = 'dharwad.govos.in',
    state = 'Karnataka',
    locale = 'kn-IN'
WHERE id = '00000000-0000-0000-0000-000000000002';

-- 2. Insert Dharwad Assembly Constituency (#71)
INSERT INTO constituencies (id, tenant_id, name, code, representative_name)
VALUES (
    '00000000-0000-0000-0001-000000000071',
    '00000000-0000-0000-0000-000000000002',
    'Dharwad',
    'DHARWAD-71',
    'Amrut Desai (MLA Dharwad)'
)
ON CONFLICT (tenant_id, code) DO UPDATE
SET name = EXCLUDED.name,
    representative_name = EXCLUDED.representative_name;

-- 3. Insert Dharwad Wards (Wards 1 through 8)
INSERT INTO wards (id, tenant_id, constituency_id, name, code)
VALUES
    ('11111111-1111-1111-1111-111111110001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Saptapur & University Area', 'WARD-01'),
    ('11111111-1111-1111-1111-111111110002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Kalyan Nagar & Malmaddi', 'WARD-02'),
    ('11111111-1111-1111-1111-111111110003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Line Bazaar & Old Hubli-Dharwad Road', 'WARD-03'),
    ('11111111-1111-1111-1111-111111110004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Gandhinagar & Toll Naka', 'WARD-04'),
    ('11111111-1111-1111-1111-111111110005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Kelgeri & Lake Precinct', 'WARD-05'),
    ('11111111-1111-1111-1111-111111110006', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Hosayellapur & Market Yard', 'WARD-06'),
    ('11111111-1111-1111-1111-111111110007', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Navalur & Industrial Corridor', 'WARD-07'),
    ('11111111-1111-1111-1111-111111110008', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000071', 'Sadhankeri & Cultural Zone', 'WARD-08')
ON CONFLICT (tenant_id, code) DO UPDATE
SET name = EXCLUDED.name;

-- 4. Ensure Additional Municipal Departments
INSERT INTO departments (id, tenant_id, name, code, description) VALUES
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000002', 'Electricity Distribution (HESCOM)', 'HES', 'Street lighting and power distribution'),
('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000002', 'Public Health & Environment', 'PHE', 'Public health, fogging and urban greenery')
ON CONFLICT (tenant_id, code) DO NOTHING;

ALTER TABLE constituencies FORCE ROW LEVEL SECURITY;
ALTER TABLE wards FORCE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
