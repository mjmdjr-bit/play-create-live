#!/bin/sh
set -eu
TARGET="${1:-.}"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKUP="$TARGET/.cgc-backup-v10-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
if [ -f "$TARGET/index.html" ]; then cp "$TARGET/index.html" "$BACKUP/index.html"; fi
cp "$SCRIPT_DIR/index.html" "$TARGET/index.html"
printf '%s\n' "CGC v10 polish applied. Backup: $BACKUP"
