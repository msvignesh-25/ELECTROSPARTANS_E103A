@echo off
REM Batch script to free up port 3000 on Windows
echo Checking for processes using port 3000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found process %%a using port 3000
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo Failed to kill process %%a
    ) else (
        echo Successfully terminated process %%a
    )
)

timeout /t 1 /nobreak >nul
echo Port 3000 should now be free.
