@echo off
REM ============================================================
REM  Sync both Musahm products to latest remote.
REM  Run this before chatting / writing user stories.
REM
REM  Vault   <- Musahm-dev/Musahm-Vault @ development  -> .\Vault\
REM  Musahm  <- Musahm-dev/Musahm       @ master       -> .\Musahm\
REM
REM  Behavior: clone if missing, otherwise fetch + hard reset.
REM  Local edits inside Vault/ or Musahm/ will be discarded.
REM ============================================================
setlocal EnableDelayedExpansion
set ROOT=%~dp0

call :sync "Vault"  "https://github.com/Musahm-dev/Musahm-Vault.git" "development" "%ROOT%Vault"
set RC1=%ERRORLEVEL%
echo.
call :sync "Musahm" "https://github.com/Musahm-dev/Musahm.git"       "master"      "%ROOT%Musahm"
set RC2=%ERRORLEVEL%

echo.
echo ============================================================
if "%RC1%"=="0" (echo  [OK]    Vault)  else (echo  [FAIL]  Vault)
if "%RC2%"=="0" (echo  [OK]    Musahm) else (echo  [FAIL]  Musahm)
echo ============================================================
pause
endlocal & exit /b 0

:sync
REM args: %1=label  %2=url  %3=branch  %4=target
setlocal
set LABEL=%~1
set URL=%~2
set BRANCH=%~3
set TARGET=%~4
echo === [%LABEL%] syncing %BRANCH% ===

if not exist "%TARGET%\.git" (
    echo [%LABEL%] cloning fresh...
    git clone --branch %BRANCH% --single-branch "%URL%" "%TARGET%"
    if errorlevel 1 (echo [%LABEL%] [ERROR] clone failed. & endlocal & exit /b 1)
    echo [%LABEL%] cloned.
    endlocal & exit /b 0
)

cd /d "%TARGET%" || (echo [%LABEL%] [ERROR] cd failed. & endlocal & exit /b 1)
git fetch origin %BRANCH%
if errorlevel 1 (echo [%LABEL%] [ERROR] fetch failed. & endlocal & exit /b 1)
git checkout %BRANCH% 2>nul || git checkout -B %BRANCH% origin/%BRANCH%
git reset --hard origin/%BRANCH%
if errorlevel 1 (echo [%LABEL%] [ERROR] reset failed. & endlocal & exit /b 1)
for /f "tokens=*" %%i in ('git log -1 --format^=%%h^|%%s') do echo [%LABEL%] now at: %%i
endlocal & exit /b 0
