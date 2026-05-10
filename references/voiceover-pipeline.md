# Voiceover Pipeline · 解说驱动动画

> 把动画从「无声画面 + 后期配音」升级为「**先有解说词，再按音频实测时长驱动画面**」的工作流。
> 适用：5-20 分钟概念解说视频、教程视频、长篇知识科普。
>
> 配套 `references/animation-best-practices.md` 使用——本文件管 **怎么把解说和画面对上**，
> animation-best-practices 管 **每一帧画面怎么动**。

---

## 🛑 铁律 · 在写一行代码之前必读

> **强调多少遍都不够：解说动画的失败模式 #1 是做成了带配音的 PowerPoint。**

### 第一条 · 整片是一个连续的运动叙事，不是一组独立场景

PowerPoint 是 7 张幻灯片。我们做的是 **1 段持续 X 分钟的电影**。

**身份切换**：
- ❌ 你不是「在做 7 个 scene 的内容」
- ✅ 你是「在屏幕上让一个或几个 hero element 演 X 分钟的戏」

**视觉骨架 = 一个或几个贯穿全片的 hero element**：
- 它从 t=0 出现，到结束才离场
- 每个 cue 是它的**状态变化**（位置 / 大小 / 颜色 / 透视 / 形态），不是「换一个新元素」
- scene 边界在剧本里有，**在画面里不应该有**——观众看不出"这是第 3 个 scene"，只看到一段连续的运动

**反例（本 skill v1 实战踩坑 · 2026-05-10）**：
- 7 个 `<Scene>` 各自独立 layout，scene 切换 = 整页 opacity 1→0 切到下一页
- 每个 cue = `opacity: p, transform: translateY((1-p)*30px)`（fade-up 单调使用）
- 结果：观众看完第一反应「像一页页 keynote」，整片质感归零

**正确模式**：
- 选定 1-2 个 hero element（如本文章 demo 应选「md」「html」两个字符作为骨架）
- 这两个字符**从片头到片尾**一直在屏幕上
- 每段「scene」实际是 hero element 的一次状态变化
  - opening：两字符在屏幕中央对峙
  - md-side：md 变大变粗占据画面，html 退到角落小字；数据围绕 md 涌入
  - html-side：html 反转为主角；md 退到角落
  - the-real-question：两字符回到中央，但中间出现「≠」分隔
  - the-split：两字符向两侧推开，中间空白展开
  - activity-proof：两字符在 timeline 上交替闪烁
  - closing：两字符落地为最终答案位置
- 这样整片是「md 和 html 在屏幕上演了 X 分钟」，不是 7 张独立 PPT

**最小实现骨架**（直接抄改）：

```jsx
// ── Step 1: 定义 hero 在每个 scene 的目标状态（位置/大小/不透明度）──
const HERO_KEYS = {
  opening:    { md: { x: 50, y: 35, scale: 1.0, opacity: 1 }, html: { x: 50, y: 65, scale: 1.0, opacity: 1 } },
  'md-side':  { md: { x: 78, y: 50, scale: 1.6, opacity: 1 }, html: { x: 92, y: 8,  scale: 0.25, opacity: 0.4 } },
  'html-side':{ md: { x: 8,  y: 8,  scale: 0.25, opacity: 0.4 }, html: { x: 22, y: 50, scale: 1.6, opacity: 1 } },
  // ... 每段一个 entry，连贯的运动从前一段的 final → 本段的 from
};

// ── Step 2: easing + lerp 工具 ──
const expoOut = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPos = (from, to, t) => ({
  x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t),
  scale: lerp(from.scale, to.scale, t),
  opacity: lerp(from.opacity ?? 1, to.opacity ?? 1, t),
});

// ── Step 3: HeroAnchor 组件 —— 直接挂在 <NarrationStage> 子级，不放进 <Scene> ──
const HeroAnchor = () => {
  const { time, scene, timeline } = useNarration();
  if (!scene) return null;
  const idx = timeline.scenes.findIndex(s => s.id === scene.id);
  const prevId = idx > 0 ? timeline.scenes[idx - 1].id : scene.id;
  const from = HERO_KEYS[prevId];
  const to   = HERO_KEYS[scene.id];

  // 段内前 ~45% 时间用于从 prev 状态 morph 到本段状态，剩余 hold
  const transitionDur = Math.min(2.0, scene.duration * 0.45);
  const t = expoOut(Math.min(1, (time - scene.start) / transitionDur));
  const md   = lerpPos(from.md,   to.md,   t);
  const html = lerpPos(from.html, to.html, t);

  // 加 subtle breathing 让任意一帧都有运动（对应铁律第三条）
  const breath = 1 + Math.sin(time * 0.6) * 0.012;

  const renderHero = (label, pos, color) => (
    <div style={{
      position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
      transform: `translate(-50%, -50%) scale(${pos.scale * breath})`,
      opacity: pos.opacity, color, fontSize: 360, fontWeight: 800,
      lineHeight: 1, willChange: 'transform, opacity', pointerEvents: 'none',
    }}>{label}</div>
  );
  return <>
    {renderHero('md',   md,   '#1B4965')}
    {renderHero('html', html, '#C04A1A')}
  </>;
};

// ── Step 4: 主组件 —— hero 在 NarrationStage 子级，scene 内辅助元素另外管 ──
const App = () => (
  <NarrationStage timeline={TIMELINE} audioSrc="_narration/voiceover.mp3" width={1920} height={1080}>
    <HeroAnchor />  {/* ← 跨 scene 持续存在，整片视觉骨架 */}
    {/* scene 内辅助元素用 useSceneFade 控制软淡入淡出，不要硬切 */}
    <MdSideAux />
    <HtmlSideAux />
    {/* ... */}
  </NarrationStage>
);
```

**完整可运行参考**：`demos/md-html-narration/md-html-demo.html`（3 分 21 秒，7 段，21 cue，已实战验证）

### 第二条 · 场景之间不能「硬切」

| 错误模式（PowerPoint slop） | 正确模式（电影感） |
|---|---|
| scene A 整体 `opacity 1→0` 同时 scene B `opacity 0→1` | scene A 的核心元素 **morph 进** B（位置/大小/颜色平滑变换） |
| 每个 scene 独立 layout，元素出现/消失 | 元素在屏幕上**持续存在**，只是位置和形态在变 |
| `keepMounted=false`，scene 切换瞬间组件被卸载 | hero 用 `keepMounted=true`，跨 scene 共享 DOM 节点 |
| 字幕条/数据卡片各自 fade in fade out | 字幕条作为画面唯一的"非 hero" 入场，hold 后**配合 hero 的运动一起退出** |

实现层面：
- **共享元素跨 scene** → 把 hero 提到 `<NarrationStage>` 直接子级，**不放在任何 `<Scene>` 里**
- 用 `useNarration()` hook 在 hero 里读 `time`、`scene`、`isCueTriggered`，自己根据当前时间决定形态
- `<Scene>` 只用来管那些只在该段出现的辅助元素（数据卡、引用块等），并且**这些辅助元素也不要硬切**——出场用 expoOut + stagger，退场用 fade overlap 跟下一段叠

### 第三条 · 每一帧画面都必须有运动

**自检方法**：在录制中**任意截一帧**（不是 cue 触发那一秒）。
- 如果画面看起来「**完全静止**」→ 错。回去加底层运动（background drift / hero subtle scale / camera pan / parallax）
- 永远有一个**底层运动**在跑（即使不是焦点）：
  - hero element 的 `scale: 1 ↔ 1.02` 5 秒呼吸循环
  - 背景 `translateX: 0 ↔ -20px` 缓慢漂移
  - 数据卡片入场后保留 `translateY` 微抖（Perlin noise）
- 一个完全静止的画面 = PowerPoint slop

### 第四条 · Easing / Stagger / Hold 是底线

| 项 | 必须 | 禁止 |
|---|---|---|
| Easing | `expoOut` 主轴（`cubic-bezier(0.16, 1, 0.3, 1)`），`overshoot` 强调，`spring` 落位 | `linear`、`ease`、CSS 默认 |
| 多元素入场 | 30ms stagger（每个晚 30ms 进） | 一刀切全部出现 |
| 关键 cue 前 | hold 0.3-0.5s 让观众"看见"（前一段元素先静止 0.3s，再触发 cue） | 一段说完无缝切下一段 |
| 收尾 | 戛然而止，最后一帧 hold 1s | fade to black |

详细规则参考 `animation-best-practices.md` 的 §1-§4。

### 自检 · 第一观众反应

做完拿给一个没看过的人看（或自己 24 小时后再看），**他们的第一反应**是什么？

| 反应 | 评级 | 行动 |
|---|---|---|
| 「这是带配音的 PPT」 | 失败 | 回去重做 |
| 「画面跟着声音在切换」 | 不及格 | 缺连续叙事，hero element 不存在或没贯穿 |
| 「这个东西在动」 | 合格 | 但没记忆点 |
| 「我想看完」 | 良 | 节奏对了 |
| 「这一段我想截图」 | great | 你做到了 |

---

## 工作流（高层）

```
                ┌──────────────────────────┐
                │  解说稿 .md（## scene + │
                │  [[cue:xx]] 标关键句）   │
                └──────────────┬───────────┘
                               │
                  narrate-pipeline.mjs
                               │
                               ▼
            ┌──────────────────────────────┐
            │ voiceover.mp3 (拼接的整段)  │
            │ timeline.json (实测时长)    │
            └──────────────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌─────────────────┐      ┌──────────────────┐
    │ HTML 动画       │      │ 录制 MP4 + 混音  │
    │ (NarrationStage)│      │ render-narration │
    │ 实播带 audio 同步│      │ → 最终发布 MP4   │
    └─────────────────┘      └──────────────────┘
       交付形态 1                交付形态 2
```

## 解说稿格式

放在项目目录下任意位置，文件名建议 `script.md`：

```markdown
---
title: 什么是 LLM
voice: S_JSdgdWk22   # 可选，覆盖 .env 默认音色
speed: 1.0           # 可选，0.5-2.0
gap: 0.4             # 段间静音秒数，默认 0.3
---

## intro
大家好，今天我们 5 分钟讲清楚 LLM 是什么。

## what-is
LLM 全称 Large Language Model，[[cue:bigmodel]]它是一个有几千亿参数的神经网络。
本质是一个文字接龙的预测器。

## demo
比如你输入「今天天气」，[[cue:input]]模型会预测下一个字最可能是什么。
[[cue:predict]]也许是「真好」，也许是「不错」。
```

**规则**：
- 段标题 `## scene-id` 是英文/数字 + 连字符（如 `## what-is`、`## scene-1`）
- `[[cue:xx]]` 标在**关键句中间**——脚本运行时会在该位置切割文本，cue 之后那一刻就是画面的触发点
- cue id 在动画 HTML 里用 `<Cue id="xx">` 监听
- 写解说时**关注节奏 + 短句**，长句 TTS 出来会平淡

## timeline.json schema

```ts
{
  title: string,
  voice: string | null,
  speed: number,
  gap: number,
  totalDuration: number,        // 整段 voiceover.mp3 的实测秒数
  voiceover: 'voiceover.mp3',   // 相对 timeline.json 的路径
  scenes: [
    {
      id: string,
      start: number,            // 该段在整段音频里的开始时间
      end: number,
      duration: number,
      audio: 'audio/<id>.mp3',  // 该段单独音频（合并前的子段已 concat）
      text: string,             // 已剥离 [[cue:xx]] 标记的整段文本
      // chunks 是字幕显示的源——每个 chunk 是被 cue 切开的子段，含 TTS 实测时间窗
      chunks: [
        {
          text: string,            // 子段文本
          start: number,           // 段内相对时间
          end: number,
          absoluteStart: number,   // 整轨绝对时间（对齐 voiceover.mp3）
          absoluteEnd: number,
        }
      ],
      cues: [
        {
          id: string,
          offset: number,       // 段内相对时间
          absoluteTime: number, // 整段时间轴上的绝对时间
        }
      ]
    }
  ]
}
```

`absoluteTime` 和 `absoluteStart/End` 都是**真实测出来的**——pipeline 把段内文本按 cue 切成子段分别 TTS，时间 = 累加前面子段的实测时长。**不是按字符数线性估算的近似值**。

## 字幕（Subtitles）

> **字幕是默认带的**——长解说视频没字幕，留存率会显著下降。NarrationStage 提供 `<Subtitles />` 开箱即用。

### 用法（一行）

```jsx
const { NarrationStage, Subtitles } = NarrationStageLib;
<NarrationStage timeline={TIMELINE} audioSrc="...">
  {/* 你的 hero / scene 内容 */}
  <Subtitles />  {/* ← 自动从 timeline.scenes[].chunks 取活动文本 */}
</NarrationStage>
```

### 视觉规则（B 站风 · 反 PowerPoint）

| 项 | 规则 | 反例 |
|---|---|---|
| 背景 | **无背景**（不要黑色横条不要 backdrop-blur）| 半透明黑底 + blur = 字幕条压住画面 = PPT 感 |
| 字色 | **浅底用深墨 `#1a1a1a` + 白光晕**；深底用白字 + 黑光晕 | 浅底白字+黑描边 = 字糊 |
| 字号 | 32px（1080p 视频）| <24px 看不清，>40px 抢主视觉 |
| 字体 | `PingFang SC` / `Noto Sans SC`（无衬线，B 站标准）| 衬线字体 = 像电影字幕 |
| 位置 | bottom: 90px（不贴边）| 贴底边显得廉价 |
| 单行长度 | **≤ 12-13 字**（中英混合时英文按 0.5 字算）| >15 字一行手机端读不完 |
| 切句规则 | **绝不跨句号截断**：先按 `。！？` 切句，每句再按 `，、；：` 合并到 ≤maxLen | 按字数硬切，把「这是好的」切成「这是好」+「的」 |

`<Subtitles />` 默认按以上规则跑，不需要传 props。深底场景：`<Subtitles color="#fff" haloColor="rgba(0,0,0,0.85)" />`。

### 切句算法（已在 narration_stage.jsx 内置）

```js
splitChunkToLines(text, maxLen = 13)
// 1. 强标点切句（。！？\n）
// 2. 每句 ≤ maxLen 直接保留
// 3. 否则按弱标点（，、；：）切片，合并到 ≤ maxLen
// 4. 兜底硬切（罕见）
// 中英混合：英文/数字按 0.5 字算视觉宽度
```

如果 chunk 切完后某行明显太长或太短，**改解说稿里 cue 位置**（cue 把段切得更细），不要在前端调切句逻辑。

## NarrationStage API

```jsx
import 'assets/narration_stage.jsx';
const { NarrationStage, Scene, Cue, useNarration } = NarrationStageLib;

<NarrationStage
  timeline={TIMELINE}                  // timeline.json 内容
  audioSrc="_narration/voiceover.mp3"  // 相对当前 HTML 的路径
  width={1920} height={1080}
  background="#f5f1e8"
  controls={true}                      // 实播时显示底部播放条
>
  {/* hero element：跨 scene 持续存在 —— 直接放在 NarrationStage 子级 */}
  <HeroAnchor />

  {/* scene 内辅助元素：只在该段出现 */}
  <Scene id="intro">
    <Cue id="bigmodel">{(triggered, progress) => (
      <SomeElement style={{ opacity: progress }} />
    )}</Cue>
  </Scene>
</NarrationStage>
```

**Hooks**：
- `useNarration()` 返回 `{ time, scene, sceneTime, isCueTriggered, cueProgress }`
- 在自定义组件里直接读，不需要传 props

**Scene 组件**：
- 默认只在 `scene.id === id` 时挂载
- 加 `keepMounted` 持续挂载（跨 scene 动画连续时用）

**Cue 组件**：
- children 必须是 `(triggered, progress) => ReactNode`
- progress 是 cue 触发后 0→1 的渐进值（默认 0.6s ramp）

## 时间源（双轨）

NarrationStage 自动检测 `window.__recording`：
- **实播模式**（默认）：跟随 audio 元素的 currentTime，用户暂停/拖动 seek 都能同步
- **录视频模式**（render-video.js 设置 `window.__recording = true`）：rAF wall-clock 自驱动从 0 开始，暴露 `window.__seek(t)` 给 render-video.js 复位

## 三个脚本

| 脚本 | 输入 | 输出 |
|---|---|---|
| `scripts/tts-doubao.mjs` | 单段文本 | 单个 mp3 + 实测时长 |
| `scripts/narrate-pipeline.mjs` | 解说稿 .md | voiceover.mp3 + timeline.json |
| `scripts/mix-voiceover.sh` | 视频 + voiceover.mp3 [+ BGM] | 带音频的 MP4 |
| `scripts/render-narration.sh` | 解说 HTML + timeline.json | 最终 MP4（录制 + 混音一条龙）|

## .env 配置

skill 根目录下 `.env`（已 gitignore）：

```
DOUBAO_TTS_API_KEY=<your_key>
DOUBAO_TTS_VOICE_ID=<your_clone_voice_id>
DOUBAO_TTS_CLUSTER=volcano_icl
DOUBAO_TTS_ENDPOINT=https://openspeech.bytedance.com/api/v1/tts
```

参考 `.env.example` 模板。豆包语音克隆音色 ID 在火山引擎控制台获取。

## 标准工作流（10 步）

1. **写解说稿**：解说稿是源代码。先把整段口播写完整，标段标题 `## scene-id`，关键句前加 `[[cue:xx]]`
2. **跑 narrate-pipeline**：`node scripts/narrate-pipeline.mjs --script script.md --out-dir _narration`
3. **听整段 voiceover.mp3**：节奏不对回去改稿。**这一步决定整片质量上限**
4. **🛑 设计前先回答铁律**：hero element 是什么？它在每段是什么状态？跨场景怎么 morph？答不上不要写代码
5. **写动画 HTML**：用 NarrationStage + 一个或几个 hero element 跨 scene 演戏
6. **实播预览**：浏览器打开 HTML，点 ▶ Play，听画面+解说同步
7. **第一观众自检**：用上面「自检 · 第一观众反应」表打分。失败回到 Step 4 重做
8. **录视频**：`bash scripts/render-narration.sh demo.html --timeline=_narration/timeline.json`（自动录无声 MP4 + 混入 voiceover）
9. **可选 BGM**：在 render-narration 加 `--bgm-mood=educational`（或 tech / tutorial 等）
10. **交付**：浏览器 HTML（实时演示用）+ 最终 MP4（发布用）

## 异常处理

| 问题 | 解决 |
|---|---|
| TTS API 报错 | 检查 .env 里 `DOUBAO_TTS_API_KEY` 是否正确 |
| 某段音频明显比脚本长/短 | 该段文本里有奇怪标点或 emoji，TTS 解析异常 → 改稿 |
| cue absoluteTime 不准 | 段内子段拼接时 ffmpeg 有问题 → 检查 mp3 编码一致性 |
| 录视频结果有黑屏 | render-video.js 没拿到 `window.__ready` 信号 → 检查 NarrationStage 是否正常挂载 |
| 录视频画面卡顿 | 动画里有重 layout（大量 box-shadow / blur）→ 简化或预合成 |
| 实播音画不同步 | audio 元素加载延迟 → 加 `preload="auto"` 或本地预加载 |

## 何时不用这套 pipeline

- **<60s 短动画**：直接做无声动画 + 后期配音（add-music.sh + 一段单独 TTS）即可，不需要 timeline 驱动
- **纯 BGM 视频**：用 `add-music.sh` 加预设 BGM
- **真人录音替换 TTS**：把 `voiceover.mp3` 替换成真人录音，timeline 自己手写或用 ffprobe 测段时长 + 工具脚本生成 → 流程其余部分通用

---

**最后一次提醒**：写代码前回到铁律。**别做带配音的 PowerPoint**。
