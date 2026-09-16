#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ] || [ ! -f "$TARGET/js/app.js" ]; then
  echo "ERROR: run from the CGC project root (index.html and js/app.js required)." >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-v5-$STAMP"
mkdir -p "$BACKUP/js" "$TARGET/js" "$TARGET/media"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$TARGET/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
cp "$(dirname "$0")/js/app.js" "$TARGET/js/app.js"
cp "$(dirname "$0")/media/cgc-hero-2.mp4" "$TARGET/media/cgc-hero-2.mp4"
echo "CGC redesign v5 applied. Backup: $BACKUP"
echo "Hero alternates between media/cgc-hero.mp4 and media/cgc-hero-2.mp4 on reload."
