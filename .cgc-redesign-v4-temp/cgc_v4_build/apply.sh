#!/bin/sh
set -eu
ROOT="${1:-.}"
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$ROOT/.cgc-backup-v4-$STAMP"
mkdir -p "$BACKUP/js"
[ -f "$ROOT/index.html" ] && cp "$ROOT/index.html" "$BACKUP/index.html" || true
[ -f "$ROOT/js/app.js" ] && cp "$ROOT/js/app.js" "$BACKUP/js/app.js" || true
mkdir -p "$ROOT/js"
cp "$(dirname "$0")/index.html" "$ROOT/index.html"
cp "$(dirname "$0")/js/app.js" "$ROOT/js/app.js"
echo "CGC redesign v4 applied. Backup: $BACKUP"
