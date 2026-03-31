#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/316space-deploy-cron.lock"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") another deploy is running" >&2
  exit 0
fi

cd "${REPO_ROOT}"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${BRANCH}" == "HEAD" ]]; then
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") detached HEAD; skip cron deploy" >&2
  exit 0
fi

if ! git fetch origin "${BRANCH}"; then
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") git fetch origin ${BRANCH} failed" >&2
  exit 1
fi

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/${BRANCH}")"
if [[ "${LOCAL}" == "${REMOTE}" ]]; then
  exit 0
fi

echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") origin/${BRANCH} updated $(git rev-parse --short "${REMOTE}"); running deploy-pull-restart.sh"
bash "${SCRIPT_DIR}/deploy-pull-restart.sh"
