@echo off
title MHADA Towers Utsav Mandal Launcher
echo ========================================================
echo    MHADA Towers Utsav Mandal - Digital Information Hub
echo ========================================================
echo.
echo [1/2] Starting Backend API on http://localhost:5000 ...
start "MHADA Utsav - Backend (Port 5000)" cmd /k "cd /d ""%~dp0server"" && npm start"
timeout /t 3 >nul
echo.
echo [2/2] Starting Frontend App on http://localhost:5173 ...
start "MHADA Utsav - Frontend (Port 5173)" cmd /k "cd /d ""%~dp0client"" && npm run dev"
echo.
echo ========================================================
echo [OK] Both servers have been launched!
echo.
echo   - Frontend Website: http://localhost:5173
echo   - Backend API:      http://localhost:5000
echo ========================================================
