# 316space

**316스페이스** 공식 홈페이지를 제작·운영하기 위한 저장소입니다. 공개 웹 UI는 React(Vite), 폼·연동·API는 Spring Boot로 구성하며, 배포·도메인·환경은 이 프로젝트에서 관리합니다.

*(초기 화면·콘텐츠 구성은 기존 [316tower Canva 사이트](https://316tower.my.canva.site/home)를 참고해 옮겼습니다.)*

**저장소:** [github.com/coverdreamit/316space](https://github.com/coverdreamit/316space)

## 목표

- 랜딩·소개 등 공개 페이지를 **React 기반 프론트**로 유지·확장
- 폼·동적 데이터·연동을 위한 **Spring Boot API**
- 버전 관리·CI·스테이징/프로덕션 환경을 코드로 일관되게 운영

## 구성

| 디렉터리 | 역할 | 자세한 설명 |
|----------|------|-------------|
| [`316space-fe`](316space-fe/README.md) | 공개 웹 UI (Vite + React) | [프론트 README](316space-fe/README.md) |
| [`316space-be`](316space-be/README.md) | REST API (Spring Boot) | [백엔드 README](316space-be/README.md) |
| [`infra`](infra/README.md) | 서버용 Nginx 리버스 프록시 (Docker) | [인프라 README](infra/README.md) |

로컬 개발 시 프론트(**3000**)가 `/api`를 백엔드(**8080**)로 프록시합니다.

## 빠른 시작

```bash
# 백엔드 (터미널 1)
cd 316space-be
mvn spring-boot:run

# 프론트 (터미널 2)
cd 316space-fe
pnpm install
pnpm dev
```

- 프론트: `http://localhost:3000`
- API 헬스: `GET http://localhost:8080/api/health`

## 서버 배포 (예정)

프로덕션에서는 **Nginx(외부 6280)** 가 단일 진입점이 되고, 내부적으로 프론트 **3000**·API **8080**으로 리버스 프록시합니다.

| 공개 포트 | 역할 |
|-----------|------|
| **6280** | Nginx (브라우저 접속) |
| 3000 | 프론트 (호스트에서 실행, Nginx upstream) |
| 8080 | Spring Boot API (호스트에서 실행, `/api/` 프록시) |

설정 파일과 Docker Compose는 [`infra/`](infra/README.md)에 둡니다. **Compose는 Nginx만 올리는 구성**이며, FE·BE는 서버에서 빌드·실행한 뒤 Nginx가 `host.docker.internal`로 붙습니다. 자세한 순서는 [인프라 README](infra/README.md)를 참고하세요.

갱신 시에는 저장소 루트에서 [`infra/scripts/deploy-pull-restart.sh`](infra/scripts/deploy-pull-restart.sh)로 `git pull`·빌드·`docker compose up -d --build`·**BE·FE 재시작(nohup 기본)**까지 한 번에 할 수 있습니다. systemd를 쓰려면 `deploy.local.sh`에 `restart_app_services()`만 정의하면 됩니다. UFW `default deny` 환경이면 [`infra/scripts/ufw-allow-docker-to-app-ports.sh`](infra/scripts/ufw-allow-docker-to-app-ports.sh)로 Docker 브리지→호스트 3000·8080을 허용하세요.

**레포 vs 서버:** `infra/`의 `nginx.conf`·`docker-compose.yml`은 **버전 관리해 두고**, 실제 `docker compose up`은 **배포할 서버**(또는 CD 파이프라인)에서 실행하는 방식이 일반적입니다. 로컬에서 미리 검증할 수 있어 재현성이 좋습니다.

## 사전 요구 사항

- Node.js (LTS 권장), pnpm (`corepack enable` 후 사용 권장)  
- JDK 17, Apache Maven  

## 버전 관리

```bash
git clone https://github.com/coverdreamit/316space.git
cd 316space
```

## 참고 링크

- 이전 공개 페이지(참고용): [316tower.my.canva.site/home](https://316tower.my.canva.site/home)
