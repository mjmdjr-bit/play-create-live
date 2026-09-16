#!/bin/sh
set -eu
TARGET="${1:-.}"
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-redesign-v3-$STAMP"
mkdir -p "$BACKUP/js" "$TARGET/js"
[ -f "$TARGET/index.html" ] && cp "$TARGET/index.html" "$BACKUP/index.html"
[ -f "$TARGET/js/app.js" ] && cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
cp "$(dirname "$0")/js/app.js" "$TARGET/js/app.js"
echo "CGC redesign v3 applied. Backup: $BACKUP"
