#!/bin/bash
# design-gate-hook.sh — PreToolUse(Bash) hook：长片渲染前检查设计流程gate文件
#
# 铁律背景（2026-07-17花叔立）：huashu-design做设计前必须①资产协议(brand-spec.md)
# ②三方向真实视觉给用户选(direction-approved.md记录选择或豁免理由)。
# B00(210s)实测：跳过方向确认直接渲全片→整片返工。此hook把教训变成机器约束：
# **时长≥45秒的合成，缺direction-approved.md就不许渲**——长片返工的代价远大于停一下。
#
# 放行条件（任一）：
#   - 合成时长<45s或无法判定（短片/实验低摩擦，靠SKILL.md gate协议约束）
#   - 项目目录（或上两级）存在 direction-approved.md
#   - 命令里显式带 SKIP_DESIGN_GATE=1（花叔明说跳过时用，可审计）
#
# 安全声明：本hook**不会被skill自动安装**——SKILL.md/README没有任何写入settings.json的
# 指令，只有你手动把它配进settings.json后才生效。行为上限：对匹配的长片渲染命令exit 2
# 阻止执行并打印原因，无网络请求、无文件写入、无删除。见仓库根SECURITY.md。
#
# settings.json配置：PreToolUse / matcher "Bash" / command指向本脚本

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python3 -c "import json,sys;print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)
CWD=$(printf '%s' "$INPUT" | python3 -c "import json,sys;print(json.load(sys.stdin).get('cwd',''))" 2>/dev/null)

# 谈论命令的命令（echo/grep等）直接放行，防纯文本误伤（QA Bug1）
FIRST=$(echo "$CMD" | sed -E 's/^[[:space:]]*//' | cut -d' ' -f1)
case "$FIRST" in echo|printf|grep|cat|ls|head|tail|wc|sed|awk) exit 0;; esac
# 只管渲染命令（含npm run render与解说长片渲染）
echo "$CMD" | grep -qE "hyperframes(@[0-9.]+)? +render|render-video(-seek)?\.js|render-narration\.sh|npm +run +render\b" || exit 0
# 显式跳过（可审计的逃生门）
echo "$CMD" | grep -q "SKIP_DESIGN_GATE=1" && exit 0

# 定位项目目录：命令中cd的目标 > hook cwd
DIR="$CWD"
CDDIR=$(echo "$CMD" | grep -oE 'cd +"[^"]+"|cd +[^ &;]+' | head -1 | sed -E 's/^cd +//; s/"//g')
[ -n "$CDDIR" ] && [ -d "$CDDIR" ] && DIR="$CDDIR"

# 取合成时长：hyperframes项目读index.html的data-duration；render-video-seek读--duration参数
DUR=""
D_ARG=$(echo "$CMD" | grep -oE '\-\-duration=[0-9]+' | head -1 | cut -d= -f2)
[ -n "$D_ARG" ] && DUR="$D_ARG"
if [ -z "$DUR" ] && [ -f "$DIR/index.html" ]; then
  DUR=$(grep -oE 'data-duration="[0-9.]+"' "$DIR/index.html" | head -1 | grep -oE '[0-9.]+' | cut -d. -f1)
fi
# 判不出时长或短片 → 放行
[ -z "$DUR" ] && exit 0
[ "$DUR" -lt 45 ] 2>/dev/null && exit 0

# 长片：查gate文件（项目目录及上两级）
for d in "$DIR" "$DIR/.." "$DIR/../.."; do
  [ -f "$d/direction-approved.md" ] && exit 0
done

cat >&2 << EOF
🛑 设计流程gate：该合成时长${DUR}s（≥45s长片），但项目内未找到 direction-approved.md。
huashu-design铁律：长片渲染前必须完成「三方向真实视觉给用户选择」（或用户明示豁免），并把选择/豁免记录写入项目目录的 direction-approved.md（含：展示了哪几版、截图路径、用户的选择原话）。
补齐后重渲；用户当面明说跳过时，在命令前加 SKIP_DESIGN_GATE=1 显式放行。
（依据：2026-07-17 B00实测，跳过方向确认渲210s全片→整片视觉返工）
EOF
exit 2
