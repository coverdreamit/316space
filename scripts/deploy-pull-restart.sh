#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

git pull --ff-only

(
  cd "${REPO_ROOT}"
  docker compose up -d --build
)

LOCAL_HOOK="${SCRIPT_DIR}/deploy.local.sh"
if [[ -f "${LOCAL_HOOK}" ]]; then
  # shellcheck source=/dev/null
  source "${LOCAL_HOOK}"
fi

# deploy.local.sh 에서 restart_app_services() 를 정의했으면 배포 후 추가 작업(예: DB 마이그레이션)만 실행.
# 기본 경로는 compose 가 FE·BE·Nginx 를 모두 기동하므로 nohup 재시작은 하지 않습니다.
if declare -F restart_app_services >/dev/null 2>&1; then
  restart_app_services
fi

echo "Deploy finished. Repo: ${REPO_ROOT}"
