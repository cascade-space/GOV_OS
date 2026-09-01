@echo off
echo ========================================
echo  CivicPath - Database Verification
echo ========================================
echo.
echo Checking database contents...
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d civicpath -c "SELECT COUNT(*) as total_complaints FROM complaints;"

echo.
echo Latest complaints:
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d civicpath -c "SELECT complaint_number, citizen_name, citizen_mobile, status, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as submitted_at FROM complaints ORDER BY created_at DESC LIMIT 5;"

echo.
echo ========================================
echo.
pause
