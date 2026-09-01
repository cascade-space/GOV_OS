@echo off
echo ========================================
echo   CivicPath System Status Check
echo ========================================
echo.

echo [1] Checking Backend (Port 5000)...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo     [OK] Backend is RUNNING on port 5000
) else (
    echo     [X] Backend is NOT running
    echo     Run: cd backend ^&^& npm run dev
)

echo.
echo [2] Checking Frontend (Port 3000)...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo     [OK] Frontend is RUNNING on port 3000
) else (
    echo     [X] Frontend is NOT running
    echo     Run: npm run dev
)

echo.
echo [3] Testing Backend API...
curl -s http://localhost:5000/api/complaints >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK] Backend API is responding
) else (
    echo     [X] Backend API is not responding
)

echo.
echo [4] Checking Database Connection...
cd backend
node -e "const {pool} = require('./src/config/database'); pool.query('SELECT NOW()').then(r => console.log('    [OK] Database connected')).catch(e => console.log('    [X] Database error:', e.message))" 2>nul
cd ..

echo.
echo ========================================
echo   Quick Links
echo ========================================
echo Admin:    http://localhost:3000/admin/complaints
echo Citizen:  http://localhost:3000/citizen/report
echo Test API: http://localhost:5000/api/complaints
echo.
echo ========================================
pause
