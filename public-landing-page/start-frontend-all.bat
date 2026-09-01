@echo off
echo ========================================
echo Starting All CivicPath Frontend Portals
echo ========================================
echo.
echo Citizen Portal: http://localhost:3000
echo Officer Portal: http://localhost:3001
echo MLA Portal:     http://localhost:3003
echo.
echo Press Ctrl+C to stop all servers
echo.
start "Citizen Portal" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "Officer Portal" cmd /k "npm run dev:officer"
timeout /t 3 /nobreak >nul
start "MLA Portal" cmd /k "npm run dev:mla"
echo.
echo All portals are starting...
echo Check the new windows that opened.
pause
