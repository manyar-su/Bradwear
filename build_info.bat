@echo off
cd android
call gradlew assembleDebug --info > build_info.txt 2>&1
