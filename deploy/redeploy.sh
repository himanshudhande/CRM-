#!/bin/bash
# Runs the actual deploy steps on Hostinger shared hosting (Node.js App /
# Passenger): install deps, regenerate the Prisma client, apply DB
# migrations, build, then signal Passenger to restart the app.
#
# IMPORTANT: fill in ACTIVATE_CMD below with the exact "Enter to the virtual
# environment" command hPanel shows you on the Node.js app's page (Website ->
# Node.js -> your app). It looks something like:
#   source /home/USERNAME/nodevenv/domains/DOMAIN/public_html/20/bin/activate && cd /home/USERNAME/domains/DOMAIN/public_html
# Without it, this script may run the wrong Node/npm version (or none).
set -e

cd "$(dirname "$0")/.."

ACTIVATE_CMD='echo "Set ACTIVATE_CMD in deploy/redeploy.sh to the command hPanel gives you"'
eval "$ACTIVATE_CMD"

echo "=== $(date) — starting deploy ==="

npm install --no-audit --no-fund
npx prisma generate
npx prisma migrate deploy
npm run build

# Phusion Passenger (what Hostinger's Node.js App hosting runs on) restarts
# the app whenever this file's mtime changes -- no process manager needed.
mkdir -p tmp
touch tmp/restart.txt

echo "=== $(date) — deploy finished ==="
