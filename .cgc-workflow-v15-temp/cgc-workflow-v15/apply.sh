#!/bin/sh
set -eu
ROOT=$(pwd)
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

backup_dir="$ROOT/.cgc-backup-workflow-v15-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir/js" "$backup_dir/images/workflow"

[ -f "$ROOT/index.html" ] && cp "$ROOT/index.html" "$backup_dir/index.html" || true
[ -f "$ROOT/js/app.js" ] && cp "$ROOT/js/app.js" "$backup_dir/js/app.js" || true
for name in discover imagine curate create build deliver; do
  [ -f "$ROOT/images/workflow/$name.mp4" ] && cp "$ROOT/images/workflow/$name.mp4" "$backup_dir/images/workflow/$name.mp4" || true
done

cp "$SCRIPT_DIR/index.html" "$ROOT/index.html"
mkdir -p "$ROOT/js" "$ROOT/images/workflow"
cp "$SCRIPT_DIR/js/app.js" "$ROOT/js/app.js"
cp "$SCRIPT_DIR/images/workflow/"*.mp4 "$ROOT/images/workflow/"

echo "Applied CGC Workflow videos v15."
echo "Backup: $backup_dir"
printf '%s\n' "Workflow files:" 
for name in discover imagine curate create build deliver; do
  ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$ROOT/images/workflow/$name.mp4" 2>/dev/null | awk -v n="$name" '{printf "  %s.mp4 %ss\n", n, $1}'
done
