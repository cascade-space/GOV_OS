@echo off
echo ========================================
echo   CivicPath - All Portals
echo ========================================
echo.
echo This will open 4 terminal windows:
echo   1. Citizen Portal - Port 3000
echo   2. Officer Portal - Port 3001
echo   3. Admin Portal   - Port 3002
echo   4. MLA Portal     - Port 3003
echo.
echo Press any key to continue...
pause >nul

start "Citizen Portal - Port 3000" cmd /k "npm run dev"
timeout /t 2 >nul
start "Officer Portal - Port 3001" cmd /k "npm run dev:officer"
timeout /t 2 >nul
start "Admin Portal - Port 3002" cmd /k "npm run dev:admin"
timeout /t 2 >nul
start "MLA Portal - Port 3003" cmd /k "npm run dev:mla"

echo.
echo All portals are starting...
echo.
echo Access URLs:
echo   Citizen: http://localhost:3000/citizen
echo   Officer: http://localhost:3001/officer/dashboard
echo   Admin:   http://localhost:3002/admin/login
echo   MLA:     http://localhost:3003/mla/dashboard
echo.
echo Close this window when done.
pause
