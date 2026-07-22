#!/bin/bash
# Cron-friendly change detector for shared hosting (no root, so no systemd
# watcher / inotify like a VPS would use). Set this up as a Cron Job in
# hPanel to run every 1-2 minutes:
#   bash /home/USERNAME/domains/DOMAIN/public_html/deploy/watch-deploy.sh
#
# It hashes the project's source files, compares against the hash from the
# last successful deploy, and only redeploys when something actually
# changed -- so re-uploading files via FTP is all you need to do; this
# picks it up on its next run.
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HASH_FILE="$PROJECT_DIR/deploy/.last-deploy-hash"
LOCK_FILE="$PROJECT_DIR/deploy/.deploy.lock"
LOG_FILE="$PROJECT_DIR/deploy/deploy.log"

# Don't overlap with an in-progress deploy (a build can take longer than the
# cron interval).
if [ -f "$LOCK_FILE" ]; then
  if [ -n "$(find "$LOCK_FILE" -mmin +20 2>/dev/null)" ]; then
    echo "$(date): stale lock file, removing" >> "$LOG_FILE"
    rm -f "$LOCK_FILE"
  else
    exit 0
  fi
fi

CURRENT_HASH=$(find "$PROJECT_DIR" \
  -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -not -path "*/uploads/*" \
  -not -path "*/deploy/.last-deploy-hash" \
  -not -path "*/deploy/.deploy.lock" \
  -not -path "*/deploy/deploy.log" \
  -not -path "*/.env" \
  -print0 | sort -z | xargs -0 sha256sum 2>/dev/null | sha256sum | awk '{print $1}')

PREVIOUS_HASH=""
[ -f "$HASH_FILE" ] && PREVIOUS_HASH=$(cat "$HASH_FILE")

if [ "$CURRENT_HASH" = "$PREVIOUS_HASH" ]; then
  exit 0
fi

touch "$LOCK_FILE"
echo "$(date): change detected, redeploying..." >> "$LOG_FILE"

if bash "$PROJECT_DIR/deploy/redeploy.sh" >> "$LOG_FILE" 2>&1; then
  echo "$CURRENT_HASH" > "$HASH_FILE"
  echo "$(date): deploy succeeded" >> "$LOG_FILE"
else
  echo "$(date): deploy FAILED -- see log above. Will retry next run." >> "$LOG_FILE"
fi

rm -f "$LOCK_FILE"
