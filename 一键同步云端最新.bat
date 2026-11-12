@echo off
chcp 65001 >nul
title StarWhiteNote - 一键从 GitHub 同步最新文件
cd /d "%~dp0"

echo ==========================================================
echo       📥 StarWhiteNote - 一键从 GitHub 同步最新文件
echo ==========================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;%PATH%"
    )
)

echo 正在从云端拉取最新更新...
git pull origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 同步成功！本地文件已与 GitHub 云端完全保持一致！
) else (
    echo.
    echo ⚠️ 同步提示：如果本地有未保存的修改，请先提交或运行【一键发布到GitHub.bat】。
)

echo.
pause
