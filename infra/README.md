# 인프라 (Nginx 리버스 프록시)

서버에서 **외부 포트 6280**으로 접속하면 Nginx가 아래로 나눕니다.

| 경로 | upstream | 설명 |
|------|----------|------|
| `/` | `host.docker.internal:3000` | 프론트 (`pnpm preview` 등) |
| `/api/` | `host.docker.internal:8080` | Spring Boot API |

## 전제

- FE가 **3000**, BE가 **8080**에서 수신 중이어야 합니다. `pnpm preview`는 `--host`로 외부(도커 브리지)에서 접근 가능하게 두는 것을 권장합니다.
- 이 Compose는 **Nginx 컨테이너만** 올립니다. FE·BE는 systemd 등으로 호스트에서 실행합니다.
- 설정 파일: 루트의 `nginx.conf`를 `conf.d/default.conf`로 마운트합니다.

## 실행 (서버)

```bash
cd infra
docker compose up -d
```

접속: `http://<서버>:6280`  
API 예: `http://<서버>:6280/api/health`

## UFW

`default deny`이면 Docker 브리지에서 호스트 3000·8080으로의 트래픽이 막힐 수 있습니다. 한 번 실행:

```bash
sudo bash infra/scripts/ufw-allow-docker-to-app-ports.sh
```

## 설정 변경

- 프록시 대상: `nginx.conf`의 `proxy_pass`
- 외부 포트: `docker-compose.yml`의 `"6280:80"`

## 배포: git pull 후 빌드·Nginx 반영

`scripts/deploy-pull-restart.sh` (저장소 루트 기준):

1. `git pull --ff-only`
2. `316space-be`: `mvn -B package -DskipTests`
3. `316space-fe`: `pnpm install --frozen-lockfile` 후 `pnpm run build`
4. `infra`: `docker compose up -d`
5. (선택) `deploy.local.sh`의 `restart_app_services()` — BE·FE systemd 재시작

실행 권한:

```bash
chmod +x infra/scripts/deploy-pull-restart.sh infra/scripts/ufw-allow-docker-to-app-ports.sh
```

서버에서 훅:

```bash
cp infra/scripts/deploy.local.sh.example infra/scripts/deploy.local.sh
# 유닛 이름 등 수정
```

`deploy.local.sh`는 루트 `.gitignore`에 있어 커밋되지 않습니다.
