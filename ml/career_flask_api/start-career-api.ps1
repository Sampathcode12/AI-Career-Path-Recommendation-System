# Start the career Flask API (TF-IDF + model). Default URL matches Back-End appsettings ML:PythonPredictBaseUrl.
# "Connection refused" in the app = this process is not running (window closed, crash, or deps missing).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# If models\ is empty, use %USERPROFILE%\Downloads\model when all three .pkl files exist there (common Colab export location).
if ([string]::IsNullOrWhiteSpace($env:CAREER_MODEL_DIR)) {
    $localDir = Join-Path $PSScriptRoot "models"
    $need = @("vectorizer.pkl", "career_model.pkl", "label_encoder.pkl")
    $hasLocal = ($need | ForEach-Object { Test-Path (Join-Path $localDir $_) }) -notcontains $false
    if (-not $hasLocal) {
        $dlDir = Join-Path $env:USERPROFILE "Downloads\model"
        $hasDl = ($need | ForEach-Object { Test-Path (Join-Path $dlDir $_) }) -notcontains $false
        if ($hasDl) {
            $env:CAREER_MODEL_DIR = $dlDir
            Write-Host "Using CAREER_MODEL_DIR = $dlDir" -ForegroundColor Green
        }
    }
}

if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    Write-Host "Using .venv" -ForegroundColor Gray
    . ".\.venv\Scripts\Activate.ps1"
}

function Test-FlaskReady {
    try {
        python -c "import flask; import flask_cors; import sklearn" 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

if (-not (Test-FlaskReady)) {
    Write-Host "Python packages missing (Flask / scikit-learn). Installing from requirements.txt ..." -ForegroundColor Yellow
    python -m pip install --upgrade pip
    python -m pip install -r "$PSScriptRoot\requirements.txt"
    if (-not (Test-FlaskReady)) {
        Write-Host "Still failing. Try explicitly: py -3 -m venv .venv  then  .\.venv\Scripts\Activate.ps1  then  pip install -r requirements.txt" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencies installed." -ForegroundColor Green
}

Write-Host "Starting Flask career API (default http://127.0.0.1:5052) ..." -ForegroundColor Cyan
Write-Host "If the port is busy: `$env:PORT = 5100` then run this script again; set ML:PythonPredictBaseUrl to match." -ForegroundColor Gray
python app.py
