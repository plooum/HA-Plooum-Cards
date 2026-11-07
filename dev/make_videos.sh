#!/usr/bin/env bash
# Test recordings for the gallery card: 5 s H.264 clips named <HH:MM:SS>-<HH:MM:SS>.mp4 in
# $PLOOUM_MEDIA_DIR/videos/<YYYY-MM-DD>/ (default dev/ha-config/media/rec_cam_entree), dates relative
# to today. Idempotent: only missing clips are made, generated day folders older than 6 days are removed.
#   today: 3 clips; D-1: empty folder; D-2: 2 clips + notes.txt (must be ignored); D-5: 1 clip.
set -euo pipefail
DEV="$(cd "$(dirname "$0")" && pwd)"
ROOT="${PLOOUM_MEDIA_DIR:-$DEV/ha-config/media/rec_cam_entree}/videos"
mkdir -p "$ROOT"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found: no test videos" >&2; exit 0; }

# Generated day folders older than 6 days.
OLDEST="$(date -d '-6 days' +%F)"
for d in "$ROOT"/????-??-??; do
  [[ -d "$d" ]] || continue
  [[ "$(basename "$d")" < "$OLDEST" ]] && rm -rf "$d"
done

day() { date -d "-$1 days" +%F; }

clip() { # <days ago> <name without extension>
  local dir="$ROOT/$(day "$1")" f="$2.mp4"
  mkdir -p "$dir"
  [[ -s "$dir/$f" ]] && return 0
  local src="testsrc=size=320x180:rate=15:duration=5"
  # drawtext needs a font build of ffmpeg; fall back to the bare test pattern without it.
  ffmpeg -loglevel error -y -f lavfi -i "$src" \
    -vf "drawtext=text='${2%%-*}':x=(w-tw)/2:y=h-40:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6" \
    -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$dir/$f" 2>/dev/null \
  || ffmpeg -loglevel error -y -f lavfi -i "$src" \
    -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$dir/$f"
}

clip 0 "07:20:00-07:23:00"
clip 0 "12:05:10-12:08:10"
clip 0 "18:40:00-18:43:00"
mkdir -p "$ROOT/$(day 1)"
clip 2 "09:00:00-09:03:00"
clip 2 "21:15:30-21:18:30"
echo "Not a recording." > "$ROOT/$(day 2)/notes.txt"
clip 5 "03:10:00-03:13:00"
