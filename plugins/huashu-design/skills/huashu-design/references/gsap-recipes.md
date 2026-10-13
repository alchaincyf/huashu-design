# GSAP Recipes · 设计语言到 GSAP Timeline 的翻译层

> 本文件只做一件事：把 huashu-design 已沉淀的动画设计语言
> （`animation-best-practices.md` 的五段叙事、easing 体系、运动语言 8 条、场景配方，
> 以及 `cinematic-patterns.md` 的 22 秒 5-scene 模板）翻译成可直接粘贴的
> GSAP timeline 实现配方，跑在 HyperFrames 渲染后端上。
>
> **设计判断以本 skill 自己的 references 为准，GSAP 只是实现工具。**
> 什么时候该悬停、该用哪种叙事弧线、什么算美，去读 `animation-best-practices.md` §0；
> 本文件回答的只是「这条规则用 GSAP 怎么写」。
> HyperFrames 的合成契约（composition root 属性、`.clip` 标记、渲染命令、check 审计）
> 见 `references/hyperframes-backend.md`，本文只引用不复述。

---

## 0 · 基础样板（每个合成都从这里开始）

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};

  const tl = gsap.timeline({
    paused: true,                                   // 必须。HyperFrames 负责 seek
    defaults: { ease: "expo.out", duration: 0.6 },  // 本 skill 的主 easing（见 §1）
  });

  // ... 所有 tween 都挂在这条 timeline 上 ...

  window.__timelines["main"] = tl;  // key 必须等于合成根的 data-composition-id
</script>
```

硬约束（违反任何一条，渲染结果不确定）：

- timeline 必须 `paused: true`，**永远不调用 `tl.play()`** 做渲染关键动画
- timeline 必须在同步代码里建好，不放进 async / 定时器 / 事件回调
- 渲染时长来自合成根的 `data-duration`，不是 timeline 长度。不要用空 tween 垫长度
- 禁 `repeat: -1`。循环动作用可见时长算出有限的 repeat 次数
- 注意：`defaults: { ease: "expo.out" }` 与 hyperframes-animation 文档里的
  `power3.out` house default 不同。那是它的品味，本 skill 的既有规则是
  「expoOut 是默认主 easing」，翻译层遵循自家设计语言

---

## 1 · Easing 映射表 · 自研 Easing → GSAP

`assets/animations.jsx` 里的自研 Easing 函数，逐个对应到 GSAP 写法。
前三个是数学上**完全同一条曲线**，不是近似。

| 自研 Easing | 数学定义 | GSAP 写法 | 关系 | 用途（既有规则） |
|---|---|---|---|---|
| `expoOut` | `1 - 2^(-10t)` | `"expo.out"` | 完全一致 | **默认主 easing**。卡片 rise-in、面板入场、Terminal fade、focus overlay |
| `overshoot` | easeOutBack，c1=1.70158 | `"back.out"`（默认 1.70158）或 `"back.out(1.7)"` | 完全一致 | Toggle 切换、按钮弹出、强调交互 |
| `spring` | easeOutElastic，周期 2π/3 | `"elastic.out(1, 0.3)"`（即默认 `"elastic.out"`） | 完全一致 | 几何体归位、物理落位、UI 抖弹 |
| `easeIn` | `t²` | `"power1.in"` | 完全一致 | 出场、Anticipation 预备段 |
| `easeOut` | `1-(1-t)²` | `"power1.out"` | 完全一致 | 次要元素的轻动作（说明文字 fade 等） |
| `easeInOut` | quad inOut | `"power1.inOut"` | 完全一致 | 持续运动（鼠标轨迹插值等对称运动） |
| `linear` | `t` | `"none"` | 完全一致 | 只用于 proxy 驱动 / 相机匀速运动。**禁止用在元素动效上** |
| `anticipation` | 分段曲线，先下探 -0.3 再回升 | 无内置等价，用函数 ease（见下） |  | 带预备动作的入场 |

### 1.1 anticipation · 函数 ease

GSAP 接受任意 `(p) => number` 作为 ease，把自研定义原样搬过来即可：

```js
// 与 animations.jsx 的 Easing.anticipation 逐点一致
const anticipation = (t) => {
  if (t < 0.2) return -0.3 * (t / 0.2) * (t / 0.2);   // 前 20%：反向下探
  const a = (t - 0.2) / 0.8;
  return -0.012 + 1.012 * a * a * (3 - 2 * a);         // 后 80%：smoothstep 回升
};

tl.fromTo("#card", { y: 40 }, { y: 0, duration: 0.7, ease: anticipation }, "s2");
```

注意：这条曲线会越过 0（负值区），**只能用在 transform 上**（y / scale / rotation），
不要用在 opacity 或颜色上（会推出合法范围）。

### 1.2 spring 的另一个选项 · 烤制弹簧（seek-safe 真物理）

`"elastic.out(1, 0.3)"` 是自研 spring 的精确等价，直接用它没问题。
当你想要**可调阻尼**的真弹簧手感（比如「落位几乎不过冲、只是尾巴长」），
用 hyperframes-animation 提供的 `springEase` 闭式解（`adapters/gsap-easing-and-stagger.md`
有完整 40 行实现，闭式解是时间的纯函数，seek-safe）：

```js
// dampingFraction 1.0 = 无过冲的沉稳落位；0.6-0.7 ≈ 自研 spring 的弹跳感
const settle = springEase({ response: 0.4, dampingFraction: 0.65 });
tl.fromTo("#hero", { scale: 0 }, { scale: 1,
  duration: settle.duration, ease: settle.ease }, "s4");   // duration 必须一起用，它是物理的一部分
```

**禁止**引入任何实时弹簧库（react-spring 等积分器）：状态逐帧累积，无法确定性 seek。

---

## 2 · 五段叙事骨架 · Slow-Fast-Boom-Stop（15/15/40/20/10%）

为什么：均匀节奏的动画是技术演示，有节奏的动画才是叙事（best-practices §1）。

带 label 的 timeline 骨架模板，改 `D` 即可适配任意总时长：

```js
const D = 15;   // 总时长（秒），与合成根 data-duration 保持一致
const at = (p) => D * p;

const tl = gsap.timeline({
  paused: true,
  defaults: { ease: "expo.out", duration: 0.6 },
});

// ── 五段 label，比例 15 / 15 / 40 / 20 / 10 ──────────────────
tl.addLabel("s1_trigger",  at(0));     // 慢 · 触发：给人类反应时间，建立真实感
tl.addLabel("s2_generate", at(0.15));  // 中 · 生成：视觉惊艳点出现
tl.addLabel("s3_process",  at(0.30));  // 快 · 过程：展示可控性/密度/细节
tl.addLabel("s4_boom",     at(0.70));  // Boom · 爆发：拉远/3D pop-out/多面板涌现
tl.addLabel("s5_hold",     at(0.90));  // 静 · 落幅：Logo 形变 + 戛然而止

// ── S1 触发（节奏慢：单个动作 + 大量留白）─────────────────────
tl.fromTo("#terminal", { y: 48, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: 0.8 }, "s1_trigger+=0.1");

// ── S2 生成（一个明确的惊艳点，不堆动作）─────────────────────
tl.fromTo("#result-panel", { scale: 0.92, autoAlpha: 0 },
  { scale: 1, autoAlpha: 1, duration: 0.7 }, "s2_generate");

// ── S3 过程（密度最高：stagger、typewriter、focus 切换都在这）──
tl.fromTo(".row", { y: 10, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.03 }, "s3_process");

// ── S4 爆发（镜头级动作：拉远 / rotationX / 多元素涌现）───────
tl.to("#stage", { scale: 0.82, rotationX: 8, duration: 1.2,
  ease: "expo.inOut" }, "s4_boom");

// ── S5 落幅（Logo 形变收束，见 §3.6；之后什么都不发生）────────
// 最后 ~0.5s 是有意的静止 hold：不加任何 tween，也绝不 fade to black

window.__timelines["main"] = tl;
```

要点：

- **S5 之后留白**：`data-duration` 覆盖到最后，但 timeline 上没有 tween，
  画面 hold 在最终帧。这就是「戛然而止」的实现（禁 fade out 收尾）
- 22 秒 5-scene 模板（cinematic-patterns Pattern B）同构：把比例换成
  Invoke 3-4s / Process 5-6s / Insight 4-5s / Output 3-4s / Hero 4-5s，label 同法
- scene 之间的全屏切换用 autoAlpha 交叠 + 位移，不用 display 切换
  （`display` / 裸 `visibility` 是渲染器禁区，show/hide 一律 `autoAlpha`）

---

## 3 · 运动语言 8 条 · 逐条翻译

### 3.1 底色不用纯黑纯白

非 timeline 规则：底色是静态 CSS，带色温的中性色，具体色值走品牌 spec。
唯一的 GSAP 关联：scene 之间要变底色时，tween `backgroundColor`（在允许列表内），
且两个 scene 的底色应同色系（cinematic-patterns §2 的配色一致约束）：

```js
tl.to("#stage", { backgroundColor: "#F4EFE6", duration: 0.8, ease: "sine.inOut" }, "s4_boom");
```

### 3.2 Easing 绝不是 linear

为什么：`linear` 让数字元素像机器，`expoOut` 给物理重量感（best-practices §2）。

实现：timeline `defaults` 写 `ease: "expo.out"`（见 §0 样板），
个别 tween 按 §1 映射表覆盖。`ease: "none"` 只允许出现在两处：
proxy 驱动 tween（§7）和刻意的机械运动（相机匀速 pan）。

### 3.3 Slow-Fast-Boom-Stop

见 §2 骨架，不重复。

### 3.4 展示「过程」而非「魔法结果」

为什么：产品是协作者不是魔术师，展示 tweak / 报错修复 / redline 打击「一键魔法」
的 AI slop（best-practices §3.4）。

两个最常用的「过程感」配方：

**Chunk Reveal（模拟 token 流式输出）**。原配方用 `setTimeout + Math.random`，
两者在 seek 渲染下都非法。翻译成「预计算时刻表 + proxy 驱动」，双向 seek 安全：

```js
// 为什么不用 tl.call()：回调不可逆，preview 里往回拖会残留状态
const rand = mulberry32(42);                              // 种子随机，见 §7.4
const text = "为你生成了三个候选方案，第一个最激进。";
const chunks = text.split(/(?=[，。、；])|(?<=[，。、；])/); // 中文按标点切 chunk
const times = []; let acc = 0;
chunks.forEach(() => { acc += 0.04 + rand() * 0.08; times.push(acc); }); // 不规律 40-120ms

const tw = { t: 0 };
tl.to(tw, {
  t: acc, duration: acc, ease: "none",
  onUpdate: () => {   // 每帧从 t 重算完整可见文本：纯函数，回拖也正确
    let n = 0;
    while (n < times.length && times[n] <= tw.t) n++;
    document.querySelector("#stream").textContent = chunks.slice(0, n).join("");
  },
}, "s2_generate+=0.3");
```

**数字 counter（展示真实数据在涨）**：

```js
// snap 保证整数；innerText 是 HyperFrames 认可的 counter 写法
tl.fromTo("#metric", { innerText: 0 },
  { innerText: 237, snap: { innerText: 1 }, duration: 1.2, ease: "expo.out" }, "s3_process");
```

带千分位 / 后缀格式化时改用 proxy + onUpdate（`tw.v` 推导 `toLocaleString`），套路同上。

### 3.5 鼠标轨迹 · 弧线 + 手抖

为什么：直线插值的鼠标有潜意识机器感，真人是「加速、弧线、减速修正」
（best-practices §3.5）。

贝塞尔弧线没法用普通属性 tween 表达，用 proxy 驱动。手抖不用 Perlin
（原实现依赖运行时噪声），用两条不可通约频率的正弦叠加，确定性等效：

```js
const mouse = { p: 0 };
const P0 = [100, 100];                       // 起点
const P2 = [tx, ty];                          // 终点（点击目标）
const P1 = [tx - 200, ty + 80];               // 控制点：偏离中点，制造弧线

tl.to(mouse, {
  p: 1, duration: 1.1, ease: "power1.inOut",  // 对称 easing：起步加速 + 到达减速
  onUpdate: () => {
    const t = mouse.p;
    let x = (1-t)*(1-t)*P0[0] + 2*(1-t)*t*P1[0] + t*t*P2[0];
    let y = (1-t)*(1-t)*P0[1] + 2*(1-t)*t*P1[1] + t*t*P2[1];
    x += Math.sin(t * 47.13) * 2 * (1 - t);   // ±2px 手抖，接近目标时收敛
    y += Math.sin(t * 33.7 + 1.3) * 2 * (1 - t);
    gsap.set("#cursor", { x, y });            // 一切由 p 推导，seek-safe
  },
}, "s1_trigger+=0.5");

// 点击反馈：Anticipation 缩小再回弹
tl.to("#cursor", { scale: 0.85, duration: 0.08, ease: "power1.in" }, ">");
tl.to("#cursor", { scale: 1, duration: 0.25, ease: "back.out" }, ">");
```

### 3.6 Logo 形变收束（Morph）

为什么：Logo 淡入没有叙事收束感，要让前一个视觉元素「坍缩」再「膨胀」成 Logo，
让叙事在品牌点上坍缩（best-practices §3.6）。

blur 走 CSS 变量（`filter` 是 paint-only、seek-safe，官方 depth-of-field-blur
rule 认可的做法）：

```css
#lastVisual, #logo { --blur: 0px; filter: blur(var(--blur)); will-change: filter; }
```

```js
tl.addLabel("morph", "s5_hold-=0.3");

// 坍缩：前一个视觉元素缩成色块，motion blur 升起
tl.to("#lastVisual", { scale: 0.1, "--blur": "6px",
  duration: 0.5, ease: "expo.out" }, "morph");

// 膨胀：Logo 从色块中心弹出，blur 收敛到锐利
tl.fromTo("#logo",
  { scale: 0.1, "--blur": "6px", autoAlpha: 0 },
  { scale: 1, "--blur": "0px", autoAlpha: 1, duration: 0.6, ease: "back.out" },
  "morph+=0.35");                              // 150ms 量级交叠 = 快切

tl.to("#lastVisual", { autoAlpha: 0, duration: 0.15 }, "morph+=0.5");
// 之后：hold，无 tween，戛然而止
```

### 3.7 衬线 + 无衬线双字体

非 timeline 规则：静态 CSS，字体选择走品牌 spec。
HyperFrames 编译器会自动抓取 Google Fonts 并注入确定性 @font-face
（Phase 0 实测，自研管线的字体时序坑在新后端不存在），CSS 里正常引 Google Fonts 即可。

### 3.8 焦点切换 = 背景减弱 + 前景锐化 + Flash 引导

为什么：只降 opacity 时非焦点元素还是锐利的，必须加 blur 才真的退到后景
（best-practices §3.8）。

filter 三件套全部走 CSS 变量，GSAP tween 变量本身：

```css
.tile {
  --f: 0;   /* focusIntensity 0→1 */
  filter: brightness(calc(1 - 0.5 * var(--f)))
          saturate(calc(1 - 0.3 * var(--f)))
          blur(calc(var(--f) * 4px));          /* ← 关键：blur 让非焦点真的退后 */
  will-change: filter;
}
```

```js
tl.addLabel("focus", "s3_process+=1.5");

// 非焦点元素：三滤镜 + dim 一次 tween 完成
tl.to(".tile:not(.focus-target)", {
  "--f": 1, opacity: 0.4, duration: 0.5, ease: "expo.out",
}, "focus");

// Flash highlight 引导视线回流。
// 注意：原配方用 element.animate()（WAAPI），那走墙钟，seek 下不确定，必须翻译成 tween
tl.fromTo("#focusFlash",
  { backgroundColor: "rgba(255,255,255,0.3)" },
  { backgroundColor: "rgba(255,255,255,0)", duration: 0.15, ease: "power1.out" },
  "focus+=0.5");

// 焦点释放：settle sharp。交给下一个 scene 前必须把 blur 收回 0，
// 停在半虚化状态会被观众读成「渲染出 bug 了」
tl.to(".tile", { "--f": 0, opacity: 1, duration: 0.5, ease: "power2.inOut" }, "focus+=2.5");
```

性能约束（来自官方 DoF rule）：blur 半径大面积元素上 ≤24px；优先「dim + 适度 blur」
而不是把 blur 拉满；`will-change: filter` 只加在真的动 blur 的元素上。

---

## 4 · 具体运动技巧 · §4 代码片段的 GSAP 版

### 4.1 FLIP / Shared Element（按钮膨胀成输入框）

为什么：同一个元素在两种状态间过渡，不是两个元素 cross-fade（best-practices §4.1）。

原配方用 Framer Motion layoutId，GSAP 侧不引入 Flip 插件（在 HyperFrames 下未验证），
直接手算：合成的视口是固定的（data-width/height），两个状态的几何都是设计稿常量，
用 fromTo 写死即可。位移缩放全走 transform，元素保持在最终布局位置：

```css
/* 元素以「终态」布局，起态由 transform 表达 */
#search-box { width: 560px; height: 56px; }   /* 静态终态，不 tween 尺寸 */
```

```js
// 起态几何：按钮 120x44 在 (400, 300)，终态输入框 560x56 在 (200, 300)
tl.fromTo("#search-box",
  { x: 200, y: 0, scaleX: 120/560, scaleY: 44/56, transformOrigin: "left top" },
  { x: 0,   y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "expo.out" },
  "s2_generate");
// 内层文字反向补偿或延后进场，避免被 scaleX 拉伸（同 §4.2 的处理）
tl.fromTo("#search-box .placeholder", { autoAlpha: 0 },
  { autoAlpha: 1, duration: 0.3 }, "s2_generate+=0.4");
```

### 4.2 呼吸式展开（先展开、再注水）

为什么：面板不该同时拉 width 和 height，先横向展开再纵向撑起才像物理世界
（best-practices §4.2）。

原配方直接 tween width/height，这在 HyperFrames 是 reflow 禁区（整数像素 snap，
慢速段肉眼可见抖动，§7.2）。翻译成 scaleX/scaleY，时间错位保持不变：

```js
// L = 展开总时长；前 40% 拉横、30% 处开始撑纵，两段交叠
const L = 0.9;
tl.fromTo("#panel",
  { scaleX: 0, scaleY: 0.12, transformOrigin: "left top" },
  { scaleX: 1, duration: 0.4 * L, ease: "expo.out" }, "open");
tl.to("#panel", { scaleY: 1, duration: 0.7 * L, ease: "expo.out" }, "open+=" + 0.3 * L);

// 内容在壳展开完成后才浮现：既符合「先展开再注水」的意象，
// 又让 scale 过程中的内容拉伸变形不可见
tl.fromTo("#panel .content", { autoAlpha: 0, y: 8 },
  { autoAlpha: 1, y: 0, duration: 0.35 }, "open+=" + 0.75 * L);
```

注意 scale 版不是逐像素忠实（圆角和边框会随比例变形）。展开壳是纯色 / 大圆角面板时
不可察觉；如果面板边框细节重要，改用「壳固定 + 内容 clip-path 揭示」的方案并实测截帧。

### 4.3 Staggered Fade-up（30ms stagger）

为什么：列表挨个入场比整块出现更有「物体感」，30ms 是既定间隔（best-practices §4.3）。

```js
tl.fromTo(".row",
  { y: 10, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: 0.4, ease: "expo.out", stagger: 0.03 },
  "s3_process");

// 变体：从中心向两侧涌现（S4 爆发的多面板涌现常用）
tl.fromTo(".panel",
  { y: 24, autoAlpha: 0, scale: 0.96 },
  { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out",
    stagger: { each: 0.03, from: "center" } },
  "s4_boom");
```

用 `fromTo` 不用 `from`：sub-composition 会被反复 re-seek，`from` 在注册时刻
快照起始状态，回拖后可能错位；`fromTo` 两端显式声明，永远一致。

### 4.4 关键结果前悬停 0.5s

为什么：机器执行快且连贯，但人脑需要反应时间，关键结果前停 0.5 秒是礼让观众
（best-practices §4.4，§0.2 核心信念第 3 条）。

GSAP 里「悬停」就是 position 参数上的一段空档，用 label 把停顿写成显式设计决策：

```js
// 生成完成的时刻
tl.addLabel("generated", "s2_generate+=1.2");
// loading 态停住 0.5s：这 0.5s 内没有任何 tween，观众盯着加载状态
tl.addLabel("reveal", "generated+=0.5");

tl.fromTo("#result", { scale: 0.94, autoAlpha: 0 },
  { scale: 1, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, "reveal");
```

### 4.5 Anticipation → Action → Follow-through

为什么：只有 Action 的动画是 PowerPoint 动画，Disney 三段给动作生命感
（best-practices §4.6）。

三段顺序 tween，easing 按 §1 映射（预备 power1.in、主动 expo.out、回弹 elastic）：

```js
tl.addLabel("pop", "s2_generate+=0.2");
tl.to("#card", { scale: 0.95, duration: 0.12, ease: "power1.in"  }, "pop");        // 预备
tl.to("#card", { scale: 1.05, duration: 0.30, ease: "expo.out"   }, ">");          // 主动
tl.to("#card", { scale: 1.00, duration: 0.35, ease: "elastic.out(1, 0.3)" }, ">"); // 回弹
```

单 tween 版：`ease: anticipation`（§1.1）一步完成「预备 + 主动」，回弹再补一段。

### 4.6 3D Perspective + translateZ 分层

为什么：rotateX 8° / rotateY -4° 模拟镜头在桌面左上角俯视的 natural angle
（best-practices §4.7）。

透视和分层是静态 CSS（照抄原配方，perspective / translateZ 不需要动）；
动的部分（入场时立起来、S4 拉远）用 GSAP 的 3D transform 别名：

```css
.stage-wrap { perspective: 2400px; perspective-origin: 50% 30%; }
.card-grid  { transform-style: preserve-3d; }
.card:nth-child(3n) { transform: translateZ(30px); }
.card:nth-child(5n) { transform: translateZ(-20px); }
.card:nth-child(7n) { transform: translateZ(60px); }
```

```js
// 入场：从正视缓慢立到黄金角
tl.fromTo("#card-grid", { rotationX: 0, rotationY: 0 },
  { rotationX: 8, rotationY: -4, duration: 1.4, ease: "expo.out" }, "s2_generate");
```

### 4.7 斜向 Pan · 同时动 XY，频率不同

为什么：X 和 Y 用不同频率避免 Lissajous 循环规则化，模拟手持镜头的斜向漂移
（best-practices §4.8）。

原配方是 `Math.sin(flowT * ...)` 逐帧算，GSAP 版用两条不同 duration 的
yoyo tween 叠加（GSAP 对 x / y 独立追踪，两条 tween 不打架）。repeat 必须有限：

```js
// 周期不同（4.6s vs 2.9s）= 频率不同，路径不闭合
// repeat 数从可见时长算出：Math.ceil(D / dur) 保证覆盖全片
tl.to("#stage", { x: 40, duration: 4.6, ease: "sine.inOut",
  yoyo: true, repeat: Math.ceil(D / 4.6) }, 0);
tl.to("#stage", { y: 30, duration: 2.9, ease: "sine.inOut",
  yoyo: true, repeat: Math.ceil(D / 2.9) }, 0);
```

### 4.8 戛然而止收尾

为什么：fade out 没有决定感，最后一帧要清晰、肯定（best-practices §0.3 留白）。

实现上是「不写代码」：S5 的 Logo 落位后，timeline 上不再有任何 tween，
`data-duration` 比最后一个 tween 的结束时刻长 0.5-1s，画面 hold 在终态。
如果有 BGM，用 volume tween 在尾部收音（volume 在允许列表内）：

```js
tl.to("#bgm", { volume: 0, duration: 0.4 }, "s5_hold+=0.8");  // 音频截停，画面不动
```

---

## 5 · 场景配方 A/B/C · timeline 结构要点

设计判断（选哪种、SFX 密度、BGM 风格）见 best-practices §5，这里只给 timeline 侧的差异。

### 配方 A · Apple Keynote 戏剧式

- 骨架：§2 五段结构原样，S4 的 Boom 做足
- defaults：`ease: "expo.out"`，强调交互处覆盖 `"back.out"`
- S4 标志动作：镜头急拉远 + drop。`tl.to("#stage", { scale: 0.78, y: -40, duration: 1.1, ease: "expo.inOut" }, "s4_boom")`
- S5：Logo Morph（§3.6）+ 空灵单音 + hold

### 配方 B · 一镜到底工具式

- 骨架：**不用**五段峰值结构，一条持续 flow。label 按 BGM 小节打：
  `tl.addLabel("bar1", 0); tl.addLabel("bar2", 60/88*4);`（88 BPM，一小节 ≈ 2.73s）
- 关键 UI 动作的 position 参数直接写在 kick/snare 时刻上，音乐律动即交互音效
- easing：`springEase`（§1.2）+ `"expo.out"`，落位感多于爆发感
- 没有 S4 式 Boom，收尾同样戛然而止

### 配方 C · 办公效率叙事式

- 骨架：多 scene 硬切。每个 scene 一个 label，scene 间 autoAlpha 快切（0.15s）
  而不是长交叠；配合 Dolly In/Out：
  `tl.fromTo("#scene2", { scale: 1.06 }, { scale: 1, duration: 1.2, ease: "expo.out" }, "sc2")`
- toggle 类交互一律 `"back.out"`，面板一律 `"expo.out"`
- 全片必有一处高光：3D pop-out（§4.6 的 rotationX + translateZ 元素浮起），
  只做一次，到处炫技是廉价信号（§0.3 克制）

---

## 6 · seek 安全规则（Phase 0 实测，全部踩过）

HyperFrames 渲染是逐帧 seek + 截屏。任何不是「时间的纯函数」的状态都会在
渲染里出现不确定结果，而且**preview 里看起来往往是好的**，只有渲染产物才暴露。

### 6.1 禁 CSS transition + class 切换 · 一律用 tween 表达

CSS transition 走浏览器墙钟，不走时间轴。逐帧 seek 时每帧都是一次「状态突变」，
transition 要么不触发、要么起点错乱，Phase 0 迁移 c3 时实测中招。

```css
/* ✗ 旧写法：JS 里 classList.add('lit')，靠 transition 过渡 */
.capsule { transition: transform 0.3s ease; }
.capsule.lit { transform: scale(1.06); }
```

```js
// ✓ 新写法：状态变化本身是 timeline 上的一段 tween
tl.to("#capsule", { scale: 1.06, duration: 0.3, ease: "expo.out" }, "lit_at");
tl.to("#capsule", { scale: 1.0,  duration: 0.3, ease: "expo.out" }, "lit_at+=1.2");
```

同类禁区：`element.animate()`（WAAPI，同样走墙钟，§3.8 的 Flash 已给翻译）、
CSS `@keyframes` animation 用于渲染关键动画。
交付前扫一遍：`grep -n "transition:\|animation:\|\.animate(" index.html`，
命中的每一处要么删掉、要么翻译成 tween。

### 6.2 禁 animate 触发 reflow 的属性 · 用 transform 代替

layout 属性在浏览器 layout 阶段 snap 到整数设备像素。快速 tween 看不出来；
慢速 ease-out 尾巴上每帧移动不足 1px，就会「憋几帧、跳 1px」，肉眼可见的抖动。
Phase 0 的 lint 当场抓到 letterSpacing 逐帧抖动，正是这类无报警视觉 bug。

| ✗ 禁 tween | ✓ 忠实替代 |
|---|---|
| `width` / `height` | `scaleX` / `scaleY` + `transformOrigin`（内容处理见 §4.2） |
| `top` / `left` / `right` / `bottom` | 元素停在 CSS 终态位，tween `x` / `y` 偏移量 |
| `fontSize` | `scale`（视觉等价，sub-pixel 平滑） |
| `letterSpacing` / `wordSpacing` | 逐字 split 后 tween 每个字符的 `x`（uniform scale 不是同一个效果，它缩放字形而不是字距） |
| `margin*` / `padding*` | 布局写死，动 `x` / `y` |

修复原则：**重现同一个视觉，只去掉抖动**。过 lint 不是标准，和原动画逐帧对比才是。

### 6.3 t=0 时 onUpdate 不触发 · 代理 tween 必须手动补首帧

timeline seek 到 0 时 proxy tween 的 `onUpdate` 可能不触发，首帧就是白屏 / 初始 DOM。
所有 proxy 驱动的场景（§3.4 chunk reveal、§3.5 鼠标、§7 老 demo 适配器），
注册完 timeline 后手动调一次：

```js
window.__timelines["main"] = tl;
render(0);   // 首帧保险：把 t=0 的画面显式画出来
```

### 6.4 禁 Math.random / Date.now · 随机用种子函数

同一帧每次 seek 必须得到同一画面。运行时随机 = 每次渲染不同 = 无法逐帧渲染。
需要「随机感」（粒子、抖动、不规律间隔）时用 mulberry32，**建 timeline 前**
一次性生成所有随机值（Phase 0 的 3D 粒子 demo 实测写法）：

```js
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260717);   // 种子写死，改种子 = 换一版随机

// 用法：预生成，不在 onUpdate 里现抽
const offsets = Array.from({ length: 40 }, () => (rand() - 0.5) * 24);
```

同理禁用：`Date.now()`、`performance.now()`、任何事件驱动状态（渲染模式没有输入事件）。

---

## 7 · 老 demo 适配器配方 · render(t) 挂进 GSAP

21 个自研引擎老 demo 的动画核心都是 `render(t)` 纯函数。迁移不重写动画逻辑，
用一个代理 tween 把 render(t) 挂到 GSAP timeline 上（Phase 0 实测：单个 demo
20-30 分钟，动画代码一行不改，c3 电影级 demo 1134 行验证通过）。

### 7.1 代理 tween 模板（12 行，c3 实测原版）

```js
// =============== HyperFrames adapter ===============
// 代理 tween 驱动原 render(t)。每一帧都是时间轴时间的纯函数：
// 无 rAF、无时钟、无输入状态。
window.__timelines = window.__timelines || {};
const proxy = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(proxy, {
  t: T.DURATION,            // 老 demo 的总时长常量
  duration: T.DURATION,
  ease: "none",             // 时间必须匀速映射，easing 在 render(t) 内部
  onUpdate: () => render(proxy.t),
}, 0);
window.__timelines["main"] = tl;

// 首帧保险（timeline 停在 t=0 时 onUpdate 不触发，§6.3）
render(0);
```

### 7.2 迁移四步

1. **包 root / clip**：给最外层容器加合成根属性
   （`data-composition-id="main"` + `data-duration` + 尺寸），
   舞台元素加 `.clip` 及 `data-start` / `data-duration` / `data-track-index`。
   完整契约见 `hyperframes-backend.md`
2. **删自驱**：删掉 rAF 循环、`setInterval`、自动 play 逻辑、
   `performance.now()` 起点。`render(t)` 只吃参数 t，不再自己找时间
3. **挂 proxy**：粘 §7.1 模板，`T.DURATION` 对上 `data-duration`，末尾 `render(0)`
4. **扫 transition**：`grep -n "transition:\|animation:\|\.animate(\|Math.random\|Date.now\|performance.now"`
   逐条清零。class 切换类效果按 §6.1 改成 t 的纯函数（老 demo 最常见的残留
   就是「classList.add + transition」组合）

迁完跑一次 `npx hyperframes check`（暗色 cinematic 用 `--no-contrast`，
其余四门必须 0 error），再抽 3-4 个关键时刻截帧和老版对比。

### 7.3 什么时候不用适配器

适配器是**存量迁移**方案。新写的动画直接用本文件 §0-§5 的原生 timeline 写法：
label 可读、stagger 声明式、GSAP inspector 能逐 tween 检查，
proxy 大黑盒里的动画对审计工具是不透明的。

---

## 8 · 交付前自检（GSAP 侧，补充 best-practices §7 清单)

- [ ] timeline `paused: true`，注册 key 等于 `data-composition-id`？
- [ ] defaults 是 `expo.out`，没有裸 `linear` / `ease` 出现在元素动效上？
- [ ] 五段 label 齐全，S5 之后有 hold 留白（没有 fade out）？
- [ ] `grep "transition:\|\.animate(\|Math.random\|Date.now"` 结果为 0？
- [ ] 没有 tween width / height / top / left / letterSpacing / fontSize？
- [ ] 所有 `repeat` 是有限数？
- [ ] proxy 场景末尾补了 `render(0)`？
- [ ] blur / filter 全部走 CSS 变量，动过 blur 的元素有 `will-change: filter`？
- [ ] sub-composition 里入场全用 `fromTo` 不用 `from`？
- [ ] `npx hyperframes check` 通过（暗色片 `--no-contrast`，其余 0 error）？

---

## 9 · Camera Rig 配方 · 镜头运动的实现层

为什么：镜头运动和元素动画抢同一个 transform 是运镜混乱的技术根源
（camera-language.md §3）。所有镜头级 tween 收口到专职 rig 容器，
相机状态用一个 proxy 对象承载，每帧由它推导出全部相机 DOM 状态，seek-safe。

### 9.1 rig 容器结构（静态骨架）

```html
<div id="viewport">                <!-- 固定视口 -->
  <div id="camera">                <!-- 镜头层：只有相机 transform -->
    <div id="world">...</div>      <!-- 世界层：元素动画只发生在这里面 -->
  </div>
  <div id="hud">...</div>          <!-- 字幕/角标：#camera 的兄弟，天然静止 -->
</div>
```

```css
#viewport { position: relative; width: 1920px; height: 1080px; overflow: hidden; }
#camera   { position: absolute; inset: 0; perspective-origin: 960px 540px; }
#world    { position: absolute; transform-origin: 0 0; will-change: transform; }
/* pan 露边保险：#world 尺寸 ≥ 视口 + 最大 pan 振幅 + 8% 边距（camera-language §3.3） */
```

### 9.2 相机 proxy + PageCam 关键帧翻译

相机是一个普通对象，GSAP tween 它的字段，`onUpdate` 里把状态写进 DOM。
一切由 cam 推导，回拖也正确（同 §3.4 chunk reveal 的 proxy 思路）：

```js
const cam = { cx: 960, cy: 540, zoom: 1, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 };
const camEl = document.querySelector("#camera");
const world = document.querySelector("#world");

// ── 平面模式（纯 zoom + pan，无旋转）──────────────────────────
function applyCam() {
  world.style.transform =
    `translate(${960 - cam.cx * cam.zoom}px, ${540 - cam.cy * cam.zoom}px) scale(${cam.zoom})`;
  applyCounter();
}

// ── 3D 模式（有 rotX/rotY/rotZ）· 放大走 CSS zoom 属性，不走 scale ──
// 布局级缩放让 Chromium 按放大后尺寸栅格化，根治 3D 下文字发糊
// （camera-language §3.4，全库最贵知识）。zoom 改变坐标系，translate 要除以 zoom。
function applyCam3d() {
  camEl.style.perspective = `${cam.persp * cam.zoom}px`;
  world.style.zoom = cam.zoom;
  world.style.transformOrigin = `${cam.cx}px ${cam.cy}px`;
  world.style.transform =
    `translate(${960 / cam.zoom - cam.cx}px, ${540 / cam.zoom - cam.cy}px)` +
    ` rotateY(${cam.rotY}deg) rotateX(${cam.rotX}deg) rotateZ(${cam.rotZ}deg)`;
  applyCounter();
}
```

注意：CSS `zoom` 每帧触发 re-layout，是 §6.2 reflow 禁令的**唯一合法例外**，
只允许用在 `#world` 相机层。HyperFrames / Playwright 离线逐帧渲染下单帧耗时不影响产物；
实时 preview 掉帧属正常，以渲染产物为准。

### 9.3 对数时长 helper（固定 duration 是业余感的来源）

```js
// camera-language §4.2：1→2x 正好 0.55s，任何幅度的 zoom 视觉速度一致
function zoomDur(z1, z2) {
  return gsap.utils.clamp(0.30, 0.94,
    0.55 * Math.abs(Math.log(z2 / z1)) / Math.LN2);
}
```

### 9.4 镜头段落写法（推近 → hold → 平移 → 谢幕拉出）

镜头 tween 全部驱动 cam，easing 按 camera-language §4.1：
主动推拉 `power3.inOut`，跟随式 `cubic-bezier(0.33,0,0.15,1)`（自定义 ease 见下）。

```js
const followEase = gsap.parseEase("0.33,0,0.15,1");   // shotcraft 相机默认

// 定场微推：开机即 1.06x，3s 缓出回全景（片长 >14s 且首镜 >7s 时才加）
tl.fromTo(cam, { zoom: 1.06 },
  { zoom: 1, duration: 3.0, ease: "power2.out", onUpdate: applyCam }, 0);

// 推近特写：目标点 (1240, 430)，1 → 1.8x，时长由公式给
tl.to(cam, { cx: 1240, cy: 430, zoom: 1.8,
  duration: zoomDur(1, 1.8), ease: "power3.inOut", onUpdate: applyCam },
  "s2_generate");
// 镜头到位后 hold ≥1.2s 再走（不写 tween 就是 hold）

// 中距焦点转移：不回 1x，直接平移过去（镜间语法：0.22-0.45 改平移）
tl.to(cam, { cx: 880, cy: 620,
  duration: 0.7, ease: followEase, onUpdate: applyCam }, "s3_process+=1.5");

// 谢幕：0.55s 拉出 + ≥0.8s 全景停顿，data-duration 覆盖到停顿末尾
tl.to(cam, { cx: 960, cy: 540, zoom: 1,
  duration: 0.55, ease: "power3.inOut", onUpdate: applyCam }, "s5_hold");

window.__timelines["main"] = tl;
applyCam();   // 首帧保险：timeline 停在 t=0 时 onUpdate 不触发（§6.3）
```

镜头预算不写在代码里，写在排镜时：相邻镜头 tween 起点间隔 ≥2.6s、
15s 窗口 ≤4-5 个、<1.25x 的 zoom 不排（camera-language §0/§4.4）。

### 9.5 counter-transform · 跟随字幕/标注保持字号恒定

字幕和 chrome 首选放 `#hud`（不跟镜头，零成本）。必须挂在 world 内、
跟着元素走但字号要恒定的标注，反向抵消镜头缩放：

```js
const counters = gsap.utils.toArray(".cam-counter");   // 需要恒定字号的标注
function applyCounter() {
  const inv = 1 / cam.zoom;
  counters.forEach((el) => { el.style.transform = `scale(${inv})`; });
}
```

`.cam-counter` 自身的入场动画写在其**子元素**上，避免和 counter scale 抢 transform。

### 9.6 多层 parallax · 全部由 cam 推导

每层不给独立 tween，速度系数乘同一个相机位移（层间系数比 ≥2 倍、≤4 层，
camera-language §8.1），天然同步、天然 seek-safe：

```js
const LAYERS = [
  { el: document.querySelector("#bg"),  k: 0.35 },
  { el: document.querySelector("#mid"), k: 0.7  },
  { el: document.querySelector("#fg"),  k: 1.4  },
];
function applyParallax() {
  const dx = 960 - cam.cx, dy = 540 - cam.cy;    // 相机位移
  LAYERS.forEach(({ el, k }) => {
    el.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  });
}
// 把 applyParallax() 追加进 applyCam() 末尾即可
```

### 9.7 Camera Rig 自检（追加到 §8 清单）

- [ ] 镜头 tween 只动 cam proxy，`#world` 内元素没有被相机 tween 碰过？
- [ ] 注册 timeline 后补了 `applyCam()` 首帧？
- [ ] 3D 文字特写用了 CSS `zoom`，没有 `scale()` 放大发糊？
- [ ] `zoom` 属性只出现在 `#world` 上（reflow 例外不扩散）？
- [ ] 推拉时长全部来自 `zoomDur()`，没有手写常数？
- [ ] 谢幕拉出后有 ≥0.8s 无 tween 的全景 hold？
