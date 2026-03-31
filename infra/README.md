# 인프라 (테스트·스테이징: Docker Compose)

**로컬 개발**은 Docker·Nginx 없이 [루트 README](../README.md)대로 FE `:3000` + BE `:8080` 만 사용합니다.

**테스트·운영 서버**는 루트 Compose로 **Nginx(진입점) + FE(vite preview `:3000`) + BE(API)** 를 한 번에 띄웁니다.

| 환경 | 브라우저 URL | API |
|------|----------------|-----|
| 로컬 | `http://localhost:3000` | Vite가 `/api` → `http://localhost:8080` 로 프록시 |
| Docker (통합) | `http://<서버>:6280` 등 (`PUBLIC_PORT`) | 동일 출처 `/api/...` → Nginx → BE |
| Docker (FE만 직접) | `http://<서버>:13000` (기본 `FE_HOST_PORT`, 컨테이너 내부 3000) | `/api` → Vite preview 프록시 → `be:8080` |
| Docker (BE만 직접) | `http://<서버>:18080` (기본 `BE_HOST_PORT`, 컨테이너 내부 8080) | 헬스: `/api/health` — **필수는 아님**(nginx·fe 는 Docker 네트워크 `be:8080`만 사용) |

FE 코드에서는 **`/api/...` 상대 경로**만 쓰면 로컬·서버 모두 동작합니다.

## 구성

| 서비스 | 이미지/빌드 | 역할 |
|--------|-------------|------|
| `nginx` | `nginx:alpine` | 외부 포트 바인딩, `/` → `fe`, `/api` → `be` |
| `fe` | `316space-fe/Dockerfile` | **vite preview** 컨테이너 **3000** → 호스트 기본 **13000** (`FE_HOST_PORT`) |
| `be` | `316space-be/Dockerfile` | Spring Boot 컨테이너 **8080** → 호스트 기본 **18080** (`BE_HOST_PORT`, 디버그·직접 호출용) |

Compose 파일: 저장소 루트의 [`docker-compose.yml`](../docker-compose.yml). Nginx 설정: 이 디렉터리의 `nginx.conf` → 컨테이너 `conf.d/default.conf` 로 마운트.

## 실행 (서버)

**저장소 루트**(`316space/`)에서 Compose 파일을 사용합니다.

```bash
cd /path/to/316space   # 저장소 루트
docker compose up -d --build
```

- 통합 접속: `http://<서버>:6280`
- FE만(디버그 등): `http://<서버>:13000`
- BE만(호스트에서 직접): `http://<서버>:18080/api/health`
- API(통합 진입): `http://<서버>:6280/api/health`

절대 URL이 빌드에 필요하면(Next `NEXT_PUBLIC_*` 와 유사) 루트에 `.env` 두고 `VITE_PUBLIC_API_URL=...` 설정 후 `docker compose build` — `docker-compose.yml`의 `fe.build.args`로 전달됩니다.

게시 포트 변경:

```bash
PUBLIC_PORT=8080 docker compose up -d --build
```

## UFW

외부에서 위 포트로 들어오게 허용:

```bash
sudo bash scripts/ufw-allow-docker-to-app-ports.sh
# 또는 PUBLIC_PORT=8080 sudo -E bash scripts/ufw-allow-docker-to-app-ports.sh
```

## 배포: git pull 후 이미지 재빌드·기동

저장소 루트에서:

```bash
./scripts/deploy-pull-restart.sh
```

(`chmod +x` 필요 시 한 번 실행)

Compose가 FE·BE를 다시 빌드하고 Nginx까지 재기동합니다. 호스트에 Maven·pnpm으로 별도 빌드할 필요는 없습니다.

선택 훅: `scripts/deploy.local.sh.example` 을 `scripts/deploy.local.sh` 로 복사해 배포 후 추가 작업을 넣을 수 있습니다.

## 설정 변경

- 리버스 프록시 규칙: `infra/nginx.conf`
- 외부 포트·서비스 정의: 루트 `docker-compose.yml` 의 `PUBLIC_PORT` 또는 `ports` 매핑
