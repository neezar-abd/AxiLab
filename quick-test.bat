@echo off
echo ========================================
echo   AXI-Lab Quick Test Setup
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found! Please install Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker found

echo.
echo [2/5] Starting Docker containers...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start Docker containers
    pause
    exit /b 1
)
echo ✅ Docker containers started

echo.
echo [3/5] Checking Backend dependencies...
cd backend
if not exist "node_modules\" (
    echo Installing Backend dependencies...
    call npm install
)
echo ✅ Backend dependencies ready

echo.
echo [4/5] Seeding database...
call npm run seed
if errorlevel 1 (
    echo ⚠️ Warning: Seed failed, but continuing...
)

echo.
echo [5/5] Backend server will start in new window...
echo ========================================
echo.
echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Backend will start in new window (port 5000)
echo 2. Open ANOTHER terminal and run: npm run dev (for frontend)
echo 3. Open browser: http://localhost:3000
echo 4. Login: budi@teacher.com / password123
echo.
echo Press any key to start backend server...
pause >nul

start "AXI-Lab Backend" cmd /k "npm run dev"

echo.
echo Backend started in new window!
echo Now run this in another terminal:
echo   npm run dev
echo.
pause
