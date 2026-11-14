@echo off
cd /d "%~dp0"
title StarWhiteNote - 一键发布到 GitHub

echo ==========================================================
echo        StarWhiteNote - 一键发布到 GitHub
echo ==========================================================
echo.

set "GIT_EXE=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
    )
)

echo 目标仓库: https://github.com/StarWhiteIsBusy/StarWhiteNote.git
echo.
echo 正在检查本地文件变动...
"%GIT_EXE%" status --short
echo.

set "commit_msg="
set /p commit_msg="请输入本次更新说明（直接按回车默认使用当前时间）: "
if not defined commit_msg set commit_msg=Update notes %date% %time:~0,5%

echo.
echo [准备] 正在自动扫描 notes 目录并更新知识库索引...
where python >nul 2>nul
if %errorlevel% equ 0 (
    python build_notes.py
)

echo.
echo [1/3] 正在添加文件到暂存区 (git add) ...
"%GIT_EXE%" add .

echo [2/3] 正在创建提交版本 (git commit) ...
"%GIT_EXE%" commit -m "%commit_msg%"

echo [3/3] 正在推送到 GitHub 云端 (git push) ...
"%GIT_EXE%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==========================================================
    echo [OK] 发布成功！
    echo 你的网站地址: https://starwhitenote.xyz/ (或 https://starwhiteisbusy.github.io/StarWhiteNote/)
    echo GitHub Pages 将在 30 秒至 1 分钟内全网自动同步生效！
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [提示] 正在尝试拉取合并云端更新并重新推送...
    "%GIT_EXE%" pull origin main --rebase --allow-unrelated-histories
    "%GIT_EXE%" push -u origin main
    echo ==========================================================
)

echo.
pause
