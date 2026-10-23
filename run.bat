@echo off
title NIRF University Rankings - Master Launcher
color 0b

echo ======================================================================
echo           NIRF University Rankings - EDA Dashboard Launcher
echo ======================================================================
echo.
cd /d "%~dp0"

:: 1. Detect Python Executable
set PYTHON_EXE=
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
    echo [OK] Using virtual environment: .venv\Scripts\python.exe
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_EXE=python"
        echo [OK] Using system Python
    ) else (
        echo [ERROR] Python not found! Please install Python 3.10+ and add it to PATH.
        pause
        exit /b 1
    )
)

:: 2. Verify backend dependencies
echo Checking backend dependencies...
"%PYTHON_EXE%" -c "import fastapi, uvicorn, pandas, numpy" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing required backend dependencies...
    "%PYTHON_EXE%" -m pip install -r "%~dp0backend\requirements.txt"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
)
echo [OK] Backend dependencies verified.

:: 3. Start Backend in separate window
echo.
echo [1/2] Starting FastAPI Backend on http://https://dev-mini-project.onrender.com ...
start "NIRF Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && "%PYTHON_EXE%" -m uvicorn main:app --reload --reload-dir "%~dp0backend" --host 127.0.0.1 --port 8000"

:: 4. Start Frontend in separate window
echo.
echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "NIRF Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 5. Wait for backend health check
echo.
echo Waiting for backend to become ready...
powershell -NoProfile -Command "for ($i=0; $i -lt 15; $i++) { try { $res = Invoke-RestMethod -Uri 'http://https://dev-mini-project.onrender.com/api/health' -TimeoutSec 1; if ($res.status -eq 'ok') { Write-Host '[OK] Backend is healthy!'; break } } catch { Start-Sleep -Milliseconds 1000 } }"

:: 6. Open Browser
echo.
echo Opening Dashboard in browser...
start http://localhost:5173

echo.
echo ======================================================================
echo   Dashboard is running!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://https://dev-mini-project.onrender.com
echo   API Docs:  http://https://dev-mini-project.onrender.com/docs
echo ======================================================================
echo   Keep the terminal windows open while using the application.
echo.
pause
