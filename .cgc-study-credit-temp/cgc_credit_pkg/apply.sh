#!/bin/sh
set -eu
TARGET="${1:-.}"
if [ ! -f "$TARGET/index.html" ]; then
  echo "ERROR: Run from the CGC project root or pass it as the first argument."
  exit 1
fi
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$TARGET/.cgc-backup-study-credit-$STAMP"
cp "$TARGET/index.html" "$TARGET/.cgc-backup-study-credit-$STAMP/index.html"
cp "$(dirname "$0")/index.html" "$TARGET/index.html"
echo "Applied CGC STUDY LLC. symbol credit to: $TARGET"
