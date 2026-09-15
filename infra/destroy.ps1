# ==========================================
# APP PRUEBA - ELIMINAR INFRAESTRUCTURA AWS
# ==========================================

$ErrorActionPreference = "Stop"

$STACK_NAME = "app-prueba"
$REGION = "us-east-1"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   APP PRUEBA - ELIMINAR INFRAESTRUCTURA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stack: $STACK_NAME"
Write-Host "Region: $REGION"
Write-Host ""

Write-Host "Este script elimina el stack de AWS." -ForegroundColor Yellow
Write-Host "Si existe contenido en el bucket S3, tambien se eliminara." -ForegroundColor Yellow
Write-Host "Esta operacion no se puede deshacer." -ForegroundColor Yellow
Write-Host ""

$confirmacion = Read-Host "Escribe ELIMINAR para continuar"

if ($confirmacion -ne "ELIMINAR") {
    Write-Host ""
    Write-Host "Operacion cancelada." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Eliminando stack..." -ForegroundColor Yellow

aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --region $REGION `
    --output json | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "El stack no existe o ya fue eliminado." -ForegroundColor Green
    exit 0
}

$bucketName = aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --region $REGION `
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue | [0]" `
    --output text

if ($LASTEXITCODE -eq 0 -and $bucketName -and $bucketName -ne "None") {
    Write-Host "Vaciando bucket S3: $bucketName" -ForegroundColor Yellow

    aws s3 rm "s3://$bucketName" --recursive

    if ($LASTEXITCODE -ne 0) {
        Write-Host "No fue posible vaciar el bucket S3." -ForegroundColor Red
        exit 1
    }
}

aws cloudformation delete-stack `
    --stack-name $STACK_NAME `
    --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "No fue posible iniciar la eliminacion." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Solicitud de eliminacion enviada correctamente." -ForegroundColor Green
Write-Host ""