#!/bin/sh
set -eu
TARGET="${1:-.}"
[ -f "$TARGET/index.html" ] || { echo "ERROR: run from CGC project root"; exit 1; }
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$TARGET/.cgc-backup-v14-$STAMP/js"
cp "$TARGET/index.html" "$TARGET/.cgc-backup-v14-$STAMP/index.html"
[ -f "$TARGET/js/app.js" ] && cp "$TARGET/js/app.js" "$TARGET/.cgc-backup-v14-$STAMP/js/app.js"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
mkdir -p "$TARGET/js"
cp "$(dirname "$0")/js/app.js" "$TARGET/js/app.js"
echo "Applied CGC v14 Scroll Motion System"
