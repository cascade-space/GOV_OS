-- ============================================
-- CivicPath Database Check Commands
-- ============================================
-- Run these in pgAdmin Query Tool or psql
-- Database: civicpath
-- ============================================

-- 1. CHECK CURRENT DATABASE
SELECT current_database(), current_user;

-- 2. LIST ALL TABLES
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. COUNT COMPLAINTS
SELECT COUNT(*) as total_complaints FROM complaints;

-- 4. VIEW ALL COMPLAINTS
SELECT 
    complaint_number,
    title,
    category,
    status,
    priority,
    citizen_name,
    citizen_mobile,
    created_at
FROM complaints 
ORDER BY created_at DESC;

-- 5. VIEW COMPLAINT DETAILS (with location)
SELECT 
    complaint_number,
    title,
    description,
    category,
    sub_category,
    status,
    priority,
    location_address,
    ward,
    citizen_name,
    citizen_mobile,
    citizen_email,
    created_at,
    updated_at
FROM complaints 
ORDER BY created_at DESC;

-- 6. CHECK COMPLAINT ATTACHMENTS
SELECT 
    ca.id,
    ca.complaint_id,
    c.complaint_number,
    ca.file_name,
    ca.file_type,
    ca.file_size_kb,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;

-- 7. CHECK COMPLAINT HISTORY
SELECT 
    ch.id,
    c.complaint_number,
    ch.activity_type,
    ch.old_status,
    ch.new_status,
    ch.performed_by_role,
    ch.notes,
    ch.created_at
FROM complaint_history ch
JOIN complaints c ON ch.complaint_id = c.id
ORDER BY ch.created_at DESC;

-- 8. COUNT BY STATUS
SELECT 
    status,
    COUNT(*) as count
FROM complaints
GROUP BY status
ORDER BY count DESC;

-- 9. COUNT BY CATEGORY
SELECT 
    category,
    COUNT(*) as count
FROM complaints
GROUP BY category
ORDER BY count DESC;

-- 10. COUNT BY PRIORITY
SELECT 
    priority,
    COUNT(*) as count
FROM complaints
GROUP BY priority
ORDER BY count DESC;

-- 11. RECENT COMPLAINTS (Last 10)
SELECT 
    complaint_number,
    title,
    status,
    priority,
    citizen_name,
    created_at
FROM complaints 
ORDER BY created_at DESC 
LIMIT 10;

-- 12. CHECK USERS TABLE
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    status,
    created_at
FROM users
ORDER BY created_at DESC;

-- 13. CHECK DEPARTMENTS
SELECT 
    id,
    name,
    code,
    description,
    is_active,
    created_at
FROM departments
ORDER BY name;

-- 14. CHECK OFFICERS
SELECT 
    o.id,
    u.full_name,
    o.employee_id,
    o.designation,
    o.ward_assigned,
    o.total_assigned,
    o.total_resolved,
    o.is_available
FROM officers o
JOIN users u ON o.user_id = u.id
ORDER BY u.full_name;

-- 15. CHECK DATABASE SIZE
SELECT 
    pg_size_pretty(pg_database_size('civicpath')) as database_size;

-- 16. CHECK TABLE SIZES
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 17. SEARCH COMPLAINT BY NUMBER
-- Replace 'CMP-2026-00001' with your complaint number
SELECT * FROM complaints 
WHERE complaint_number = 'CMP-2026-00001';

-- 18. SEARCH COMPLAINT BY CITIZEN MOBILE
-- Replace '9876543210' with mobile number
SELECT 
    complaint_number,
    title,
    status,
    created_at
FROM complaints 
WHERE citizen_mobile = '9876543210'
ORDER BY created_at DESC;

-- 19. CHECK COMPLAINTS WITH ATTACHMENTS
SELECT 
    c.complaint_number,
    c.title,
    COUNT(ca.id) as attachment_count
FROM complaints c
LEFT JOIN complaint_attachments ca ON c.complaint_id = ca.id
GROUP BY c.complaint_number, c.title
HAVING COUNT(ca.id) > 0
ORDER BY attachment_count DESC;

-- 20. CHECK SYSTEM HEALTH
SELECT 
    'Complaints' as table_name, COUNT(*) as record_count FROM complaints
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Officers', COUNT(*) FROM officers
UNION ALL
SELECT 'Attachments', COUNT(*) FROM complaint_attachments
UNION ALL
SELECT 'History', COUNT(*) FROM complaint_history;

-- ============================================
-- USEFUL FILTERS
-- ============================================

-- Get complaints by status
SELECT * FROM complaints WHERE status = 'submitted';
SELECT * FROM complaints WHERE status = 'in_progress';
SELECT * FROM complaints WHERE status = 'resolved';

-- Get complaints by priority
SELECT * FROM complaints WHERE priority = 'high';
SELECT * FROM complaints WHERE priority = 'critical';

-- Get complaints by date range
SELECT * FROM complaints 
WHERE created_at >= '2026-02-25' 
AND created_at < '2026-02-26';

-- Get complaints from today
SELECT * FROM complaints 
WHERE DATE(created_at) = CURRENT_DATE;

-- Get complaints from last 7 days
SELECT * FROM complaints 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================
-- MAINTENANCE COMMANDS
-- ============================================

-- Clear all complaints (USE WITH CAUTION!)
-- TRUNCATE TABLE complaint_attachments, complaint_history, complaints RESTART IDENTITY CASCADE;

-- Delete specific complaint
-- DELETE FROM complaints WHERE complaint_number = 'CMP-2026-00001';

-- Update complaint status
-- UPDATE complaints SET status = 'in_progress' WHERE complaint_number = 'CMP-2026-00001';
