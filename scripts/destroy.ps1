$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Eliminando stack de SAM..."
sam delete --config-file samconfig.toml --no-prompts

Write-Host "Stack eliminada."
