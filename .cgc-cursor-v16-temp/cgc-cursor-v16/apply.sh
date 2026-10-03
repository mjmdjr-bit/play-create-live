#!/bin/sh
set -eu
TARGET="${1:-.}"
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ ! -f "$TARGET/index.html" ] || [ ! -d "$TARGET/js" ]; then
  echo "ERROR: Run this from the CGC project root (index.html and js/ are required)."
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-cursor-v16-$STAMP"
mkdir -p "$BACKUP/js"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
cp "$SELF_DIR/index.html" "$TARGET/index.html"
cp "$SELF_DIR/js/app.js" "$TARGET/js/app.js"
echo "Applied CGC Living Silver Dot Cursor v16."
echo "Backup: $BACKUP"
echo "Touch/mobile behavior is unchanged; custom cursor is desktop fine-pointer only."
