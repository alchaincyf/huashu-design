# Apple Gallery Showcase · 画廊展示墙动画风格

> 灵感来源：Claude Design 官网 hero 视频 + 苹果产品页「作品墙」式陈列
> 实战出处：huashu-design 发布 hero v5
> 适用场景：**产品发布 hero 动画、skill 能力演示、作品集展示**——任何需要把「多件高质量产出」同时展陈并引导观众注意力的场景

---

## 触发判断：什么时候用这个风格

**适合**：
- 有10张以上真实产出要同屏展示（PPT、App、网页、信息图）
- 观众是专业受众（开发者、设计师、产品经理），对「质感」敏感
- 希望传递的气质是「克制、展览式、高级、有空间感」
- 需要焦点和全局同时存在（看细节但不失整体）

**不适合**：
- 单产品聚焦（用 frontend-design 的产品 hero 模板）
- 情绪向/故事性强的动画（用时间轴叙事模板）
- 小屏幕 / 竖屏（倾斜视角在小画面上会糊）

---

## 核心视觉 Token

```css
:root {
  /* 浅色画廊调板 */
  --bg:         #F5F5F7;   /* 主画布底 — 苹果官网灰 */
  --bg-warm:    #FAF9F5;   /* 温暖米白变体 */
  --ink:        #1D1D1F;   /* 主字色 */
  --ink-80:     #3A3A3D;
  --ink-60:     #545458;
  --muted:      #86868B;   /* 次级文字 */
  --dim:        #C7C7CC;
  --hairline:   #E5E5EA;   /* 卡片1px边框 */
  --accent:     #D97757;   /* 赤陶橙 — Claude brand */
  --accent-deep:#B85D3D;

  --serif-cn: "Noto Serif SC", "Songti SC", Georgia, serif;
  --serif-en: "Source Serif 4", "Tiempos Headline", Georgia, serif;
  --sans:     "Inter", -apple-system, "PingFang SC", system-ui;
  --mono:     "JetBrains Mono", "SF Mono", ui-monospace;
}
```

**关键原则**：
1. **绝不用纯黑底**。黑底会让作品看起来像电影、不像「可以被采用的工作成果」
2. **赤陶橙是唯一色相accent**，其他全部是灰阶 + 白
3. **三字体栈**（serif英+serif中+sans+mono）营造「出版物」而非「互联网产品」的气质

---

## 核心布局模式

### 1. 悬浮卡片（整个风格的基本单元）

```css
.gallery-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 6px;                          /* 内边距是「装裱纸」 */
  border: 1px solid var(--hairline);
  box-shadow:
    0 20px 60px -20px rgba(29, 29, 31, 0.12),   /* 主阴影，软且长 */
    0 6px 18px -6px rgba(29, 29, 31, 0.06);     /* 第二层近光，制造浮感 */
  aspect-ratio: 16 / 9;                  /* 统一 slide 比例 */
  overflow: hidden;
}
.gallery-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 9px;                    /* 比卡片圆角略小，视觉嵌套 */
}
```

**反面教材**：不要贴边瓷砖（无padding无border无shadow）——那是信息图密度表达，不是展览。

### 2. 3D倾斜作品墙

```css
.gallery-viewport {
  position: absolute; inset: 0;
  overflow: hidden;
  perspective: 2400px;                   /* 深一些的透视，倾斜不夸张 */
  perspective-origin: 50% 45%;
}
.gallery-canvas {
  width: 4320px;                         /* 画布 = 2.25× viewport */
  height: 2520px;                        /* 留出pan空间 */
  transform-origin: center center;
  transform: perspective(2400px)
             rotateX(14deg)              /* 向后倾 */
             rotateY(-10deg)             /* 向左转 */
             rotateZ(-2deg);             /* 轻微倾斜，去掉太规整 */
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 40px;
  padding: 60px;
}
```

**参数 sweet spot**：
- rotateX: 10-15deg（再多就像开酒会 VIP 背景板）
- rotateY: ±8-12deg（左右对称感）
- rotateZ: ±2-3deg（「这不是机器摆的」的人味）
- perspective: 2000-2800px（小于2000会鱼眼，大于3000接近正投影）

### 3. 2×2 四角汇聚（选择场景）

```css
.grid22 {
  display: grid;
  grid-template-columns: repeat(2, 800px);
  gap: 56px 64px;
  align-items: start;
}
```

每张卡片从对应角落（tl/tr/bl/br）向中心滑入 + fade in。对应的 `cornerEntry` 向量：

```js
const cornerEntry = {
  tl: { dx: -700, dy: -500 },
  tr: { dx:  700, dy: -500 },
  bl: { dx: -700, dy:  500 },
  br: { dx:  700, dy:  500 },
};
```

---

## 五种核心动画模式

### 模式 A · 四角汇聚（0.8-1.2s）

4 个元素从视口四角滑入，同时缩放 0.85→1.0，对应 ease-out。适合「展示多方向选择」的开场。

```js
const inP = easeOut(clampLerp(t, start, end));
card.style.transform = `translate3d(${(1-inP)*ce.dx}px, ${(1-inP)*ce.dy}px, 0) scale(${0.85 + 0.15*inP})`;
card.style.opacity = inP;
```

### 模式 B · 选中放大 + 其他滑出（0.8s）

被选中的卡片放大 1.0→1.28，其他卡片 fade out + blur + 向四角漂回：

```js
// 被选中
card.style.transform = `translate3d(${cellDx*outP}px, ${cellDy*outP}px, 0) scale(${1 + 0.28*easeOut(zoomP)})`;
// 未选中
card.style.opacity = 1 - outP;
card.style.filter = `blur(${outP * 1.5}px)`;
```

**关键**：未选中的要 blur，不是纯 fade。blur 模拟景深，视觉上把被选中的「推出来」。

### 模式 C · Ripple 涟漪展开（1.7s）

从中心向外，按距离 delay，每张卡片依次淡入 + 从 1.25x 缩到 0.94x（「镜头拉远」）：

```js
const col = i % COLS, row = Math.floor(i / COLS);
const dc = col - (COLS-1)/2, dr = row - (ROWS-1)/2;
const dist = Math.sqrt(dc*dc + dr*dr);
const delay = (dist / maxDist) * 0.8;
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
card.style.opacity = easeOut(Math.min(1, localT));

// 同时整体 scale 1.25→0.94
const galleryScale = 1.25 - 0.31 * easeOut(rippleProgress);
```

### 模式 D · Sinusoidal Pan（持续漂移）

用正弦波 + 线性漂移组合，避免 marquee 那种「有起点有终点」的循环感：

```js
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;    // 横向左漂
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;    // 纵向上漂
const clampedX = Math.max(-900, Math.min(900, panX));   // 防止露边
```

**参数**：
- 正弦周期 `0.09-0.15 rad/s`（慢，约30-50秒一个摆动）
- 线性漂移 `5-8 px/s`（比观众眨眼慢）
- 振幅 `120-220 px`（大到能感觉，小到不会晕）

### 模式 E · Focus Overlay（焦点切换）

**关键设计**：focus overlay 是一个**平面元素**（不倾斜），浮在倾斜画布之上。被选中的 slide 从瓦片位置（约400×225）缩放到屏幕中央（960×540），背景画布不倾斜变化但**变暗到 45%**：

```js
// Focus overlay (flat, centered)
focusOverlay.style.width = (startW + (endW - startW) * focusIntensity) + 'px';
focusOverlay.style.height = (startH + (endH - startH) * focusIntensity) + 'px';
focusOverlay.style.opacity = focusIntensity;

// 背景卡片变暗，但依然可见（关键！不要100%遮罩）
card.style.opacity = entryOp * (1 - 0.55 * focusIntensity);   // 1 → 0.45
card.style.filter = `brightness(${1 - 0.3 * focusIntensity})`;
```

**清晰度铁律**：
- Focus overlay 的 `<img>` 必须 `src` 直连原图，**不要复用 gallery 里的压缩缩略**
- 提前 preload 所有原图到 `new Image()[]` 数组
- overlay 自身 `width/height` 按帧计算，浏览器每帧 resample 原图

---

## 时间轴架构（可复用骨架）

```js
const T = {
  DURATION: 25.0,
  s1_in: [0.0, 0.8],    s1_type: [1.0, 3.2],  s1_out: [3.5, 4.0],
  s2_in: [3.9, 5.1],    s2_hold: [5.1, 7.0],  s2_out: [7.0, 7.8],
  s3_hold: [7.8, 8.3],  s3_ripple: [8.3, 10.0],
  panStart: 8.6,
  focuses: [
    { start: 11.0, end: 12.7, idx: 2  },
    { start: 13.3, end: 15.0, idx: 3  },
    { start: 15.6, end: 17.3, idx: 10 },
    { start: 17.9, end: 19.6, idx: 16 },
  ],
  s4_walloff: [21.1, 21.8], s4_in: [21.8, 22.7], s4_hold: [23.7, 25.0],
};

// 核心 easing（v9 历史实现用 cubic；新项目主 easing 默认 expoOut，见 best-practices §2 / hero-case-study 模式1 的修正）
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
function lerp(time, start, end, fromV, toV, easing) {
  if (time <= start) return fromV;
  if (time >= end) return toV;
  let p = (time - start) / (end - start);
  if (easing) p = easing(p);
  return fromV + (toV - fromV) * p;
}

// 单一 render(t) 函数读时间戳、写所有元素
function render(t) { /* ... */ }
requestAnimationFrame(function tick(now) {
  const t = ((now - startMs) / 1000) % T.DURATION;
  render(t);
  requestAnimationFrame(tick);
});
```

**架构精髓**：**所有状态由时间戳 t 推导**，没有状态机、没有 setTimeout。这样：
- 播放到任意时刻 `window.__setTime(12.3)` 立刻跳转（方便 playwright 逐帧截）
- 循环天然无缝（t mod DURATION）
- Debug 时能冻结任意一帧

---

## 质感细节（容易被忽略但致命）

### 1. SVG noise texture

浅色底最怕「太平」。叠加一层极弱的 fractalNoise：

```html
<style>
.stage::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.078  0 0 0 0 0.078  0 0 0 0 0.074  0 0 0 0.035 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.5;
  pointer-events: none;
  z-index: 30;
}
</style>
```

看上去没区别，去掉就知道有了。

### 2. 角落品牌标识

```html
<div class="corner-brand">
  <div class="mark"></div>
  <div>HUASHU · DESIGN</div>
</div>
```

```css
.corner-brand {
  position: absolute; top: 48px; left: 72px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}
```

只在作品墙 scene 显示，淡入淡出。像美术馆展签。

### 3. 品牌收束 wordmark

```css
.brand-wordmark {
  font-family: var(--sans);
  font-size: 148px;
  font-weight: 700;
  letter-spacing: -0.045em;   /* 负字距是关键，让字紧凑成标志 */
}
.brand-wordmark .accent {
  color: var(--accent);
  font-weight: 500;           /* accent字符反而细一点，视觉差 */
}
```

`letter-spacing: -0.045em` 是苹果产品页大字的标准做法。

---

## 常见失败模式

| 症状 | 原因 | 解法 |
|---|---|---|
| 看起来像 PPT 模板 | 卡片没有 shadow / hairline | 加上两层 box-shadow + 1px border |
| 倾斜感廉价 | 只用了 rotateY 没加 rotateZ | 加 ±2-3deg rotateZ 打破工整 |
| Pan 感觉「卡顿」 | 用了 setTimeout 或 CSS keyframes 循环 | 用 rAF + sin/cos 连续函数 |
| Focus 时字看不清 | 复用了 gallery 瓦片的低分图 | 独立 overlay + 原图 src 直连 |
| 背景太空 | 纯色 `#F5F5F7` | 叠加 SVG fractalNoise 0.5 opacity |
| 字体太"互联网" | 只有 Inter | 加 Serif（中英各一）+ mono 三栈 |

---

## 引用

- 完整实现样本：hero-animation-v5.html（作者本地样本，未随仓库分发）
- 原始灵感：claude.ai/design hero 视频
- 参考审美：Apple 产品页、Dribbble shot 集合页

遇到「多件高质量产出要陈列」的动画需求，直接从此文件 copy 骨架，换内容 + 调 timing 即可。
