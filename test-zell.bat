@echo off
echo ========================================
echo    ZELL Sandbox Testing Script
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found: 
    node --version
)
echo.

echo 2. Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found! Please install npm first.
    pause
    exit /b 1
) else (
    echo ✅ npm found:
    npm --version
)
echo.

echo 3. Checking project files...
if exist "App.js" (
    echo ✅ App.js found
) else (
    echo ❌ App.js missing
)

if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json missing
)

if exist "src\screens\ConvertScreen.js" (
    echo ✅ ConvertScreen.js found
) else (
    echo ❌ ConvertScreen.js missing
)

if exist "src\services\ShareService.js" (
    echo ✅ ShareService.js found
) else (
    echo ❌ ShareService.js missing
)
echo.

echo 4. Installing dependencies...
if not exist "node_modules" (
    echo Installing dependencies... This may take a few minutes.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)
echo.

echo 5. Testing web server startup...
echo Starting ZELL web version...
echo The app should open at http://localhost:19006
echo Press Ctrl+C to stop the server when done testing.
echo.

npm run web

echo.
echo Testing complete!
pause
