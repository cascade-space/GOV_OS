@echo off
echo ========================================
echo Quick Database Check - civicpath
echo ========================================
echo.

set PGPASSWORD=mayursql

echo [1] Current Database and User:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT current_database(), current_user;"
echo.

echo [2] Total Complaints:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) as total FROM complaints;"
echo.

echo [3] All Complaints:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, priority, citizen_name, created_at FROM complaints ORDER BY created_at DESC;"
echo.

echo [4] Complaints by Status:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT status, COUNT(*) as count FROM complaints GROUP BY status;"
echo.

echo [5] Recent Activity (History):
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT ch.activity_type, ch.new_status, ch.performed_by_role, ch.created_at FROM complaint_history ch ORDER BY ch.created_at DESC LIMIT 5;"
echo.

echo [6] Attachments:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) as total_attachments FROM complaint_attachments;"
echo.

echo ========================================
echo Check Complete!
echo ========================================
echo.
echo For more detailed queries, see:
echo   database/check-civicpath-db.sql
echo.
pause
