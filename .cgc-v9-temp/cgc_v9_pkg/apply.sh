#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ] || [ ! -f "$TARGET/js/app.js" ]; then
  echo "ERROR: run this from the CGC project root (index.html and js/app.js required)." >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-v9-$STAMP"
mkdir -p "$BACKUP"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
echo "CGC v9 applied. Backup: $BACKUP"
echo "Fixes: creator detail overlay / logo fit / monochrome works"
