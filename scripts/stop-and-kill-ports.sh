#!/usr/bin/env bash
# 316space: Docker Compose 중지 + 호스트에서 FE/BE/Nginx 게시 포트 강제 해제
# 사용: 저장소 루트 또는 scripts/ 에서 ./scripts/stop-and-kill-ports.sh
# 옵션: --no-ports  호스트 포트 fuser/kill 생략 (Compose 중지만)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

KILL_HOST_PORTS=1
for arg in "$@"; do
  case "$arg" in
    --no-ports) KILL_HOST_PORTS=0 ;;
    -h|--help)
      echo "Usage: $0 [--no-ports]"
      exit 0
      ;;
  esac
done

if [[ -f "${REPO_ROOT}/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${REPO_ROOT}/.env"
  set +a
fi

PUBLIC_PORT="${PUBLIC_PORT:-6280}"
FE_HOST_PORT="${FE_HOST_PORT:-13000}"
BE_HOST_PORT="${BE_HOST_PORT:-18080}"

cd "${REPO_ROOT}"

echo "==> Docker Compose down (${REPO_ROOT})"
docker compose down --remove-orphans 2>/dev/null || true

echo "==> 동일 이름 컨테이너 제거 (잔여)"
docker rm -f 316space-nginx 316space-fe 316space-be 2>/dev/null || true

if [[ "${KILL_HOST_PORTS}" -eq 0 ]]; then
  echo "==> 완료 (--no-ports: 호스트 포트 정리 생략)"
  exit 0
fi

free_tcp_port() {
  local port="$1"
  [[ -z "${port}" ]] && return
  echo "==> 포트 ${port}/tcp 정리"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
  sleep 0.5
  if command -v lsof >/dev/null 2>&1; then
    local p
    p="$(lsof -ti:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${p}" ]]; then
      # shellcheck disable=SC2086
      kill -9 ${p} 2>/dev/null || true
    fi
  fi
}

# 로컬 개발 기본 + compose 기본 게시 포트 (중복 제거)
mapfile -t PORTS < <(printf '%s\n' "${FE_HOST_PORT}" "${BE_HOST_PORT}" "${PUBLIC_PORT}" 3000 8080 6280 13000 18080 | sort -un)

for p in "${PORTS[@]}"; do
  free_tcp_port "${p}"
done

echo "==> 완료"
