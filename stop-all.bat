@echo off
echo ========================================
echo   AXI-Lab - Stop All Services
echo ========================================
echo.

echo Stopping Docker containers...
docker-compose down

echo.
echo ✅ All services stopped!
echo.
echo Docker containers stopped.
echo Backend/Frontend servers should be stopped manually (Ctrl+C in their terminals)
echo.
pause
