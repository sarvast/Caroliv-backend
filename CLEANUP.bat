@echo off
echo Removing old function.json files...

cd /d C:\Users\Admin\OneDrive\Desktop\Caroliv\caroliv-backend

rmdir /s /q login 2>nul
rmdir /s /q register 2>nul
rmdir /s /q syncProfile 2>nul
rmdir /s /q getFoods 2>nul
rmdir /s /q getExercises 2>nul
rmdir /s /q foodsAdmin 2>nul
rmdir /s /q exercisesAdmin 2>nul

echo Done! Function folders removed.
echo.
echo Now rebuild and redeploy:
echo   npm run build
echo   func azure functionapp publish caroliv-backend-v2
echo.
pause
