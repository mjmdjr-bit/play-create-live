#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ] || [ ! -d "$TARGET/js" ]; then
  echo "ERROR: Run this from the CGC project root (index.html and js/ required)." >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-workflow-autoplay-v20-$STAMP"
mkdir -p "$BACKUP/js"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
cp "$(dirname "$0")/js/app.js" "$TARGET/js/app.js"
echo "Applied CGC Workflow autoplay v20."
echo "Backup: $BACKUP"
