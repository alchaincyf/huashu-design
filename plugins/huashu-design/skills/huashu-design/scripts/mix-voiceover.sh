#!/usr/bin/env bash
# mix-voiceover.sh · Mix voiceover (人声主轨) + optional BGM into an MP4
#
# Usage:
#   bash mix-voiceover.sh <video.mp4> --voiceover=<voice.mp3> [options]
#
# Required:
#   --voiceover=<path>    Path to voiceover mp3 (人声主轨, 来自 narrate-pipeline.mjs)
#
# Optional:
#   --bgm=<path>          BGM mp3 path (overrides --bgm-mood)
#   --bgm-mood=<name>     Pick a preset BGM from assets/ (educational / tech / tutorial / ...)
#   --bgm-volume=<0-1>    BGM 静态音量, 默认 0.18 (相对人声)
#   --no-ducking          关闭 sidechain ducking（默认开启：人声响时 BGM 自动让路）
#   --voice-volume=<0-2>  人声音量倍率, 默认 1.0
#   --out=<path>          输出路径, 默认 <input>-voiced.mp4
#
# Behavior:
#   - 视频流 stream copy（不重编码，快）
#   - 人声始终是主轨，必带；BGM 可选
#   - 默认开 ducking：人声响时 BGM 压到约 -10dB，人声停时回升
#   - 输出长度 = 视频长度（人声/BGM 较短就尾静音；较长就截断）
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
    -*)               echo "未知参数：$arg" >&2; exit 1 ;;
    *)                INPUT="$arg" ;;
  esac
done

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "Usage: bash mix-voiceover.sh <video.mp4> --voiceover=<v.mp3> [--bgm=<b.mp3> | --bgm-mood=<name>]" >&2
  exit 1
fi
if [ -z "$VOICEOVER" ] || [ ! -f "$VOICEOVER" ]; then
  echo "✗ 缺 --voiceover=<path>" >&2
  exit 1
fi

# 解析 BGM 来源
if [ -z "$BGM" ] && [ -n "$BGM_MOOD" ]; then
  BGM="$ASSETS_DIR/bgm-${BGM_MOOD}.mp3"
fi
if [ -n "$BGM" ] && [ ! -f "$BGM" ]; then
  echo "✗ BGM 文件不存在: $BGM" >&2
  echo "  可用 mood: $(ls "$ASSETS_DIR" 2>/dev/null | grep -E '^bgm-.*\.mp3$' | sed 's/^bgm-//;s/\.mp3$//' | tr '\n' ' ')" >&2
  exit 1
fi

# 输出路径
if [ -z "$OUTPUT" ]; then
  base="${INPUT%.*}"
  OUTPUT="${base}-voiced.mp4"
fi

echo "─ mix-voiceover ──────────────"
echo "  视频:     $INPUT"
echo "  人声:     $VOICEOVER (vol=$VOICE_VOLUME)"
if [ -n "$BGM" ]; then
  echo "  BGM:      $BGM (vol=$BGM_VOLUME, ducking=$DUCKING)"
else
  echo "  BGM:      （无）"
fi
echo "  输出:     $OUTPUT"
echo "──────────────────────────────"

# ── ffmpeg filter graph ─────────────────────────────────────
if [ -z "$BGM" ]; then
  # 仅人声
  ffmpeg -y -i "$INPUT" -i "$VOICEOVER" \
    -filter_complex "[1:a]volume=${VOICE_VOLUME}[a]" \
    -map 0:v -map "[a]" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUTPUT"
elif [ "$DUCKING" = "1" ]; then
  # 人声 + BGM + sidechain ducking
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
  # 人声 + BGM 静态混合
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

echo "✓ 完成：$OUTPUT"
