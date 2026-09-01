@echo off
echo ========================================
echo Testing CivicPath Backend API
echo ========================================
echo.

echo Test 1: Check if backend is running...
curl -s http://localhost:5000
echo.
echo.

echo Test 2: Check health endpoint...
curl -s http://localhost:5000/health
echo.
echo.

echo Test 3: Try to get complaints...
curl -s http://localhost:5000/api/v1/complaints
echo.
echo.

echo Test 4: Submit a test complaint...
curl -X POST http://localhost:5000/api/v1/complaints -H "Content-Type: application/json" -d "{\"title\":\"Test Pothole\",\"description\":\"This is a test complaint to verify the API is working properly\",\"category\":\"Roads & Infrastructure\",\"subCategory\":\"Potholes\",\"priority\":\"high\",\"citizenName\":\"Test User\",\"citizenMobile\":\"9876543210\",\"location\":{\"address\":\"Test Street, Ward 12\",\"latitude\":12.9716,\"longitude\":77.5946,\"ward\":\"Ward 12\"}}"
echo.
echo.

echo ========================================
echo Tests Complete
echo ========================================
echo.
echo If you see errors above, the backend is not working properly.
echo Check the backend terminal for error messages.
echo.
pause
