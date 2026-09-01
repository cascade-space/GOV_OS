@echo off
echo ========================================
echo Update Cloudinary Credentials
echo ========================================
echo.
echo This will help you update backend/.env file
echo.
echo Please enter your Cloudinary credentials:
echo (Get them from: https://cloudinary.com/console)
echo.

set /p CLOUD_NAME="Enter Cloud Name: "
set /p API_KEY="Enter API Key: "
set /p API_SECRET="Enter API Secret: "

echo.
echo ========================================
echo Credentials Entered:
echo ========================================
echo Cloud Name: %CLOUD_NAME%
echo API Key: %API_KEY%
echo API Secret: %API_SECRET%
echo.

set /p CONFIRM="Is this correct? (Y/N): "

if /i "%CONFIRM%" NEQ "Y" (
    echo.
    echo Cancelled. Please run again.
    pause
    exit /b
)

echo.
echo Updating backend/.env file...

powershell -Command "(Get-Content backend\.env) -replace 'CLOUDINARY_CLOUD_NAME=.*', 'CLOUDINARY_CLOUD_NAME=%CLOUD_NAME%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'CLOUDINARY_API_KEY=.*', 'CLOUDINARY_API_KEY=%API_KEY%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'CLOUDINARY_API_SECRET=.*', 'CLOUDINARY_API_SECRET=%API_SECRET%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'USE_CLOUDINARY=false', 'USE_CLOUDINARY=true' | Set-Content backend\.env"

echo.
echo ========================================
echo SUCCESS! Credentials Updated
echo ========================================
echo.
echo Next steps:
echo 1. Test connection: cd backend ^&^& node test-cloudinary.js
echo 2. Restart backend: npm run dev
echo.
pause
