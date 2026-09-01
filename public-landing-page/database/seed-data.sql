-- ============================================
-- CivicPath Seed Data - PostgreSQL
-- ============================================
-- Description: Sample data for testing and development
-- ============================================

-- ============================================
-- 1. CONSTITUENCIES
-- ============================================

INSERT INTO constituencies (id, name, code, total_wards, population, area_sq_km) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'North Constituency', 'CONST-NORTH', 15, 250000, 45.5),
('550e8400-e29b-41d4-a716-446655440002', 'South Constituency', 'CONST-SOUTH', 12, 180000, 38.2),
('550e8400-e29b-41d4-a716-446655440003', 'East Constituency', 'CONST-EAST', 18, 320000, 52.8);

-- ============================================
-- 2. DEPARTMENTS
-- ============================================

INSERT INTO departments (id, name, code, description, contact_email, contact_phone, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Roads & Public Works', 'DEPT-ROADS', 'Handles road maintenance, potholes, and infrastructure', 'roads@civicpath.gov', '1800-ROADS-01', true),
('650e8400-e29b-41d4-a716-446655440002', 'Water Supply', 'DEPT-WATER', 'Water supply, leakage, and quality issues', 'water@civicpath.gov', '1800-WATER-01', true),
('650e8400-e29b-41d4-a716-446655440003', 'Sanitation', 'DEPT-SANIT', 'Garbage collection, drainage, and cleanliness', 'sanitation@civicpath.gov', '1800-CLEAN-01', true),
('650e8400-e29b-41d4-a716-446655440004', 'Street Lighting', 'DEPT-LIGHT', 'Street lights and electrical issues', 'lighting@civicpath.gov', '1800-LIGHT-01', true),
('650e8400-e29b-41d4-a716-446655440005', 'Parks & Recreation', 'DEPT-PARKS', 'Parks, playgrounds, and public spaces', 'parks@civicpath.gov', '1800-PARKS-01', true);

-- ============================================
-- 3. USERS (Officers, Admins, MLAs)
-- ============================================

-- Admin users
INSERT INTO users (id, username, email, password_hash, full_name, mobile, role, status) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'System Administrator', '9876543210', 'admin', 'active'),
('750e8400-e29b-41d4-a716-446655440002', 'supervisor1', 'supervisor1@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Rajesh Kumar', '9876543211', 'supervisor', 'active');

-- Officer users
INSERT INTO users (id, username, email, password_hash, full_name, mobile, role, status) VALUES
('750e8400-e29b-41d4-a716-446655440010', 'officer1', 'suresh.patil@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Suresh Patil', '9876543220', 'officer', 'active'),
('750e8400-e29b-41d4-a716-446655440011', 'officer2', 'priya.sharma@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Priya Sharma', '9876543221', 'officer', 'active'),
('750e8400-e29b-41d4-a716-446655440012', 'officer3', 'amit.verma@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Amit Verma', '9876543222', 'officer', 'active'),
('750e8400-e29b-41d4-a716-446655440013', 'officer4', 'neha.singh@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Neha Singh', '9876543223', 'officer', 'active'),
('750e8400-e29b-41d4-a716-446655440014', 'officer5', 'rahul.desai@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Rahul Desai', '9876543224', 'officer', 'active');

-- MLA users
INSERT INTO users (id, username, email, password_hash, full_name, mobile, role, status) VALUES
('750e8400-e29b-41d4-a716-446655440020', 'mla1', 'rajesh.kumar.mla@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Hon. Rajesh Kumar', '9876543230', 'mla', 'active'),
('750e8400-e29b-41d4-a716-446655440021', 'mla2', 'priya.devi.mla@civicpath.gov', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Hon. Priya Devi', '9876543231', 'mla', 'active');

-- ============================================
-- 4. OFFICERS
-- ============================================

INSERT INTO officers (id, user_id, department_id, employee_id, designation, ward_assigned, performance_score, total_resolved, total_assigned, is_available, joined_date) VALUES
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', 'EMP-2024-001', 'Senior Field Officer', 'Ward 12', 92.5, 145, 160, true, '2023-01-15'),
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440002', 'EMP-2024-002', 'Field Officer', 'Ward 8', 88.3, 98, 115, true, '2023-03-20'),
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'EMP-2024-003', 'Field Officer', 'Ward 15', 85.7, 112, 135, true, '2023-06-10'),
('850e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', 'EMP-2024-004', 'Junior Field Officer', 'Ward 5', 78.2, 67, 90, true, '2024-01-05'),
('850e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440001', 'EMP-2024-005', 'Field Officer', 'Ward 20', 90.1, 128, 145, true, '2023-09-15');

-- ============================================
-- 5. MLAs
-- ============================================

INSERT INTO mlas (id, user_id, constituency_id, party_name, term_start_date, term_end_date, office_address, is_current) VALUES
('950e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Progressive Party', '2023-01-01', '2028-12-31', 'MLA Office, North Constituency, Main Road', true),
('950e8400-e29b-41d4-a716-446655440021', '750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Democratic Alliance', '2023-01-01', '2028-12-31', 'MLA Office, South Constituency, Central Avenue', true);

-- ============================================
-- 6. SAMPLE COMPLAINTS
-- ============================================

INSERT INTO complaints (
    id, complaint_number, citizen_name, citizen_mobile, citizen_email,
    title, description, category, sub_category, priority, status,
    location_address, latitude, longitude, ward, constituency_id,
    assigned_department_id, assigned_officer_id,
    sla_deadline, is_escalated, ai_urgency_score,
    created_at
) VALUES
-- Active complaints
('a50e8400-e29b-41d4-a716-446655440001', 'CMP-2024-00001', 'Ramesh Patel', '9123456789', 'ramesh@example.com',
 'Large pothole on Main Street', 'There is a large pothole near the traffic signal causing accidents. Urgent repair needed.',
 'Roads & Infrastructure', 'Potholes', 'high', 'in_progress',
 'Main Street, Near Traffic Signal, Ward 12', 12.9716, 77.5946, 'Ward 12', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010',
 CURRENT_TIMESTAMP + INTERVAL '20 hours', false, 0.85,
 CURRENT_TIMESTAMP - INTERVAL '2 days'),

('a50e8400-e29b-41d4-a716-446655440002', 'CMP-2024-00002', 'Sunita Sharma', '9123456790', 'sunita@example.com',
 'Water leakage in residential area', 'Continuous water leakage from main pipeline for the past 3 days.',
 'Water Supply', 'Leakage', 'critical', 'assigned',
 'Green Park Colony, Block A, Ward 8', 12.9800, 77.6000, 'Ward 8', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440011',
 CURRENT_TIMESTAMP + INTERVAL '2 hours', false, 0.92,
 CURRENT_TIMESTAMP - INTERVAL '6 hours'),

('a50e8400-e29b-41d4-a716-446655440003', 'CMP-2024-00003', 'Anil Kumar', '9123456791', 'anil@example.com',
 'Garbage not collected for 5 days', 'Garbage bins are overflowing and not collected for the past 5 days.',
 'Sanitation', 'Garbage Collection', 'medium', 'validated',
 'Sunrise Apartments, Ward 15', 12.9650, 77.5850, 'Ward 15', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440003', NULL,
 CURRENT_TIMESTAMP + INTERVAL '60 hours', false, 0.68,
 CURRENT_TIMESTAMP - INTERVAL '12 hours'),

-- Resolved complaints
('a50e8400-e29b-41d4-a716-446655440004', 'CMP-2024-00004', 'Meera Reddy', '9123456792', 'meera@example.com',
 'Street light not working', 'Street light pole #45 not working for 2 weeks.',
 'Street Lighting', 'Light Not Working', 'low', 'resolved',
 'Park Avenue, Near School, Ward 5', 12.9550, 77.5750, 'Ward 5', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440013',
 CURRENT_TIMESTAMP - INTERVAL '5 days', false, 0.45,
 CURRENT_TIMESTAMP - INTERVAL '7 days'),

('a50e8400-e29b-41d4-a716-446655440005', 'CMP-2024-00005', 'Vikram Singh', '9123456793', 'vikram@example.com',
 'Broken footpath near market', 'Footpath tiles are broken and dangerous for pedestrians.',
 'Roads & Infrastructure', 'Footpath', 'medium', 'resolved',
 'Market Road, Ward 20', 12.9900, 77.6100, 'Ward 20', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440014',
 CURRENT_TIMESTAMP - INTERVAL '10 days', false, 0.62,
 CURRENT_TIMESTAMP - INTERVAL '15 days');

-- Update resolved complaints
UPDATE complaints SET 
    resolved_at = CURRENT_TIMESTAMP - INTERVAL '2 days',
    resolution_notes = 'Street light bulb replaced and tested. Working properly now.',
    citizen_satisfaction_rating = 5,
    citizen_feedback = 'Very quick response. Thank you!'
WHERE id = 'a50e8400-e29b-41d4-a716-446655440004';

UPDATE complaints SET 
    resolved_at = CURRENT_TIMESTAMP - INTERVAL '5 days',
    resolution_notes = 'Footpath tiles replaced with new ones. Area is now safe.',
    citizen_satisfaction_rating = 4,
    citizen_feedback = 'Good work but took a bit longer than expected.'
WHERE id = 'a50e8400-e29b-41d4-a716-446655440005';

-- ============================================
-- 7. COMPLAINT HISTORY
-- ============================================

INSERT INTO complaint_history (complaint_id, activity_type, old_status, new_status, performed_by_id, performed_by_role, notes) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'created', NULL, 'submitted', NULL, 'citizen', 'Complaint submitted by citizen'),
('a50e8400-e29b-41d4-a716-446655440001', 'status_changed', 'submitted', 'validated', '750e8400-e29b-41d4-a716-446655440001', 'admin', 'Complaint validated by admin'),
('a50e8400-e29b-41d4-a716-446655440001', 'assigned', 'validated', 'assigned', '750e8400-e29b-41d4-a716-446655440001', 'admin', 'Assigned to Roads & Public Works department'),
('a50e8400-e29b-41d4-a716-446655440001', 'status_changed', 'assigned', 'in_progress', '750e8400-e29b-41d4-a716-446655440010', 'officer', 'Field officer started working on the issue');

-- ============================================
-- 8. COMMENTS
-- ============================================

INSERT INTO comments (complaint_id, user_id, comment_text, visibility, is_work_note) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440010', 'Site inspection completed. Materials ordered for repair.', 'internal', true),
('a50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440010', 'Repair work scheduled for tomorrow morning.', 'public', false);

-- ============================================
-- 9. ANNOUNCEMENTS
-- ============================================

INSERT INTO announcements (title, content, type, priority, created_by_id, target_audience, is_active, published_at) VALUES
('Scheduled Maintenance - Water Supply', 'Water supply will be interrupted on Sunday from 10 AM to 2 PM for maintenance work in Ward 8 and Ward 12.', 'maintenance', 'high', '750e8400-e29b-41d4-a716-446655440001', ARRAY['citizen'::user_role], true, CURRENT_TIMESTAMP),
('New Complaint Portal Features', 'We have added photo upload and real-time tracking features to the complaint portal.', 'general', 'medium', '750e8400-e29b-41d4-a716-446655440001', ARRAY['citizen'::user_role, 'officer'::user_role], true, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- ============================================
-- 10. DAILY STATISTICS (Sample)
-- ============================================

INSERT INTO daily_statistics (
    stat_date, department_id, ward, 
    total_submitted, total_resolved, total_pending, total_escalated,
    sla_met, sla_breached, avg_resolution_time_hours, avg_satisfaction_rating
) VALUES
(CURRENT_DATE - INTERVAL '1 day', '650e8400-e29b-41d4-a716-446655440001', 'Ward 12', 5, 4, 1, 0, 4, 0, 18.5, 4.5),
(CURRENT_DATE - INTERVAL '1 day', '650e8400-e29b-41d4-a716-446655440002', 'Ward 8', 3, 2, 1, 0, 2, 0, 12.3, 4.8),
(CURRENT_DATE - INTERVAL '1 day', '650e8400-e29b-41d4-a716-446655440003', 'Ward 15', 4, 3, 1, 0, 3, 0, 24.7, 4.2);

-- ============================================
-- END OF SEED DATA
-- ============================================
