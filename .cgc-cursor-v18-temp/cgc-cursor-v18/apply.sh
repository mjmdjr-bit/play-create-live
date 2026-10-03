#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ]; then
  echo "ERROR: Run this from the CGC project root (index.html not found)." >&2
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.cgc-backup-cursor-v18-$STAMP"
mkdir -p "$BACKUP"
cp "$TARGET/index.html" "$BACKUP/index.html"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$SCRIPT_DIR/index.html" "$TARGET/index.html"
echo "Applied CGC Cursor visibility v18."
echo "Backup: $BACKUP"
