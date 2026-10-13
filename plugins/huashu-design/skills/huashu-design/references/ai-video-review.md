# AI看片评审闭环（scripts/cloud/ai-review-video.py）

> 终渲MP4喂给视频理解模型（seed-2.0-lite），按固定checklist出结构化评审报告。
> 定位：**终渲后、交付前**的最后一道质检，替代人肉全片重看。不替代逐帧verify-video.sh。
> ⚠️ 可选云能力：压缩后的视频段会发送到火山方舟官方接口（ark.cn-beijing.volces.com），
> 使用你自己的ARK_API_KEY，需`--yes`或`HUASHU_CLOUD_OK=1`显式确认。见仓库根`SECURITY.md`。
> 不想用云：`scripts/verify-video.sh`截帧人工看，全程本地。

## 何时用

- 终渲60fps成片出来后、交付/混音前，跑一遍
- SFX混音版出来后再跑一遍（onset核对只在有音轨时生效）
- 改完大问题重渲后复检
- 不要在试渲30fps阶段跑（分辨率/节奏未定，浪费调用）

## 怎么用

```bash
cd 项目目录 && unset ALL_PROXY   # 脚本内已免疫代理，unset是双保险
uv run ~/.claude/skills/huashu-design/scripts/cloud/ai-review-video.py \
  --video 成片.mp4 \
  --context 导演稿.md \      # 强烈建议带上：模型靠它区分「设计意图」和「bug」
  --yes                      # 确认视频段发送火山方舟（或 HUASHU_CLOUD_OK=1）
```

- ARK_API_KEY 配在 skill 根目录 `.env`（已 gitignore）或环境变量，脚本只提取这一个变量

- 报告落盘：视频同目录 `<视频名>-AI评审.md`（`--output`可改）
- `--segment-len` 默认60秒一段；`--model` 默认 doubao-seed-2-0-lite-260215
- 210秒片实测：6次API调用，6-10分钟，tokens约18万in/2万out（lite档，费用分钱级）

## 调用链路（三层混合，不是纯模型）

1. **ffmpeg客观检测**（确定性，不会漏）：
   - `silencedetect` → 音效onset时间表（模型**听不到**视频音轨，2026-07-17实测）
   - `freezedetect` → ≥3秒完全静止段清单
2. **模型分段看片**：60s/段压缩后送审（1280宽/15fps/crf28，扁平动画约0.5MB/分钟），
   每段prompt含checklist+导演稿+该段的onset/静止段数据，时间点换算成原片时间
3. **模型全片低清pass**：960宽/10fps全片单独送审，专查跨段叙事连贯/hero贯穿/整体节奏
4. 文本汇总call按①-⑧合并；分段原始记录+客观检测数据全部保留在报告附录

## checklist与严重度

①黑帧/渲染残缺 ②文字裁切/错字 ③元素重叠遮挡 ④叙事连贯（过渡按 camera-language.md §7 三层词汇识别：六式[流白/穿暗场/虚焦接力/黑场字卡/whip-pan/mask-wipe]、hidden-cut、travel[共享元素归位/字腔穿越]；裸切=未包装的硬切，记⚡）
⑤hero贯穿性 ⑥节奏死段（客观清单+模型判断刻意hold还是真死段）⑦音效打点（onset+画面事件核对）
⑧构图失衡/空白

⚠️致命=交付前必修 | ⚡重要=观感明显受损 | 💡建议=锦上添花

## 局限（用报告前必读）

- **模型听不到声音**：⑦是「音轨onset时刻画面有没有事件」的单向核对，
  判断不了音效选得对不对、音量对不对、BGM情绪对不对
- **看不到帧级细节**：1-2帧的闪烁、细微抖动、精确色值偏差、亚像素对齐抓不到，
  这些仍靠 verify-video.sh 截帧人工看
- **过渡类型判断偏严**：压缩到15fps后，快速交叉淡出可能被报成「硬切」，
  分段与全片pass矛盾时汇总会标「存疑」——存疑项自己抽帧确认再改
- **「刻意hold vs 死段」是模型意见**：b-roll垫口播的长定格常被放行，成片独立观看时要自己再判
- 调用失败（网络/key/额度）会如实写进报告头，绝不编造评审结果；失败段的时间范围会标出

## 实测基准

首跑对象：B00-前三分钟主线-SFX.mp4（210s）。模型自主发现幕间过渡问题和hero断点方向正确
但把fade误报硬切；纯模型抓死段只中3/14，接入freezedetect后全覆盖。结论：客观检测层是
这个闭环的下限保证，模型负责语义判断。
