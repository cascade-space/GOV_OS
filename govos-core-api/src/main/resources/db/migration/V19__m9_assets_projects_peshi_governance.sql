-- ============================================================
-- V19: Milestone M9 — Assets, Projects & Documents/Peshi Governance
-- GovOS MTAS — Infrastructure, Public Works & Hearing Dockets
-- ============================================================

-- 1. Extend Complaints with Relational Links to Assets and Projects
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES civic_assets(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES civic_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_complaints_asset_id ON complaints(asset_id);
CREATE INDEX IF NOT EXISTS idx_complaints_project_id ON complaints(project_id);

-- 2. Enrich Civic Assets with Ward, Department, Cost & Technical Specs
ALTER TABLE civic_assets
    ADD COLUMN IF NOT EXISTS ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS installation_date DATE,
    ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cost DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_civic_assets_ward ON civic_assets(ward_id);
CREATE INDEX IF NOT EXISTS idx_civic_assets_category ON civic_assets(category);

-- 3. Enrich Civic Projects with Ward, Department, Contractor, Sector & Milestones
ALTER TABLE civic_projects
    ADD COLUMN IF NOT EXISTS ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contractor_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS beneficiaries_description VARCHAR(255),
    ADD COLUMN IF NOT EXISTS target_date_formatted VARCHAR(50),
    ADD COLUMN IF NOT EXISTS sector VARCHAR(50) DEFAULT 'INFRASTRUCTURE';

CREATE INDEX IF NOT EXISTS idx_civic_projects_ward ON civic_projects(ward_id);
CREATE INDEX IF NOT EXISTS idx_civic_projects_sector ON civic_projects(sector);

-- 4. Enrich Documents for Peshi, Hearings, Directives & Attachments
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS directive_id UUID REFERENCES mla_directives(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'NORMAL',
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS next_hearing_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS hearing_bench_officer VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hearing_summary TEXT,
    ADD COLUMN IF NOT EXISTS hearing_order_url TEXT;

CREATE INDEX IF NOT EXISTS idx_documents_directive ON documents(directive_id);
CREATE INDEX IF NOT EXISTS idx_documents_complaint ON documents(complaint_id);
CREATE INDEX IF NOT EXISTS idx_documents_hearing_date ON documents(next_hearing_date);

-- 5. Create Document Movements Table (Peshi File Custody Audit Ledger)
CREATE TABLE IF NOT EXISTS document_movements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id             UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    from_desk               VARCHAR(100) NOT NULL,
    to_desk                 VARCHAR(100) NOT NULL,
    dispatched_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_at             TIMESTAMPTZ,
    dispatch_notes          TEXT,
    receipt_remarks         TEXT,
    is_urgent               BOOLEAN DEFAULT FALSE,
    created_by              UUID REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE document_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_movements FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'document_movements' AND policyname = 'tenant_iso'
    ) THEN
        CREATE POLICY tenant_iso ON document_movements USING (tenant_id = current_tenant_id());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'document_movements' AND policyname = 'govos_admin_bypass'
    ) THEN
        CREATE POLICY govos_admin_bypass ON document_movements TO govos_admin USING (TRUE);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_movements_doc ON document_movements(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_movements_tenant ON document_movements(tenant_id);

-- ============================================================
-- 6. Seed Authentic Dharwad Municipal Corporation (HDMC) Data
-- ============================================================
-- Tenant: 00000000-0000-0000-0000-000000000002

ALTER TABLE civic_assets NO FORCE ROW LEVEL SECURITY;
ALTER TABLE civic_projects NO FORCE ROW LEVEL SECURITY;
ALTER TABLE documents NO FORCE ROW LEVEL SECURITY;
ALTER TABLE document_movements NO FORCE ROW LEVEL SECURITY;

-- A. Civic Assets
INSERT INTO civic_assets (
    id, tenant_id, asset_id, name, category, status, latitude, longitude,
    next_maintenance_date, ward_id, department_id, installation_date, manufacturer, cost
) VALUES
(
    '22222222-2222-2222-2222-222222220001', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-SL-001', 'Smart LED Streetlight Cluster #1', 'STREETLIGHT', 'ACTIVE',
    15.4589, 74.9892, CURRENT_DATE + INTERVAL '45 days',
    '11111111-1111-1111-1111-111111110001', '00000000-0000-0000-0003-000000000004',
    '2025-01-15', 'Havells Smart Lighting Ltd', 145000.00
),
(
    '22222222-2222-2222-2222-222222220002', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-SL-002', 'High-Mast Stadium Lighting Mast', 'STREETLIGHT', 'MAINTENANCE',
    15.4530, 75.0080, CURRENT_DATE + INTERVAL '3 days',
    '11111111-1111-1111-1111-111111110003', '00000000-0000-0000-0003-000000000004',
    '2024-08-20', 'Bajaj Electricals Ltd', 320000.00
),
(
    '22222222-2222-2222-2222-222222220003', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-WP-001', 'Submersible Borewell Pump 25HP', 'WATER_INFRASTRUCTURE', 'ACTIVE',
    15.4670, 74.9750, CURRENT_DATE + INTERVAL '60 days',
    '11111111-1111-1111-1111-111111110005', '00000000-0000-0000-0003-000000000002',
    '2024-11-10', 'Kirloskar Brothers Ltd', 450000.00
),
(
    '22222222-2222-2222-2222-222222220004', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-WP-002', 'Water Pressure Regulating Station', 'WATER_INFRASTRUCTURE', 'ACTIVE',
    15.4610, 75.0120, CURRENT_DATE + INTERVAL '90 days',
    '11111111-1111-1111-1111-111111110002', '00000000-0000-0000-0003-000000000002',
    '2025-03-01', 'Grundfos Pumps India', 680000.00
),
(
    '22222222-2222-2222-2222-222222220005', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-TR-001', 'Industrial Step-Down Transformer 11kV', 'ELECTRICAL', 'ACTIVE',
    15.4350, 75.0250, CURRENT_DATE + INTERVAL '30 days',
    '11111111-1111-1111-1111-111111110007', '00000000-0000-0000-0003-000000000004',
    '2023-06-18', 'Schneider Electric', 850000.00
),
(
    '22222222-2222-2222-2222-222222220006', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-SWM-001', 'Hydraulic Refuse Compactor Vehicle (KA-25-G-1420)', 'VEHICLE', 'ACTIVE',
    15.4690, 75.0010, CURRENT_DATE + INTERVAL '14 days',
    '11111111-1111-1111-1111-111111110004', '00000000-0000-0000-0003-000000000003',
    '2024-02-14', 'Tata Motors Commercial', 2800000.00
),
(
    '22222222-2222-2222-2222-222222220007', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-SWM-002', 'Underground Smart Waste Bin Sensor Array', 'SANITATION', 'ACTIVE',
    15.4510, 75.0040, CURRENT_DATE + INTERVAL '180 days',
    '11111111-1111-1111-1111-111111110006', '00000000-0000-0000-0003-000000000003',
    '2025-05-12', 'CleanTech Systems India', 210000.00
),
(
    '22222222-2222-2222-2222-222222220008', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-PK-001', 'Lake Aeration & Ecological Oxygenator', 'ENVIRONMENT', 'ACTIVE',
    15.4480, 74.9920, CURRENT_DATE + INTERVAL '40 days',
    '11111111-1111-1111-1111-111111110008', '00000000-0000-0000-0003-000000000005',
    '2024-09-05', 'AquaEcology Technologies', 520000.00
),
(
    '22222222-2222-2222-2222-222222220009', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-BLD-001', 'Zonal Municipal Citizens Service Center', 'BUILDING', 'ACTIVE',
    15.4595, 74.9880, CURRENT_DATE + INTERVAL '365 days',
    '11111111-1111-1111-1111-111111110001', '00000000-0000-0000-0003-000000000001',
    '2022-01-20', 'Karnataka PWD Construction', 7500000.00
),
(
    '22222222-2222-2222-2222-222222220010', '00000000-0000-0000-0000-000000000002',
    'AST-HDMC-RD-001', 'Automated Pavement Quality & Defect Scanner', 'ROADS', 'ACTIVE',
    15.4540, 75.0060, CURRENT_DATE + INTERVAL '60 days',
    '11111111-1111-1111-1111-111111110003', '00000000-0000-0000-0003-000000000001',
    '2025-04-10', 'RoadMetrics AI Labs', 380000.00
)
ON CONFLICT (tenant_id, asset_id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    next_maintenance_date = EXCLUDED.next_maintenance_date,
    ward_id = EXCLUDED.ward_id,
    department_id = EXCLUDED.department_id,
    cost = EXCLUDED.cost;

-- B. Civic Projects (The 6 Dharwad Public Works)
INSERT INTO civic_projects (
    id, tenant_id, project_id, title, status, budget, spent,
    start_date, estimated_end_date, completion_percentage,
    ward_id, department_id, contractor_name, beneficiaries_description,
    target_date_formatted, sector
) VALUES
(
    '33333333-3333-3333-3333-333333330001', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-001', 'Saptapur University Main Road Four-Laning & Asphalting', 'IN_PROGRESS',
    12500000.00, 10250000.00, '2026-01-10', '2026-10-15', 82,
    '11111111-1111-1111-1111-111111110001', '00000000-0000-0000-0003-000000000001',
    'Karnataka Road Development Corp', '35,000 daily commuters',
    'Oct 15, 2026', 'ROADS'
),
(
    '33333333-3333-3333-3333-333333330002', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-002', 'Kelgeri Lake Rejuvenation, Aerators & Jogging Track', 'IN_PROGRESS',
    8500000.00, 7990000.00, '2025-11-01', '2026-09-20', 94,
    '11111111-1111-1111-1111-111111110005', '00000000-0000-0000-0003-000000000005',
    'GreenEco Infra Ltd', '15,000 residents',
    'Sep 20, 2026', 'ENVIRONMENT'
),
(
    '33333333-3333-3333-3333-333333330003', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-003', 'Line Bazaar Underground Drainage Network Modernization', 'IN_PROGRESS',
    6200000.00, 4216000.00, '2026-02-15', '2026-11-01', 68,
    '11111111-1111-1111-1111-111111110003', '00000000-0000-0000-0003-000000000002',
    'Dharwad Urban Water Engg', '8,200 commercial shops',
    'Nov 01, 2026', 'WATER'
),
(
    '33333333-3333-3333-3333-333333330004', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-004', 'Navalur Industrial Feeder Line Substation Upgrade', 'IN_PROGRESS',
    4800000.00, 2640000.00, '2026-03-01', '2026-11-30', 55,
    '11111111-1111-1111-1111-111111110007', '00000000-0000-0000-0003-000000000004',
    'HESCOM Projects Division', '140 MSME Industrial Units',
    'Nov 30, 2026', 'ELECTRICITY'
),
(
    '33333333-3333-3333-3333-333333330005', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-005', 'Sadhankeri Heritage Park Cultural Open Amphitheater', 'IN_PROGRESS',
    3800000.00, 2850000.00, '2026-01-20', '2026-10-05', 75,
    '11111111-1111-1111-1111-111111110008', '00000000-0000-0000-0003-000000000001',
    'Hubballi Heritage Builders', 'All Dharwad Citizens',
    'Oct 05, 2026', 'INFRASTRUCTURE'
),
(
    '33333333-3333-3333-3333-333333330006', '00000000-0000-0000-0000-000000000002',
    'PRJ-HDMC-2026-006', 'Gandhinagar Smart Waste Segregation & Processing Hub', 'IN_PROGRESS',
    6000000.00, 5280000.00, '2025-12-10', '2026-09-25', 88,
    '11111111-1111-1111-1111-111111110004', '00000000-0000-0000-0003-000000000003',
    'CleanCity Ventures Pvt Ltd', '42,000 Ward Residents',
    'Sep 25, 2026', 'SANITATION'
)
ON CONFLICT (tenant_id, project_id) DO UPDATE
SET title = EXCLUDED.title,
    status = EXCLUDED.status,
    budget = EXCLUDED.budget,
    spent = EXCLUDED.spent,
    completion_percentage = EXCLUDED.completion_percentage,
    contractor_name = EXCLUDED.contractor_name,
    beneficiaries_description = EXCLUDED.beneficiaries_description,
    target_date_formatted = EXCLUDED.target_date_formatted,
    sector = EXCLUDED.sector;

-- C. Documents / Peshi Hearing Dockets
INSERT INTO documents (
    id, tenant_id, document_number, title, type, status, current_desk, received_date,
    priority, next_hearing_date, hearing_bench_officer, hearing_summary, department_id
) VALUES
(
    '44444444-4444-4444-4444-444444440001', '00000000-0000-0000-0000-000000000002',
    'DOC-PESHI-202609-001', 'Saptapur Commercial Encroachment Notice & Show-Cause Hearing',
    'NOTICE', 'RECEIVED', 'MUNICIPAL_COMMISSIONER_DESK', CURRENT_DATE,
    'URGENT', NOW() + INTERVAL '2 days', 'Dr. Suresh Patil (Addl. Municipal Commissioner)',
    'Encroachment inquiry on University Road pedestrian walkway. All 14 parties summoned with land records.',
    '00000000-0000-0000-0003-000000000001'
),
(
    '44444444-4444-4444-4444-444444440002', '00000000-0000-0000-0000-000000000002',
    'DOC-PESHI-202609-002', 'Line Bazaar Drinking Water Quality Incident & Pipeline Audit Docket',
    'INTERNAL_MEMO', 'IN_TRANSIT', 'CHIEF_ENGINEER_DESK', CURRENT_DATE,
    'IMMEDIATE', NOW() + INTERVAL '1 day', 'Er. Vinay Hegde (Chief Engineer HDMC)',
    'Urgent file routing: Joint inspection findings on sewage cross-leakage near Line Bazaar market.',
    '00000000-0000-0000-0003-000000000002'
),
(
    '44444444-4444-4444-4444-444444440003', '00000000-0000-0000-0000-000000000002',
    'DOC-PESHI-202609-003', 'Navalur Substation High-Tension Cable Procurement Tender Order #442',
    'TENDER', 'RECEIVED', 'HESCOM_EXECUTIVE_ENGINEER_DESK', CURRENT_DATE,
    'NORMAL', NOW() + INTERVAL '5 days', 'Er. Ramesh Kulkarni (SE HESCOM)',
    'Formal vendor bid technical evaluation and allotment for 11kV substation expansion.',
    '00000000-0000-0000-0003-000000000004'
)
ON CONFLICT (tenant_id, document_number) DO UPDATE
SET title = EXCLUDED.title,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    current_desk = EXCLUDED.current_desk,
    priority = EXCLUDED.priority,
    next_hearing_date = EXCLUDED.next_hearing_date,
    hearing_bench_officer = EXCLUDED.hearing_bench_officer,
    hearing_summary = EXCLUDED.hearing_summary;

-- D. Initial Document Movements for Peshi Docket Audit
INSERT INTO document_movements (
    id, tenant_id, document_id, from_desk, to_desk, dispatched_at, received_at, dispatch_notes, receipt_remarks, is_urgent
) VALUES
(
    '55555555-5555-5555-5555-555555550001', '00000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444440001',
    'INWARD_DAK_SECTION', 'MUNICIPAL_COMMISSIONER_DESK',
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour',
    'Inward representation from Saptapur Citizen Welfare Forum alleging right-of-way obstruction.',
    'Acknowledged custody by Commissioner Peshi. Scheduled for preliminary hearing on Friday.',
    TRUE
),
(
    '55555555-5555-5555-5555-555555550002', '00000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444440002',
    'MUNICIPAL_COMMISSIONER_DESK', 'CHIEF_ENGINEER_DESK',
    NOW() - INTERVAL '30 minutes', NULL,
    'Transmitted for urgent site verification and contractor notice regarding sewage seepage.',
    NULL,
    TRUE
),
(
    '55555555-5555-5555-5555-555555550003', '00000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444440003',
    'INWARD_DAK_SECTION', 'HESCOM_EXECUTIVE_ENGINEER_DESK',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours',
    'Technical bid documents submitted by competitive tender participants.',
    'Docket received and entered into official tender committee agenda.',
    FALSE
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE civic_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE civic_projects FORCE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE document_movements FORCE ROW LEVEL SECURITY;
