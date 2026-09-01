@echo off
echo ========================================
echo Testing Complaint System Fixes
echo ========================================
echo.

echo Step 1: Checking database connection...
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) as total_complaints FROM complaints;"

echo.
echo Step 2: Checking recent complaints...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5;"

echo.
echo Step 3: Verifying complaint_number column exists...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'complaints' AND column_name = 'complaint_number';"

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Now restart your backend server and try submitting a complaint.
echo.
pause
