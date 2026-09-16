#!/bin/sh
set -eu
TARGET="${1:-.}"
[ -f "$TARGET/index.html" ] || { echo "ERROR: run from CGC project root"; exit 1; }
[ -f "$TARGET/js/app.js" ] || { echo "ERROR: js/app.js not found"; exit 1; }
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-v7-$STAMP"
mkdir -p "$BACKUP/js"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$SCRIPT_DIR/index.html" "$TARGET/index.html"
cp "$SCRIPT_DIR/js/app.js" "$TARGET/js/app.js"
echo "CGC v7 stability fix applied. Backup: $BACKUP"
