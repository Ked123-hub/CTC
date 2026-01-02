# start-dev.ps1
# Usage: run from repository root (PowerShell)
# Powershell script to bring up Postgres and Redis with Docker Compose,
# wait for Postgres to be ready, run the seed script, and start the server.

Set-StrictMode -Version Latest

$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $serverDir

function Check-Command($cmd) {
    $which = Get-Command $cmd -ErrorAction SilentlyContinue
    return $which -ne $null
}

if (-not (Check-Command docker)) {
    Write-Error "Docker not found. Please install Docker Desktop and try again."
    exit 1
}

# Prefer new CLI 'docker compose' if available
$composeCmd = 'docker-compose'
if (Check-Command docker) {
    $composeVersion = (& docker version --format '{{.Server.Version}}' 2>$null) -ne $null
    # use 'docker compose' if supported
    $composeCmd = 'docker compose'
}

Write-Host "Using compose command: $composeCmd"

# Bring up postgres and redis
& $composeCmd up -d

# Wait for Postgres
$pgHost = 'localhost'
$pgPort = 5432
Write-Host "Waiting for Postgres on $pgHost:$pgPort..."
$maxWait = 60
for ($i=0; $i -lt $maxWait; $i++) {
    try {
        $res = Test-NetConnection -ComputerName $pgHost -Port $pgPort -WarningAction SilentlyContinue
        if ($res.TcpTestSucceeded) { Write-Host "Postgres is up"; break }
    } catch {}
    Start-Sleep -Seconds 1
}

# Wait for Redis
$redisHost = 'localhost'
$redisPort = 6379
Write-Host "Waiting for Redis on $redisHost:$redisPort..."
for ($i=0; $i -lt $maxWait; $i++) {
    try {
        $res = Test-NetConnection -ComputerName $redisHost -Port $redisPort -WarningAction SilentlyContinue
        if ($res.TcpTestSucceeded) { Write-Host "Redis is up"; break }
    } catch {}
    Start-Sleep -Seconds 1
}

# Run seed script
Write-Host "Running seed.js (this will populate the DB)..."
node seed.js
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Seeding may have failed. Check seed.js output and database state."
}

# Start server
Write-Host "Starting server in background (node app.js)..."
Start-Process -FilePath node -ArgumentList 'app.js' -WorkingDirectory $PWD -NoNewWindow
Write-Host "Server started. Use logs in terminal or check http://localhost:3000"

Pop-Location
