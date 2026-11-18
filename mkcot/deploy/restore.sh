#!/usr/bin/env bash
# Kurudisha database kutoka nakala:  sudo bash restore.sh backups/mkcot-2026-11-08.sql.gz
# TAHADHARI: data iliyopo sasa inabadilishwa na ile ya kwenye nakala.
set -euo pipefail
cd "$(dirname "$0")"
F="${1:?Taja faili la nakala, mf. backups/mkcot-2026-11-08.sql.gz}"
read -r -p "Data yote ya sasa itabadilishwa na $F. Andika NDIYO kuendelea: " ok
[[ "$ok" == "NDIYO" ]] || { echo "Imesitishwa."; exit 1; }
C="docker compose -f docker-compose.prod.yml"
$C stop app
$C exec -T db psql -U mkcot -d postgres -c "drop database if exists mkcot with (force);" -c "create database mkcot owner mkcot;"
gunzip -c "$F" | $C exec -T db psql -U mkcot -d mkcot -q
$C start app
echo "Imerudishwa kutoka $F"
