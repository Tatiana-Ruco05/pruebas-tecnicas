param(
    [string]$StackName = "app-prueba",
    [string]$Region = "us-east-1",
    [Parameter(Mandatory = $true)]
    [string]$KeyName,
    [Parameter(Mandatory = $true)]
    [string]$VpcId,
    [Parameter(Mandatory = $true)]
    [string]$SubnetId,
    [Parameter(Mandatory = $true)]
    [string]$ApiImageUri,
    [Parameter(Mandatory = $true)]
    [string]$DbHost,
    [string]$DbName = "app_prueba",
    [string]$DbUser = "app_prueba",
    [string]$DbPassword,
    [string]$JwtSecret
)

$ErrorActionPreference = "Stop"
$templatePath = Join-Path $PSScriptRoot "template.yaml"

function Read-SecretIfMissing {
    param([string]$Value, [string]$Prompt)

    if ($Value) {
        return $Value
    }

    $secureValue = Read-Host -Prompt $Prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)

    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   APP PRUEBA - DESPLIEGUE AWS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Region: $Region"
Write-Host "Stack:  $StackName"
Write-Host ""

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI no esta disponible."
}

if (-not (Get-Command sam -ErrorAction SilentlyContinue)) {
    throw "AWS SAM CLI no esta disponible."
}

Write-Host "Verificando credenciales AWS..." -ForegroundColor Yellow
aws sts get-caller-identity --region $Region
if ($LASTEXITCODE -ne 0) {
    throw "No hay credenciales AWS configuradas."
}

$DbPassword = Read-SecretIfMissing $DbPassword "Contraseña de PostgreSQL"
$JwtSecret = Read-SecretIfMissing $JwtSecret "Secreto JWT"

Write-Host "Validando template SAM..." -ForegroundColor Yellow
sam validate --template-file $templatePath
if ($LASTEXITCODE -ne 0) {
    throw "La plantilla SAM tiene errores."
}

Write-Host "Construyendo recursos SAM..." -ForegroundColor Yellow
sam build --template-file $templatePath
if ($LASTEXITCODE -ne 0) {
    throw "sam build fallo."
}

$parameterOverrides = @(
    "KeyName=$KeyName",
    "VpcId=$VpcId",
    "SubnetId=$SubnetId",
    "ApiImageUri=$ApiImageUri",
    "DbHost=$DbHost",
    "DbName=$DbName",
    "DbUser=$DbUser",
    "DbPassword=$DbPassword",
    "JwtSecret=$JwtSecret"
)

Write-Host "Desplegando stack SAM..." -ForegroundColor Yellow
sam deploy `
    --template-file .aws-sam/build/template.yaml `
    --stack-name $StackName `
    --region $Region `
    --resolve-s3 `
    --s3-prefix $StackName `
    --capabilities CAPABILITY_IAM `
    --no-confirm-changeset `
    --parameter-overrides $parameterOverrides

if ($LASTEXITCODE -ne 0) {
    throw "sam deploy fallo."
}

Write-Host ""
Write-Host "Outputs del stack:" -ForegroundColor Green
aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query "Stacks[0].Outputs[].{Nombre:OutputKey,Valor:OutputValue}" `
    --output table

Write-Host ""
Write-Host "Despliegue terminado correctamente." -ForegroundColor Green