#!/usr/bin/env bash
# =====================================================================
#  MKCOT: kuandaa seva mpya ya Ubuntu (22.04/24.04) na kuwasha mfumo.
#  Inafaa Oracle Cloud Always Free, Google Cloud e2-micro, AWS, au VPS yoyote.
#
#  Matumizi (kwenye seva, ukiwa umeingia kwa SSH):
#     git clone https://github.com/kelvinlivinus-code/mfuko-kuhani.git
#     cd mfuko-kuhani/mkcot-spring-angular/deploy
#     sudo bash setup-server.sh  mkcot.duckdns.org  wewe@mfano.com
#
#  Inafanya:
#   1. Masasisho ya usalama ya Ubuntu, na kuyaweka yajifanye yenyewe kila siku
#   2. Firewall: inafungua port 22 (SSH), 80 na 443 tu
#   3. fail2ban: inazuia IP zinazojaribu kukisia neno la siri la SSH
#   4. SSH: inazima kuingia kwa neno la siri (funguo za SSH tu) na kuingia kama root
#   5. Swap ya GB 2 kama RAM ni ndogo (mf. seva ya GB 1)
#   6. Docker, kisha inatengeneza deploy/.env yenye siri za nasibu
#   7. Inawasha MKCOT (Postgres + Spring Boot/Angular + Caddy HTTPS + nakala za kila siku)
# =====================================================================
set -euo pipefail

DOMAIN="${1:-}"
ADMIN_EMAIL="${2:-}"
if [[ -z "$DOMAIN" || -z "$ADMIN_EMAIL" ]]; then
  echo "Matumizi: sudo bash setup-server.sh <jina-la-tovuti> <barua-pepe-ya-msimamizi>"
  echo "Mfano:    sudo bash setup-server.sh mkcot.duckdns.org wewe@mfano.com"
  exit 1
fi
if [[ $EUID -ne 0 ]]; then
  echo "Endesha kwa sudo: sudo bash setup-server.sh $*"
  exit 1
fi

HERE="$(cd "$(dirname "$0")" && pwd)"
export DEBIAN_FRONTEND=noninteractive

echo "==> 1/7 Masasisho ya Ubuntu"
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl git openssl fail2ban unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> 2/7 Firewall (22, 80, 443 tu)"
if [[ -f /etc/iptables/rules.v4 ]] && grep -q "REJECT" /etc/iptables/rules.v4; then
  # Picha za Ubuntu za Oracle Cloud zinatumia iptables zenyewe: ongeza 80 na 443 kabla ya sheria ya REJECT.
  for p in 80 443; do
    iptables -C INPUT -p tcp --dport "$p" -m state --state NEW -j ACCEPT 2>/dev/null \
      || iptables -I INPUT 5 -p tcp --dport "$p" -m state --state NEW -j ACCEPT
  done
  iptables -C INPUT -p udp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p udp --dport 443 -j ACCEPT
  apt-get install -y iptables-persistent
  netfilter-persistent save
else
  apt-get install -y ufw
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 443/udp
  ufw --force enable
fi

echo "==> 3/7 fail2ban kwa SSH"
cat > /etc/fail2ban/jail.d/mkcot.conf <<'JAIL'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
JAIL
systemctl enable --now fail2ban
systemctl restart fail2ban

echo "==> 4/7 SSH: funguo tu, hakuna root"
SSHD_DIR=/etc/ssh/sshd_config.d
mkdir -p "$SSHD_DIR"
if ls /home/*/.ssh/authorized_keys >/dev/null 2>&1 || [[ -s /root/.ssh/authorized_keys ]]; then
  cat > "$SSHD_DIR/90-mkcot.conf" <<'SSHC'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
SSHC
  systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
else
  echo "   (Sikupata funguo za SSH, kwa hiyo sijazima kuingia kwa neno la siri. Weka funguo kisha zima mwenyewe.)"
fi

echo "==> 5/7 Swap (kama RAM < 2GB)"
MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [[ $MEM_MB -lt 2048 && ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> 6/7 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
# Log za Docker zisijaze diski
if [[ ! -f /etc/docker/daemon.json ]]; then
  cat > /etc/docker/daemon.json <<'DJ'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
DJ
  systemctl restart docker
fi

cd "$HERE"
if [[ ! -f .env ]]; then
  umask 077
  cat > .env <<ENV
MKCOT_DOMAIN=$DOMAIN
MKCOT_ADMIN_EMAIL=$ADMIN_EMAIL
DB_PASSWORD=$(openssl rand -hex 24)
MKCOT_JWT_SECRET=$(openssl rand -hex 32)
ENV
  chmod 600 .env
  echo "   deploy/.env imetengenezwa (siri za nasibu). Usiitume kwa mtu yeyote."
else
  echo "   deploy/.env ipo tayari: sijaibadilisha."
fi
mkdir -p backups
chmod 700 backups

echo "==> 7/7 Kuwasha MKCOT (mara ya kwanza ujenzi unachukua dakika 5-15)"
docker compose -f docker-compose.prod.yml up -d --build

echo
echo "=============================================================="
echo " Tayari. Fungua:  https://$DOMAIN"
echo " Jisajili kwa barua pepe $ADMIN_EMAIL ili uwe Msimamizi."
echo " Hali ya mfumo:   docker compose -f docker-compose.prod.yml ps"
echo " Log:             docker compose -f docker-compose.prod.yml logs -f app"
echo "=============================================================="
