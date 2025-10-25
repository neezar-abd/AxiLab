@echo off
echo Stopping Docker services...
cd ..
docker-compose down
echo.
echo Docker services stopped.
pause
