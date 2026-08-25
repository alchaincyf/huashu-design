#!/bin/bash
# sfx-cues.sh — 按cue表给无声视频打SFX点（B00阶跃b-roll实战沉淀，2026-07-17）
#
# 用法：bash sfx-cues.sh <无声视频.mp4> <cue表.tsv> <输出.mp4> [--dur=秒]
#
# cue表格式（TSV，#开头为注释）：
#   秒数<TAB>sfx相对路径（相对assets/sfx/）<TAB>音量dB
#   例：63.0	impact/brand-stamp.mp3	-13
#
# 音量基准（轻SFX垫口播下）：whoosh类-16 / tick类-15 / impact类-12；纯动画成品可整体+4dB
# cue密度参考 audio-design-rules.md 配方（b-roll垫底≈1个/9s，只打结构性节点）

set -e
SFX_DIR="$(cd "$(dirname "$0")/../assets/sfx" && pwd)"
IN="${1:?用法: bash sfx-cues.sh in.mp4 cues.tsv out.mp4 [--dur=210]}"
TABLE="${2:?缺cue表}"
OUT="${3:?缺输出路径}"
DUR=""
for a in "$@"; do case "$a" in --dur=*) DUR="${a#*=}";; esac; done
[ -z "$DUR" ] && DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN" | cut -d. -f1)

INPUTS=(-i "$IN")
FILTER=""; MIX=""; i=1
while IFS=$'\t' read -r t f db; do
  [ -z "$t" ] && continue
  case "$t" in \#*) continue;; esac
  [ ! -f "$SFX_DIR/$f" ] && { echo "✗ SFX不存在: $f"; exit 1; }
  INPUTS+=(-i "$SFX_DIR/$f")
  ms=$(python3 -c "print(int(float('$t')*1000))")
  FILTER+="[$i:a]adelay=${ms}:all=1,volume=${db}dB[s$i];"
  MIX+="[s$i]"
  i=$((i+1))
done < "$TABLE"
N=$((i-1))
[ "$N" = "0" ] && { echo "✗ cue表为空"; exit 1; }

ffmpeg -y -loglevel error "${INPUTS[@]}" \
  -filter_complex "${FILTER}${MIX}amix=inputs=${N}:normalize=0,apad=whole_dur=${DUR}[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"

echo "✓ ${N}个cue → $OUT"
