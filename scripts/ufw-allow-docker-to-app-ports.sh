#!/usr/bin/env bash
# UFW 사용 시: Nginx 진입점(기본 6280) 허용. FE·BE 직접 포트(기본 13000·18080)는
# 외부에 열 거면 별도로 ufw allow 하거나 이 스크립트 확장.
#
# 사용(저장소 루트): sudo bash scripts/ufw-allow-docker-to-app-ports.sh
# 다른 포트를 쓰려면: PUBLIC_PORT=8080 sudo -E bash ...
set -euo pipefail

PORT="${PUBLIC_PORT:-6280}"
ufw allow "${PORT}/tcp" comment '316space nginx (docker compose)'
ufw reload
ufw status verbose
