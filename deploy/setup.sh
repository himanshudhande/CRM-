#!/bin/bash
# One-time VPS setup for Hexamad Digital AOS.
#
# Usage (run once, from inside the project folder, after uploading the code):
#   sudo bash deploy/setup.sh
#
# What it does:
#   1. Installs Node.js, PM2, Nginx, Certbot, inotify-tools (only what's missing)
#   2. Checks .env exists (stops and gives you a template if not)
#   3. Installs deps, applies DB migrations, builds, starts the app under PM2
#   4. Configures Nginx to proxy crm.hexamaddigital.com -> the app
#   5. Installs a background watcher (systemd service) that auto-redeploys
#      whenever you upload new files — this is what makes future updates
#      "just drag and drop" with no SSH needed.
#   6. Tries to issue an SSL certificate (skips gracefully if DNS isn't
#      pointed at this server yet — rerun deploy/ssl.sh later once it is)
set -e

if [ "$EUID" -ne 0 ]; then
  echo "Run this with sudo: sudo bash deploy/setup.sh"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="crm.hexamaddigital.com"
REAL_USER="${SUDO_USER:-$(whoami)}"

echo "=== Project directory: $PROJECT_DIR ==="

# --- 1. System packages -----------------------------------------------------
if ! command -v node > /dev/null; then
  echo "=== Installing Node.js LTS ==="
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 > /dev/null; then
  echo "=== Installing PM2 ==="
  npm install -g pm2
fi

if ! command -v nginx > /dev/null; then
  echo "=== Installing Nginx ==="
  apt-get update
  apt-get install -y nginx
fi

if ! command -v certbot > /dev/null; then
  echo "=== Installing Certbot ==="
  apt-get install -y certbot python3-certbot-nginx
fi

if ! command -v inotifywait > /dev/null; then
  echo "=== Installing inotify-tools (for the auto-deploy watcher) ==="
  apt-get install -y inotify-tools
fi

# --- 2. Env file check -------------------------------------------------------
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "=== No .env found — creating a template ==="
  AUTO_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  cat > "$PROJECT_DIR/.env" <<EOF
# Fill these in, then re-run: sudo bash deploy/setup.sh

# Supabase pooler connection strings (from your Supabase project settings)
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# Auth.js
AUTH_SECRET="$AUTO_SECRET"
NEXTAUTH_URL="https://$DOMAIN"

# Single admin login
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="change-me"
EOF
  chown "$REAL_USER":"$REAL_USER" "$PROJECT_DIR/.env"
  echo ""
  echo "!!! Edit $PROJECT_DIR/.env now (nano .env), fill in your real values,"
  echo "!!! then run this script again: sudo bash deploy/setup.sh"
  exit 0
fi

# --- 3. Build and start the app ---------------------------------------------
cd "$PROJECT_DIR"
sudo -u "$REAL_USER" npm install --no-audit --no-fund
sudo -u "$REAL_USER" npx prisma migrate deploy
sudo -u "$REAL_USER" npm run build

if ! sudo -u "$REAL_USER" pm2 describe hexamad-aos > /dev/null 2>&1; then
  sudo -u "$REAL_USER" pm2 start npm --name hexamad-aos --cwd "$PROJECT_DIR" -- start
else
  sudo -u "$REAL_USER" pm2 restart hexamad-aos
fi
sudo -u "$REAL_USER" pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u "$REAL_USER" --hp "$(eval echo ~"$REAL_USER")" | tail -1 | bash || true

# --- 4. Nginx ----------------------------------------------------------------
NGINX_CONF="/etc/nginx/sites-available/hexamad-aos"
if [ ! -f "$NGINX_CONF" ]; then
  echo "=== Writing Nginx config for $DOMAIN ==="
  cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/hexamad-aos
  nginx -t
  systemctl reload nginx
fi

# --- 5. Auto-deploy watcher (systemd service) --------------------------------
chmod +x "$PROJECT_DIR/deploy/redeploy.sh" "$PROJECT_DIR/deploy/watch-deploy.sh"

cat > /etc/systemd/system/hexamad-aos-watch.service <<EOF
[Unit]
Description=Hexamad Digital AOS auto-deploy watcher
After=network.target

[Service]
Type=simple
User=$REAL_USER
ExecStart=/bin/bash $PROJECT_DIR/deploy/watch-deploy.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable hexamad-aos-watch
systemctl restart hexamad-aos-watch

# --- 6. SSL (best-effort) -----------------------------------------------------
echo "=== Attempting SSL certificate for $DOMAIN ==="
if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$REAL_USER@$DOMAIN" --redirect 2>/dev/null; then
  echo "=== SSL enabled ==="
else
  echo "!!! SSL setup skipped (DNS for $DOMAIN probably isn't pointed at this"
  echo "!!! server yet). Once the A record has propagated, run:"
  echo "!!!   sudo bash deploy/ssl.sh"
fi

echo ""
echo "=== Done ==="
echo "App running at: http://$DOMAIN (or https:// if SSL succeeded above)"
echo "From now on: just re-upload changed files via FTP/SFTP — the watcher"
echo "at deploy/watch-deploy.sh will detect them and redeploy automatically."
echo "Watch it happen: tail -f /var/log/hexamad-aos-deploy.log"
