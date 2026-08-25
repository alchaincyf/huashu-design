#!/bin/bash
# verify-video.sh — 渲染产物侧硬校验（PASS/FAIL，不靠agent目测）
#
# 检查项：分辨率/fps、时长误差、audio stream存在性、首尾黑帧、LUFS响度、体积
# 合成侧的校验（lint/layout/motion/contrast）由 hyperframes check 负责，此脚本只管产物。
#
# Usage:
#   bash verify-video.sh video.mp4 [--duration=10] [--fps=60] [--width=1920] [--height=1080]
#                        [--no-audio]        # 明确无音频的中间产物，跳过audio+响度检查
#                        [--allow-black-open] # 片头刻意黑场开场时跳过片头黑帧检查
#
# Exit code: 0 = 全PASS；1 = 有FAIL

set -u
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: bash verify-video.sh video.mp4 [--duration=N] [--fps=N] [--width=N] [--height=N] [--no-audio] [--allow-black-open]"
  exit 1
fi
shift || true

EXP_DURATION=""; EXP_FPS=""; EXP_W=""; EXP_H=""; NO_AUDIO=0; ALLOW_BLACK_OPEN=0
for a in "$@"; do
  case "$a" in
    --duration=*) EXP_DURATION="${a#*=}" ;;
    --fps=*)      EXP_FPS="${a#*=}" ;;
    --width=*)    EXP_W="${a#*=}" ;;
    --height=*)   EXP_H="${a#*=}" ;;
    --no-audio)   NO_AUDIO=1 ;;
    --allow-black-open) ALLOW_BLACK_OPEN=1 ;;
  esac
done

FAILS=0
pass() { echo "  ✓ PASS  $1"; }
fail() { echo "  ✗ FAIL  $1"; FAILS=$((FAILS+1)); }
warn() { echo "  ⚠ WARN  $1"; }

echo "▸ verify-video: $FILE"

# ---------- 基本流信息 ----------
INFO=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -show_entries format=duration,size -of default=noprint_wrappers=1 "$FILE" 2>/dev/null)
W=$(echo "$INFO" | grep '^width=' | cut -d= -f2)
H=$(echo "$INFO" | grep '^height=' | cut -d= -f2)
FPS_RAW=$(echo "$INFO" | grep '^avg_frame_rate=' | cut -d= -f2)
DUR=$(echo "$INFO" | grep '^duration=' | cut -d= -f2)
SIZE=$(echo "$INFO" | grep '^size=' | cut -d= -f2)
FPS=$(python3 -c "print(round(eval('${FPS_RAW:-0}' if '${FPS_RAW:-0}'!='0/0' else '0'),2))" 2>/dev/null || echo "?")

[ -z "$W" ] && { fail "无法读取视频流（文件损坏或非视频）"; echo "✗ 1项FAIL"; exit 1; }
echo "  info: ${W}x${H} · ${FPS}fps · ${DUR%.*}s · $((SIZE/1024))KB"

# ---------- 分辨率 / fps ----------
if [ -n "$EXP_W" ]; then
  [ "$W" = "$EXP_W" ] && [ "$H" = "$EXP_H" ] && pass "分辨率 ${W}x${H}" || fail "分辨率 ${W}x${H}，期望 ${EXP_W}x${EXP_H}"
fi
if [ -n "$EXP_FPS" ]; then
  python3 -c "exit(0 if abs($FPS-$EXP_FPS)<=0.5 else 1)" 2>/dev/null && pass "帧率 ${FPS}fps" || fail "帧率 ${FPS}fps，期望 ${EXP_FPS}fps"
fi

# ---------- 时长误差（±2% 或 ±0.2s 取大者）----------
if [ -n "$EXP_DURATION" ]; then
  python3 -c "
d=float('$DUR'); e=float('$EXP_DURATION')
tol=max(e*0.02,0.2)
exit(0 if abs(d-e)<=tol else 1)" 2>/dev/null && pass "时长 ${DUR%.*}s（期望 ${EXP_DURATION}s）" || fail "时长 ${DUR}s，期望 ${EXP_DURATION}s（容差2%）"
fi

# ---------- audio stream ----------
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$FILE" 2>/dev/null | head -1)
if [ "$NO_AUDIO" = "1" ]; then
  [ -z "$HAS_AUDIO" ] && pass "无音轨（--no-audio 中间产物）" || warn "声明--no-audio但存在音轨"
else
  if [ -n "$HAS_AUDIO" ]; then
    pass "audio stream 存在"
    # ---------- LUFS 响度（成品参考 -14 LUFS ±4）----------
    LUFS=$(ffmpeg -i "$FILE" -af loudnorm=print_format=summary -f null - 2>&1 | grep 'Input Integrated' | grep -oE '\-?[0-9]+\.?[0-9]*')
    if [ -n "$LUFS" ]; then
      python3 -c "exit(0 if -18<=float('$LUFS')<=-10 else 1)" 2>/dev/null \
        && pass "响度 ${LUFS} LUFS（目标区间 -18~-10）" \
        || warn "响度 ${LUFS} LUFS 偏离 -14±4 区间，检查混音增益"
    fi
  else
    fail "无 audio stream——skill铁律：动画默认交付形态是带SFX+BGM的MP4，无声=半成品"
  fi
fi

# ---------- 首尾黑帧 ----------
BLACK=$(ffmpeg -i "$FILE" -vf "blackdetect=d=0.1:pix_th=0.10" -an -f null - 2>&1 | grep -oE 'black_start:[0-9.]+ black_end:[0-9.]+' )
if [ -n "$BLACK" ]; then
  HEAD_BLACK=$(echo "$BLACK" | awk -F'[: ]' '$2<0.3{print}' | head -1)
  TOTAL=${DUR%.*}
  TAIL_BLACK=$(echo "$BLACK" | awk -F'[: ]' -v t="$TOTAL" '$4>t-0.3{print}' | head -1)
  if [ -n "$HEAD_BLACK" ] && [ "$ALLOW_BLACK_OPEN" = "0" ]; then
    fail "片头黑帧（$HEAD_BLACK）——录制起点偏移的典型症状；刻意黑场开场用 --allow-black-open"
  else
    [ -n "$HEAD_BLACK" ] && pass "片头黑场（--allow-black-open 已声明）"
  fi
  [ -n "$TAIL_BLACK" ] && fail "片尾黑帧（$TAIL_BLACK)——loop回跳或时长超录的典型症状"
  [ -z "$HEAD_BLACK" ] && [ -z "$TAIL_BLACK" ] && warn "片中存在黑帧段（如是刻意转场可忽略）：$(echo "$BLACK" | head -2 | tr '\n' ' ')"
else
  pass "无黑帧"
fi

# ---------- 汇总 ----------
echo ""
if [ "$FAILS" = "0" ]; then
  echo "◇ verify-video: 全部PASS"
  exit 0
else
  echo "✗ verify-video: ${FAILS}项FAIL"
  exit 1
fi
