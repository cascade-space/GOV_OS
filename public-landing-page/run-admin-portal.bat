@echo off
echo ========================================
echo   CivicPath - Admin Portal
echo ========================================
echo.
echo Starting Admin Portal on port 3002...
echo.
echo Access at: http://localhost:3002/admin/login
echo.
echo Demo Credentials:
echo   Email: admin@civic.gov
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev:admin
