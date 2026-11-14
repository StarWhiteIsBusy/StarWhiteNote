@echo off
cd /d "%~dp0"
title StarWhiteNote - 本地笔记与资料站

echo ================================================================
echo           StarWhiteNote - 本地笔记与文件共享站
echo ================================================================
echo.

set "NODE_CMD="

:: 1. 优先使用 Antigravity 内置的高性能 Node 环境 (v24)
if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
    set "ELECTRON_RUN_AS_NODE=1"
    set "NODE_CMD=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    goto START_SERVER
)

:: 2. 检查系统全局 node
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
    goto START_SERVER
)

:: 3. 检查系统全局 python 作为备选
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [提示] 未检测到 Node 环境，正在通过 Python 启动服务...
    start "" "http://localhost:3000"
    python -m http.server 3000
    goto END
)

echo [错误] 未检测到可用的运行环境。
pause
exit /b 1

:START_SERVER
echo 正在启动本地高速服务...
echo 稍后将自动在浏览器中打开本站页面...
echo.
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:3000"
"%NODE_CMD%" server.js

:END
pause