# Video Export：HTML 动画导出为 MP4/GIF

动画 HTML 完成后，用户常想「能导出视频吗」。这份指南给出完整流程。

## 何时导出

**导出时机**：
- 动画完整跑通、视觉验证过（Playwright 截图确认各时间点状态正确）
- 用户在浏览器里看过至少一次，表示效果 OK
- **不要**在动画 bug 没修完的阶段导出——导出到视频后改起来更贵

**用户可能说的触发语**：
- 「能导出成视频吗」
- 「转成 MP4」
- 「做成 GIF」
- 「60fps」

## 产出规格

默认一次给三种格式，让用户选：

| 格式 | 规格 | 适合场景 | 典型大小（30s） |
|---|---|---|---|
| MP4 25fps | 1920×1080 · H.264 · CRF 18 | 公众号嵌入、视频号、YouTube | 1-2 MB |
| MP4 60fps | 1920×1080 · 默认帧复制（兼容稳）· H.264 · CRF 18；高质量插帧需显式 `--minterpolate`；走 Stage 时钟的用 render-video-seek.js 直录真 60fps | 高帧率展示、B站、作品集 | 1.5-3 MB |
| GIF | 960×540 · 15fps · palette 优化 | Twitter/X、README、Slack 预览 | 2-4 MB |

## 工具链

两个脚本在 `scripts/`：

### 1. `render-video.js` — HTML → MP4

录一个 25fps 的 MP4 基础版本。依赖全局 playwright。

```bash
NODE_PATH=$(npm root -g) node /path/to/claude-design/scripts/render-video.js <html文件>
```

可选参数：
- `--duration=30` 动画时长（秒）
- `--width=1920 --height=1080` 分辨率
- `--trim=2.2` 从视频开头裁掉的秒数（去掉 reload + 字体加载时间）
- `--fontwait=1.5` 字体加载等待时间（秒），字体多时调高

输出：与 HTML 同目录，同名 `.mp4`。

### 2. `add-music.sh` — MP4 + BGM → MP4

给无声 MP4 混入背景音乐，按场景（mood）从内置 BGM 库里选，也可自带音频。自动匹配时长、加淡入淡出。

```bash
bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]
```

**内置 BGM 库**（在 `assets/bgm-<mood>.mp3`）：

| `--mood=` | 风格 | 适配场景 |
|-----------|------|---------|
| `tech`（默认） | Apple Silicon / 苹果发布会，极简合成器+钢琴 | 产品发布、AI工具、Skill 宣传 |
| `ad` | upbeat 现代电子，有 build + drop | 社交媒体广告、产品预告、促销片 |
| `educational` | 温暖明亮、轻吉他/电钢琴，inviting | 科普、教程介绍、课程预告 |
| `educational-alt` | 同类备选，换一首试试 | 同上 |
| `tutorial` | lo-fi 环境音，几乎无存在感 | 软件演示、编程教程、长演示 |
| `tutorial-alt` | 同类备选 | 同上 |

**行为**：
- 音乐按视频时长裁剪
- 0.3s 淡入 + 1s 淡出（避免硬切）
- 视频流 `-c:v copy` 不重编码，音频 AAC 192k
- `--music=<path>` 优先级高于 `--mood`，可以直接指定任意外部音频
- 传错 mood 名会列出所有可用选项，不会静默失败

**典型流水线**（动画导出三件套 + 配乐）：
```bash
node render-video.js animation.html                        # 录屏
bash convert-formats.sh animation.mp4                      # 派生 60fps + GIF
bash add-music.sh animation-60fps.mp4                      # 加默认 tech BGM
# 或针对不同场景：
bash add-music.sh tutorial-demo.mp4 --mood=tutorial
bash add-music.sh product-promo.mp4 --mood=ad --out=promo-final.mp4
```

### 3. `convert-formats.sh` — MP4 → 60fps MP4 + GIF

从已有 MP4 生成 60fps 版本和 GIF。

```bash
bash /path/to/claude-design/scripts/convert-formats.sh <input.mp4> [gif_width] [--minterpolate]
```

输出（与输入同目录）：
- `<name>-60fps.mp4` — 默认用 `fps=60` 帧复制（兼容性广）；加 `--minterpolate` 启用高质量插帧
- `<name>.gif` — palette 优化的 GIF（默认 960 宽，可改）

**60fps 模式选择**：

| 模式 | 命令 | 兼容性 | 使用场景 |
|---|---|---|---|
| 帧复制（默认）| `convert-formats.sh in.mp4` | QuickTime/Safari/Chrome/VLC 全通 | 通用交付、上传平台、社交媒体 |
| minterpolate 插帧 | `convert-formats.sh in.mp4 --minterpolate` | macOS QuickTime/Safari 可能拒打 | B站等需要真插帧的展示场景，**交付前必须本地测**目标播放器 |

为什么默认改成帧复制？minterpolate 输出的 H.264 elementary stream 有 known compat bug——之前默认 minterpolate 时多次踩到「macOS QuickTime 打不开」的问题。详见 `animation-pitfalls.md` §14。

`gif_width` 参数：
- 960（默认）—— 社交平台通用
- 1280 —— 更清晰但文件更大
- 600 —— Twitter/X 优先加载

### 4. `render-video-seek.js` — 真 60fps / 确定性渲染（推荐高质量交付）

`render-video.js` 的 recordVideo 路径有三个固有限制：帧率被 Chromium compositor 锁死 25fps、开头有加载黑帧需 trim、60fps 只能靠事后 minterpolate 插帧（有 ghosting + macOS QuickTime 兼容 bug，见 `animation-pitfalls.md §14`）。需要**真 60fps、确定性输出、或交付 B站/作品集**时，改用 seek 渲染。

它逐帧 seek 到时间戳截图、再用 ffmpeg 把 PNG 序列编码成 MP4。技术内核借鉴 HeyGen HyperFrames（Apache 2.0）的「冻结时钟 + seek 截图」思路，但不引入任何第三方包——只用本 skill 已有的 playwright + ffmpeg，runtime 中立。

```bash
NODE_PATH=$(npm root -g) node /path/to/claude-design/scripts/render-video-seek.js <html文件> --fps=60
```

参数：`--duration` · `--fps`（默认 60）· `--width` · `--height` · `--concurrency`（默认 4 个 worker 并行）· `--settle`（seek 后等几个 rAF 再截图，默认 2，重 layout 动画可调高）· `--keep-chrome`。输出与 HTML 同目录、同名 `.mp4`。

正面解决 recordVideo 三死结：
- **真原生任意帧率**：`--fps=60` 出真 60fps（每帧都是真实 seek 画面），不再经 `convert-formats.sh` 的 minterpolate 插帧，绕开 ghosting + macOS 兼容 bug
- **无开头黑帧**：不录屏，根本没有加载期黑帧，不需要 `--trim` / `--fontwait`
- **确定性**：seek 到时间戳截图，同输入同输出，不受机器负载/丢帧影响

**适用边界（重要）**：只支持走 Stage 时钟的动画——`assets/animations.jsx` 的 `<Stage>` 或 `narration_stage.jsx` 的 `<NarrationStage>`，它们会响应 `window.__seekRender` 冻结自驱时钟并暴露 `window.__seek(t)`。纯 CSS `@keyframes` / Lottie / 手写非 Stage 动画不吃 `__seek`，这类继续用 `render-video.js`（脚本检测不到 `__seek` 会报错并提示）。

**代价**：逐帧截图，长视频总耗时可能比 recordVideo 实时录更久（靠 `--concurrency` 多 worker 缓解）；大量临时 PNG 占盘，渲染前建议关其他大内存 App。

**二选一策略**：默认仍用 `render-video.js`（零风险、覆盖所有动画类型）；需要真 60fps / 确定性 / 高质量交付、且动画走 Stage 时钟时，用 `render-video-seek.js`。带解说的长动画用 `render-narration.sh --seek` 一键走 seek 渲染 + 混音。

## 完整流程（标准推荐）

用户说「导出视频」后：

```bash
cd <项目目录>

# 假设 $SKILL 指向本 skill 的根目录（自行按安装位置替换）

# 1. 录 25fps 基础 MP4
NODE_PATH=$(npm root -g) node "$SKILL/scripts/render-video.js" my-animation.html

# 2. 派生 60fps MP4 和 GIF
bash "$SKILL/scripts/convert-formats.sh" my-animation.mp4

# 产出清单：
# my-animation.mp4         (25fps · 1-2 MB)
# my-animation-60fps.mp4   (60fps · 1.5-3 MB)
# my-animation.gif         (15fps · 2-4 MB)
```

## 技术细节（排错用）

### Playwright recordVideo 的坑

- 帧率固定 25fps，无法直接录 60fps（Chromium headless 的 compositor 上限）
- 从 context 创建就开始录，必须用 `trim` 裁掉前面的加载时间
- 默认 webm 格式，需要 ffmpeg 转 H.264 MP4 才能通用播放

`render-video.js` 已处理以上问题。

### ffmpeg minterpolate 参数

当前配置：`minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`

- `mi_mode=mci` — motion compensation interpolation（运动补偿）
- `mc_mode=aobmc` — adaptive overlapped block motion compensation
- `me_mode=bidir` — 双向运动估计
- `vsbmc=1` — 可变 size block motion compensation

对 CSS **transform 动画**（translate/scale/rotate）效果好。
对**纯 fade** 可能产生轻微 ghosting——如果用户嫌弃，退化为简单帧复制：

```bash
ffmpeg -i input.mp4 -r 60 -c:v libx264 ... output.mp4
```

### GIF palette 为何要两阶段

GIF 只能 256 色。一次 pass 的 GIF 会把全动画色彩压到 256 色通用 palette，对米色底+橙色这种细腻配色会糊。

两阶段：
1. `palettegen=stats_mode=diff` —— 先扫描全片，生成**针对此动画的 optimal palette**
2. `paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle` —— 用这个 palette 编码，rectangle diff 只更新变化区域，大幅减小文件

对 fade 过渡用 `dither=bayer` 比 `none` 更平滑，但文件大一点。

## Pre-flight check（导出前）

导出前 30 秒自检：

- [ ] HTML 在浏览器里完整跑过一遍，无控制台错误
- [ ] 动画第 0 帧是完整初始状态（不是空白加载中）
- [ ] 动画最后一帧是稳定的收尾状态（不是半截）
- [ ] 字体/图片/emoji 全部正常渲染（参考 `animation-pitfalls.md`）
- [ ] Duration 参数与 HTML 里的实际动画时长匹配
- [ ] HTML 中 Stage 检测 `window.__recording` 强制 loop=false（手写 Stage 必查；用 `assets/animations.jsx` 自带）
- [ ] 结尾 Sprite 的 `fadeOut={0}`（视频末帧不淡出）
- [ ] 含「Created by Huashu-Design」水印（仅动画场景必加；第三方品牌作品加「非官方出品 · 」前缀。详见 SKILL.md §「Skill 推广水印」）

## 交付时附带的说明

导出完成后给用户的标准说明格式：

```
**完整交付**

| 文件 | 格式 | 规格 | 大小 |
|---|---|---|---|
| foo.mp4 | MP4 | 1920×1080 · 25fps · H.264 | X MB |
| foo-60fps.mp4 | MP4 | 1920×1080 · 60fps（默认帧复制；插帧版会注明）· H.264 | X MB |
| foo.gif | GIF | 960×540 · 15fps · palette 优化 | X MB |

**说明**
- 60fps 默认帧复制（兼容性好）；显式要求时才用 minterpolate 插帧（transform 动画效果好，复杂画面易出伪影）；真 60fps 用 render-video-seek.js 逐帧 seek 直录
- GIF 用 palette 优化，30s 动画可压到 3MB 左右

要换尺寸或帧率说一声。
```

## 常见用户追加需求

| 用户说 | 应对 |
|---|---|
| 「太大了」 | MP4：提高 CRF 到 23-28；GIF：降分辨率到 600 或 fps 到 10 |
| 「GIF 太糊」 | 提高 `gif_width` 到 1280；或者建议用 MP4 代替（微信朋友圈也支持） |
| 「要竖屏 9:16」 | 改 HTML 源的 `--width=1080 --height=1920`，重新录 |
| 「加水印」 | ffmpeg 加 `-vf "drawtext=..."` 或 `overlay=` 一个 PNG |
| 「要透明背景」 | MP4 不支持 alpha；用 WebM VP9 + alpha 或 APNG |
| 「要无损」 | CRF 改 0 + preset veryslow（文件会大 10 倍） |

## Skill 推广水印模板（仅动画导出用）

SKILL.md 规定动画 MP4/GIF 默认带水印，模板如下（深底改用 `rgba(255,255,255,0.35)`；第三方品牌动画前缀「非官方出品 · 」）：

```jsx
<div style={{
  position: 'absolute', bottom: 24, right: 32,
  fontSize: 11, color: 'rgba(0,0,0,0.4)',
  letterSpacing: '0.15em', fontFamily: 'monospace',
  pointerEvents: 'none', zIndex: 100,
}}>
  Created by Huashu-Design
</div>
```
