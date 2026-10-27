# AgriProcure Full-Stack Platform Launcher (PowerShell)
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "   AGRIPROCURE AI - FULL STACK PLATFORM LAUNCHER" -ForegroundColor Green
Write-Host "   Smart India Hackathon (SIH) - Integrated 6 ML Models" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PythonPath = "C:\Users\raksh\AppData\Local\Programs\Python\Python311\python.exe"
if (-not (Test-Path $PythonPath)) {
    $PythonPath = "python"
}

Write-Host "`n[1/3] Starting Flask Backend API on Port 5000..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$RootPath\backend`" && `"$PythonPath`" run.py" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting React Vite Frontend on Port 5173..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$RootPath\frontend`" && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "[3/3] Opening Browser at http://localhost:5173..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "   SERVERS RUNNING SUCCESSFULLY!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "   Backend API: http://127.0.0.1:5000/api" -ForegroundColor Yellow
Write-Host "   Demo Farmer: farmer1 / farmer123" -ForegroundColor White
Write-Host "   Demo Officer: officer1 / officer123" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green
