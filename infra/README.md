# 인프라 (Nginx 리버스 프록시)

서버에서 **외부 포트 6280**으로 접속하면 Nginx가 아래로 나눕니다.

| 경로 | upstream | 설명 |
|------|----------|------|
| `/` | `host:3000` | 프론트 (Vite dev 또는 `pnpm preview` 등) |
| `/api/` | `host:8080` | Spring Boot API |

## 전제

- FE가 **3000**, BE가 **8080**에서 수신 중이어야 합니다.
- 이 Compose는 **Nginx 컨테이너만** 올립니다. FE·BE는 systemd, 수동 실행, 별도 컨테이너 등 서버에서 관리합니다.

## 실행 (서버)

```bash
cd infra
docker compose up -d
```

접속: `http://<서버>:6280`  
API 예: `http://<서버>:6280/api/health`

## 설정 변경

- 업스트림 호스트명·포트: `nginx/nginx.conf`의 `upstream` 블록
- 외부 포트: `docker-compose.yml`의 `"6280:80"`

FE·BE를 Docker 네트워크 안에서 같이 띄우면 `upstream`을 서비스 이름(예: `frontend:3000`)으로 바꾸면 됩니다.

## 배포: git pull 후 빌드·Nginx 반영

`scripts/deploy-pull-restart.sh`는 저장소 **루트 기준**으로 동작합니다.

1. `git pull --ff-only`
2. `316space-be`: `mvn -DskipTests package`
3. `316space-fe`: `pnpm install && pnpm build`
4. `infra`: `docker compose up -d` (Nginx)
5. (선택) 같은 디렉터리의 `deploy.local.sh`에 정의한 `restart_app_services()` 호출 — BE·FE를 systemd 등으로 돌릴 때 여기서 재시작

최초 한 번 실행 권한:

```bash
chmod +x infra/scripts/deploy-pull-restart.sh
```

서버에서 훅 만들기:

```bash
cp infra/scripts/deploy.local.sh.example infra/scripts/deploy.local.sh
# 편집: restart_app_services() 안에 systemctl restart … 등 작성
```

`deploy.local.sh`는 `.gitignore`에 넣어 두었으므로 커밋되지 않습니다.
