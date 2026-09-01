@echo off
echo ========================================
echo  CivicPath - Clear Database Data
echo ========================================
echo.
echo WARNING: This will delete ALL data from the database!
echo Press Ctrl+C to cancel, or
pause

echo.
echo Clearing all data...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -f database/clear-data.sql

echo.
echo ========================================
echo  Database cleared successfully!
echo ========================================
echo.
echo You can now submit fresh complaints.
echo.
pause
