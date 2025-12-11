@echo off
echo ========================================
echo  CAROLIV BACKEND DEPLOYMENT
echo ========================================
echo.

cd /d C:\Users\Admin\OneDrive\Desktop\Caroliv\caroliv-backend

echo [1/4] Cleaning dist folder...
if exist dist rmdir /s /q dist
echo Done!
echo.

echo [2/4] Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/4] Verifying files...
if not exist "dist\src\functions\auth\login.js" (
    echo ERROR: login.js not found!
    pause
    exit /b 1
)
echo Files OK!
echo.

echo [4/4] Deploying to Azure...
call func azure functionapp publish caroliv-api
if errorlevel 1 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Check Azure Portal:
echo https://portal.azure.com
echo.
echo Go to: caroliv-api -^> Functions
echo.
pause
