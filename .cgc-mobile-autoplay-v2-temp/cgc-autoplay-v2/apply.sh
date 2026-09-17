#!/bin/sh
set -eu
ROOT="${1:-.}"
case "$ROOT" in
  /*) TARGET="$ROOT" ;;
  *) TARGET="$(cd "$ROOT" && pwd)" ;;
esac
mkdir -p "$TARGET/js" "$TARGET/media"
cp index.html "$TARGET/index.html"
cp app.js "$TARGET/js/app.js"
cp cgc-hero-autoplay.mp4 "$TARGET/media/cgc-hero-autoplay.mp4"
cp cgc-hero-2-autoplay.mp4 "$TARGET/media/cgc-hero-2-autoplay.mp4"
printf '%s\n' "Applied CGC mobile autoplay v2 to: $TARGET"
printf '%s\n' "Hero sources are audio-free copies to satisfy iOS autoplay policy."
