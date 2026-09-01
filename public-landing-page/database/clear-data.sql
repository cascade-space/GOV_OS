-- Clear all data from CivicPath database
-- This will remove all dummy/seed data but keep the schema intact

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = 'replica';

-- Clear all tables in correct order (respecting foreign keys)
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE daily_statistics CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE mla_directives CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE complaint_history CASCADE;
TRUNCATE TABLE complaint_attachments CASCADE;
TRUNCATE TABLE complaints CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE mlas CASCADE;
TRUNCATE TABLE constituencies CASCADE;
TRUNCATE TABLE officers CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
ALTER SEQUENCE officers_id_seq RESTART WITH 1;
ALTER SEQUENCE constituencies_id_seq RESTART WITH 1;
ALTER SEQUENCE mlas_id_seq RESTART WITH 1;
ALTER SEQUENCE complaints_id_seq RESTART WITH 1;
ALTER SEQUENCE complaint_history_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE mla_directives_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE announcements_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_statistics_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_log_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'complaints' as table_name, COUNT(*) as row_count FROM complaints
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'officers', COUNT(*) FROM officers
UNION ALL
SELECT 'mlas', COUNT(*) FROM mlas
UNION ALL
SELECT 'constituencies', COUNT(*) FROM constituencies;

-- Success message
SELECT '✅ All dummy data cleared successfully!' as status;
