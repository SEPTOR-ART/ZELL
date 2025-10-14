@echo off
echo ========================================
echo    ZELL - File Converter & Editor
echo    Installation and Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

echo Installing ZELL dependencies...
echo This may take a few minutes...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.

echo Choose how to run ZELL:
echo.
echo 1. Web Version (Recommended for testing)
echo 2. Desktop App (Electron)
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting ZELL Web Version...
    echo The app will open in your default browser.
    echo Press Ctrl+C to stop the server.
    echo.
    npm run web
) else if "%choice%"=="2" (
    echo.
    echo Installing Electron for desktop app...
    npm install electron --save-dev
    echo.
    echo Starting ZELL Desktop App...
    npm run build:desktop
) else if "%choice%"=="3" (
    echo.
    echo Goodbye!
    exit /b 0
) else (
    echo.
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Thank you for using ZELL!
pause

