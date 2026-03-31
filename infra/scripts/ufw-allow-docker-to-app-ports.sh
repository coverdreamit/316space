#!/usr/bin/env bash
# UFW 사용 시: 외부에서 테스트 서버 Nginx 진입점(기본 6280)만 열면 됩니다.
# (FE·BE는 Docker 내부 네트워크만 사용 — 호스트 3000·8080 개방 불필요)
#
# 사용: sudo bash infra/scripts/ufw-allow-docker-to-app-ports.sh
# 다른 포트를 쓰려면: PUBLIC_PORT=8080 sudo -E bash ...
set -euo pipefail

PORT="${PUBLIC_PORT:-6280}"
ufw allow "${PORT}/tcp" comment '316space nginx (docker compose)'
ufw reload
ufw status verbose
