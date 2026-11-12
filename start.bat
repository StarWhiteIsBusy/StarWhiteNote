@echo off
chcp 65001 >nul
title StarWhiteNote - 个人笔记与文件共享站
cd /d "%~dp0"

echo ==========================================================
echo        ⭐ StarWhiteNote - 个人笔记与文件共享站
echo ==========================================================
echo 正在检查运行环境并启动服务...

set NODE_CMD=

:: 1. 检查环境变量中的 agy-node
where agy-node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=agy-node"
    goto RUN
)

:: 2. 检查环境变量中的 node
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    goto RUN
)

:: 3. 检查 Antigravity 内置环境
if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
    set ELECTRON_RUN_AS_NODE=1
    set "NODE_CMD=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    goto RUN
)

:: 4. 检查用户漫游目录中的 agy-node.cmd
if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    set "NODE_CMD=%APPDATA%\Antigravity\bin\agy-node.cmd"
    goto RUN
)

echo [错误] 未找到 Node 运行环境。请安装 Node.js 或确保 Antigravity 环境正常。
pause
exit /b 1

:RUN
echo 启动服务引擎: %NODE_CMD%
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
%NODE_CMD% server.js

pause
