$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Compilando SAM..."
sam build

Write-Host "Desplegando stack..."
sam deploy --config-file samconfig.toml --resolve-s3 --capabilities CAPABILITY_IAM

Write-Host "Despliegue completado."
