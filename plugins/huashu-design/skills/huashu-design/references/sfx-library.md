# SFX Library · huashu-design

> 全部由 ElevenLabs Sound Generation API 生成，苹果发布会级音质。
> 产品级 SFX 资产库，覆盖花叔动画/演示/产品 Demo 全场景。

**资产位置**：`assets/sfx/<category>/<name>.mp3`
**总数**：37 个 SFX（30 批量生成 + 7 个 v7b 保留）
**生成模型**：ElevenLabs Sound Generation API（prompt_influence 0.4）
**音质**：44.1kHz MP3，苹果发布会级清晰度，无额外混响

---

## 目录结构

```
assets/sfx/
├── keyboard/      type, type-fast, delete-key, space-tap, enter
├── ui/            click, click-soft, focus, hover-subtle, tap-finger, toggle-on
├── transition/    whoosh, whoosh-fast, swipe-horizontal, slide-in, dissolve
├── container/     card-snap, card-flip, stack-collapse, modal-open
├── feedback/      success-chime, error-tone, notification-pop, achievement
├── progress/      loading-tick, complete-done, generate-start
├── impact/        logo-reveal, logo-reveal-v2, brand-stamp, drop-thud
├── magic/         sparkle, ai-process, transform
└── terminal/      command-execute, output-appear, cursor-blink
```

---

## 快速索引

### ⌨️ Keyboard（键盘输入）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/keyboard/type.mp3` | 0.5s | 单键敲击（mechanical keyboard single key） | mechanical keyboard single key press |
| `sfx/keyboard/type-fast.mp3` | 1.5s | 连续快速打字（演示输入提示词） | fast continuous typing rhythm, apple magic keyboard |
| `sfx/keyboard/delete-key.mp3` | 0.5s | backspace 回删 | single backspace key, low pitched thud |
| `sfx/keyboard/space-tap.mp3` | 0.5s | 空格键轻击 | soft spacebar tap, wide flat |
| `sfx/keyboard/enter.mp3` | 0.5s | 回车确认（v7b 保留） | enter key press, crisp tactile |

### 🎯 UI（界面交互）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/ui/click.mp3` | 0.5s | 标准 UI 点击（v7b 保留） | crisp modern interface click |
| `sfx/ui/click-soft.mp3` | 0.5s | 柔和 UI click（次要按钮/链接） | soft gentle button click, mid pitched |
| `sfx/ui/focus.mp3` | 0.5s | 元素聚焦/选中（v7b 保留） | subtle focus tone, element highlight |
| `sfx/ui/hover-subtle.mp3` | 0.5s | 悬停提示（微秒级反馈） | barely audible tick, air whisper |
| `sfx/ui/tap-finger.mp3` | 0.5s | 移动端 tap（iOS 界面） | finger tap on touchscreen, muted thud |
| `sfx/ui/toggle-on.mp3` | 0.5s | 开关打开 | ios toggle switch flip, satisfying click |

### 🌊 Transition（过渡）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/transition/whoosh.mp3` | 0.5s | 标准 whoosh（v7b 保留） | air whoosh transition |
| `sfx/transition/whoosh-fast.mp3` | 0.6s | 快速 whoosh（标题闪入、标签切换） | quick fast air whoosh, cinematic |
| `sfx/transition/swipe-horizontal.mp3` | 0.7s | 横向滑动（轮播、tab 切换） | smooth left-to-right air movement |
| `sfx/transition/slide-in.mp3` | 0.6s | 元素滑入（side panel、抽屉） | smooth soft whoosh with arrival |
| `sfx/transition/dissolve.mp3` | 0.8s | 柔化融化（图片淡出淡入） | soft dissolve, airy shimmer |

### 🃏 Container（卡片/容器）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/container/card-snap.mp3` | 0.5s | 卡片吸附/定位（v7b 保留） | card snap into place |
| `sfx/container/card-flip.mp3` | 0.7s | 卡片翻转（前后面切换） | playing card flip, crisp snap |
| `sfx/container/stack-collapse.mp3` | 0.8s | 堆叠合拢（列表聚合） | cards stacking, paper taps collapsing |
| `sfx/container/modal-open.mp3` | 0.6s | 模态框打开 | modal popping open, whoosh + thud |

### 🔔 Feedback（通知/反馈）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/feedback/success-chime.mp3` | 1.0s | 成功提示（支付成功、任务完成） | two ascending bell tones, ios-style |
| `sfx/feedback/error-tone.mp3` | 0.7s | 错误提示（警告、失败） | descending two-note warning, soft |
| `sfx/feedback/notification-pop.mp3` | 0.6s | 消息弹出（toast、通知） | notification bloop, ios message alert |
| `sfx/feedback/achievement.mp3` | 1.5s | 成就达成（里程碑、徽章） | triumphant rising arpeggio, game-style |

### ⏳ Progress（进度/状态）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/progress/loading-tick.mp3` | 0.5s | 加载计时（进度条节拍） | soft short pulse, minimal ambient |
| `sfx/progress/complete-done.mp3` | 0.8s | 完成确认（step 完成） | two ascending satisfying tones |
| `sfx/progress/generate-start.mp3` | 0.8s | AI 开始生成 | soft rising shimmer, magical whoosh |

### 💥 Impact（品牌/冲击）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/impact/logo-reveal.mp3` | 0.7s | Logo impact（v7b 保留） | logo reveal thud |
| `sfx/impact/logo-reveal-v2.mp3` | 1.5s | 更长的 Logo impact（电影感） | cinematic bass hit with shimmer tail |
| `sfx/impact/brand-stamp.mp3` | 1.0s | 印章重击（认证、盖章） | rubber stamp thud, paper contact |
| `sfx/impact/drop-thud.mp3` | 0.7s | 物件落地（插入、放置） | heavy thud, wood surface contact |

### ✨ Magic（AI 变换）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/magic/sparkle.mp3` | 0.8s | 魔法闪光（AI 高亮、惊喜） | bright twinkling stars, fairy dust |
| `sfx/magic/ai-process.mp3` | 1.2s | AI 处理音（thinking 状态） | modulating digital hum with shimmer |
| `sfx/magic/transform.mp3` | 1.0s | 变换过渡（morph 效果） | rising shimmer whoosh with sparkle tail |

### 💻 Terminal（命令行）

| 文件 | 时长 | 用途 | Prompt 要点 |
|---|---|---|---|
| `sfx/terminal/command-execute.mp3` | 0.5s | 命令执行 | crisp digital beep with tick, hacker ui |
| `sfx/terminal/output-appear.mp3` | 0.6s | 输出出现 | rapid digital ticks, retro printout |
| `sfx/terminal/cursor-blink.mp3` | 0.5s | 光标闪烁 | subtle soft digital pulse, rhythmic |

---

## 按场景推荐搭配

### 💻 Terminal 交互演示
```
type (0.5s) → enter (0.5s) → command-execute (0.5s) → output-appear (0.6s)
```
循环元素：`cursor-blink` 作为 idle 时的环境音。

### 🃏 卡片选择流程
```
hover-subtle (0.5s, UI悬停) → click-soft (0.5s, 点击) → card-snap (0.5s, 定位)
```
或进阶版：`card-flip` 做前后面切换。

### 🤖 AI 生成全流程
```
generate-start (0.8s, 启动) → ai-process (1.2s, 处理) → sparkle (0.8s, 闪现) → complete-done (0.8s, 完成)
```
错误时用 `error-tone` 替代 `complete-done`。

### 🎬 Logo Reveal（品牌时刻）
```
whoosh-fast (0.6s, 铺垫) → logo-reveal-v2 (1.5s, 落点) → sparkle (0.8s, 尾韵)
```
简版：`whoosh → logo-reveal`（直接 v7b 两件套）。

### 📱 UI 交互演示（移动端）
```
tap-finger (0.5s, 点击) → slide-in (0.6s, 面板滑入) → toggle-on (0.5s, 开关)
```
完成后：`success-chime` 或 `notification-pop`。

### 📊 数据可视化/仪表盘
```
loading-tick (0.5s, 节拍) × N → complete-done (0.8s, 数据到位) → achievement (1.5s, 惊艳落点)
```

### 🎯 表单提交流程
```
click-soft (0.5s) → loading-tick ×2 (1.0s) → success-chime (1.0s)
```
失败分支：`error-tone (0.7s)`。

### 🪄 Magic Transform 场景
```
whoosh-fast (0.6s) → transform (1.0s) → sparkle (0.8s)
```
适合：元素变形、效果前后对比、"AI 重写"等演示。

---

## 使用规范

### 音量建议（来自 apple-gallery-showcase.md 音频双轨制）
- **SFX 主轨**：`1.0`（不做衰减）
- **BGM 背景轨**：`0.4 ~ 0.5`（SFX 明显穿透）
- **多 SFX 叠加**：用 `amix=inputs=N:duration=longest:normalize=0` 保留动态范围

### ffmpeg 拼接模板
```bash
# 单 SFX 对齐时间点：
ffmpeg -i video.mp4 -itsoffset 2.5 -i sfx/ui/click.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest:normalize=0[a]" \
  -map 0:v -map "[a]" output.mp4

# 多 SFX + BGM：
ffmpeg -i video.mp4 \
  -itsoffset 1.0 -i sfx/transition/whoosh-fast.mp3 \
  -itsoffset 1.6 -i sfx/impact/logo-reveal-v2.mp3 \
  -i bgm.mp3 \
  -filter_complex "[3:a]volume=0.4[bgm];[0:a][1:a][2:a][bgm]amix=inputs=4:normalize=0[a]" \
  -map 0:v -map "[a]" output.mp4
```

### 选型决策树
1. **有 tactile 动作**（打字/点击/滑动）→ `keyboard/` or `ui/`
2. **元素进场/出场** → `transition/`
3. **容器层操作**（卡片/模态） → `container/`
4. **状态反馈**（成功/失败/通知） → `feedback/`
5. **进度/时间流逝** → `progress/`
6. **品牌落点/重要时刻** → `impact/`
7. **AI 魔法/变换** → `magic/`
8. **命令行/代码演示** → `terminal/`

### 避免叠音堆积
- 同一个时间点 `max 2 个 SFX` 并发
- BGM 降到 0.3 以下时可以放 3 个
- 品牌 impact 时清空其他 SFX（留空 0.2s 再落点）

---

## Prompt 撰写原则（供复用）

参考风格：`apple keynote, tight, minimal, no reverb unless ambient, crisp, elegant`

**好 prompt 的三要素**：
1. **声音物理描述**：什么物体、什么动作（"mechanical keyboard single key press"）
2. **质感/风格限定**：apple-style / ios-style / cinematic / retro
3. **反例排除**：no reverb / clean studio / minimal

❌ "click sound"
✅ "crisp ui button click, clean modern interface sound, apple-style, high pitched"

❌ "magic"
✅ "bright twinkling stars sound, high pitched glittery chime, fairy dust"

---

## 详见
- 音频双轨制与 ffmpeg 拼接：`apple-gallery-showcase.md`
- 原始生成脚本：`/tmp/gen_sfx_batch.sh`（一次性批量生成器）
