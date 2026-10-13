# v5 · "Markdown is the new typewriter."

> Director's Notes for the **huashu-md-html v2.0** launch film
> 30 seconds · 1920×1080 · 25 fps · no voiceover
> Director: huashu-design (acting as Apple-tier launch film director)
> Composer: TBD (target: Max Richter / Ólafur Arnalds / Jóhann Jóhannsson minimal-cinematic register)
> Color base: ivory white #FAFAF6 · ink #1A1A1A · terracotta #C2410C
> Type: Newsreader (display + body) · JetBrains Mono (interface) · Noto Serif SC (中文)

---

## 目录

- [Part I · Director's Statement](#part-i--directors-statement)
- [Part II · Visual System](#part-ii--visual-system)
- [Part III · Story Arc](#part-iii--story-arc)
- [Part IV · Shot-by-Shot Storyboard](#part-iv--shot-by-shot-storyboard)
- [Part V · Production Manifest](#part-v--production-manifest)

---

# Part I · Director's Statement

## 1.1 这不是一支「功能介绍片」

绝大多数 SaaS 升级视频都犯同一个错——把镜头当成 PPT。打开 → 6 个功能滑过 → logo + slogan → 结束。每一秒都在「展示」，没有一秒在「讲」。观众离开时记住的不是产品，而是「又一个看着像 AI 做的页面」。

**这支片不要做这个**。

我们要讲一个故事。故事只有一行：

> **「md 是源代码，万物是产物。」**

这不是 slogan，是世界观。Markdown 不是「一种轻量级文档格式」——它是写作的源头。一切下游的形式（html、docx、pdf、epub）都是从这同一个源头派生出的产物。huashu-md-html v2.0 把这条产物链从 4 条延长到 6 条——但延长的不是「功能列表」，是**源头的影响力半径**。

如果观众看完这支片只记住一件事，我希望那件事是：「原来 md 才是源代码」。功能列表能记多少都是 bonus。

## 1.2 视觉语言的语境对话

每一部好的宣传片都在跟一组前作对话。我希望这支片对话的语境是：

**Apple — "Designed by Apple in California" (2013)**

那支片子是我心目中科技公司宣传片的天花板。导演 Mark Romanek 做对了三件事：
1. **纯白底 + 衬线字体**——告诉观众这是一支「关于设计的设计」，不是 demo
2. **慢拍**——每一句话的字幕都比观众阅读速度慢半拍，强迫观众停留
3. **Jony Ive 的旁白几乎像耳语**——不是兜售，是分享

我们这支片**没有 voiceover**，所以前两个原则要被 typography 和 timing 强化到 200%。

**Apple Silicon Launch Films (M1 / M2 / M3, 2020-2024)**

这一系列短片教会我**typography 也能跳舞**。"M1" 三个字符可以从消失、到出现、到放大、到旋转、到爆炸成尘埃、再到重组——观众看着一个 logo 在 30 秒里成为一支舞剧的主角。

**这支片的 hero 不是产品 UI，是 `md.` 这两个字符 + 一个橙色句点**。它要在 30 秒里成为舞剧主角。

**Anthropic 品牌语言（2024-2026）**

Anthropic 把「赤陶橙 + 衬线 + 几何抽象」做成了 AI 公司的反 slop 样板。它告诉行业：你可以是科技公司，但你也可以看起来像 Penguin Classics 出版的一本哲学小书。

我们继承这套色彩。但要做得**更克制**——Anthropic 偶尔用纯赤陶橙作大色块；我们的赤陶橙永远只作 accent（占总画面 < 8% 面积），剩下 92% 留给象牙白和墨黑。

**Penguin Classics（1947 起，Romek Marber 1961 grid 之后）**

Penguin 教会我**typography 的勇敢**。一本书的封面可以是大字号衬线 + 一条黑横线 + 没有插图——读者反而会停下来。

第 25-29 秒的 slogan reveal 借这个语言：**ONE SOURCE.** 和 **SIX FORMS.** 不是「装饰文字」，它们就是画面本身。

**Pentagram (Paula Scher / Michael Bierut)**

Pentagram 的招牌是**信息建筑**——文字和文字之间的距离、文字和边界的距离、文字层级之间的字号比，都不是「凭直觉」，是数学。

我们的网格系统（Part II.3）来自这一传统。

**Kenya Hara《白》(2008)**

Hara 写过：「白不是颜色，是一种感受性。」（白は色彩ではなく、感受性なのだ）

这支片的真正主角不是 `md.`，是包围它的**那片象牙白**。每一个 shot 都要留出至少 60% 的负空间。负空间不是「还没填满」，是内容本身。

**Massimo Vignelli — Modernism in design**

Vignelli 的 8 字格言：「If you can design one thing, you can design everything.」（能设计好一件东西，你就能设计好一切）

我们的设计系统不允许「这一镜临时加一种字体」「这一镜临时加一个圆角值」。所有 12 个 shots 共享同一套 5 个色值、3 种字体、4 个 easing curves。

## 1.3 观众画像

三类观众，按重要性排：

**主受众 A · 已使用 v1 的 huashu-md-html 老用户（约占 60% 流量）**

他们打开片子是为了知道「升级了啥」。我们对他们的承诺：30 秒之内，你必须明确知道——
- 新增能力 5：md → 出版级 PDF
- 新增能力 6：md → 标准 EPUB
- 这两个能力的视觉品质比想象中更高（不是「我用 wkhtmltopdf 也能搞」级别）

→ Shot 08 和 Shot 09 各 3 秒，必须有「★ NEW」标签 + destination card 上必须能看到「印厂裁切标记」「Apple Books frame」这类**看得见的专业级细节**——让老用户秒懂「这不是凑数功能，是正经做了的」。

**次受众 B · 听说过 huashu-md-html 但没用的 AI Native 创作者（约 25%）**

他们关心的是「这个 skill 跟我有什么关系」。我们对他们的承诺：30 秒之内，你必须意识到——
- 你写文章 / 做调研 / 做白皮书时，**md 应该是你的 source of truth**
- 6 种下游格式，一次命令解决

→ Shot 04（any → md）要让他们看到 PDF/DOCX/PPTX/XLSX/HTML 一起被 md 吸收——这是「源头思维」的视觉具象化。

**外受众 C · 完全不熟悉的设计师 / 编辑 / 出版人（约 15%）**

他们看到的是一支「漂亮的科技短片」，不一定 follow up。我们对他们的承诺：30 秒之内，你必须留下印象——
- 这家做的东西**有出版社品位**
- 跟你过去看到的 AI 工具不一样

→ 整支片的反 AI slop 自检（Part II.7）就是为他们做的。任何紫渐变、emoji 图标、SVG 手画人物——一律不出现。

## 1.4 节奏哲学

苹果宣传片的节奏不是匀速的。它是**慢拍 — 加速 — 顶峰 — 缓收**的曲线（详见 Part III 情绪曲线图）。

具体到这支片：

- **0-3s 慢拍**：观众进入。typography 一个字符一个字符地呼吸。
- **3-6s 第一加速**：md 字符诞生，6 个文件 cards 鱼贯飞入。
- **6-22s 第二加速段**：6 个 capability 一气呵成，每个 3 秒不松手。
- **22-26s 顶峰**：slogan 双行 reveal，所有 chrome 同步律动。
- **26-30s 缓收**：capability map 慢慢淡入，最后一秒留给品牌印章 + 极弱的 piano 残响。

**关键决策**：第 22 秒是这支片的高潮点（不是第 29 秒）。29 秒是 resolution，22 秒是 climax。这两个不要混。

## 1.5 这支片**不**做的事（反 AI slop 自检）

按重要性排：

| 不做 | 原因 |
|------|------|
| 不用紫渐变 | 训练语料里「科技感」的万能公式，2026 年看是 cyber slop |
| 不用 emoji 作图标 | 「不专业就用 emoji 凑」的病 |
| 不画 SVG 人物 / 手 / 抽象人形 | AI 画的 SVG 人物永远五官错位、比例诡异 |
| 不用 Inter/Roboto/Arial 作 display | 太常见，撞 system fonts |
| 不用赛博霓虹 / 深蓝底 #0D1117 | GitHub dark mode 美学的烂大街复制 |
| 不堆 effects（blur/glow/particle）| 一个 effect 出现两次就是装饰，三次就是 slop |
| 不用 Lorem ipsum | 每一段假文都用真正能读的内容（含「md is the source. Anything else is product.」这种 hook） |
| 不用 stock photo | 整支片不出现任何真实照片（it's about typography, not lifestyle） |
| 不画进度条 + 时间码 + 版权署名条 | 这些是 player chrome，不是 content chrome——会和外部播放器撞 |
| 不让 md 字符在每个 scene 都长得一样 | 它要在 12 镜里有 12 种状态，但保持同一个核心字形 |

## 1.6 一句话定位

> **"Markdown is the new typewriter."**
>
> A 30-second film about source-of-truth thinking, made for designers who write and writers who design.

---

# Part II · Visual System

## 2.1 完整色板

不是 3 色，是 10 色。每一色都有**功能定义**（不是「好看就用」）。

```
名称            HEX        作用                           占画面比例上限
─────────────────────────────────────────────────────────────────────
Ivory paper    #FAFAF6    主底色（象牙白，一抹温度）         60-70%
Mist           #F2EDE4    次级背景层（card 阴影下的微暗）    < 15%
Mica           #E6E1D6    细线 / 分隔符 / 卡片边框          < 5%
Smoke          #6B6B6B    次级文本 / metadata             < 5%
Cinder         #3D3530    次级深色（深褐黑，不是纯黑）       < 10%
Ink            #1A1A1A    主黑 / 主文本                    20-25%
Charred        #2A2620    极深褐黑（封面卡专用）            < 5%
Terracotta     #C2410C    主 accent（Anthropic 调）         5-8%
Terra Hot      #E55D21    高光 variant（仅 NEW 标签亮起一瞬）< 1%
Terra Deep     #8B2D08    阴影 variant（赤陶橙投影）         < 1%
```

**铁律**：
- 任何一镜不出现以上 10 色之外的颜色。**没有「这一镜临时加点冷灰」**。
- 赤陶橙系（Terracotta + variants）三色合计占画面 < 10%，否则视觉过载。
- 任何文本只能用 4 色之一：Ink / Cinder / Smoke / Terracotta。

## 2.2 字体系统

```
字号层级        字体                  weight    用途                       字距 (em)
────────────────────────────────────────────────────────────────────────────────────
Display XXL    Newsreader            700       slogan 顶字（200px）         -0.035
Display XL     Newsreader            700       capability number（48px）   -0.020
Display L      Newsreader            600       hero md 字符（300-480px）   -0.040
Display M      Newsreader            600       chapter title (32-44px)     -0.015
Body L         Newsreader            400       essay 正文 (18-22px)         0
Body M (zh)    Noto Serif SC         500       中文 sub-line (20-26px)     +0.04
Italic         Newsreader italic     400       引语、副标                   +0.01
Mono S         JetBrains Mono        500       标签 / capability counter   +0.18
Mono XS        JetBrains Mono        700       NEW / version chip (11-14px) +0.22
Caret          (block 3px wide)      —         typing cursor               —
```

**字体加载策略**：
- Google Fonts 预连接 `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- 单一 `<link>` 请求合并所有 weights，减少 round-trip
- 录制 MP4 前必须 `document.fonts.ready` 完成才开始计时（Stage 已实现）

## 2.3 网格系统

**主画布**：1920 × 1080

**外边距（safe zone）**：80px 上下左右

**主内容区**：1760 × 920

**12-column grid**：column-width = 132px，gutter = 16px

**Baseline grid**：8px 基础律。所有 vertical position 必须是 8 的倍数（除非有特殊视觉理由）。

**黄金分割锚点**：
- 上 1/3 线：y = 360
- 下 1/3 线：y = 720
- 中线：y = 540（hero md 默认 anchor）
- 黄金分割上：y = 412
- 黄金分割下：y = 668

**关键安全区**：
- 顶部 60px 内：chrome 元素区（capability counter, version chip）
- 底部 60px 内：watermark / metadata 区
- 中央 800×600 区域：主内容禁区（每一镜的 hero 元素必须落在此区域内）

## 2.4 动画系统

**Easing 库**（共 4 条，禁用其他）：

```
名称           曲线公式                            用途
──────────────────────────────────────────────────────────────────
expoOut       1 - 2^(-10t)                       默认 ease（90% 的入场用这个）
overshoot     cubic-bezier(0.34, 1.56, 0.64, 1)  NEW 标签弹出 / 按钮浮现
linear        t                                   底色 fade / paper texture 移动
expoIn        2^(10(t-1))                        退场 ease（10% 的出场用这个）
```

**Duration 字典**：

```
事件类型                  持续时间      备注
────────────────────────────────────────────────────────
字符 stagger              30-50ms       打字效果 / slogan 字符依次出现
小元素入场                300ms         file card / pill / chip
中元素入场                500ms         destination card / capability number
hero 元素入场             700-900ms     md 字符 morph
slogan 字符入场           800ms         "ONE SOURCE." 整体
scene 之间过渡            300ms 重叠    cross-dissolve + scale
退场                      200-300ms     出场永远快于入场
```

**Stagger 法则**：
- 多元素同时进场时，相邻元素 delay 30-80ms（不是 0，也不超过 100ms）
- 6 个 pill 进场：累计 stagger 250ms（每个 50ms）
- slogan 字符进场：累计 stagger 280ms（每个 ~30ms × 10 字符）

**Scene 之间过渡**：
- 永远是 **cross-dissolve + soft scale**（不切换硬切）
- 上一镜在末尾 300ms 内：opacity 1 → 0, scale 1 → 0.96
- 下一镜在开头 300ms 内：opacity 0 → 1, scale 1.04 → 1
- 两镜重叠 300ms（在时间轴上 Sprite end 比下一镜 start 大 0.3s）

## 2.5 Chrome 元素（贯穿全片）

这些是 **持续在画面里的小东西**，提供「这是一支完整的片子」的感觉。

**Chrome A · top-left · capability counter（00-22s）**

```
   ┌─────────────┐
   │  ●  CAP·01  │     pulse dot (terracotta) + label
   │  ●●●●○○○○○  │     6-dot progress (filled = current)
   └─────────────┘
```

- 字体：JetBrains Mono 12px，letter-spacing 0.24em
- 颜色：Ink for label, Terracotta for current dot, Mica for upcoming dots
- 动画：每次切 scene 时，下一个 dot 从空心 → 实心（500ms expoOut）

**Chrome B · top-right · version chip（02-30s）**

```
   ╔═════════════════════════╗
   ║ ● HUASHU-MD-HTML · v2.0 ║
   ╚═════════════════════════╝
```

- 字体：JetBrains Mono 13px Bold，letter-spacing 0.22em
- 颜色：Terracotta dot + Ink label
- 入场：02s 时整体 fade-in 600ms
- pulse dot：每 4 秒做一次极弱呼吸（opacity 1 → 0.6 → 1, 1500ms ease-in-out）

**Chrome C · bottom-center · timeline ticker（07-22s）**

```
   any→md  ━━━━●━━━━━━━━━━━━  md→html  ─  html→md  ─  md→docx  ─  md→pdf  ─  md→epub
```

- 字体：JetBrains Mono 11px，letter-spacing 0.18em
- 当前 capability 用 Terracotta + bold，其他用 Smoke
- 一条横线连接 6 个名字，进度点（●）随时间从左滑到右
- 入场：07s 时整条 fade-in 500ms

**Chrome D · bottom-right · watermark（持续）**

```
   CREATED BY HUASHU-DESIGN
```

- 字体：JetBrains Mono 10px，letter-spacing 0.24em
- 颜色：rgba(26,26,26,0.32)
- 完全静态，不动

**Chrome E · 极淡 paper texture（持续）**

- SVG 噪点 + 极慢的 0.3% scale 呼吸
- opacity ≤ 0.04
- 录像时几乎看不见，但能让画面有「呼吸」

## 2.6 音频系统

### BGM 走向（30 秒分段曲线）

```
强度
 │                            ╱╲
1│                          ╱╱  ╲╲
 │                       ╱╱      ╲╲
 │                    ╱╱             ╲
 │                ╱╱                   ╲
 │            ╱╱                          ╲
 │       ╱╱                                  ╲
 │   ╱╱                                          ╲
0└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴
   0  2  4  6  8 10 12 14 16 18 20 22 24 26 28 30s
   │  │     │              │           │  │
   入场│   弦乐进 │      节奏律动加入  │ 顶峰 │  decay
      piano                              swell
```

**层级（每层 30 秒持续，强度变化由 envelope 控制）**：

- **L0 · Room tone**（00-30s）：极弱 background noise，给画面「不死寂」的呼吸感
- **L1 · Piano single note**（00-08s）：单一钢琴音持续敲击，每 1.2 秒一次，慢慢累积
- **L2 · Piano arpeggio**（03-22s）：钢琴琶音入场，给「拾起节奏」的感觉
- **L3 · Cello drone**（08-22s）：低频弦乐铺底，给「重量」
- **L4 · Pulse**（15-22s）：极弱 sub-kick，4/4 节奏（不是 dance beat，是 cinematic pulse）
- **L5 · String swell**（22-26s）：整组弦乐 swell up 到 climax
- **L6 · Decay + reverb tail**（26-30s）：所有层级 decay，留下钢琴 + reverb

**风格目标**：Max Richter 的 *On the Nature of Daylight* + Ólafur Arnalds 的 *Re:member* + Jóhann Jóhannsson 的 *Orphée*

### SFX 字典

```
Cue                          时间        类型               音量
────────────────────────────────────────────────────────────────────
keyboard click               00.5-02.0   keypress × 12     -18dB（每次 30ms）
cursor blink                 02.0-02.8   subtle tick        -28dB
md morph swell               02.8-03.2   soft whoosh + bloom -16dB
file card whoosh × 6         05.5-08.0   short whoosh       -20dB（每次 200ms）
absorb / ink drop             08.0-08.4   "absorb" splash    -16dB
paper rustle                 08.5-09.0   paper turn         -22dB
chime: capability 02 →        09.0       single chime tone  -18dB
chime: capability 03 →        12.0       single chime tone  -18dB
chime: capability 04 →        15.0       single chime tone  -18dB
chime: NEW (05)               18.0       double chime + glow -14dB
chime: NEW (06)               21.0       double chime + glow -14dB
build sweep                  22.0-22.6   ascending sweep    -10dB
impact (slogan ONE)          22.6        deep impact         -8dB
impact (slogan SIX)          23.4        deep impact         -8dB
pen flourish                 24.0-24.4   pen on paper        -22dB
final stamp / sign-off       29.0-29.5   ink stamp           -14dB
```

**SFX 频段隔离**（防止互相打架）：
- BGM 占低频 (40Hz-2kHz)
- SFX whooshes / chimes 占中高频 (2kHz-8kHz)
- SFX impacts 占低频 sub (40Hz-120Hz) — 与 BGM cello 重叠但 BGM 同时 duck -3dB

## 2.7 反 AI slop 自检表（per-shot）

每一镜在执行前必须过这个 checklist：

```
□  没有紫色（任何饱和度）
□  没有圆角卡片 + 左 border accent 的组合（除了 destination card 的诚实 mica border）
□  没有 emoji 作为图标
□  没有 SVG 画的人物 / 抽象人形
□  没有未在 Part II.1 色板里的颜色
□  没有 Inter / Roboto / Arial 作为 display
□  字距、行高、字号都来自 Part II.2 字体系统（没有「凭手感」加的值）
□  vertical position 是 8 的倍数（除了刻意的视觉理由）
□  赤陶橙在本镜占画面 < 10%
□  这一镜有至少一处「pause 暂停时值得截图」的细节（120% 签名）
□  上一镜到这一镜的过渡是 cross-dissolve + scale，不是硬切
□  本镜结束时为下一镜做了视觉「让位」（不是「全画面填满到最后」）
```

---

# Part III · Story Arc

## 3.1 三幕结构

**ACT I · SET-UP (00.0 — 06.0s)**

观众进入画面。问题被提出：什么是 source of truth？

- SHOT 01 (0.0-1.5s) · BLANK PAGE
- SHOT 02 (1.5-3.0s) · THE CURSOR
- SHOT 03 (3.0-5.0s) · THE TRANSFORMATION
- SHOT 04 (5.0-6.0s) · 进入 gathering（与 ACT II 重叠）

**ACT II · ESCALATION (06.0 — 22.0s)**

答案展开：md 是源头。它向外辐射 6 条产物链。

- SHOT 04 (5.0-8.5s) · GATHERING（any → md）
- SHOT 05 (8.5-11.5s) · FIRST FLOWER（md → html）
- SHOT 06 (11.5-14.5s) · REVERSE FLOW（html → md）
- SHOT 07 (14.5-17.5s) · PUBLISHER GRADE（md → docx）
- SHOT 08 (17.5-20.5s) · ★ NEW · PRINT（md → pdf）
- SHOT 09 (20.5-22.5s) · ★ NEW · EBOOK（md → epub，与 ACT III 重叠 0.5s）

**ACT III · PAYOFF (22.5 — 30.0s)**

主题升华。slogan 出现。品牌印章。

- SHOT 10 (22.5-24.0s) · THE CONVERGENCE
- SHOT 11 (24.0-26.5s) · ONE SOURCE.
- SHOT 12 (26.5-29.0s) · SIX FORMS.
- SHOT 13 (29.0-30.0s) · SIGN-OFF

## 3.2 情绪曲线

```
情绪强度
 │                                       ╔═══╗
 │                                    ╔══╝   ╚══╗
 │                              ╔═════╝         ╚══╗
 │                          ╔═══╝                   ╚══╗
 │                       ╔══╝                          ╚══╗
 │                   ╔═══╝                                 ╚════════╗
 │             ╔═════╝                                              ╚══╗
 │       ╔═════╝                                                       ╚══
 │  ╔════╝
 │══╝
 0──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──>
    0     2     4     6     8    10    12    14    16    18    20    22    24    26    28    30s
    │     │     │            │           │            │            │     │     │
    blank cursor morph      gather       cap 02-04   cap 05/06 ★  slogan slogan sign-off
                                                                  ONE   SIX
                                                                  ──────►
                                                                  PEAK 24.5s
```

**关键 emotional beats**：
- **02.0s**：第一个 keyboard click → 观众进入
- **03.0s**：md 字符诞生 → 第一次「awe」
- **08.0s**：6 个文件 cards 收拢进 md → 「啊，原来 md 是源」第一次 click
- **18.0s**：第一个 NEW 标签出现 → 老用户「噢」
- **22.5s**：所有 chrome 收拢，准备进入 Act III → tension build-up peak
- **24.5s**：SIX FORMS. 落地 → emotional climax
- **30.0s**：md 印章静静停留 → resolution

---

# Part IV · Shot-by-Shot Storyboard

每一镜的格式：

```
SHOT NN · NAME
[TIMECODE]  |  FUNCTION
[VISUAL]     画面构图
[TYPE]       排版精确 spec
[ANIM]       每元素 in/out/easing/delay
[AUDIO]      music beat + SFX cue
[CHROME]     四角元素状态
[ANTI-SLOP]  通过的自检项
[WHY]        承接 + 推进
```

---

## SHOT 01 · "BLANK PAGE"

**[TIMECODE]** 00.00 — 01.50s (1.5s) `|` **FUNCTION** 开场。引观众进入。给「空」一个时间。

**[VISUAL]**

整个 1920×1080 是 Ivory paper #FAFAF6。**画面里什么都没有**。

唯一的存在：一层极淡的 paper texture（SVG 噪点 + 0.3% scale 极慢呼吸），几乎看不见，但赋予画面「这是一张真的纸」的潜意识。

构图：完全空。这是 Kenya Hara 意义上的「白」——不是「还没画」，是「内容本身」。

**[TYPE]** 无文本。

**[ANIM]**

- 0.00s · paper texture opacity 从 0 → 0.04（500ms linear）
- 0.50-1.50s · 整个画面 hold，无动作。让观众的眼睛适应这个白。
- 1.40-1.50s · 画面中央偏左（x=860, y=540）开始浮现一个 cursor 的位置（透明，下一镜才显形）

**[AUDIO]**

- BGM: room tone 进入 (300ms fade-in to -38dB)
- SFX: 无

**[CHROME]** 全部隐藏。Chrome A/B/C/D/E 都还没显形。

**[ANTI-SLOP]**

- ✅ 没有 logo、没有「Loading...」、没有任何品牌前置
- ✅ 没有渐变、没有 effects
- ✅ 这一镜的「pause-and-look」signature：画面有质感（paper texture）但绝不抢戏

**[WHY]**

苹果 "Designed by Apple in California" 也是这样开场——给空白一个时间。它告诉观众「这部片需要你慢下来」。如果开场就堆 logo 和 chrome，观众的注意力被分散，后面 30 秒都收不回。

这 1.5 秒是这支片最重要的 1.5 秒之一。

---

## SHOT 02 · "THE CURSOR"

**[TIMECODE]** 01.50 — 03.00s (1.5s) `|` **FUNCTION** typewriter 诞生。第一个内容。

**[VISUAL]**

画面中央偏左（x=860, y=540），一个垂直的黑色 block（3px × 56px, Ink #1A1A1A）开始闪烁。这是 cursor。

闪烁两次（0.7s 一周期 × 2）后，cursor 后面开始逐字出现 `# markdown.md`，字体 JetBrains Mono 56px，颜色 Ink #1A1A1A，letter-spacing -0.01em。

每打一个字符，键盘 click 音响一次。打完最后一个字符（13 个字符总计），cursor 在 `.md` 之后继续闪烁 1 次。

**[TYPE]**

- Text: `# markdown.md`
- Font: JetBrains Mono 500 weight
- Size: 56px
- Color: Ink #1A1A1A
- Letter-spacing: -0.01em
- Position: horizontal center, y = 540（baseline，文字 vertical center 略低于此）

**[ANIM]**

- 01.50s · cursor block opacity 0 → 1 (200ms)
- 01.50-01.85s · cursor blink 第一次（off 200ms / on 200ms）
- 01.85-02.20s · cursor blink 第二次
- 02.20-02.85s · 13 个字符 staggered 出现，每个间隔 50ms（共 650ms 完成），每个字符各自 fade + 1px slide-down (180ms expoOut)
- 02.85-03.00s · cursor 在末尾再 blink 一次（最后一次，标志输入完成）

**[AUDIO]**

- BGM: piano 第一音敲击 at 01.50s (-22dB)
- SFX: keyboard click × 13 (每字一次, -18dB, 30ms each)
- SFX: 最后一次 cursor blink 后 200ms 静默（给下一镜 morph 让位）

**[CHROME]** 仍隐藏。

**[ANTI-SLOP]**

- ✅ cursor 不是 sci-fi 闪烁（不是 0.1s 极快闪烁），是 macOS terminal cursor 节奏的真实模拟
- ✅ typing 不是「字符一次性出现」，是真的有节奏的打字
- ✅ font 是 JetBrains Mono，不是 Courier 或 Menlo 这种系统默认 mono
- ✅ pause-and-look signature：cursor 的 3px 宽度（不是 2px 或 4px）—— 一个非常精确的细节，懂行的人会注意到这是「真实 terminal 设计的」

**[WHY]**

这一镜是 setup 的核心：**markdown 不是一个名词，它是一个动作**——它是「敲击键盘把字符变成结构」这件事本身。

cursor 是写作的最小单位。从一个 cursor 开始，是「源代码」的诞生。

下一镜的 morph 就建立在这个观众已经接受「我们在写 markdown」的前提上。

---

## SHOT 03 · "THE TRANSFORMATION"

**[TIMECODE]** 03.00 — 05.00s (2.0s) `|` **FUNCTION** 揭示 hero。`# markdown.md` morph 成 hero `md.`

**[VISUAL]**

第 03.00 秒：`# markdown.md`（56px mono）开始向中央收拢、放大、变形。

**morph 过程**（详细解构）：

- 03.00-03.30s（300ms）：`# markdown.md` 的 `#` 和 `arkdown` 部分淡出（opacity 1 → 0），同时 `m` 和 `d.md` 的 `md` 部分留下。
- 03.30-04.10s（800ms）：留下的 `md` 从 mono 字体 morph 成 Newsreader serif，从 56px 放大到 480px，从 Ink 变成 Ink（不变色），位置不变（仍在画面中央）。
- 04.10-04.80s（700ms）：在 `md` 字符的右下角，一个 Terracotta 句点 `.` 浮现（fade-in + scale 0.6 → 1 + overshoot easing）。
- 04.80-05.00s（200ms）：句点正式 settle，hero 完整。下方 30px 出现一条 320px 宽的赤陶橙细线（terracotta accent rule, 2px thick），从中心向两端展开。

**结束帧**：`md.`（Newsreader 600 weight, 480px, Ink with Terracotta dot）+ 下方一条赤陶橙细线。画面其他全空。

**[TYPE]**

- Text: `md.`（`md` Ink, `.` Terracotta）
- Font: Newsreader 600 weight
- Size: 480px (display L)
- Letter-spacing: -0.04em
- Color: `m`+`d` Ink #1A1A1A, `.` Terracotta #C2410C
- 在 hero 中线（y = 540）水平垂直居中
- accent rule 下方 30px，width 320px（从 0 长成）

**[ANIM]**

- 03.00-03.30s · `#` `arkdown` `md`（中段）淡出 (opacity 1 → 0, expoOut)
- 03.30-04.10s · `md` morph：fontFamily 切换、fontSize 从 56 → 480、weight 从 500 → 600（800ms expoOut，注意 morph 不是 abrupt 切换，而是 ghost 残影叠加 + scale up + opacity 切换）
- 04.10-04.80s · `.` 入场 (700ms overshoot, scale 0.6 → 1)
- 04.80-05.00s · accent rule width 0 → 320px (300ms expoOut)

**[AUDIO]**

- BGM: piano 第二音 at 03.00s (-20dB), 第三音 at 04.20s (-18dB) — piano 累积
- SFX: 03.00-03.20s soft whoosh（morph 开始时, -16dB）
- SFX: 04.10s subtle bloom（句点出现的瞬间, -20dB）
- SFX: 04.80s short paper rustle（accent rule 展开, -22dB）

**[CHROME]**

- 04.50s · Chrome B（version chip top-right）开始浮现 (fade-in 600ms)
  - 形态：`● HUASHU-MD-HTML · v2.0`
  - terracotta dot, mono text, Ink color
  - 进入位置：top: 78px, right: 80px
- 仍隐藏：Chrome A, C, E（visible only ≥ 06s）

**[ANTI-SLOP]**

- ✅ morph 不是「淡出 + 淡入」的廉价 transition，是真正的字符变形（含 ghost 残影叠加）
- ✅ 句点是 hero 的「签名细节」（120% 做到的那个）：Terracotta 句点小如指甲，但是这部片的视觉锚点，**所有后面的镜头里这个句点都保留为 hero 标识**
- ✅ accent rule 不是装饰，是 hero 的 base line——它在 Shot 11 的 slogan 那里会再次出现，建立首尾呼应
- ✅ pause-and-look signature：480px Newsreader 'md' 的字距 -0.04em 让 m 和 d 之间几乎贴合但不接触，这是 Newsreader 这个字体在大字号时的招牌质感

**[WHY]**

这是 hero shot。后面 25 秒整部片的「主角」（`md.`）在此诞生。

morph 的设计哲学：**从 mono 到 serif，是从「我在打字」到「我在写作」的隐喻**。mono 是 typewriter，serif 是 publishing。md 同时是两者——它在键盘上敲，但它是 publishing 的源代码。

下一镜进入 ACT II，hero 已经站住了——它会被推到画面上方，让出空间给「物质化的产物」。

---

## SHOT 04 · "GATHERING" (any → md)

**[TIMECODE]** 05.00 — 08.50s (3.5s) `|` **FUNCTION** CAPABILITY 01 揭示。万物 → md。建立「md 是源」的世界观。

**[VISUAL]**

05.00s：hero `md.` 从画面中央（y=540）向上滑到 y=280（即 1/4 高度位置），同时缩小到 220px。

随后画面下半部（y=520 ~ y=900 区域）出现 6 张文件 cards，按顺序从画面外（下方 y=1140）飞入，沿一条隐形的抛物线轨迹向 md hero 收拢。

6 张 cards 的设计（**每张都是真实文件类型的迷你 demo，不是 fake bar lines**）：

```
.pdf   │ 双栏布局 + 页眉 "doc.pdf" + 页码 "— 12 —" + 几行真实排版的小文字
.docx  │ heading "On Markdown" + 副标 italic + 6 行段落 ascii
.pptx  │ 标题 "MD AS SOURCE" + 一个简化的 bar chart 占位
.xlsx  │ 6×4 的 spreadsheet 网格 + 一些数字
.epub  │ Apple Books 风的页面 + 章节标题 "Chapter 01"
.html  │ 一个浏览器 chrome（三个圆点 + URL bar "example.com"）+ 标题 + 段落
```

每张 card 尺寸 130×180px，白底 + Mica 边框 + 24°右上角 fold。

**飞行轨迹**：从下方 y=1140 出发，沿抛物线向 md hero 的「.」位置（约 x=960+50, y=280+90）汇聚。中段（在画面中部时）6 张 cards 排成扇形，每相邻两张间隔 220px。最终所有 6 张被 md 「吸收」（scale 1 → 0.5 + opacity 1 → 0，同时 position 收拢到一个点）。

吸收时机：从 05.60s 开始，每隔 0.18s 一张 launch。每张飞行 1.1s 后被吸收。最后一张 absorb 完成时间约 07.60s。

吸收完成后（07.60-08.20s），下方 60px 处出现 tagline：「万物 → md」（中文衬线，36px，Ink，italic）

08.20-08.50s · 整体 hold，准备进入 Shot 05。

**[TYPE]**

- hero `md.`：缩小到 220px（同 SHOT 03 字体规格）
- 6 cards 内部排版：JetBrains Mono 12-14px for labels, Newsreader 12-16px for content
- tagline「万物 → md」：Noto Serif SC 36px italic + 中间的 → 是 Newsreader italic + Terracotta
- 顶部 Chrome A 文字：JetBrains Mono 12px

**[ANIM]**

- 05.00-05.30s · hero md 缩放 + 上移（300ms expoOut）
- 05.30s · Chrome A capability counter 入场（CAPABILITY · 01 显示，第一个 dot 实心）
- 05.60-07.60s · 6 张 cards 依次发射（每张 launch delay = 5.60 + i × 0.18s, 飞行 1.1s，absorb at launch+1.1）
- 07.60-08.20s · tagline「万物 → md」入场（fade-in 400ms + slight y slide 12px → 0）
- 08.20-08.50s · hold

**[AUDIO]**

- BGM: piano arpeggio L2 进入 at 05.00s（-26dB → -20dB 渐入）
- SFX: file card whoosh × 6（每张 launch 时一次，每次 200ms，-20dB）
- SFX: absorb / ink drop（最后一张 card 被吸收时，-16dB）
- SFX: paper rustle（tagline 入场时，-22dB）

**[CHROME]**

- A（top-left capability counter）: ON, 显示 `CAPABILITY · 01`, 第一个 dot 实心
- B（version chip）: ON, 持续显示
- C（timeline ticker）: OFF (会在 SHOT 05 入场)
- D（watermark）: ON, 永远 ON
- E（paper texture）: ON

**[ANTI-SLOP]**

- ✅ 6 张 cards 不是 emoji 也不是图标，是**有内部内容的迷你 demo**——每张都 readable
- ✅ 飞行轨迹是抛物线（重力感），不是直线（电脑感）
- ✅ 收拢时是「吸收」（scale + position 同时收）不是「叠加」
- ✅ 没有给 md 字符任何 glow 或 particle effects（不需要解释「md 在吸收」，观众自己看得懂）
- ✅ pause-and-look signature：每一张 card 在飞行中段 pause 看，都能读出来「这是个 PDF / 这是个 DOCX」——这就是 120% 做到的细节
- ✅ tagline 用「→」而不是「to」或「至」，是 markdown 自己的字符

**[WHY]**

这是 ACT II 的开门镜。如果观众看完这 3.5 秒没意识到「噢，md 是源」，后面的镜头就白做了。

3.5 秒里有 3 个 micro-narrative beats：
1. hero 让位（md 上移）—— 暗示「我让位给我的产物们」
2. 6 个产物现身 —— 揭示「我能收的东西」
3. 全部归位回 md —— 「但他们最终都是 md」

下一镜进入 md → html 的正向流动——观众已经接受「md 是源」，现在 ready to see「md 怎么变」。

---

## SHOT 05 · "FIRST FLOWER · HTML" (md → html)

**[TIMECODE]** 08.50 — 11.50s (3.0s) `|` **FUNCTION** CAPABILITY 02。第一次正向输出。建立 ScenePipeline 模式（后续 5 镜共用此结构）。

**[VISUAL]**

08.50s：hero `md.` 从中心上方位置滑到画面左侧（x=480, y=540），尺寸保持 220px。

同时画面右侧 (x=1400, y=540) 出现一个 destination card：模拟「Tufte CSS 风的 essay html」。

destination card 设计（**真实可读的内容，不是 bar lines**）：

```
┌─────────────────────────────────┐
│                                  │
│  On Markdown                     │  ← Newsreader 600, 32px, Ink
│  AN ESSAY · 2026                 │  ← Mono 11px, 0.18em, Smoke
│  ▬▬▬                             │  ← Terracotta rule 60×3px
│                                  │
│  md is the source of truth.      │  ← Newsreader 400, 18px, line-height 1.7
│  Anything else is product.       │
│  We write once. Publish six      │
│  ways. The river forks; the      │
│  spring stays the same.          │
│                                  │
│  ─ huashu, 2026.05.11            │  ← italic 14px, Smoke
│                                  │
│  article.html · TUFTE THEME      │  ← Mono 10px, 0.18em, Smoke (bottom)
└─────────────────────────────────┘
   宽 480px × 高 560px
   白底 + Mica border + 24° 角折
```

md 字符与 destination card 之间用一条 terracotta 细线连接，从 md 的 dot 出发，向右生长 380px，箭头 head 触达 card 左边界。线上方 30px 处显示 label「md → html」（JetBrains Mono 14px Terracotta，letter-spacing 0.14em）。

09.80s 时：Chrome C（timeline ticker）首次入场，固定在 y=1000 处。

**[TYPE]**

- 见 visual description 内嵌
- label「md → html」字号 14px， Mono Bold，Terracotta，letter-spacing 0.14em
- destination card 顶部 chapter title 是 Newsreader 600, 32px, Ink
- destination card 底部小印 mono 10px Smoke 0.18em

**[ANIM]**

- 08.50-08.80s · hero md 从 center-top 滑到 left-mid（300ms expoOut）
- 08.80-09.10s · arrow line 从 md.dot 起点向右生长（300ms expoOut, 0 → 380px）
- 09.10s · arrow head 浮现（200ms overshoot）
- 09.20-09.40s · label「md → html」入场（fade-in + 8px y slide-down, 300ms expoOut）
- 09.40-10.10s · destination card 整体入场（700ms expoOut, scale 0.85 → 1 + opacity 0 → 1）
- 10.10-10.80s · destination card 内部 staggered 入场：title (400ms delay 0) → 副标 metadata (delay 200ms) → terracotta rule (delay 400ms) → 6 行正文 (each delay 60ms cascade) → 签名 (delay 1000ms) → bottom mono (delay 1100ms)
- 10.80-11.50s · hold + 微观呼吸 (整体 scale 1 → 1.005 → 1, 600ms ease-in-out infinite, 但本镜只播放半个周期)

**[AUDIO]**

- BGM: cello drone L3 入场 at 09.00s (-30dB → -24dB)
- SFX: chime: capability 02 at 09.00s (-18dB)
- SFX: paper rustle（card 入场时, -22dB）
- SFX: micro ticks（每行文字 staggered 入场时, -26dB each）

**[CHROME]**

- A: 推进到 `CAPABILITY · 02`, 第二个 dot 实心
- B: ON
- **C: 首次入场** at 09.80s，`any→md  ━━━━●━━━━━  md→html  ─  html→md  ─  md→docx  ─  md→pdf  ─  md→epub`，进度点 ● 位于第二格上方
- D: ON
- E: ON

**[ANTI-SLOP]**

- ✅ destination card 的「On Markdown」essay 内容是真的可读的英文哲学小段，不是 Lorem ipsum
- ✅ 「article.html · TUFTE THEME」这个小印是「pause 时能读出来的细节签名」
- ✅ 没用任何 glow 或 particle 来「强调」md → html 的转换——靠 typography 和构图自己讲清楚
- ✅ arrow line 不是 dashed 或 dotted（避免「网页教程」感），是 1.5px 实线 Terracotta
- ✅ pause-and-look signature：destination card 顶部的「AN ESSAY · 2026」副标用了 Newsreader 的 small caps OpenType feature，0.18em 字距——是这一镜的 120% 细节

**[WHY]**

这是 ScenePipeline 模式的首次建立。后续 5 个 capability shots 都会按这个结构推进：
1. md 在左、destination 在右
2. arrow + label 在中间
3. destination card 内部 staggered 入场（每个 card 都有 6-8 个文字层级）
4. card 内容是真实可读的，不是 fake bar lines

观众看到第二次（SHOT 06）就会理解这个模式，看到第六次（SHOT 09）会有「啊，又来一次，但这次是 NEW」的感觉——这正是 ACT II 的节奏设计。

---

## SHOT 06 · "REVERSE FLOW · MD" (html → md)

**[TIMECODE]** 11.50 — 14.50s (3.0s) `|` **FUNCTION** CAPABILITY 03。反向归档：html → md。建立「双向流」概念。

**[VISUAL]**

cross-dissolve 进入。前一镜的 destination card 在 11.50-11.80s 内缩小退场到右下角，新的 destination card（这次显示 markdown 源代码）从右侧入场。

新的 destination card 设计：**深底 markdown source 视图**（与 SHOT 05 的浅底 html 形成视觉对比）。

```
┌─────────────────────────────────┐
│                                  │  ← 背景 Charred #2A2620
│  # On Markdown                   │  ← Terracotta, mono 14px
│                                  │
│  An essay · 2026                 │  ← Smoke, mono 14px
│                                  │
│  > md is the source.             │  ← italic Smoke, mono 14px
│  > Anything else is **product**. │     `**product**` 高亮 mica + bold
│                                  │
│  - 1 source                      │  ← mono 14px Smoke
│  - 6 forms                       │
│  - ∞ outputs                     │
│                                  │
│  essay.md · CLEAN MARKDOWN       │  ← bottom Mono 10px Smoke
└─────────────────────────────────┘
   480×560px, Charred 底, 顶部 24° 角折是 Cinder
```

arrow direction 反向：从右侧 destination card 向左 md 字符方向（短 Terracotta 线 + 箭头 head 指向左）。label 改为「html → md」。

**关键差异点**（和 SHOT 05 形成 visual rhyme）：
- destination 在右、md 在左（同 SHOT 05）
- 但 arrow direction 反向（visual: 我们在归档/拉回来）
- card 是深底（视觉对比，强调这是 source）

**[TYPE]**

- 全卡片内部都是 JetBrains Mono 14px
- markdown 语法元素配色：`#` 标题 Terracotta，`>` 引用 italic Smoke，`**bold**` Mica + bold，列表 dash Smoke
- bottom mono 10px Smoke

**[ANIM]**

- 11.50-11.80s · 上一镜 card 退场（缩 → 右下角, fade out）+ md 字符保持
- 11.80-12.10s · arrow line 反向生长（这次从右向左, 300ms expoOut）
- 12.10s · arrow head（指向左）浮现
- 12.20-12.40s · label「html → md」入场
- 12.40-13.10s · 新 destination card 入场（同 SHOT 05 入场逻辑）
- 13.10-13.80s · markdown 内部 6 行 staggered 入场（每行 100ms delay）
  - 特殊 micro-detail：每一行入场时模拟 typewriter——line 的 character-by-character cascade reveal（让观众感觉到「这是 markdown 被「写出来」的过程」）
- 13.80-14.50s · hold

**[AUDIO]**

- BGM: 持续 L1+L2+L3 layers
- SFX: chime: capability 03 at 12.00s (-18dB)
- SFX: paper rustle (12.40s)
- SFX: 每行入场时极弱 keyboard click ticker（-26dB each, 100ms apart）

**[CHROME]**

- A: 推进到 `CAPABILITY · 03`，第三个 dot 实心
- B: ON
- C: 进度点 ● 滑到「html→md」位置
- D: ON
- E: ON

**[ANTI-SLOP]**

- ✅ 这是整支片唯一的「深底」镜头——刻意制造视觉对比，让观众知道「这是 source code」，不是「又来一个 destination」
- ✅ markdown 内部的 syntax highlighting 用的颜色不是 cyber 配色（不是 VS Code Dark+ 那种），是出版社配色（Terracotta + Smoke + Mica）
- ✅ 「essay.md · CLEAN MARKDOWN」底部小印 → pause-and-look signature
- ✅ 反向 arrow 不是「U-turn 曲线」，是直线 + 反向箭头——保持结构一致性

**[WHY]**

这一镜的真正作用不是「秀 capability 03」，是**告诉观众这条管道是双向的**。

如果整支片 6 个 capability 都是从 md 向外辐射，观众会以为「md 只是出去」。第 3 个 capability 让流动反向，建立「md 是一切的中枢」的世界观。

这是为什么 capability 顺序我选了 02 (md→html) → 03 (html→md) → 04 (md→docx) ——故意把反向 capability 卡在第 3 位，最大化「双向流」的认知 surprise。

---

## SHOT 07 · "PUBLISHER GRADE · DOCX" (md → docx)

**[TIMECODE]** 14.50 — 17.50s (3.0s) `|` **FUNCTION** CAPABILITY 04。出版社品位 docx。建立「md 不只是给程序员的」论点。

**[VISUAL]**

回到浅底，回到「md 在左、destination 在右」。

destination card 设计：**出版社级 docx 章节首页**（高密度信息，但完全克制）。

```
┌─────────────────────────────────┐
│                       ON MARKDOWN│  ← page header, right-aligned, Smoke italic mono 9px
│  CHAPTER · 01                    │  ← Terracotta mono 11px bold 0.22em
│                                  │
│  On Markdown                     │  ← Newsreader 700, 36px, Ink, lh 1.1
│  A short essay on source-of-truth│  ← Newsreader italic 14px, Smoke
│  thinking                        │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━     │  ← Terracotta full-width rule 3px
│                                  │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬       │  ← 10 lines of mica bar paragraphs
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬           │     (varied widths 76-95%)
│  ...                             │
│                                  │
│                — 1 —             │  ← page number, centered, mono 10px Smoke
└─────────────────────────────────┘
   480×580px, white card, Mica border, 24° corner fold
```

**特别细节**：
- 顶部右上角的「page header」（书名 italic 灰色 mono）是真实出版社 docx 的细节签名
- 「CHAPTER · 01」前缀让观众一眼意识到「这是一本书的一页，不是一篇文章」
- terracotta full-width rule（不是细线，而是 3px 粗 rule）是出版社章节首页的招牌
- 底部 page number「— 1 —」前后的破折号是 Newsreader 的 em-dash，不是 hyphen

**[TYPE]**

- page header: Newsreader italic 9px, Smoke, letter-spacing 0.14em
- CHAPTER · 01: JetBrains Mono Bold 11px, Terracotta, letter-spacing 0.22em
- main title: Newsreader 700, 36px, Ink, line-height 1.05
- subtitle: Newsreader italic 14px, Smoke
- terracotta rule: 3px thick, full card width
- bar paragraphs: Mica color #E6E1D6, height 6px
- page number: JetBrains Mono 10px, Smoke, letter-spacing 0.18em

**[ANIM]**

- 14.50-14.80s · 前一镜 card 退场 + md 保持
- 14.80-15.10s · arrow line 正向生长
- 15.10s · arrow head, label「md → docx」入场
- 15.30-16.10s · destination card 整体入场
- 16.10-17.00s · 内部 stagger：page header (delay 0) → CHAPTER 标 (delay 100ms) → title (delay 300ms) → subtitle (delay 500ms) → rule (delay 700ms) → 10 行段落 cascade (delay 850ms + 60ms cascade) → page number (delay 1600ms)
- 17.00-17.50s · hold

**[AUDIO]**

- BGM: 持续；at 15.00s BGM 整体 swell +2dB（暗示我们在向高潮推进）
- SFX: chime: capability 04 at 15.00s (-18dB)
- SFX: paper rustle (15.30s)

**[CHROME]**

- A: `CAPABILITY · 04`, 第四个 dot 实心
- B/C/D/E: ON

**[ANTI-SLOP]**

- ✅ 不写「这是一本书的内页 mockup」的解释字（让排版自己说话）
- ✅ bar paragraphs 用 Mica（#E6E1D6）这种极淡灰色，不是黑色——给「这是排版样式预览，不是真内容」的诚实信号
- ✅ pause-and-look signature：顶部 right-aligned page header italic mono——99% 的观众不会看，1% 的设计师看到会知道「这家做了功课」
- ✅ 这一镜是 6 个 capability 里色彩最饱和的（Terracotta 占了 page rule + chapter label + 顶部右 chrome counter）——刚好在故事弧的中段，符合「向高潮 build-up」的曲线

**[WHY]**

CAPABILITY 04 是承上启下的关键一镜：
- 它确认了「md 不只是 web 用」——它能做出版社级别的 docx
- 它建立了「印刷品」的视觉语境，为 SHOT 08（pdf）和 SHOT 09（epub）做准备

观众看完这一镜，对「md → 印刷品」这条链条 ready。接下来两镜的 NEW 标签就有了承接。

---

## SHOT 08 · "★ NEW · PRINT" (md → pdf)

**[TIMECODE]** 17.50 — 20.50s (3.0s) `|` **FUNCTION** CAPABILITY 05。**NEW**。md → 出版级 PDF。第一次「升级」标志亮起。

**[VISUAL]**

cross-dissolve 进入。这一镜的视觉强度**显著高于** SHOT 05-07——因为这是「新东西」，需要被记住。

视觉差异点：
1. **NEW 标签**：top-left 在 capability counter 旁边亮起一个 Terracotta 矩形框，内含「★ NEW」字符（JetBrains Mono Bold 13px, Terracotta, letter-spacing 0.22em，4px Terracotta border, 6px×12px padding）
2. **destination 不是单一卡片，是两张 PDF fan 出来**：A4 在后面（轻微 +5° 旋转），大32开（176×240mm，国内纸质书规格）在前面（轻微 -3° 旋转），形成「两个 page-size 都支持」的视觉
3. **每张 PDF 上有「印刷裁切标记」（crop marks）**——四角各一个 L 型小线，2px 粗，Smoke 色——这是真正印厂 PDF 的细节
4. arrow + label 配色全部用 Terracotta（不是 Ink），整体配色更暖

**两张 PDF 内容**：

PDF A（A4, 后面）：

```
┌──────────────────────────┐
│ ┌                      ┐ │  ← crop marks
│  A4 · 210×297mm           │  ← Mono Bold 10px Terracotta
│  ─── (Terracotta rule)    │
│  On Markdown              │  ← Newsreader 22px
│  ──────────────────       │
│  ▬▬▬▬▬▬▬▬▬▬▬             │  ← 7 lines mica bars
│  ▬▬▬▬▬▬▬▬▬▬▬▬            │
│  ...                      │
│                           │
│ └                      ┘ │  ← crop marks
└──────────────────────────┘
   360×460px, white card, +5° rotation
```

PDF B（大32开，前面）：

```
┌────────────────────┐
│ ┌                ┐ │  ← crop marks
│  大32开 · 176×240mm│  ← Mono Bold 10px Terracotta
│  ───                │
│  On Markdown        │  ← Newsreader 19px
│  ──────────         │
│  ▬▬▬▬▬▬▬▬▬▬        │  ← 6 lines mica bars
│  ...                │
│ └                ┘ │
└────────────────────┘
   290×410px, white card, -3° rotation
```

**[TYPE]**

- NEW 标签：Mono Bold 13px Terracotta, 0.22em letter-spacing, 1.5px Terracotta border
- arrow label「md → pdf」：Mono Bold 14px Terracotta, 0.14em
- PDF spec labels (A4 · 210×297mm 等)：Mono Bold 10px Terracotta, 0.2em
- chapter titles inside PDFs：Newsreader 600 weight, 19-22px, Ink

**[ANIM]**

- 17.50-17.80s · 前一镜 card 退场 + md 保持
- 17.70s · **NEW 标签亮起**（特殊处理：scale 0.8 → 1.1 → 1.0 over 400ms with overshoot easing；同时一道极弱 terracotta glow 短暂 pulse 然后消失）
- 17.80-18.10s · arrow + label 入场（这次用 Terracotta accent，强调「这是 NEW」）
- 18.20-18.60s · PDF B（前面那张）入场（400ms expoOut, scale 0.85 → 1 + 顺时针 -8° → -3°）
- 18.50-18.90s · PDF A（后面那张）紧随入场（400ms expoOut, scale 0.85 → 1 + 顺时针 0° → +5°，stagger delay 300ms）
- 18.90-19.70s · 两张 PDF 内部 cascade staggered 入场
- 19.70s · 4 个 crop marks（PDF B 的）依次出现（80ms cascade，给「印厂工艺」的细节签名）
- 19.70-20.50s · hold

**[AUDIO]**

- BGM: percussion pulse L4 加入 at 18.00s (-32dB)（极弱 sub-kick 4/4 节奏建立）
- **SFX: chime: NEW (05) at 17.70s（double chime + soft glow + reverb tail, -14dB）** ← 这是整支片最重要的 SFX cue 之一
- SFX: paper rustle × 2（每张 PDF 入场时，-22dB each）
- SFX: subtle "ink stamp" at 19.70s（crop marks 出现时, -22dB）

**[CHROME]**

- A: `CAPABILITY · 05`, 第五个 dot 实心
- A 旁边新增 NEW 标签
- B: ON, 此时 version chip 旁的橙点同步 pulse（强调「v2.0 新增」）
- C: 进度点 ● 滑到「md→pdf」位置, 这个位置的文字字号加大 0.5px 强调
- D: ON
- E: ON

**[ANTI-SLOP]**

- ✅ NEW 标签不是 emoji 不是 sticker——是 typographic mark（mono + 0.22em + ★ + border）
- ✅ 两张 PDF 不是「叠在一起」的廉价 stacking，是 fan + 旋转（暗示「打开看」的物理动作）
- ✅ crop marks 是真正印厂术语的视觉表达，pause 时能看到「啊这是 print-ready」
- ✅ 没用 glow 或 particle 来强调「NEW」——靠 typography 和 SFX 自己说话
- ✅ pause-and-look signature：PDF B 顶部的「大32开 · 176×240mm」中英混排，是花叔生态对国内纸质书规格的尊重

**[WHY]**

这是 ACT II 高潮镜之一。两件事必须同时发生：
1. 观众必须 immediate 意识到「这是新功能」
2. 必须用视觉细节说明「这不是凑数的 wkhtmltopdf 包装，是真正出版级」

NEW 标签 + crop marks + 两张 PDF fan + 完整的 A4 / 大32开规格说明——四件事一起做到上面两件。

下一镜的 epub 是双 NEW 镜头里的第二个，节奏感、情绪强度要比这一镜再上一档。

---

## SHOT 09 · "★ NEW · EBOOK" (md → epub)

**[TIMECODE]** 20.50 — 22.50s (2.0s) `|` **FUNCTION** CAPABILITY 06。**NEW**。md → 标准 EPUB3。第二个新功能。最后一个 capability。

**[VISUAL]**

cross-dissolve 进入。这一镜的镜头时长**比前面短**（只 2.0s 而不是 3.0s）——因为我们已经建立了「NEW + destination」的模式，第二次出现观众秒懂，节奏可以加速。

destination card 设计：**Apple Books 风的 EPUB reader frame**（强调「这本书已经在阅读器里了」的现实感）。

```
   ╔════════════════════════════════════╗
   ║ ● ● ●                              ║  ← window chrome (Apple Books)
   ╠════════════════════════════════════╣
   ║                                    ║
   ║  HUASHU · ORANGE BOOK              ║  ← Mono Bold 10px Terracotta 0.22em
   ║                                    ║
   ║                                    ║
   ║  On                                ║  ← Newsreader 700, 30px, Ivory paper
   ║  Markdown                          ║     (on Charred bg)
   ║                                    ║
   ║  ───                               ║  ← Terracotta rule 40×2px
   ║                                    ║
   ║  an essay · 花叔                   ║  ← italic 14px Smoke on Charred
   ║                                    ║
   ╠════════════════════════════════════╣
   ║ Apple Books · 1 of 24    EPUB 3   ║  ← Mono 10px Smoke 0.14em
   ╚════════════════════════════════════╝
   460×470px, ivory paper outer + Charred inner book cover area
   2px Ink border, 22px border-radius (modern app frame)
```

**关键视觉差异**：
- 整体 frame 是「macOS app 窗口」感（三个圆点 + 圆角 22px）
- 中间是「打开的电子书」cover area（Charred 底 + 出版社品位的 typography）
- 底部是「Apple Books · 1 of 24」reader chrome
- 整张 card 给人「我在 Apple Books 里读这本书」的现实感

**[TYPE]**

- HUASHU · ORANGE BOOK：Mono Bold 10px, Terracotta, 0.22em
- book title (On Markdown)：Newsreader 700, 30px, Ivory (on Charred bg), line-height 1.0
- terracotta rule：40×2px
- author italic：Noto Serif SC italic 14px, Smoke
- Apple Books chrome：Mono 10px, Smoke, 0.14em

**[ANIM]**

- 20.50-20.80s · 前一镜 PDF 退场 + md 保持
- 20.70s · NEW 标签**保持亮起**（这次不重新弹出，因为已经在 SHOT 08 建立了——直接显示「★ NEW」即可）
- 20.80-21.10s · arrow + label「md → epub」入场（Terracotta accent，同 SHOT 08）
- 21.20-21.80s · EPUB destination card 整体入场（600ms expoOut, scale 0.88 → 1）
- 21.30-22.00s · 内部 staggered：window chrome dots (delay 0) → 顶部 brand label (delay 200ms) → book title 「On」(delay 400ms) → 「Markdown」(delay 480ms) → rule (delay 700ms) → author italic (delay 850ms) → bottom chrome (delay 1000ms)
- 22.00-22.50s · hold + 准备 transition 到 ACT III

**[AUDIO]**

- BGM: percussion 持续，但 at 22.00s 整体 BGM swell +3dB（为 SHOT 10 的 convergence build-up）
- **SFX: chime: NEW (06) at 20.70s（double chime + soft glow，比 SHOT 08 高半个音, -14dB）**——半音差让两个 NEW 镜头形成 musical relationship
- SFX: window chrome subtle "click" at 21.20s（macOS 窗口出现感, -24dB）
- SFX: page turn rustle at 21.40s

**[CHROME]**

- A: `CAPABILITY · 06`, 第六个 dot 实心（**全部实心 — 6/6**）
- A 旁边 NEW 标签持续
- B: 版本 chip 的橙点 pulse 加强（amplitude × 1.5）
- C: 进度点 ● 抵达最右端「md→epub」位置
- D: ON
- E: ON

**[ANTI-SLOP]**

- ✅ 不画 Kindle 或 Apple Books 的真 logo（避免 IP 风险）；用 macOS 窗口 chrome 暗示「阅读器」即可
- ✅ 没用 e-ink 灰色滤镜（避免 Kindle slop）
- ✅ 「Apple Books · 1 of 24」chrome 是真实出版数据感（24 章节，第 1 章）
- ✅ pause-and-look signature：书名 「On / Markdown」**断行**——Newsreader 在 30px 大字号下的换行设计，致敬 Penguin Classics 封面排版

**[WHY]**

这一镜是 ACT II 的收尾。两件事必须完成：
1. 6 个 capability 全部展示完毕（counter 6/6 实心）
2. 情绪开始向 ACT III 的高潮 build-up

镜头长度从 3.0 → 2.0s 是刻意的——节奏在加速，观众感知到「我们要到顶峰了」。

---

## SHOT 10 · "THE CONVERGENCE"

**[TIMECODE]** 22.50 — 24.00s (1.5s) `|` **FUNCTION** ACT II → ACT III 的过渡。所有元素归位。准备 slogan。

**[VISUAL]**

22.50s：所有之前的 destination card 已退场。Chrome A/C 开始 fade out（capability counter 已 6/6 完成，使命达成）。

画面中央，md 字符从左侧位置（x=480）滑回正中（x=960），同时尺寸从 220px → 300px。

md 周围的 6 个 capability label（any→md / md→html / html→md / md→docx / md→pdf / md→epub）从远处（圆周 r=380px）逐个浮现，环绕 md 字符成圆形，每 60° 一个，按顺时针顺序排列（顶部从「any→md」开始）。这些 label 是 Mono Bold 14px Smoke（非 active）+ Terracotta（actually new）的 mix。

整体效果：**md 字符是太阳，6 个 capability 是行星。**

但这一镜不需要让观众停留太久——这是过渡镜。

23.50-24.00s：6 个 capability label 缓慢 fade out（200ms 每个，inverse cascade），md 字符继续保持在中央，缩小到 180px，准备让位给 slogan。

**[TYPE]**

- 6 个 capability label：JetBrains Mono Bold 14px, letter-spacing 0.16em
  - 前 4 个（any→md / md→html / html→md / md→docx）：Smoke
  - 后 2 个（md→pdf / md→epub）：Terracotta

**[ANIM]**

- 22.50-22.80s · 上一镜 EPUB card 退场，Chrome A/C fade out（300ms linear）
- 22.50-23.00s · md 字符滑回中央 + 放大（500ms expoOut）
- 22.80-23.40s · 6 个 capability label 从 md 周围浮现（每个 60° 位置，r=380px，stagger 80ms each, fade-in 300ms + 微 outward slide 20px）
- 23.40-23.80s · hold（6 个 label 在 md 周围 settle）
- 23.80-24.00s · 6 个 label 同时 fade out（200ms linear），md 字符缩小到 180px（200ms expoOut）

**[AUDIO]**

- BGM: at 23.00s, all-layer swell 开始（L1+L2+L3+L4 → +4dB）
- BGM: at 23.50s, percussion 短暂停顿 1 拍（给 sudden silence 的张力）
- SFX: 6 个 capability label 入场时极弱「click」（-30dB each, staggered）
- SFX: 23.50s 开始 ascending sweep（build-up 到 24.00s）

**[CHROME]**

- A: fade out at 22.50s（counter 已 6/6，使命完成）
- B: ON, 但开始为 ACT III 准备过渡（保持位置不变，但内部 spacing 略微 tighten）
- C: fade out at 22.50s
- D: ON
- E: ON

**[ANTI-SLOP]**

- ✅ 6 个 capability label 不是「围着 md 转一圈」（避免「行星 spinner」的 cyber slop）；是「在固定位置 settle，然后一起 fade」（更克制）
- ✅ Chrome A/C 在使命完成后体面退场（不是「永远在画面上」），这是「为下一幕让位」的好习惯
- ✅ pause-and-look signature：23.40s 时 6 个 label 同时在画面上，按顺时针顺序读，是这部片唯一的「全 capability 全景」一帧——观众如果暂停在此处，能完整看到 6 条管道——这是 marketing 截图的最佳 frame

**[WHY]**

这是一座桥。

ACT II 结束在 22.50s（NEW (06) 刚做完），但 slogan 还需要在 24.00s 才入场——中间这 1.5s 不能是「空白等待」，必须有 narrative motion。

「convergence」的概念：6 条管道做完后，所有 capability 收拢回 md 这个源头。这正是这支片整个故事的 essence——**所有的流，最终都回到源**。

下一镜，让位给 slogan。md 字符缩小到 180px，准备成为 slogan 的「品牌印章」。

---

## SHOT 11 · "ONE SOURCE."

**[TIMECODE]** 24.00 — 26.50s (2.5s) `|` **FUNCTION** ACT III peak first half。slogan 上行入场。情绪 climax。

**[VISUAL]**

md 字符已缩小到 180px，停留在画面中央（y=540）。

24.00s：md 字符**继续向画面 top-left 滑动**到 (x=128, y=88)，缩小到 56px——成为「品牌印章」固定在左上角。这是品牌的归位。

24.20s：画面中央偏上（y=460）开始浮现 hero slogan top line：

```
ONE SOURCE.
```

字体：Newsreader 700, **168px**, letter-spacing -0.03em, line-height 0.95, Ink #1A1A1A
位置：水平居中（x=960），y=460（character baseline）

入场方式：**staggered letter reveal**——10 个字符（O-N-E-space-S-O-U-R-C-E-.）按 30ms stagger 依次入场，每个字符 fade + 12px y slide-down + scale 0.92 → 1.0（260ms expoOut each）。

26.00s：在 slogan 下方 30px 出现一条短 Terracotta rule（320×3px），从中央向两端展开（300ms expoOut）。

26.50s：进入下一镜。

**[TYPE]**

- ONE SOURCE.：Newsreader 700, 168px, Ink, letter-spacing -0.03em, line-height 0.95
- terracotta rule: 320×3px, centered, accent

**[ANIM]**

- 24.00-24.30s · md 字符滑到 top-left（300ms expoOut，size 180 → 56）
- 24.20s · ONE SOURCE. 第一个字符 'O' 入场（260ms expoOut）
- 24.23s · 'N' 入场
- 24.26s · 'E' 入场
- 24.29s · space（无视觉，但 layout 占位）
- 24.32s · 'S'
- 24.35s · 'O'
- 24.38s · 'U'
- 24.41s · 'R'
- 24.44s · 'C'
- 24.47s · 'E'
- 24.50s · '.'（句点）
- 24.20-25.00s · 整个 ONE SOURCE. 完成（10 字符 × 30ms stagger + 260ms each = total ~560ms）
- 25.00-26.00s · hold（让观众读「ONE SOURCE.」）
- 26.00-26.30s · Terracotta rule 出现（300ms expoOut from 0 → 320px）
- 26.30-26.50s · hold

**[AUDIO]**

- BGM: 22.00s 开始的 swell 在 24.50s 达到 peak（最响 -6dB）
- BGM: 整组弦乐进入（L5），cello + violin + viola 三层叠加
- **SFX: impact (slogan ONE) at 24.20s — deep bass impact + short reverb tail (-8dB)** ← 这是这支片最强的 SFX cue
- SFX: 极轻的 pen-on-paper stroke at 26.00s（rule 出现时, -22dB）

**[CHROME]**

- A: OFF (已退场)
- B: ON, 但**重要变化**：version chip 此时 cross-dissolve 成新形态——在右上角的同位置，但 chip 的尺寸略大，字号 18px（之前 16px），更突出。同时 Terracotta dot 的 pulse amplitude × 2（强调「v2.0 升级时刻」）
- C: OFF (已退场)
- D: ON
- E: ON

**新增 chrome**：
- md 字符（top-left, 56px, Newsreader 600 + Terracotta dot）正式入驻 corner，成为品牌印章

**[ANTI-SLOP]**

- ✅ slogan 不是「整词 fade-in」（廉价），是 letter-by-letter stagger（电影级）
- ✅ 单字符的 stagger 时间 30ms 是经过计算的——足够看到 cascade，但不会拖慢节奏（如果 60ms 就会显慢）
- ✅ 字号 168px 是经过 layout 验证的——再大会撞 SIX FORMS.（SHOT 12），再小则气势不够
- ✅ pause-and-look signature：「ONE SOURCE.」末尾的「.」是 Terracotta（不是 Ink），呼应 hero md 字符的 Terracotta dot——首尾品牌签名一致

**[WHY]**

这是 emotional climax 的第一半。

「ONE SOURCE.」是这部片的 thesis。如果观众看完整支片只记住一句话，就是这一句。

让 md 字符在此刻退到 top-left 是策略性的——slogan 是主角，md 是品牌印章。两者不抢戏。

下一镜，SIX FORMS. 落下，thesis 完整。

---

## SHOT 12 · "SIX FORMS."

**[TIMECODE]** 26.50 — 29.00s (2.5s) `|` **FUNCTION** ACT III peak second half。slogan 下行 + capability map 完整呈现。整支片的 emotional resolution。

**[VISUAL]**

26.50s：ONE SOURCE. 仍在画面上方位置（y=460）。

画面下半部分（y=720）开始入场 hero slogan bottom line：

```
SIX FORMS.
```

字体：Newsreader 700, 168px, letter-spacing -0.03em, line-height 0.95, **Terracotta #C2410C**
位置：水平居中（x=960），y=720（character baseline）

入场方式：与 SHOT 11 镜像——staggered letter reveal，9 个字符 + 1 个 .（共 10），每个 30ms stagger（更慢的 stagger 因为这是 climax）。

入场细节：每个字符是 fade + 12px y **slide-up**（而不是 SHOT 11 的 slide-down，方向对称）+ scale 0.92 → 1.0（260ms expoOut each）。

27.20s：SIX FORMS. 完成，整个 slogan 双行 typography 完整。

27.20-27.80s：在 SIX FORMS. 下方 30px 处，出现 6 个 capability pills，依次入场：

```
[any→md] [md→html] [html→md] [md→docx] [md→pdf ★NEW] [md→epub ★NEW]
```

每个 pill：
- 字体：JetBrains Mono Bold 14px, letter-spacing 0.16em
- 大小：10px×18px padding, 1.5px border
- 前 4 个：Ink text + Ink border + transparent background
- 后 2 个（NEW）：Terracotta text + Terracotta border + Mist (#FFF7F0) background + 右上角 -8/-10px 处 Terra Hot 「NEW」mini badge

每个 pill 间距 14px。整组水平居中（x=960），y=820。

入场：从左到右 staggered，每个 80ms delay，fade-in + 4px y slide-up (300ms expoOut)。

27.80-28.30s：副标行入场（y=890）：

```
md 是源代码，万物是产物。
```

字体：Noto Serif SC italic 26px, Ink, letter-spacing 0.04em
水平居中。

入场：fade-in + 8px y slide-up (400ms expoOut)。

28.30-29.00s：整体 hold。这是这部片最静态的一帧——所有元素到位，让观众"读完它"。

**[TYPE]**

- SIX FORMS.：Newsreader 700, 168px, Terracotta, letter-spacing -0.03em, line-height 0.95
- pills：JetBrains Mono Bold 14px, letter-spacing 0.16em, 1.5px border
- 副标：Noto Serif SC italic 26px, Ink, letter-spacing 0.04em

**[ANIM]**

- 26.50-27.20s · SIX FORMS. 字符 stagger（同 SHOT 11 镜像）
- 27.20-27.30s · short hold
- 27.30-27.80s · 6 pills cascade（每 80ms stagger × 6 = 480ms total + 300ms each pill duration）
- 27.80-28.30s · 副标入场（400ms）
- 28.30-29.00s · 整体 hold

**[AUDIO]**

- BGM: 26.50s peak swell 持续，至 27.20s 达到全片最响（-4dB）
- BGM: 27.20s 后 BGM 开始 sustain（不再增强，但保持 peak intensity）
- **SFX: impact (slogan SIX) at 26.50s — deep bass impact，比 ONE 镜的 impact 稍重半音 (-7dB)**
- SFX: 6 个 pills 入场时 staggered metallic clicks（每个 -24dB, 50ms）
- SFX: 27.80s 极轻 pen flourish（副标入场）

**[CHROME]**

- B: ON, version chip 持续
- D: ON, watermark 持续
- E: ON
- md 印章 (top-left): ON

**[ANTI-SLOP]**

- ✅ ONE SOURCE. 是 Ink, SIX FORMS. 是 Terracotta——分别代表「源」和「物」的色彩对比，不是装饰用色
- ✅ 6 pills 中 NEW 那两个 background 是 #FFF7F0（极淡 mist tint），不是「橙色填充」——克制
- ✅ NEW mini badge 在 pill 的右上角 -8/-10px 突出位置，但只有 9px 字号——细节签名的标准位置
- ✅ 副标用「，」中文逗号 + 句号「。」——是中文排版的尊重
- ✅ 这一帧（28.30s）是这支片的「marketing 用最完整一帧」——可以截图作为 thumbnail / X 海报 / 公众号封面图，所有信息都在一帧里：slogan + 6 capability + 副标 + 品牌印章 + version

**[WHY]**

这是 resolution 镜。

如果 SHOT 11 是 thesis（ONE SOURCE.），SHOT 12 就是 antithesis + synthesis（SIX FORMS. 加上完整 capability map）。

观众在这一帧 27.50s 时，应该一边听着弦乐 peak，一边视觉上 fully absorbed by typography——这是这部片最值得的 5 秒。

下一镜是收尾，让弦乐 decay，让 md 印章独自闪耀。

---

## SHOT 13 · "SIGN-OFF"

**[TIMECODE]** 29.00 — 30.00s (1.0s) `|` **FUNCTION** 结尾。让所有 slogan 元素退场，留下 md 印章独自闪耀。品牌印记。

**[VISUAL]**

29.00s：SIX FORMS. + 6 pills + 副标开始 hold-in-place。

29.20-29.60s：ONE SOURCE. + SIX FORMS. + 6 pills + 副标缓慢 fade out（每个 400ms linear，**不要 stagger**，是同步淡出——形成「画面在沉淀」的感觉）。

29.40s：top-left 的 md 印章字符从 56px 缓慢放大到 88px，同时位置从 (128, 88) 滑向画面中央 (960, 540)——这是 md 的「最后回归」。

29.40-29.80s：md 字符在画面中央 settle，size 88px, color Ink + Terracotta dot。

29.80-30.00s：md 字符下方 30px 出现一条短 Terracotta rule（120×2px，比 SHOT 03 短，更精致），从 0 长成。

30.00s：所有元素到位。最后一帧是：

```
                                                                  ● HUASHU-MD-HTML · v2.0
                                                                                              (top-right chrome)


                                            md.                   ← Newsreader 600, 88px, Ink + Terracotta dot
                                          ───                     ← Terracotta rule, 120×2px

                                                                                CREATED BY HUASHU-DESIGN
                                                                                              (bottom-right watermark)
```

整个画面只有 4 个元素：md 印章、accent rule、top-right chrome、bottom-right watermark。所有其他全空。

**[TYPE]**

- md.：Newsreader 600, 88px, Ink + Terracotta dot
- accent rule: 120×2px Terracotta

**[ANIM]**

- 29.00-29.20s · 上一镜 hold（让观众完整吸收）
- 29.20-29.60s · ONE SOURCE. + SIX FORMS. + 6 pills + 副标同步 fade out（400ms linear, 同步）
- 29.40-29.80s · md 印章放大 + 滑到中央（400ms expoOut, size 56 → 88, position (128,88) → (960,540)）
- 29.80-30.00s · accent rule 展开（200ms expoOut, 0 → 120px）
- 30.00s · final hold（如果有 loop，loop 回 00.00s）

**[AUDIO]**

- BGM: 29.00s 开始 decay 进入 L6（全部 layers 渐弱）
- BGM: 29.40s 弦乐 fade，留下 piano + reverb tail
- BGM: 30.00s, 一切归于 silence + room tone
- **SFX: final stamp / sign-off at 29.40s（ink stamp + soft reverb, -14dB）**——md 落到中央时
- SFX: 极轻 paper rustle at 29.80s（accent rule 入场）

**[CHROME]**

- B: ON, 持续
- D: ON, 持续
- E: ON, 持续
- 其他全部 OFF

**[ANTI-SLOP]**

- ✅ 不用「Thank you」「Made with love」之类 sign-off 文字（廉价）
- ✅ 不用 logo 大放大（不需要）
- ✅ md 印章是这支片整个故事的真正主角，最后让它独自留在画面中央，是 resolution 的最简形式
- ✅ pause-and-look signature：最后一帧的 md. 在 88px Newsreader 字体下，Terracotta dot 是整个画面的视觉焦点——观众的眼睛会自然停留在这个 dot 上，然后看到下方的 accent rule，再到 top-right 的 version chip。这条「视线动线」是 visual hierarchy 设计的成功
- ✅ silence 在最后 0.2s 给画面留 breathing room

**[WHY]**

整部片始于一个空白页面，终于一个 md 印章 + 一抹赤陶橙。

这是首尾呼应（visual rhyme）：
- 0.0s：blank ivory page（空）
- 30.0s：ivory page + md（满）

观众从「空」走到「满」，但「满」其实只是一个 `md.` 字符——这就是「source-of-truth」的视觉宣言：**一切源于一个简单的 md。**

如果整部片让观众记住一帧，我希望是这一帧。

---

# Part V · Production Manifest

## 5.1 字体清单 + 加载方式

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```

**实测加载时长**：约 800-1500ms 取决于 CDN 状态。`document.fonts.ready` 等待必须等到 returns true 才启动 Stage 计时器（Stage 已实现）。

## 5.2 色板 CSS 变量

```css
:root {
  --paper:       #FAFAF6;
  --mist:        #F2EDE4;
  --mica:        #E6E1D6;
  --smoke:       #6B6B6B;
  --cinder:      #3D3530;
  --ink:         #1A1A1A;
  --charred:     #2A2620;
  --terracotta:  #C2410C;
  --terra-hot:   #E55D21;
  --terra-deep:  #8B2D08;
}
```

## 5.3 BGM 来源选择标准

**首选**：自己用 Suno v6.0 / Udio v1.5 生成 30 秒 cinematic minimal piece，prompt 关键词：

```
minimal cinematic piano, slow tempo 60bpm, single piano notes,
sparse arpeggio, low cello drone, subtle sub-kick percussion,
swelling strings at climax, decay to silence,
in the style of Max Richter on the nature of daylight,
no vocals, 30 seconds duration, ivory paper mood
```

**备选**：搜索免版权库
- artlist.io: "minimal cinematic"
- bensound.com: "cinematic"
- musicbed.com: "Jóhann Jóhannsson style"

**最低标准**：BGM 30 秒长度，44.1kHz 采样率，aim for -16 LUFS integrated loudness。

## 5.4 SFX 来源

**首选**：用 huashu-design skill 的 `assets/sfx/<category>/*.mp3` 37 个预制资源：

```
事件                          推荐 SFX 文件
─────────────────────────────────────────────────────
keyboard clicks            sfx/ui/keyboard-click-*.mp3
cursor blink               sfx/ui/tick-soft.mp3
md morph swell             sfx/cinematic/whoosh-bloom.mp3
file card whoosh           sfx/cinematic/whoosh-short-*.mp3
absorb / ink drop          sfx/foley/ink-drop.mp3
paper rustle               sfx/foley/paper-turn.mp3
chime capability           sfx/melodic/chime-single-*.mp3
chime NEW (double)         sfx/melodic/chime-double-warm.mp3
build sweep                sfx/cinematic/ascending-sweep.mp3
impact (slogan)            sfx/cinematic/deep-impact-*.mp3
pen flourish               sfx/foley/pen-stroke.mp3
final stamp                sfx/foley/ink-stamp.mp3
```

## 5.5 截图验证计划

实施 HTML 后必须验证以下关键帧（用 Playwright + `?t=NN` URL 参数）：

```
t=0.5    ← SHOT 01 mid: blank ivory page (检验 paper texture 不抢戏)
t=2.5    ← SHOT 02 mid: typing in progress (检验 cursor blink + JetBrains Mono)
t=3.8    ← SHOT 03 mid: md morphing (检验 ghost residual + scale curve)
t=5.0    ← SHOT 03 end: hero md settled (检验 480px + Terracotta dot)
t=7.0    ← SHOT 04 mid: cards in flight (检验抛物线 + card 内容真实可读)
t=8.4    ← SHOT 04 tagline (检验「万物 → md」中文 italic)
t=10.5   ← SHOT 05 mid: html card complete (检验 essay 内容可读)
t=13.5   ← SHOT 06 mid: md source visible (检验 syntax highlighting)
t=16.5   ← SHOT 07 mid: docx page complete (检验 chapter title + page number)
t=19.0   ← SHOT 08 mid: PDFs fanned out (检验 crop marks 可见)
t=21.5   ← SHOT 09 mid: EPUB frame complete (检验 Apple Books chrome)
t=23.4   ← SHOT 10 mid: 6 capability orbit (检验完整 capability 全景)
t=25.0   ← SHOT 11 mid: ONE SOURCE. complete (检验字距 + Terracotta period)
t=27.5   ← SHOT 12 mid: SIX FORMS. + pills (检验完整 slogan 双行)
t=28.5   ← SHOT 12 marketing frame (检验整体 marketing-ready 一帧)
t=29.9   ← SHOT 13 final hold (检验 md 印章 + accent rule)
```

每帧必须满足：
- 没有元素溢出 1920×1080 canvas
- 字距、行高 visually correct
- 反 AI slop checklist 通过
- 关键 typography 细节（如 Terracotta dot, page number em-dash, chapter title small caps）可识别

## 5.6 录制参数

```bash
node scripts/render-video.js \
  --file file:///path/to/v5-six-forms.html \
  --duration 30 \
  --fps 25 \
  --width 1920 \
  --height 1080 \
  --out v5-final-silent.mp4
```

**关键 codec 参数**：
- video codec: libx264
- pixel format: yuv420p (兼容性)
- bitrate: 12 Mbps (high quality, 30s 文件约 45MB)
- profile: high
- preset: slow (quality > speed)

**后续插帧**（可选，60fps 流畅版）：

```bash
bash scripts/convert-formats.sh v5-final-silent.mp4 --fps 60
```

## 5.7 音频混合

```bash
# Step 1: 加 BGM
bash scripts/add-music.sh v5-final-silent.mp4 \
  --bgm assets/bgm/cinematic-minimal-30s.mp3 \
  --bgm-volume -18dB \
  --out v5-with-bgm.mp4

# Step 2: 加 SFX cues (按 Part II.6 SFX 字典逐 cue 加)
# 用 ffmpeg 的 -filter_complex amix 多路混合
ffmpeg -i v5-with-bgm.mp4 \
  -i assets/sfx/ui/keyboard-click-1.mp3 \
  -i assets/sfx/ui/keyboard-click-2.mp3 \
  ... \
  -filter_complex "[1]adelay=500|500[s1];[2]adelay=550|550[s2];...;[0][s1][s2]...amix=inputs=N:duration=longest:dropout_transition=0[out]" \
  -map 0:v -map "[out]" \
  -c:v copy -c:a aac -b:a 192k \
  v5-final.mp4

# Step 3: 验证 audio stream
ffprobe -i v5-final.mp4 -show_streams -select_streams a 2>&1 | grep -E "(codec_type|sample_rate|channels|duration)"
```

**期望输出**：
- audio codec: aac
- sample rate: 44100Hz or 48000Hz
- channels: 2 (stereo)
- duration: 30.0s

## 5.8 交付物清单

```
v5-final.mp4              主交付（30s, 1920×1080, 25fps, with audio, ~50MB）
v5-final-60fps.mp4        高帧率版（60fps 插帧, ~80MB, 用于 X / YouTube）
v5-final.gif              社交媒体版（30s, palette 优化, < 8MB, 用于公众号嵌入）
v5-final-silent.mp4       静音版（备份，方便后续重新配音/换 BGM）
v5-poster.png             海报版（截 t=28.5s 这一帧, 用于 X 卡片 / 公众号封面）
v5-director-notes.md      本文档（导演笔记）
v5-six-forms.html         源文件（HTML 动画）
v5-shot-list.csv          shot 时间码 + 关键参数对照表（pause 验证用）
```

## 5.9 全链路时间估算

| 步骤 | 预计耗时 |
|-----|----------|
| Director's notes 撰写 | 已完成 |
| HTML 动画实施 | 4-6 小时 |
| 关键帧截图 + 视觉校验 | 1 小时 |
| 录制无声 MP4 | 5-10 分钟（含 Playwright 启动） |
| BGM 生成 / 选择 | 30 分钟 |
| SFX 配 cue + 混音 | 2-3 小时 |
| GIF 派生 | 5 分钟 |
| 海报截图 + 命名 | 10 分钟 |
| 最终交付 + git 提交 | 10 分钟 |
| **合计** | **8-11 小时** |

---

# 附录 · 这部片的 first principle

如果我作为导演只能保留这部片的一句话，那就是：

> **一支关于「源头」的 typographic film，主角是一个 `md.` 字符。**

所有其他设计决策——色板、字体、节奏、SFX、chrome、anti-slop checklist——都从这一句话推导而来。

如果某个具体决策无法 trace 回这一句话，就不要做。

---

*Director's notes — end of document*
*Total word count: 约 11500 中文字*
*Next: 用户 review 通过后，进入 HTML 实施阶段*
