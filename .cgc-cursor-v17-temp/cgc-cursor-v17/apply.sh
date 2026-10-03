#!/bin/sh
set -eu
ROOT="${1:-.}"
if [ ! -f "$ROOT/index.html" ]; then
  echo "ERROR: index.html not found in $ROOT" >&2
  exit 1
fi
if [ ! -f "$ROOT/js/app.js" ]; then
  echo "ERROR: js/app.js not found in $ROOT" >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$ROOT/.cgc-backup-cursor-v17-$STAMP"
mkdir -p "$BACKUP/js"
cp "$ROOT/index.html" "$BACKUP/index.html"
cp "$ROOT/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$ROOT/index.html"
cp "$(dirname "$0")/app.js" "$ROOT/js/app.js"
printf '%s\n' 'Applied CGC Living Silver Dot Cursor v17.'
printf '%s\n' "Backup: $BACKUP"
printf '%s\n' 'Cursor markers:'
grep -n 'cgc-cursor-style\|cgcCursor' "$ROOT/index.html" | head -n 5 || true
grep -n 'CGC Living Silver Dot Cursor' "$ROOT/js/app.js" | head -n 2 || true
