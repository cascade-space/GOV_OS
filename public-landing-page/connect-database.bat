@echo off
echo ========================================
echo Connecting to CivicPath Database
echo ========================================
echo.
echo You can now run SQL commands.
echo.
echo Useful commands:
echo   \dt                    - List all tables
echo   \d complaints          - Show complaints table structure
echo   SELECT * FROM complaints;  - View all complaints
echo   \q                     - Exit
echo.
echo ========================================
echo.

set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath
