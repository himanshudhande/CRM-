#!/bin/bash
# Runs the actual deploy steps: install deps, apply DB migrations, build, restart PM2.
# Called by watch-deploy.sh whenever files change, or run manually any time.
set -e

cd "$(dirname "$0")/.."

echo "=== $(date) — starting deploy ==="

npm install --no-audit --no-fund
npx prisma migrate deploy
npm run build
pm2 restart hexamad-aos --update-env

echo "=== $(date) — deploy finished ==="
