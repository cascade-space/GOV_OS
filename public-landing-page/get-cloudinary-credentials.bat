@echo off
echo ========================================
echo Get Cloudinary Credentials
echo ========================================
echo.
echo Step 1: Open your browser and go to:
echo   https://cloudinary.com/console
echo.
echo Step 2: Login with your account
echo.
echo Step 3: You'll see your Dashboard with:
echo   - Cloud Name
echo   - API Key  
echo   - API Secret
echo.
echo Step 4: Copy those three values
echo.
echo Step 5: Open this file in notepad:
echo   backend\.env
echo.
echo Step 6: Update these lines:
echo   CLOUDINARY_CLOUD_NAME=your_cloud_name
echo   CLOUDINARY_API_KEY=your_api_key
echo   CLOUDINARY_API_SECRET=your_api_secret
echo   USE_CLOUDINARY=true
echo.
echo Step 7: Save the file
echo.
echo Step 8: Restart your backend server
echo.
echo ========================================
echo.
echo Opening Cloudinary login page...
start https://cloudinary.com/console
echo.
echo After updating .env file, run:
echo   test-cloudinary-connection.bat
echo.
pause
