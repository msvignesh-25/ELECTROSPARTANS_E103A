# PowerShell script to free up port 3000
$port = 3000
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "Found process(es) using port $port. Terminating..." -ForegroundColor Yellow
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Terminated process $pid" -ForegroundColor Green
        } catch {
            Write-Host "Failed to terminate process $pid: $_" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 1
    Write-Host "Port $port is now free." -ForegroundColor Green
} else {
    Write-Host "Port $port is already free." -ForegroundColor Green
}
