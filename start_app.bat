@echo off
title AgriProcure AI Full-Stack Platform Launcher
color 0A

echo =====================================================================
echo    AGRIPROCURE AI - FULL STACK PLATFORM LAUNCHER
echo    Smart India Hackathon (SIH) - Integrated 6 ML Models
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python 3.11...
set PYTHON_EXE=C:\Users\raksh\AppData\Local\Programs\Python\Python311\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

echo [2/3] Launching Flask Backend API (Port 5000)...
start "AgriProcure - Flask Backend API" cmd /k "cd /d "%~dp0backend" && "%PYTHON_EXE%" run.py"

timeout /t 3 /nobreak >nul

echo [3/3] Launching React Vite Frontend (Port 5173)...
start "AgriProcure - React Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo Opening Application in Browser: http://localhost:5173 ...
start http://localhost:5173

echo.
echo =====================================================================
echo    BOTH SERVERS ARE RUNNING!
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://127.0.0.1:5000/api
echo.
echo    Demo Farmer:  farmer1  / farmer123
echo    Demo Officer: officer1 / officer123
echo =====================================================================
pause
