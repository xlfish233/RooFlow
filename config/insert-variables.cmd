@echo off
setlocal enabledelayedexpansion

:: --- Get Environment Variables ---
for /f "tokens=*" %%a in ('powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object Caption | ForEach-Object { $_.Caption }"') do set "OS=%%a"
set "SHELL=cmd"
set "HOME=%USERPROFILE%"
set "WORKSPACE=%CD%"

:: --- Directory Setup ---
set "ROO_DIR=%WORKSPACE%\.roo"

:: Check if the .roo directory exists
if not exist "%ROO_DIR%" (
    echo Error: .roo directory not found in %WORKSPACE%
    exit /b 1
)

:: --- Execute PowerShell commands ---
powershell -NoProfile -ExecutionPolicy Bypass -Command "$workspace = '%CD%'; Write-Host 'Working Directory:' $workspace; $ErrorActionPreference = 'Stop'; $rooDir = '%ROO_DIR%'; $files = Get-ChildItem -Path $rooDir -Filter 'system-prompt-*'; foreach ($file in $files) { Write-Host ('Processing: ' + $file.FullName); $content = Get-Content $file.FullName -Raw; $content = $content -replace 'OS_PLACEHOLDER', '%OS%'; $content = $content -replace 'SHELL_PLACEHOLDER', 'cmd'; $content = $content -replace 'HOME_PLACEHOLDER', $env:USERPROFILE; $content = $content -replace 'WORKSPACE_PLACEHOLDER', $workspace; Set-Content -Path $file.FullName -Value $content -NoNewline; Write-Host ('Completed: ' + $file.FullName); }"

if errorlevel 1 (
    echo Error running PowerShell commands
    exit /b 1
)

echo Done.
endlocal