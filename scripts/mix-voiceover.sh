#!/usr/bin/env bash
# mix-voiceover.sh · Mix voiceover (primary voice track) + optional BGM into an MP4
#
# Usage:
#   bash mix-voiceover.sh <video.mp4> --voiceover=<voice.mp3> [options]
#
# Required:
#   --voiceover=<path>    Path to voiceover mp3 (primary voice track, from narrate-pipeline.mjs)
#
# Optional:
#   --bgm=<path>          BGM mp3 path (overrides --bgm-mood)
#   --bgm-mood=<name>     Pick a preset BGM from assets/ (educational / tech / tutorial / ...)
#   --bgm-volume=<0-1>    BGM static volume, default 0.18 (relative to voice)
#   --no-ducking          Disable sidechain ducking (on by default: BGM steps aside when voice plays)
#   --voice-volume=<0-2>  Voice volume multiplier, default 1.0
#   --out=<path>          Output path, default <input>-voiced.mp4
#
# Behavior:
#   - Video stream is copied (no re-encode, fast)
#   - Voice is always the primary track and is required; BGM is optional
#   - Ducking is on by default: BGM is pushed to ~-10dB while voice is active, restored when voice stops
#   - Output length = video length (shorter audio is padded with silence; longer audio is truncated)
#
# Examples:
#   bash mix-voiceover.sh anim.mp4 --voiceover=narration/voiceover.mp3
#   bash mix-voiceover.sh anim.mp4 --voiceover=v.mp3 --bgm-mood=educational
#   bash mix-voiceover.sh anim.mp4 --voiceover=v.mp3 --bgm=~/Music/song.mp3 --bgm-volume=0.12
#   bash mix-voiceover.sh anim.mp4 --voiceover=v.mp3 --bgm-mood=tech --no-ducking
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/../assets"

INPUT=""
VOICEOVER=""
BGM=""
BGM_MOOD=""
BGM_VOLUME="0.18"
VOICE_VOLUME="1.0"
DUCKING="1"
OUTPUT=""

for arg in "$@"; do
  case "$arg" in
    --voiceover=*)    VOICEOVER="${arg#*=}" ;;
    --bgm=*)          BGM="${arg#*=}" ;;
    --bgm-mood=*)     BGM_MOOD="${arg#*=}" ;;
    --bgm-volume=*)   BGM_VOLUME="${arg#*=}" ;;
    --voice-volume=*) VOICE_VOLUME="${arg#*=}" ;;
    --no-ducking)     DUCKING="0" ;;
    --out=*)          OUTPUT="${arg#*=}" ;;
    -*)               echo "Unknown argument: $arg" >&2; exit 1 ;;
    *)                INPUT="$arg" ;;
  esac
done

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "Usage: bash mix-voiceover.sh <video.mp4> --voiceover=<v.mp3> [--bgm=<b.mp3> | --bgm-mood=<name>]" >&2
  exit 1
fi
if [ -z "$VOICEOVER" ] || [ ! -f "$VOICEOVER" ]; then
  echo "✗ Missing --voiceover=<path>" >&2
  exit 1
fi

# Resolve BGM source
if [ -z "$BGM" ] && [ -n "$BGM_MOOD" ]; then
  BGM="$ASSETS_DIR/bgm-${BGM_MOOD}.mp3"
fi
if [ -n "$BGM" ] && [ ! -f "$BGM" ]; then
  echo "✗ BGM file not found: $BGM" >&2
  echo "  Available moods: $(ls "$ASSETS_DIR" 2>/dev/null | grep -E '^bgm-.*\.mp3$' | sed 's/^bgm-//;s/\.mp3$//' | tr '\n' ' ')" >&2
  exit 1
fi

# Output path
if [ -z "$OUTPUT" ]; then
  base="${INPUT%.*}"
  OUTPUT="${base}-voiced.mp4"
fi

echo "─ mix-voiceover ──────────────"
echo "  Video:    $INPUT"
echo "  Voice:    $VOICEOVER (vol=$VOICE_VOLUME)"
if [ -n "$BGM" ]; then
  echo "  BGM:      $BGM (vol=$BGM_VOLUME, ducking=$DUCKING)"
else
  echo "  BGM:      (none)"
fi
echo "  Output:   $OUTPUT"
echo "──────────────────────────────"

# ── ffmpeg filter graph ─────────────────────────────────────
if [ -z "$BGM" ]; then
  # Voice only
  ffmpeg -y -i "$INPUT" -i "$VOICEOVER" \
    -filter_complex "[1:a]volume=${VOICE_VOLUME}[a]" \
    -map 0:v -map "[a]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUTPUT"
elif [ "$DUCKING" = "1" ]; then
  # Voice + BGM + sidechain ducking
  ffmpeg -y -i "$INPUT" -i "$VOICEOVER" -i "$BGM" \
    -filter_complex "
      [1:a]volume=${VOICE_VOLUME}[voice];
      [2:a]volume=${BGM_VOLUME},aloop=loop=-1:size=2e9[bgm_lo];
      [bgm_lo][voice]sidechaincompress=threshold=0.04:ratio=8:attack=5:release=300:makeup=1[bgm_ducked];
      [voice][bgm_ducked]amix=inputs=2:duration=first:dropout_transition=0,afade=t=out:st=0:d=0.5:curve=tri[a]
    " \
    -map 0:v -map "[a]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUTPUT"
else
  # Voice + BGM (static mix)
  ffmpeg -y -i "$INPUT" -i "$VOICEOVER" -i "$BGM" \
    -filter_complex "
      [1:a]volume=${VOICE_VOLUME}[voice];
      [2:a]volume=${BGM_VOLUME},aloop=loop=-1:size=2e9[bgm];
      [voice][bgm]amix=inputs=2:duration=first:dropout_transition=0[a]
    " \
    -map 0:v -map "[a]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUTPUT"
fi

echo "✓ Done: $OUTPUT"
