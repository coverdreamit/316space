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
| [`docker-compose.yml`](docker-compose.yml) + [`infra/`](infra/README.md) | 테스트·스테이징용 Docker (Nginx + FE + BE) — Compose는 루트, Nginx 설정·스크립트는 `infra/` | [인프라 README](infra/README.md) |

**로컬 개발** 시 프론트(**3000**)가 `/api`를 백엔드(**8080**)로 프록시합니다. **테스트 서버**에서는 Docker로 통합 URL(`:6280` 등)로 접속하고, 필요 시 FE·BE만 호스트 포트(`13000`·`18080` 기본)로도 열어둡니다.

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

## 테스트·스테이징 서버 (Docker)

[`docker-compose.yml`](docker-compose.yml)(저장소 루트)으로 **Nginx + FE(정적) + BE(JAR)** 를 함께 올립니다. 브라우저는 **`http://<서버>:6280`** 한 주소만 쓰면 되고, API는 **`/api/...`** 상대 경로로 동일 출처 요청합니다.

| 환경 | 접속 예 |
|------|---------|
| 로컬 | `http://localhost:3000` (API는 Vite 프록시로 8080) |
| Docker (통합) | `http://<서버>:6280` |
| Docker (FE/BE 직접) | `http://<서버>:13000`, `http://<서버>:18080` (기본값, `.env`로 변경 가능) |

갱신: [`scripts/deploy-pull-restart.sh`](scripts/deploy-pull-restart.sh) (`git pull` 후 `docker compose up -d --build`). UFW 사용 시 외부 포트 허용은 [`scripts/ufw-allow-docker-to-app-ports.sh`](scripts/ufw-allow-docker-to-app-ports.sh)를 참고하세요.

자세한 내용은 [인프라 README](infra/README.md)를 참고하세요.

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
