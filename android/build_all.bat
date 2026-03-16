@echo off
setlocal

echo INFO: Starting build process...

:: Step 1: Build Web Assets
echo INFO: Building web assets (Vite)...
cd ..
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: npm build failed
    exit /b %errorlevel%
)

:: Step 2: Sync Capacitor
echo INFO: Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    exit /b %errorlevel%
)

:: Step 3: Build APK
echo INFO: Building Android APK (Gradle)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed
    exit /b %errorlevel%
)

:: Step 4: Move APK to accessible location
echo INFO: Locating APK...
if not exist "..\apk" mkdir "..\apk"
copy "app\build\outputs\apk\debug\*.apk" "..\apk\" /Y

echo INFO: Build completed successfully!
echo INFO: You can find your APK in the 'apk' folder at the root of the project.
dir "..\apk\*.apk"

endlocal
