#!/bin/sh
set -eu
ROOT=$(pwd)
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP=".cgc-backup-v6-${STAMP}"
mkdir -p "$BACKUP/js" "$BACKUP/media"
[ -f "$ROOT/index.html" ] && cp "$ROOT/index.html" "$BACKUP/index.html" || true
[ -f "$ROOT/js/app.js" ] && cp "$ROOT/js/app.js" "$BACKUP/js/app.js" || true
[ -f "$ROOT/media/cgc-hero-2.mp4" ] && cp "$ROOT/media/cgc-hero-2.mp4" "$BACKUP/media/cgc-hero-2.mp4" || true
cp "$(dirname "$0")/index.html" "$ROOT/index.html"
mkdir -p "$ROOT/js" "$ROOT/media"
cp "$(dirname "$0")/js/app.js" "$ROOT/js/app.js"
cp "$(dirname "$0")/media/cgc-hero-2.mp4" "$ROOT/media/cgc-hero-2.mp4"
echo "CGC v6 applied. Backup: $BACKUP"
echo "Removed: creator likes + creator CHAT + hover SE"
echo "Added: visible silver dust + stronger Artifact + alternate hero video"
