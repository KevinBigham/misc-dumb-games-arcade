@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ECHO REQUIEM needs Node.js 22 or newer on this Windows PC.
  echo No npm install or game build is required.
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo Please use an existing Node.js 22 or newer runtime.
  pause
  exit /b 1
)
node scripts\launch.mjs
if errorlevel 1 pause
