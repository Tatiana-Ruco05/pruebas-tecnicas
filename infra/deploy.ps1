# ==========================================
# APP PRUEBA - DESPLIEGUE AWS
# ==========================================

$ErrorActionPreference = "Stop"

$STACK_NAME = "app-prueba"
$REGION = "us-east-1"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   APP PRUEBA - DESPLIEGUE AWS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Region: $REGION"
Write-Host "Stack:  $STACK_NAME"
Write-Host ""

# Verificar AWS CLI
Write-Host "Verificando AWS CLI..." -ForegroundColor Yellow

aws --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "AWS CLI no esta disponible." -ForegroundColor Red
    exit 1
}

# Verificar credenciales
Write-Host ""
Write-Host "Verificando credenciales AWS..." -ForegroundColor Yellow

aws sts get-caller-identity --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "No hay credenciales AWS configuradas." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Credenciales AWS verificadas correctamente." -ForegroundColor Green

# Validar plantilla
Write-Host ""
Write-Host "Validando template.yaml..." -ForegroundColor Yellow

aws cloudformation validate-template `
    --template-body file://template.yaml `
    --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "La plantilla tiene errores." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Template valido." -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Validacion terminada correctamente" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green