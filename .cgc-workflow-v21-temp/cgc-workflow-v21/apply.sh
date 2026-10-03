#!/bin/sh
set -eu
TARGET="${1:-.}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$TARGET/.cgc-backup-workflow-loop-v21-$STAMP"
mkdir -p "$BACKUP/js"
[ -f "$TARGET/index.html" ] && cp "$TARGET/index.html" "$BACKUP/index.html" || true
[ -f "$TARGET/edit.html" ] && cp "$TARGET/edit.html" "$BACKUP/edit.html" || true
[ -f "$TARGET/js/app.js" ] && cp "$TARGET/js/app.js" "$BACKUP/js/app.js" || true
cp "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/index.html" "$TARGET/index.html"
cp "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/edit.html" "$TARGET/edit.html"
mkdir -p "$TARGET/js"
cp "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/js/app.js" "$TARGET/js/app.js"
printf '%s\n' "Applied CGC Workflow autoplay v21."
printf '%s\n' "Backup: $BACKUP"
printf '%s\n' "All workflow videos are configured for continuous muted inline autoplay."
