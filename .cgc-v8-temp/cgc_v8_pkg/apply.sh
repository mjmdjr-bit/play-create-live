#!/bin/sh
set -eu
TARGET="${1:-.}"
[ -f "$TARGET/index.html" ] || { echo "ERROR: run from CGC project root (index.html not found)"; exit 1; }
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-v8-$STAMP"
mkdir -p "$BACKUP/js" "$TARGET/js" "$TARGET/assets/brand"
cp "$TARGET/index.html" "$BACKUP/index.html"
[ -f "$TARGET/js/app.js" ] && cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
cp "$(dirname "$0")/js/app.js" "$TARGET/js/app.js"
cp "$(dirname "$0")/assets/brand/cgc-symbol.png" "$TARGET/assets/brand/cgc-symbol.png"
echo "CGC v8 MONOCHROME IDENTITY applied. Backup: $BACKUP"
