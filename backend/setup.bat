@echo off
echo ========================================
echo AXI-Lab Backend - Quick Start
echo ========================================
echo.

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker not found! Please install Docker Desktop.
    pause
    exit /b 1
)
echo ✓ Docker is installed

echo.
echo [2/4] Starting Docker services...
cd ..
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)
echo ✓ Docker services started

echo.
echo [3/4] Checking Node.js...
cd backend
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [4/4] Installing dependencies...
if not exist "node_modules\" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Check .env file and add your GEMINI_API_KEY (optional)
echo   2. Run: npm run seed (to create test data)
echo   3. Run: npm run dev (to start server)
echo.
echo Or run: start-dev.bat to auto-start everything
echo.
pause
