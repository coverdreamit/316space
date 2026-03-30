#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

git pull --ff-only

(
  cd "${REPO_ROOT}/316space-be"
  mvn -B package -DskipTests
)

(
  cd "${REPO_ROOT}/316space-fe"
  pnpm install --frozen-lockfile
  pnpm run build
)

(
  cd "${REPO_ROOT}/infra"
  docker compose up -d --build
)

LOCAL_HOOK="${SCRIPT_DIR}/deploy.local.sh"
if [[ -f "${LOCAL_HOOK}" ]]; then
  # shellcheck source=/dev/null
  source "${LOCAL_HOOK}"
fi

# deploy.local.sh 에서 restart_app_services() 를 정의했으면 systemd 등으로 재시작.
# 그렇지 않으면 호스트에서 nohup 으로 JAR + pnpm preview 재기동.
restart_app_services_nohup() {
  local jar
  jar="$(find "${REPO_ROOT}/316space-be/target" -maxdepth 1 -type f -name 'space-be-*.jar' ! -name '*.original' -print -quit 2>/dev/null || true)"
  if [[ -z "${jar}" ]]; then
    echo "deploy: JAR 없음 (${REPO_ROOT}/316space-be/target/space-be-*.jar) — BE 재시작 생략" >&2
    return 1
  fi

  echo "deploy: 기존 BE·FE 프로세스 정리 중…"
  pkill -f "[j]ava -jar ${REPO_ROOT}/316space-be/target/space-be-.*\.jar" 2>/dev/null || true
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 8080/tcp 2>/dev/null || true
  fi
  pkill -f "[v]ite preview --port 3000" 2>/dev/null || true
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp 2>/dev/null || true
  fi
  sleep 2

  mkdir -p "${REPO_ROOT}/logs"

  nohup java -jar "${jar}" >> "${REPO_ROOT}/logs/be.log" 2>&1 &
  echo "deploy: BE 시작 → ${jar}"

  (
    cd "${REPO_ROOT}/316space-fe"
    if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
      # shellcheck source=/dev/null
      source "${HOME}/.nvm/nvm.sh"
    fi
    nohup pnpm run preview >> "${REPO_ROOT}/logs/fe.log" 2>&1 &
  )
  echo "deploy: FE 시작 (pnpm run preview → :3000)"
}

if declare -F restart_app_services >/dev/null 2>&1; then
  restart_app_services
else
  restart_app_services_nohup
fi

echo "Deploy finished. Repo: ${REPO_ROOT}"
