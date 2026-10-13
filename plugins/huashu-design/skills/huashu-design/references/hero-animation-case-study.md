# Gallery Ripple + Multi-Focus · 场景编排哲学

> 从 huashu-design hero 动画 v9（25 秒，8 场景）里提炼出的**一种可复用的视觉编排结构**。
> 不是动画制作流水线，是**什么场景下这种编排是"对的"**。
> 实战参考：[demos/hero-animation-v9.mp4](../demos/hero-animation-v9.mp4) · [https://www.huasheng.ai/huashu-design-hero/](https://www.huasheng.ai/huashu-design-hero/)

## 一句话先行

> **当你有 20+ 同质视觉素材、场景需要"表达规模感和深度"时，优先考虑 Gallery Ripple + Multi-Focus 这套编排，而不是堆砌排版。**

通用 SaaS feature 动画、产品发布会、skill 推广、系列作品集展示——只要素材数量够、风格一致，这套结构几乎都能出效果。

---

## 这个手法究竟在表达什么

不是"秀素材"——是通过**两个节奏变化**讲一个叙事：

**第一拍 · Ripple 展开（~1.5s）**：从中心向四周扩散出 48 张卡片，观众被"量"震住——「哦，这东西有这么多产出」。

**第二拍 · Multi-Focus（~8s，4 次循环）**：镜头在慢速 pan 的同时，4 次把背景 dim + desaturate，把某一张卡单独放大到屏幕中央——观众从"量的冲击"切换到"质的凝视"，每次 1.7s 节奏稳定。

**核心叙事结构**：**规模（Ripple） → 凝视（Focus × 4） → 淡出（Walloff）**。这三拍组合起来表达的是「Breadth × Depth」——不只是能做很多，每一个还都值得停下来看。

对比一下反例：

| 做法 | 观众感知 |
|------|---------|
| 48 张卡静态排列（没有 Ripple）| 好看但无叙事，像一张 grid screenshot |
| 一张一张快切（没有 Gallery context）| 像 slideshow，失去"规模感" |
| 只有 Ripple 没有 Focus | 震住了但没让人记住任何具体一张 |
| **Ripple + Focus × 4（本配方）** | **先震撼于量，再凝视于质，最后平静淡出——完整情绪弧线** |

---

## 前置条件（必须全部满足）

这套编排**不是万能的**，下面 4 条缺一不可：

1. **素材规模 ≥ 20 张，最好 30+**
   少于 20 张 Ripple 会显得"空"——48 格里每格都在动才有密度感。v9 用了 48 格 × 32 张图（循环填充）。

2. **素材视觉风格一致**
   全是 16:9 slide 预览 / 全是 app 截图 / 全是封面设计——长宽比、色调、版式得像是"一套"。混搭会让 Gallery 看起来像剪贴板。

3. **素材单独放大后仍有可读信息**
   Focus 是把某张卡放大到 960px 宽，如果原图放大后糊了或信息稀薄，Focus 这一拍就废了。反向验证：能不能从 48 张里挑出 4 张作为"最有代表性"的？挑不出来就说明素材质量不齐。

4. **场景本身是 landscape 或 square，不是竖屏**
   Gallery 的 3D 倾斜（`rotateX(14deg) rotateY(-10deg)`）需要横向延伸感，竖屏会让倾斜效果看起来窄且别扭。

**缺条件的后备路径**：

| 缺什么 | 退化为什么 |
|-------|-----------|
| 素材 < 20 张 | 改用「3-5 张并排静态展示 + 逐个 focus」 |
| 风格不一致 | 改用「封面 + 3 章节大图」的 keynote-style |
| 信息稀薄 | 改用「data-driven dashboard」或「金句 + 大字」 |
| 竖屏场景 | 改用「vertical scroll + sticky cards」 |

---

## 技术配方（v9 实战参数）

### 4-Layer 结构

```
viewport (1920×1080, perspective: 2400px)
  └─ canvas (4320×2520, 超大 overflow) → 3D tilt + pan
      └─ 8×6 grid = 48 cards (gap 40px, padding 60px)
          └─ img (16:9, border-radius 9px)
      └─ focus-overlay (absolute center, z-index 40)
          └─ img (matches selected slide)
```

**关键**：canvas 比 viewport 大 2.25 倍，这样 pan 才有"窥视更大世界"的感觉。

### Ripple 展开（距离延迟算法）

```js
// 每张卡的入场时间 = 距中心的距离 × 0.8s 延迟
const col = i % 8, row = Math.floor(i / 8);
const dc = col - 3.5, dr = row - 2.5;       // 到中心的 offset
const dist = Math.hypot(dc, dr);
const maxDist = Math.hypot(3.5, 2.5);
const delay = (dist / maxDist) * 0.8;       // 0 → 0.8s
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
const opacity = expoOut(Math.min(1, localT));
```

**核心参数**：
- 总时长 1.7s（`T.s3_ripple: [8.3, 10.0]`）
- 最大延迟 0.8s（中心最早出，角落最晚）
- 每张卡入场时长 0.7s
- Easing: `expoOut`（爆发感，不是平滑）

**同时做的事**：canvas scale 从 1.25 → 0.94（zoom out to reveal）—— 配合出现的同步推远感。

### Multi-Focus（4 次节奏）

```js
T.focuses = [
  { start: 11.0, end: 12.7, idx: 2  },  // 1.7s
  { start: 13.3, end: 15.0, idx: 3  },  // 1.7s
  { start: 15.6, end: 17.3, idx: 10 },  // 1.7s
  { start: 17.9, end: 19.6, idx: 16 },  // 1.7s
];
```

**节奏规律**：每个 focus 1.7s，间隔 0.6s 喘息。总计 8s（11.0–19.6s）。

**每次 focus 内部**：
- In ramp: 0.4s（`expoOut`）
- Hold: 中间 0.9s（`focusIntensity = 1`）
- Out ramp: 0.4s（`easeOut`）

**背景变化（这是关键）**：

```js
if (focusIntensity > 0) {
  const dimOp = entryOp * (1 - 0.6 * focusIntensity);  // dim to 40%
  const brt = 1 - 0.32 * focusIntensity;                // brightness 68%
  const sat = 1 - 0.35 * focusIntensity;                // saturate 65%
  card.style.filter = `brightness(${brt}) saturate(${sat})`;
}
```

**不只是 opacity——同时 desaturate + darken**。这让前景 overlay 的色彩"跳出来"，而不是只是"变亮一点"。

**Focus overlay 尺寸动画**：
- 从 400×225（入场）→ 960×540（hold 态）
- 外围有 3 层 shadow + 3px accent 色 outline ring，呈现"被框住的感觉"

### Pan（持续感让静止不无聊）

```js
const panT = Math.max(0, t - 8.6);
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;
```

- 正弦波 + 线性 drift 双层运动——不是纯循环，每个时刻位置都不同
- X/Y 频率不同（0.12 vs 0.09）避免视觉上看出"规律循环"
- clamp 在 ±900/500px 防止漂出

**为什么不用纯线性 pan**：纯线性观众会"预测"下一秒在哪；正弦+drift 让每一秒都是新的，3D 倾斜下产生"微晕船感"（好的那种），注意力被拉住。

---

## 5 个可复用模式（从 v6→v9 迭代中蒸馏）

### 1. **expoOut 作为主 easing，不是 cubicOut**

`easeOut = 1 - (1-t)³`（平滑）vs `expoOut = 1 - 2^(-10t)`（爆发后迅速收敛）。

**选择理由**：expoOut 的前 30% 很快达到 90%，更像物理阻尼，符合"重的东西落地"的直觉。特别适合：
- 卡片入场（重量感）
- Ripple 扩散（冲击波）
- Brand 浮起（落定感）

**什么时候仍用 cubicOut**：focus out ramp、对称的微动效。

### 2. **纸感底色 + 赤陶橙 accent（Anthropic 血统）**

```css
--bg: #F7F4EE;        /* 暖纸 */
--ink: #1D1D1F;       /* 几乎黑 */
--accent: #D97757;    /* 赤陶橙 */
--hairline: #E4DED2;  /* 暖线条 */
```

**为什么**：温暖底色在 GIF 压缩后依然有"呼吸感"，不像纯白会显得"屏幕感"。赤陶橙作为唯一 accent 贯穿 terminal prompt、dir-card 选中、cursor、brand hyphen、focus ring——所有视觉锚点都被这一个色串起来。

**v5 教训**：加了 noise overlay 以模拟"纸纹"，结果 GIF 帧压缩全废（每帧都不同）。v6 改为"只用底色 + 暖 shadow"，纸感保留 90%，GIF 体积缩小 60%。

### 3. **两档 Shadow 模拟深度，不用真 3D**

```css
.gallery-card.depth-near { box-shadow: 0 32px 80px -22px rgba(60,40,20,0.22), ... }
.gallery-card.depth-far  { box-shadow: 0 14px 40px -16px rgba(60,40,20,0.10), ... }
```

用 `sin(i × 1.7) + cos(i × 0.73)` 确定性算法给每张卡分配 near/mid/far 三档 shadow——**视觉上有"三维堆叠"感，但每帧 transform 完全不变，GPU 消耗 0**。

**真 3D 的代价**：每个 card 单独 `translateZ`，GPU 每帧都在算 48 个 transform + shadow blur。v4 试过，Playwright 录制 25fps 都吃力。v6 的两档 shadow 肉眼效果差距 <5%，但成本差 10 倍。

### 4. **字重变化（font-variation-settings）比字号变化更电影感**

```js
const wght = 100 + (700 - 100) * morphP;  // 100 → 700 over 0.9s
wordmark.style.fontVariationSettings = `"wght" ${wght.toFixed(0)}`;
```

Brand wordmark 从 Thin → Bold 用 0.9s 渐变，配合 letter-spacing 微调（-0.045 → -0.048em）。

**为什么比放大缩小好**：
- 放大缩小观众看过太多，预期固化
- 字重变化是"内在的充实感"，像气球被吹满，而不是"被推近"
- variable fonts 是 2020+ 才普及的特性，观众下意识感觉"现代"

**限制**：必须用支持 variable font 的字体（Inter/Roboto Flex/Recursive 等）。普通静态字体只能拟态（切换几个固定 weight 有跳变）。

### 5. **Corner Brand 低强度持续签名**

Gallery 阶段左上角有个 `HUASHU · DESIGN` 小标识，16% opacity 色值，12px 字号，宽字距。

**为什么加这个**：
- Ripple 爆发后观众容易"失焦"不记得在看什么，左上角轻标示帮助 anchor
- 比全屏大 logo 更高级——做品牌的人知道，品牌签名不需要喊
- 在 GIF 被截屏分享时仍留下归属信号

**规则**：只在中段（画面 busy）出现，开场关闭（不遮 terminal），结尾关闭（brand reveal 是主角）。

---

## 反例：什么时候不要用这套编排

**❌ 产品演示（要展示功能的）**：Gallery 让每一张都一闪而过，观众记不住任何一个功能。改用「单屏 focus + tooltip 标注」。

**❌ 数据驱动内容**：观众要读数字，Gallery 的快速节奏不给时间读。改用「数据图表 + 逐项 reveal」。

**❌ 故事叙事**：Gallery 是"并列"结构，故事需要"因果"。改用 keynote 章节切换。

**❌ 素材只有 3-5 张**：Ripple 密度不够，看起来像"补丁"。改用「静态排列 + 逐张高亮」。

**❌ 竖屏（9:16）**：3D tilt 需要横向延伸，竖屏会让倾斜感觉"歪"而不是"展开"。

---

## 如何判断自己的任务适用这套编排

三步快速检查：

**Step 1 · 素材数量**：数一下你有多少同类视觉素材。< 15 → 停；15-25 → 凑；25+ → 直接用。

**Step 2 · 一致性测试**：把 4 张随机素材并排放，是否像「一套」？不像 → 先统一风格再做，或改方案。

**Step 3 · 叙事匹配**：你要表达的是「Breadth × Depth」（量 × 质）吗？还是「流程」「功能」「故事」？不是前者就别硬套。

三步都 yes，直接 fork v6 HTML，改 `SLIDE_FILES` 数组和时间轴就能复用。调色板改 `--bg / --accent / --ink`，整体换皮不换骨。

---

## 相关 Reference

- 完整技术流程：[references/animations.md](animations.md) · [references/animation-best-practices.md](animation-best-practices.md)
- 动画导出流水线：[references/video-export.md](video-export.md)
- 音频配置（BGM + SFX 双轨）：[references/audio-design-rules.md](audio-design-rules.md)
- Apple 画廊风格的横向参考：[references/apple-gallery-showcase.md](apple-gallery-showcase.md)
- 源 HTML（v6 + 音频集成版）：`www.huasheng.ai/huashu-design-hero/index.html`
