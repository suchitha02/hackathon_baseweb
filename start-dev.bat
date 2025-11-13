@echo off
echo ========================================
echo   IdeaSpark Development Environment
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo   Backend:  http://localhost:5000/api
echo   Frontend: http://localhost:8080
echo ========================================
echo.
echo Press any key to exit...
pause >nul
