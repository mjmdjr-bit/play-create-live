#!/bin/sh
set -eu
ROOT="${1:-.}"
mkdir -p "$ROOT/js"
STAMP="$(date +%Y%m%d-%H%M%S)"
[ ! -f "$ROOT/index.html" ] || cp "$ROOT/index.html" "$ROOT/.cgc-backup-mobile-autoplay-$STAMP-index.html"
[ ! -f "$ROOT/js/app.js" ] || cp "$ROOT/js/app.js" "$ROOT/.cgc-backup-mobile-autoplay-$STAMP-app.js"
cp "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/index.html" "$ROOT/index.html"
cp "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/app.js" "$ROOT/js/app.js"
printf '%s\n' "Applied CGC mobile autoplay fix to: $ROOT"
