@echo off
cd /d "%~dp0"
title StarWhiteNote - 一键从 GitHub 同步最新文件

echo ==========================================================
echo        StarWhiteNote - 一键从 GitHub 同步最新文件
echo ==========================================================
echo.

set "GIT_EXE=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
    )
)

echo 正在从云端拉取最新更新...
"%GIT_EXE%" pull origin main

if %errorlevel% equ 0 (
    echo.
    echo [OK] 同步成功！本地文件已与 GitHub 云端完全保持一致！
) else (
    echo.
    echo [提示] 同步遇到问题，如果本地有修改请先运行【一键发布到GitHub.bat】。
)

echo.
pause
