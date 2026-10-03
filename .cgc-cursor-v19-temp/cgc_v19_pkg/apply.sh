#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ]; then
  echo "ERROR: index.html not found in: $TARGET" >&2
  exit 1
fi
BACKUP="$TARGET/.cgc-backup-cursor-v19-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp "$TARGET/index.html" "$BACKUP/index.html"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
echo "Applied CGC cursor v19 to: $TARGET"
echo "Backup: $BACKUP"
