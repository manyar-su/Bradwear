@echo off
cd android
call gradlew assembleDebug > build_log.txt 2>&1
echo Done.
