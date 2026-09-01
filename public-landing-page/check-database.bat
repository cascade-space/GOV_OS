@echo off
echo ========================================
echo Checking CivicPath Database
echo ========================================
echo.

set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 10;"

echo.
echo ========================================
echo Total Complaints Count:
echo ========================================
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) as total_complaints FROM complaints;"

echo.
echo Press any key to exit...
pause >nul
