@echo off
echo ========================================
echo CivicPath System Verification
echo ========================================
echo.

set PGPASSWORD=mayursql

echo [1/5] Checking databases...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -l | findstr "civic"
echo.

echo [2/5] Checking civicpath database connection...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT current_database(), current_user;"
echo.

echo [3/5] Checking complaints table...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) as total_complaints FROM complaints;"
echo.

echo [4/5] Showing recent complaints...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5;"
echo.

echo [5/5] Testing backend API...
curl -s http://localhost:5000/health
echo.
echo.

echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Database: civicpath (ACTIVE)
echo Backend: http://localhost:5000
echo Storage: Local (backend/uploads/)
echo.
echo To view in pgAdmin:
echo   Servers ^> PostgreSQL 18 ^> Databases ^> civicpath
echo.
pause
