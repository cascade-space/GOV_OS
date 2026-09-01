@echo off
echo ========================================
echo Checking BOTH Databases
echo ========================================
echo.

set PGPASSWORD=mayursql

echo ========================================
echo 1. CIVIC_PLATFORM Database (OLD)
echo ========================================
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d civic_platform -c "SELECT ticket_number as complaint_id, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5;"

echo.
echo ========================================
echo 2. CIVICPATH Database (NEW - ACTIVE)
echo ========================================
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5;"

echo.
echo ========================================
echo Summary
echo ========================================
echo Backend is NOW using: CIVICPATH database
echo You are viewing in pgAdmin: CIVIC_PLATFORM database
echo.
echo TO SEE NEW COMPLAINTS:
echo Switch to 'civicpath' database in pgAdmin!
echo.
pause
