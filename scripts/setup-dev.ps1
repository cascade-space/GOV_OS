Write-Host "=========================================="
Write-Host " GovOS MTAS Engine - Dev Environment Setup"
Write-Host "=========================================="

# 1. Copy env files if they don't exist
$services = @("govos-core-api", "govos-realtime", "govos-ai", "govos-web")
foreach ($service in $services) {
    $envPath = "$PSScriptRoot\..\$service\.env"
    $examplePath = "$PSScriptRoot\..\$service\.env.example"
    
    if (-not (Test-Path $envPath)) {
        if (Test-Path $examplePath) {
            Copy-Item -Path $examplePath -Destination $envPath
            Write-Host "Created .env for $service"
        }
    } else {
        Write-Host ".env already exists for $service"
    }
}

# 2. Check Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH."
    exit 1
}

if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue) -and -not (docker compose version -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose is not installed."
    exit 1
}

Write-Host "Starting infrastructure..."
# Use docker compose if V2, else docker-compose
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose -f "$PSScriptRoot\..\docker-compose.yml" up -d postgres redis gateway
} else {
    docker compose -f "$PSScriptRoot\..\docker-compose.yml" up -d postgres redis gateway
}

Write-Host "Infrastructure started."
Write-Host "To run the full stack, use: docker compose up -d"
Write-Host "=========================================="
