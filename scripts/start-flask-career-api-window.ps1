# Opens a NEW PowerShell window that stays open and runs the career Flask API.
# Use this so the ML server keeps running while you develop the .NET + React app.
#
# From repo root:  powershell -ExecutionPolicy Bypass -File .\scripts\start-flask-career-api-window.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot "ml\career_flask_api"
$starter = Join-Path $apiDir "start-career-api.ps1"

if (-not (Test-Path $starter)) {
    Write-Error "Not found: $starter"
    exit 1
}

Write-Host "Opening a new window for the Flask career API (http://127.0.0.1:5052) ..." -ForegroundColor Cyan
Write-Host "Leave that window open. Then start the Back-End API." -ForegroundColor Gray

Start-Process powershell.exe -WorkingDirectory $apiDir -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $starter
)
