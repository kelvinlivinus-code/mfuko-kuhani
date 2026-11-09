#!/bin/sh
# Nakala ya database ya MKCOT kila siku saa 8 usiku (saa za Afrika Mashariki).
# Faili zinahifadhiwa deploy/backups/ kwa siku 14. Nakili folda hiyo mahali pengine (mf. Google Drive) mara kwa mara.
set -u
KEEP_DAYS=14
while true; do
  if [ "$(date +%H%M)" = "0200" ]; then
    f="/backups/mkcot-$(date +%Y-%m-%d).sql.gz"
    if pg_dump -h db -U mkcot -d mkcot --no-owner | gzip > "$f"; then
      echo "Nakala imehifadhiwa: $f"
    else
      echo "KOSA: nakala haikuhifadhiwa" >&2
    fi
    find /backups -name 'mkcot-*.sql.gz' -mtime +"$KEEP_DAYS" -type f -exec rm -f {} \;
    sleep 61
  fi
  sleep 30
done
