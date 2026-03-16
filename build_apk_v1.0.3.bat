@echo off
echo Building Bradflow v1.0.3...
call npm run build
call npx cap sync android
cd android
call gradlew assembleDebug
if exist "app\build\outputs\apk\debug\bradflow_v103_force_debug.apk" (
    copy /y "app\build\outputs\apk\debug\bradflow_v103_force_debug.apk" "..\apk\bradflow_v1.0.3_debug.apk"
    echo Build Successful: apk/bradflow_v1.0.3_debug.apk
) else (
    echo Build Failed or APK name mismatch.
)
