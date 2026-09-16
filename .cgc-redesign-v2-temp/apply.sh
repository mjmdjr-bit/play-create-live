#!/bin/sh
set -eu

ROOT="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".cgc-backup-redesign-v2-${STAMP}"

mkdir -p "$BACKUP/js" "$BACKUP/media" "$BACKUP/models"

[ -f index.html ] && cp index.html "$BACKUP/index.html" || true
[ -f js/app.js ] && cp js/app.js "$BACKUP/js/app.js" || true
[ -f media/cgc-hero.mp4 ] && cp media/cgc-hero.mp4 "$BACKUP/media/cgc-hero.mp4" || true
[ -f models/cgc-logo.glb ] && cp models/cgc-logo.glb "$BACKUP/models/cgc-logo.glb" || true

cp "$(dirname "$0")/index.html" "$ROOT/index.html"
mkdir -p "$ROOT/js" "$ROOT/media" "$ROOT/models"
cp "$(dirname "$0")/js/app.js" "$ROOT/js/app.js"
cp "$(dirname "$0")/media/cgc-hero.mp4" "$ROOT/media/cgc-hero.mp4"
cp "$(dirname "$0")/models/cgc-logo.glb" "$ROOT/models/cgc-logo.glb"

echo "CGC redesign v2 applied."
echo "Backup: $BACKUP"
echo "Hero video: media/cgc-hero.mp4"
echo "Artifact GLB: models/cgc-logo.glb"
