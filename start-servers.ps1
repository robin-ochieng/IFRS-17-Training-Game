# IFRS 17 Training Game - Server Startup Script
# This script starts both the frontend (React) and backend (FastAPI) servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IFRS 17 Training Game - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script's directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = $projectRoot

# Check if backend virtual environment exists
$venvPath = Join-Path $backendDir "venv\Scripts\python.exe"
if (-not (Test-Path $venvPath)) {
    Write-Host "[ERROR] Backend virtual environment not found at: $venvPath" -ForegroundColor Red
    Write-Host "Please run: cd backend && python -m venv venv && .\venv\Scripts\Activate && pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
$nodeModulesPath = Join-Path $frontendDir "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[ERROR] Node modules not found. Please run: npm install" -ForegroundColor Red
    exit 1
}

# Kill any existing processes on ports 3000 and 8000
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1

# Start Backend Server
Write-Host "[2/4] Starting Backend Server (FastAPI on port 8000)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath $venvPath `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $backendDir `
    -PassThru `
    -WindowStyle Normal

Write-Host "       Backend PID: $($backendProcess.Id)" -ForegroundColor Gray

# Wait for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 5
    Write-Host "[3/4] Backend started successfully!" -ForegroundColor Green
    Write-Host "       Status: $($health.status)" -ForegroundColor Gray
    Write-Host "       Documents: $($health.documents_count)" -ForegroundColor Gray
} catch {
    Write-Host "[WARNING] Backend may still be starting up..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "[4/4] Starting Frontend Server (React on port 3000)..." -ForegroundColor Yellow

# Use cmd to run npm start in a new window
$frontendProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "cd /d `"$frontendDir`" && npm start" `
    -PassThru `
    -WindowStyle Normal

Write-Host "       Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray

# Wait a moment for React to start
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C in each terminal to stop the servers" -ForegroundColor Gray
Write-Host ""

# Keep script running and show process status
Write-Host "Process IDs:" -ForegroundColor Yellow
Write-Host "  Backend:  $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "  Frontend: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all servers, run:" -ForegroundColor Yellow
Write-Host "  Stop-Process -Id $($backendProcess.Id), $($frontendProcess.Id) -Force" -ForegroundColor Gray
