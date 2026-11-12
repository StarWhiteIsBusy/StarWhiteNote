@echo off
chcp 65001 >nul
title StarWhiteNote - 一键发布更新到 GitHub
cd /d "%~dp0"

echo ==========================================================
echo        ⭐ StarWhiteNote - 一键同步发布到 GitHub
echo ==========================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;%PATH%"
    )
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 尚未检测到 Git 运行环境。
    echo 请确认 Git 是否安装在标准路径。
    pause
    exit /b 1
)

:: Ensure git repo is initialized
if not exist ".git" (
    echo 正在初始化 Git 仓库...
    git init
    git branch -M main
)

:: Ensure remote origin is set
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在配置 GitHub 仓库地址...
    git remote add origin https://github.com/StarWhiteIsBusy/StarWhiteNote.git
)

echo 目标仓库: https://github.com/StarWhiteIsBusy/StarWhiteNote.git
echo.
echo 正在检查本地文件变动...
git status --short
echo.

set /p commit_msg="请输入本次更新说明（直接按回车默认使用当前时间）: "
if "%commit_msg%"=="" (
    set commit_msg=更新笔记与附件资料 %date% %time:~0,5%
)

echo.
echo [1/3] 正在添加文件到暂存区 (git add) ...
git add .

echo [2/3] 正在创建提交版本 (git commit) ...
git commit -m "%commit_msg%"

echo [3/3] 正在推送到 GitHub 云端 (git push) ...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==========================================================
    echo ✅ 发布成功！
    echo 你的网站地址: https://starwhiteisbusy.github.io/StarWhiteNote/
    echo GitHub Pages 将在 30 秒至 1 分钟内全网自动同步生效！
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [提示] 推送需要登录授权，或云端有更新文件。
    echo 正在尝试拉取合并最新文件...
    git pull origin main --rebase --allow-unrelated-histories
    git push -u origin main
    echo ==========================================================
)

echo.
pause
