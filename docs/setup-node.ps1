# setup-node.ps1
# 이 스크립트는 NVM-Windows, Node.js LTS, 그리고 pnpm을 설치합니다.

# 한글 깨짐 방지
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 관리자 권한 확인
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (!$currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ 이 스크립트는 '관리자 권한'으로 실행해야 합니다!" -ForegroundColor Red
    Write-Host "PowerShell을 마우스 오른쪽 버튼으로 클릭하여 '관리자 권한으로 실행' 후 다시 시도해 주세요."
    exit
}

# 1. NVM-Windows 설치 확인
if (!(Get-Command nvm -ErrorAction SilentlyContinue)) {
    Write-Host "🚀 NVM-Windows가 없습니다. 설치를 시작합니다..." -ForegroundColor Cyan
    $version = "1.1.12"
    $url = "https://github.com/coreybutler/nvm-windows/releases/download/$version/nvm-setup.exe"
    $output = Join-Path $env:TEMP "nvm-setup.exe"

    Write-Host "📥 NVM 설치 파일 다운로드 중..."
    Invoke-WebRequest -Uri $url -OutFile $output
    
    Write-Host "📦 NVM 설치 중... (조용히 설치)"
    Start-Process -FilePath $output -ArgumentList "/SILENT" -Wait
    Remove-Item -Path $output
    Write-Host "✅ NVM-Windows 설치 완료." -ForegroundColor Green
    Write-Host "⚠️ 환경변수 적용을 위해 현재 터미널을 다시 시작해야 할 수도 있습니다." -ForegroundColor Yellow
} else {
    Write-Host "✅ NVM-Windows가 이미 설치되어 있습니다." -ForegroundColor Green
}

# 2. Node.js LTS 설치
Write-Host "🚀 Node.js LTS 버전을 설치합니다..." -ForegroundColor Cyan
nvm install lts
nvm use lts

# 3. pnpm 설치
Write-Host "🚀 pnpm을 설치합니다..." -ForegroundColor Cyan
# nvm use lts 실행 후 npm이 활성화된 상태여야 합니다.
npm install -g pnpm

Write-Host "`n✨ Node.js 및 pnpm 설치가 완료되었습니다!" -ForegroundColor Green
Write-Host "새로운 터미널을 열어 아래 명령어로 버전을 확인하세요:"
Write-Host "node -v"
Write-Host "pnpm -v"
