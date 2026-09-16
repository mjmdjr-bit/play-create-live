#!/bin/sh
set -eu
ROOT="${1:-.}"
if [ ! -f "$ROOT/index.html" ] || [ ! -f "$ROOT/js/app.js" ]; then
  echo "ERROR: run from the CGC project root (index.html and js/app.js required)." >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$ROOT/.cgc-backup-v11-$STAMP"
mkdir -p "$BACKUP/js"
cp "$ROOT/index.html" "$BACKUP/index.html"
cp "$ROOT/js/app.js" "$BACKUP/js/app.js"
cp "$(dirname "$0")/index.html" "$ROOT/index.html"
cp "$(dirname "$0")/js/app.js" "$ROOT/js/app.js"
# BGM feature is retired; remove its local assets if present.
rm -f "$ROOT/audio/bgm-01.mp3" "$ROOT/audio/bgm-02.mp3" "$ROOT/audio/bgm-03.mp3" "$ROOT/audio/bgm-04.mp3"
echo "CGC v11 applied. Backup: $BACKUP"
echo "BGM removed / creator tap simplified / stray text removed / restrained color + white backlight enabled."
