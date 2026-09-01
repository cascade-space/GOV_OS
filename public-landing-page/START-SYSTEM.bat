@echo off
echo ========================================
echo   CivicPath System Startup
echo ========================================
echo.

echo Checking if backend is already running...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is already running on port 5000
) else (
    echo [!] Backend is NOT running
    echo.
    echo Starting backend server...
    start "CivicPath Backend" cmd /k "cd backend && npm run dev"
    timeout /t 3 >nul
)

echo.
echo Checking if frontend is already running...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is already running on port 3000
) else (
    echo [!] Frontend is NOT running
    echo.
    echo Starting frontend server...
    start "CivicPath Frontend" cmd /k "npm run dev"
    timeout /t 3 >nul
)

echo.
echo ========================================
echo   System Status
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Admin:    http://localhost:3000/admin/dashboard
echo Citizen:  http://localhost:3000/
echo Officer:  http://localhost:3000/officer/dashboard
echo MLA:      http://localhost:3000/mla/dashboard
echo.
echo ========================================
echo Press any key to open admin dashboard...
pause >nul

start http://localhost:3000/admin/dashboard

echo.
echo System is running!
echo Close this window when done.
pause
