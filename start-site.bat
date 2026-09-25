@echo off
title RPC Constructions - dev server
cd /d "%~dp0"
if not exist node_modules (
  echo Installing packages, please wait...
  call npm install
)
echo Starting the site at http://localhost:3001 ...
start "" http://localhost:3001
call npm run dev -- -p 3001
pause
