@echo off
title ECHOBOUND - 3-Level Game Launcher
echo =======================================================
echo    ECHOBOUND: REALMS OF ECHO (3-LEVEL PROTOTYPE)
echo =======================================================
echo.
echo Starting local game server...
start "" "http://localhost:8080"
node server.js
if %errorlevel% neq 0 (
    echo.
    echo Node.js not detected or port in use.
    echo Opening index.html directly in your default browser...
    start "" "%~dp0index.html"
)
pause
