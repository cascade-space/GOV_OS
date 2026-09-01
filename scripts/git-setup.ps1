Write-Host "=========================================="
Write-Host " GovOS MTAS Engine - Git Setup"
Write-Host "=========================================="

$rootPath = "$PSScriptRoot\.."

# 1. Initialize root repo (Orchestrator)
Write-Host "Initializing Root Orchestrator Repository..."
cd $rootPath
if (-not (Test-Path ".git")) {
    git init
    # We want to ignore the subfolders in the root repo so they can be separate remotes
    $rootGitignore = ".gitignore"
    if (-not (Test-Path $rootGitignore)) {
        Set-Content -Path $rootGitignore -Value "govos-core-api/`ngovos-realtime/`ngovos-ai/`ngovos-web/`n.idea/`n.vscode/`n*.env"
    } else {
        Add-Content -Path $rootGitignore -Value "`ngovos-core-api/`ngovos-realtime/`ngovos-ai/`ngovos-web/`n*.env"
    }
    git add .
    git commit -m "chore: initial orchestrator setup"
}

# 2. Initialize Microservices
$services = @(
    @{ Name="govos-core-api"; Ignore="target/`n*.class`n*.jar`n.idea/`n.vscode/`n*.env" },
    @{ Name="govos-realtime"; Ignore="node_modules/`ndist/`n.env`n.DS_Store" },
    @{ Name="govos-ai"; Ignore="__pycache__/`n*.pyc`nvenv/`n.env" },
    @{ Name="govos-web"; Ignore="node_modules/`ndist/`n.env`n.DS_Store" }
)

foreach ($service in $services) {
    Write-Host "Initializing $($service.Name) Repository..."
    $servicePath = "$rootPath\$($service.Name)"
    cd $servicePath

    if (-not (Test-Path ".git")) {
        git init
        
        $gitignore = ".gitignore"
        if (-not (Test-Path $gitignore)) {
            Set-Content -Path $gitignore -Value $service.Ignore
        }
        
        git add .
        git commit -m "chore: initial commit for $($service.Name)"
    } else {
        Write-Host "$($service.Name) is already a git repository."
    }
}

Write-Host "=========================================="
Write-Host "Git Setup Complete."
Write-Host "You can now add remotes to each folder and push them independently."
Write-Host "Example: cd govos-web && git remote add origin <URL> && git push -u origin main"
Write-Host "=========================================="
