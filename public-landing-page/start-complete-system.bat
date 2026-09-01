@echo off
echo ========================================
echo Starting Complete CivicPath System
echo ========================================
echo.
echo Backend API:    http://localhost:5000
echo Citizen Portal: http://localhost:3000
echo Officer Portal: http://localhost:3001
echo MLA Portal:     http://localhost:3003
echo.
echo Starting servers...
echo.

REM Start Backend
start "Backend API Server" cmd /k "cd backend && npm run dev"
echo Backend starting...
timeout /t 5 /nobreak >nul

REM Start Frontend Portals
start "Citizen Portal" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

start "Officer Portal" cmd /k "npm run dev:officer"
timeout /t 3 /nobreak >nul

start "MLA Portal" cmd /k "npm run dev:mla"

echo.
echo ========================================
echo All servers are starting!
echo ========================================
echo.
echo Check the new windows that opened:
echo - Backend API Server (Port 5000)
echo - Citizen Portal (Port 3000)
echo - Officer Portal (Port 3001)
echo - MLA Portal (Port 3003)
echo.
echo Wait 10-15 seconds for all servers to be ready.
echo Then open your browser to the URLs above.
echo.
echo Press any key to close this window...
pause >nul
