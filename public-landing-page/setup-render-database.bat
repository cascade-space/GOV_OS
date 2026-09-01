@echo off
echo ========================================
echo CivicPath - Render Database Setup
echo ========================================
echo.
echo This will set up your database tables on Render.
echo.
echo Connection String:
echo postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db
echo.
echo INSTRUCTIONS:
echo 1. Install PostgreSQL client (psql) if not installed
echo 2. Run this command:
echo.
echo psql "postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db" -f database/schema.sql
echo.
echo OR use Render Web Shell:
echo 1. Go to https://dashboard.render.com
echo 2. Click your database "civicpath_db"
echo 3. Click "Shell" tab
echo 4. Copy/paste content from database/schema.sql
echo.
pause
