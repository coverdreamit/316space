# 316space 개발 및 실행 가이드 (명령어 중심)

이 문서는 **실행 위치(디렉토리)**와 **명령어** 위주로 정리한 가이드입니다. 

## 0. 사전 준비 (Windows JDK 설치)
윈도우 환경에서 백엔드 개발을 위해 JDK 17이 필요합니다. 아래 명령어로 자동 설치할 수 있습니다:

```powershell
# 1. JDK 17 설치 (316space-be/utils/jdk17 경로)
powershell -ExecutionPolicy Bypass -File docs/setup-jdk17.ps1

# 2. Node.js & pnpm 설치 (NVM 활용)
# *반드시 관리자 권한으로 실행된 PowerShell에서 수행하세요*
powershell -ExecutionPolicy Bypass -File docs/setup-node.ps1
```
> 이 스크립트들은 개발에 필요한 최소 도구들을 자동으로 세팅해 줍니다. 특히 `setup-node.ps1`은 NVM-Windows를 설치하므로, 시스템에 이미 Node.js가 깔려 있다면 삭제 후 진행하는 것을 권장합니다.

---

## 1. Windows 개발 (Local Windows Dev)
윈도우 환경에서 개별 서비스를 실행하는 방법입니다.

### 🍃 백엔드 (Backend)
- **실행 위치**: `316space-be` 폴더 진입 후 실행
- **명령어 (PowerShell)**: 
  ```powershell
  # 1. 백엔드 폴더 이동
  cd 316space-be

  # 2. JDK 환경변수 설정 (현재 터미널 전용)
  # 만약 설치되지 않았다면, 루트에서 docs/setup-jdk17.ps1 를 먼저 실행하세요.
  $env:JAVA_HOME = "$PWD\utils\jdk17"

  # 3. 개발 모드 실행
  .\mvnw.cmd spring-boot:run

  # 4. (선택) 빌드/JAR 생성
  .\mvnw.cmd clean package -DskipTests
  ```

### ⚛️ 프론트엔드 (Frontend)
- **실행 위치**: `316space-fe` 폴더 진입 후 실행
- **명령어**:
  ```bash
  # 1. 프론트엔드 폴더 이동
  cd 316space-fe

  # 2. 의존성 설치 (최초 1회 또는 패키지 변경 시)
  pnpm install

  # 3. 개발 서버 실행
  pnpm dev
  ```

---

## 2. Linux 개발 (Local/Remote Linux Dev)
리눅스 환경(Ubuntu 등)에서 셸을 통해 개발할 때의 명령어입니다.

### 🍃 백엔드 (Backend)
- **실행 위치**: `316space-be` 폴더
- **명령어 (Bash)**:
  ```bash
  cd 316space-be
  chmod +x mvnw  # 권장 (최초 1회)
  ./mvnw spring-boot:run
  ```

### ⚛️ 프론트엔드 (Frontend)
- **실행 위치**: `316space-fe` 폴더
- **명령어**:
  ```bash
  cd 316space-fe
  pnpm dev
  ```

---

## 3. Linux 실행 모드 (Production/Docker Run)
서버 배포 및 통합 테스트 시 사용하며, **루트(Root) 디렉토리**에서 실행합니다.

### 🐳 Docker Compose (통합 실행)
- **실행 위치**: **프로젝트 최상위 루트 (`316space`)**
- **명령어**:
  ```bash
  # 전체 서비스(Nginx + FE + BE) 빌드 및 백그라운드 실행
  docker compose up -d --build

  # 서비스 중단
  docker compose down
  ```

### 🚀 배포 스크립트 활용
- **실행 위치**: **프로젝트 최상위 루트 (`316space`)**
- **명령어**:
  ```bash
  # 소스 최신화 및 컨테이너 재시작
  ./scripts/deploy-pull-restart.sh
  ```

---

## 요약 (실행 위치 확인)

| 작업 내용 | 실행 위치 (CWD) | 주요 명령어 |
| :--- | :--- | :--- |
| **윈도우 백엔드 개발** | `316space-be/` | `.\mvnw.cmd spring-boot:run` |
| **윈도우 프론트 개발** | `316space-fe/` | `pnpm dev` |
| **리눅스 백엔드 개발** | `316space-be/` | `./mvnw spring-boot:run` |
| **도커 통합 실행** | **루트 (`316space/`)** | `docker compose up -d` |
| **배포/업데이트** | **루트 (`316space/`)** | `./scripts/deploy-pull-restart.sh` |