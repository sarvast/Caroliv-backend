@echo off
echo ========================================
echo  REBUILDING AND REDEPLOYING
echo ========================================
echo.

cd /d C:\Users\Admin\OneDrive\Desktop\Caroliv\caroliv-backend

echo [1/2] Building...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/2] Deploying to Azure...
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
echo Wait 30 seconds, then test:
echo https://caroliv-api.azurewebsites.net/api/foods
echo.
pause
