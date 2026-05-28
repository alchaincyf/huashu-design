#!/usr/bin/env bash
# render-narration.sh · End-to-end: narrated HTML animation → final MP4 (with voiceover)
#
# Pipeline:
#   1. render-video.js  records a silent MP4 (length = timeline.totalDuration)
#   2. mix-voiceover.sh mixes in voiceover.mp3 (optional BGM)
#   3. Output: <basename>-narrated.mp4
#
# Usage:
#   bash render-narration.sh <html> --timeline=<path> [options]
#
# Required:
#   <html>                The narrated animation HTML (should embed NarrationStage + recording-mode rAF self-driver)
#   --timeline=<path>     Path to timeline.json (totalDuration and voiceover.mp3 path are read from it)
#
# Optional:
#   --bgm-mood=<name>     BGM preset (educational / tech / tutorial / ...)
#   --bgm=<path>          Custom BGM file
#   --bgm-volume=<0-1>    BGM static volume, default 0.18
#   --no-ducking          Disable sidechain ducking
#   --keep-silent         Keep the intermediate silent MP4 for debugging
#   --out=<path>          Output path, default <html-basename>-narrated.mp4
#   --width=<px>          Video width (default 1920)
#   --height=<px>         Video height (default 1080)
#
# Examples:
#   bash render-narration.sh demo.html --timeline=_narration/timeline.json
#   bash render-narration.sh demo.html --timeline=_narration/timeline.json --bgm-mood=educational
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$SCRIPT_DIR/.."

HTML=""
TIMELINE=""
BGM_MOOD=""
BGM=""
BGM_VOLUME="0.18"
NO_DUCKING=""
KEEP_SILENT=""
OUT=""
WIDTH="1920"
HEIGHT="1080"

for arg in "$@"; do
  case "$arg" in
    --timeline=*)    TIMELINE="${arg#*=}" ;;
    --bgm-mood=*)    BGM_MOOD="${arg#*=}" ;;
    --bgm=*)         BGM="${arg#*=}" ;;
    --bgm-volume=*)  BGM_VOLUME="${arg#*=}" ;;
    --no-ducking)    NO_DUCKING="--no-ducking" ;;
    --keep-silent)   KEEP_SILENT="1" ;;
    --out=*)         OUT="${arg#*=}" ;;
    --width=*)       WIDTH="${arg#*=}" ;;
    --height=*)      HEIGHT="${arg#*=}" ;;
    -*)              echo "Unknown argument: $arg" >&2; exit 1 ;;
    *)               HTML="$arg" ;;
  esac
done

if [ -z "$HTML" ] || [ ! -f "$HTML" ]; then
  echo "Usage: bash render-narration.sh <html> --timeline=<path> [options]" >&2
  exit 1
fi
if [ -z "$TIMELINE" ] || [ ! -f "$TIMELINE" ]; then
  echo "✗ Missing --timeline=<path> (timeline.json is produced by narrate-pipeline.mjs)" >&2
  exit 1
fi

# ── Read totalDuration and voiceover path from timeline.json ──
TIMELINE_DIR="$(cd "$(dirname "$TIMELINE")" && pwd)"
TOTAL_DURATION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TIMELINE','utf8')).totalDuration)")
VOICEOVER_REL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TIMELINE','utf8')).voiceover || 'voiceover.mp3')")
VOICEOVER="$TIMELINE_DIR/$VOICEOVER_REL"

if [ ! -f "$VOICEOVER" ]; then
  echo "✗ voiceover.mp3 not found: $VOICEOVER" >&2
  exit 1
fi

# Recording length = total duration + 1s safety buffer
RECORD_DURATION=$(node -e "console.log(Math.ceil($TOTAL_DURATION + 1))")

HTML_ABS="$(cd "$(dirname "$HTML")" && pwd)/$(basename "$HTML")"
HTML_DIR="$(dirname "$HTML_ABS")"
HTML_BASE="$(basename "$HTML" .html)"
SILENT_MP4="$HTML_DIR/$HTML_BASE.mp4"

if [ -z "$OUT" ]; then
  OUT="$HTML_DIR/$HTML_BASE-narrated.mp4"
fi

echo "═══ render-narration ═══════════════════"
echo "  HTML:        $HTML_ABS"
echo "  Timeline:    $TIMELINE"
echo "  Voiceover:   $VOICEOVER"
echo "  Total dur:   ${TOTAL_DURATION}s (recording ${RECORD_DURATION}s)"
echo "  Size:        ${WIDTH}×${HEIGHT}"
[ -n "$BGM_MOOD" ] && echo "  BGM mood:    $BGM_MOOD"
[ -n "$BGM" ] && echo "  BGM:         $BGM"
echo "  Final out:   $OUT"
echo "════════════════════════════════════════"

# ── Step 1: record silent MP4 ──────────────
echo ""
echo "▸ Step 1/2 · Recording HTML animation (silent)"
NODE_PATH=$(npm root -g) node "$SCRIPT_DIR/render-video.js" "$HTML_ABS" \
  --duration="$RECORD_DURATION" \
  --width="$WIDTH" \
  --height="$HEIGHT"

if [ ! -f "$SILENT_MP4" ]; then
  echo "✗ Silent MP4 was not produced: $SILENT_MP4" >&2
  exit 1
fi

# ── Step 2: mix in the voice ──────────────
echo ""
echo "▸ Step 2/2 · Mixing in voiceover"
MIX_ARGS=("$SILENT_MP4" "--voiceover=$VOICEOVER" "--out=$OUT")
[ -n "$BGM_MOOD" ] && MIX_ARGS+=("--bgm-mood=$BGM_MOOD")
[ -n "$BGM" ]      && MIX_ARGS+=("--bgm=$BGM")
[ -n "$BGM_MOOD$BGM" ] && MIX_ARGS+=("--bgm-volume=$BGM_VOLUME")
[ -n "$NO_DUCKING" ] && MIX_ARGS+=("$NO_DUCKING")

bash "$SCRIPT_DIR/mix-voiceover.sh" "${MIX_ARGS[@]}"

# Clean up intermediate artifact
if [ -z "$KEEP_SILENT" ]; then
  rm -f "$SILENT_MP4"
fi

echo ""
echo "✓ Done: $OUT"
[ -n "$KEEP_SILENT" ] && echo "  (intermediate kept: $SILENT_MP4)"
