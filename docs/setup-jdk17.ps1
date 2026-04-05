# setup-jdk17.ps1
# 이 스크립트는 316space-be를 위한 Portable JDK 17을 다운로드하고 설치합니다.

# 한글 깨짐 방지
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$targetDir = Join-Path $PSScriptRoot "..\316space-be\utils"
$jdkPath = Join-Path $targetDir "jdk17"

if (Test-Path $jdkPath) {
    Write-Host "✅ JDK 17이 이미 존재합니다: $jdkPath" -ForegroundColor Green
    exit
}

Write-Host "🚀 JDK 17 설치를 시작합니다..." -ForegroundColor Cyan

# 폴더 생성
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir
}

# 다운로드 URL (Eclipse Temurin 17)
$url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10+7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip"
$zip = Join-Path $targetDir "jdk17.zip"

Write-Host "📥 JDK 다운로드 중... (약 180MB)"
Invoke-WebRequest -Uri $url -OutFile $zip

Write-Host "📦 압축 해제 중..."
$tempDir = Join-Path $targetDir "temp_jdk"
Expand-Archive $zip -DestinationPath $tempDir -Force

# 폴더 구조 정리 (추출된 폴더의 이름을 jdk17로 변경)
$extractedDir = Get-ChildItem $tempDir | Select-Object -First 1
Move-Item $extractedDir.FullName $jdkPath -Force

# 정리
Remove-Item -Recurse -Force $tempDir
Remove-Item -Force $zip

Write-Host "✨ JDK 17 설치 완료: $jdkPath" -ForegroundColor Green
