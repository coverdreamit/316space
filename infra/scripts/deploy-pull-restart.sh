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
  docker compose up -d
)

LOCAL_HOOK="${SCRIPT_DIR}/deploy.local.sh"
if [[ -f "${LOCAL_HOOK}" ]]; then
  source "${LOCAL_HOOK}"
  if declare -F restart_app_services >/dev/null 2>&1; then
    restart_app_services
  fi
fi

echo "Deploy finished. Repo: ${REPO_ROOT}"
