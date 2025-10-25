@echo off
echo ========================================
echo AXI-Lab Backend - Development Mode
echo ========================================
echo.

echo Starting Docker services...
cd ..
docker-compose up -d
cd backend

echo.
echo Seeding database...
call npm run seed

echo.
echo ========================================
echo Starting Backend Server...
echo ========================================
echo Server will run at: http://localhost:5000
echo Press Ctrl+C to stop
echo.

call npm run dev
