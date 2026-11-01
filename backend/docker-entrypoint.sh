#!/bin/sh
set -u

MONGODB_URL="${MONGODB_URL:-mongodb://127.0.0.1:27017/note-bridge}"
export MONGODB_URL

DATA_DIR="${MONGO_DATA_DIR:-/data/db}"
LOG_FILE="${MONGO_LOG_FILE:-/tmp/mongod.log}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_CACHE_GB="${MONGO_CACHE_GB:-0.25}"

APP_PID=""
STARTED_MONGO=0

# Start the bundled MongoDB only when the app points at localhost.
# Setting MONGODB_URL to an Atlas/external URI skips the embedded server.
case "$MONGODB_URL" in
  mongodb://127.0.0.1*|mongodb://localhost*)
    echo "Starting embedded MongoDB (data: $DATA_DIR)"
    mkdir -p "$DATA_DIR" "$(dirname "$LOG_FILE")"
    mongod \
      --dbpath "$DATA_DIR" \
      --bind_ip 127.0.0.1 \
      --port "$MONGO_PORT" \
      --wiredTigerCacheSizeGB "$MONGO_CACHE_GB" \
      --logpath "$LOG_FILE" \
      --fork
    STARTED_MONGO=1
    sleep 1
    ;;
  *)
    echo "Using external MongoDB at $MONGODB_URL"
    ;;
esac

shutdown() {
  echo "Shutting down..."
  if [ -n "$APP_PID" ]; then
    kill -TERM "$APP_PID" 2>/dev/null || true
  fi
  if [ "$STARTED_MONGO" = "1" ]; then
    mongod --dbpath "$DATA_DIR" --shutdown >/dev/null 2>&1 || true
  fi
  exit 0
}

trap shutdown TERM INT

node index.js &
APP_PID=$!

STATUS=0
wait "$APP_PID" || STATUS=$?

if [ "$STARTED_MONGO" = "1" ]; then
  mongod --dbpath "$DATA_DIR" --shutdown >/dev/null 2>&1 || true
fi

exit "$STATUS"
