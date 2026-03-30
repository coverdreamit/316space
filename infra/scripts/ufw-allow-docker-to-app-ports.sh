#!/usr/bin/env bash
# UFW default deny 시 Docker 브리지(172.16.0.0/12)에서 호스트 3000·8080 허용
# 사용: sudo bash infra/scripts/ufw-allow-docker-to-app-ports.sh
set -euo pipefail

ufw allow from 172.16.0.0/12 to any port 3000 proto tcp comment '316space FE for docker nginx'
ufw allow from 172.16.0.0/12 to any port 8080 proto tcp comment '316space BE for docker nginx'
ufw reload
ufw status verbose
