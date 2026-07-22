#!/bin/bash
# Watches the project folder for file changes (e.g. after an FTP/SFTP upload)
# and automatically redeploys. Installed as a systemd service by setup.sh —
# you should not need to run this by hand.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="/var/log/hexamad-aos-deploy.log"
EXCLUDE='(node_modules|\.next|\.git|uploads|deploy/watch-deploy\.sh)'

echo "$(date): Watching $PROJECT_DIR for changes..." >> "$LOG_FILE"

while true; do
  inotifywait -r -e modify,create,delete,move --exclude "$EXCLUDE" "$PROJECT_DIR" \
    > /dev/null 2>&1

  # Debounce: an upload usually triggers many file events in a row. Keep
  # draining events for up to 15s of quiet before actually deploying, so we
  # don't rebuild halfway through an upload.
  while inotifywait -r -t 15 -e modify,create,delete,move --exclude "$EXCLUDE" "$PROJECT_DIR" \
    > /dev/null 2>&1; do
    :
  done

  echo "$(date): Change detected, redeploying..." >> "$LOG_FILE"
  bash "$PROJECT_DIR/deploy/redeploy.sh" >> "$LOG_FILE" 2>&1 \
    && echo "$(date): Deploy succeeded" >> "$LOG_FILE" \
    || echo "$(date): Deploy FAILED — check the log above" >> "$LOG_FILE"
done
