@echo off
echo ========================================
echo Testing civicpath Database Connection
echo ========================================
echo.

set PGPASSWORD=mayursql

echo Connecting to civicpath database...
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT current_database() as database, current_user as user, COUNT(*) as total_complaints FROM complaints;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database is working!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR! Could not connect
    echo ========================================
)

echo.
pause
