@echo off
echo ========================================
echo CIVIC1.1 - GitHub Deployment Script
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking Git status...
git status >nul 2>&1
if errorlevel 1 (
    echo Git not initialized. Initializing...
    git init
    git branch -M main
) else (
    echo Git already initialized.
)

echo.
echo Step 2: Adding remote repository...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/mayu1344/CIVIC1.1.git
echo Remote added: https://github.com/mayu1344/CIVIC1.1.git

echo.
echo Step 3: Adding all files...
git add .

echo.
echo Step 4: Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Deploy CIVIC1.1 project

git commit -m "%commit_msg%"

echo.
echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your project has been pushed to:
echo https://github.com/mayu1344/CIVIC1.1
echo.
echo Next steps:
echo 1. Go to repository Settings
echo 2. Navigate to Pages
echo 3. Set Source to "GitHub Actions"
echo 4. Your site will be live at:
echo    https://mayu1344.github.io/CIVIC1.1
echo.
pause
