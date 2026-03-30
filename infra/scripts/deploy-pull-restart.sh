#!/usr/bin/env bash
# 저장소 루트에서 git pull → BE/FE 빌드 → Nginx Compose 기동·갱신
# BE·FE 프로세스 재시작은 서버마다 다르므로 deploy.local.sh 훅 사용
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

echo "==> git pull"
git pull --ff-only

echo "==> Backend (Maven)"
(cd "$REPO_ROOT/316space-be" && mvn -DskipTests package)

echo "==> Frontend (pnpm)"
(cd "$REPO_ROOT/316space-fe" && pnpm install && pnpm build)

echo "==> Nginx (Docker Compose)"
(cd "$REPO_ROOT/infra" && docker compose up -d)

LOCAL_HOOK="$SCRIPT_DIR/deploy.local.sh"
if [[ -f "$LOCAL_HOOK" ]]; then
  echo "==> deploy.local.sh (BE/FE 재시작)"
  # shellcheck disable=SC1090
  source "$LOCAL_HOOK"
  if declare -F restart_app_services >/dev/null 2>&1; then
    restart_app_services
  fi
else
  echo "==> 안내: BE·FE를 systemd 등으로 띄웠다면 deploy.local.sh.example 을 복사해 deploy.local.sh 를 만들고 restart_app_services() 를 채우세요."
fi

echo "==> deploy-pull-restart 완료"
