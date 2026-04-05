# 316space 개발 및 실행 가이드 (명령어 중심)

이 문서는 **실행 위치(디렉토리)**와 **명령어** 위주로 정리한 가이드입니다. 

## 0. 사전 준비 (Windows JDK 및 Node 설치)
윈도우 환경에서 개발을 위해 필요한 도구들을 아래 명령어로 자동 설치할 수 있습니다:

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
- **특징**: **`mvnw.cmd`를 실행하면 현재 프로젝트의 JDK(`utils/jdk17`)를 자동으로 인식합니다.**
  (만약 설치되지 않았다면, 루트에서 `docs/setup-jdk17.ps1`를 먼저 실행하세요.)

- **명령어 (PowerShell)**: 
  ```powershell
  # 1. 백엔드 폴더 이동
  cd 316space-be

  # 2. 개발 모드 실행 (JAVA_HOME이 자동으로 잡힙니다)
  .\mvnw.cmd spring-boot:run

  # 3. (선택) 빌드/JAR 생성
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

## 4. 루트 폴더 명령어 (Root-level Commands)
`pnpm workspace` 설정을 통해 프로젝트 최상위 루트에서도 하위 서브 프로젝트를 제어할 수 있습니다.

### ⚛️ 프론트엔드 (Frontend Filter)
- **실행 위치**: **프로젝트 최상위 루트 (`316space/`)**
- **명령어**:
  ```bash
  # 특정 프로젝트만 실행 (Recommended)
  pnpm --filter 316space-fe dev

  # 루트 package.json에 정의된 스크립트 사용
  pnpm fe:dev
  ```

### 🍃 백엔드 (Backend)
- **실행 위치**: **프로젝트 최상위 루트 (`316space/`)**
- **명령어**:
  ```bash
  # 루트 package.json에 정의된 스크립트 사용 (프록시 스크립트)
  pnpm be:run

  # 만약 8080 포트가 이미 사용 중이라면 기존 프로세스 종료
  pnpm be:kill
  ```

---

## 5. Task Runner 활용 (Root package.json)
루트 폴더의 `package.json`은 프로젝트 전체의 **태스크 러너(Task Runner)** 역할을 합니다. 여러 환경의 명령어를 하나로 통합하여 관리할 수 있습니다.

### 💡 특징
- **통합 인터페이스**: 백엔드(Java/Maven)와 프론트엔드(Node/Vite) 명령어를 `pnpm`이라는 하나의 도구로 통합 실행합니다.
- **자동화**: 복잡한 디렉토리 이동(`cd`) 및 환경변수 설정을 스크립트 내부에 포함하여 오타와 실수를 줄여줍니다.
- **편의성**: `be:run`, `fe:dev`와 같은 직관적인 별칭을 사용하여 명령어를 간소화합니다.

### 🛠️ 주요 스크립트 정의
```json
"scripts": {
  "fe:dev": "pnpm --filter 316space-fe dev",      // 프론트엔드 실행 (필터 활용)
  "be:run": "cd 316space-be && mvnw.cmd ...",     // 백엔드 실행 (배치 호출)
  "be:kill": "powershell -Command ...",           // 포트 충돌 해결 (자동화)
  "all:install": "pnpm install"                   // 워크스페이스 전체 설치
}
```

---

## 요약 (실행 위치 확인)

| 작업 내용 | 실행 위치 (CWD) | 주요 명령어 |
| :--- | :--- | :--- |
| **백엔드 개발 (윈도우)** | `316space-be/` | `.\mvnw.cmd spring-boot:run` |
| **백엔드 포트 종료 (윈도우)** | **루트 (`316space/`)** | `pnpm be:kill` |
| **프론트 개발 (윈도우)** | `316space-fe/` | `pnpm dev` |
| **도커 통합 실행 (루트)** | **루트 (`316space/`)** | `docker compose up -d` |
| **배포/업데이트 (루트)** | **루트 (`316space/`)** | `./scripts/deploy-pull-restart.sh` |
| **프론트 개발 (루트)** | **루트 (`316space/`)** | `pnpm --filter 316space-fe dev` |
| **모든 서비스 설치** | **루트 (`316space/`)** | `pnpm install` (Workspace) |