#!/usr/bin/env bash
# Kusasisha MKCOT kwenye seva baada ya mabadiliko mapya kwenye GitHub:  sudo bash update.sh
set -euo pipefail
cd "$(dirname "$0")"
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
docker compose -f docker-compose.prod.yml ps
