# Content Guidelines：反AI slop、内容准则、Scale规范

AI设计里最容易掉进去的陷阱。这是一份「不做什么」的清单，比「做什么」更重要——因为AI slop是默认值，你不主动避免就会发生。

## AI Slop 完整黑名单

### 视觉陷阱

**❌ 激进渐变背景**
- 紫色 → 粉色 → 蓝色 全屏渐变（AI生成网页的典型味道）
- 任何方向的rainbow gradient
- Mesh gradient铺满背景
- ✅ 如果要用渐变：subtle、单色系、有意图地点缀（比如button hover）

**❌ 圆角卡片 + 左border accent色**
```css
/* 这是AI味卡片的典型签名 */
.card {
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  padding: 16px;
}
```
这种卡片在AI生成的Dashboard里泛滥。想做强调？用更有设计感的方式：背景色对比、字重/字号对比、plain分隔线、或者干脆不分卡片。

**❌ Emoji 装饰**
除非品牌本身使用emoji（比如Notion、Slack），否则不要在UI上放emoji。**尤其不要**：
- 标题前的 🚀 ⚡️ ✨ 🎯 💡
- Feature列表的 ✅
- CTA按钮里的 →（箭头单独出现OK，emoji箭头不行）

没图标用真icon库（Lucide/Heroicons/Phosphor），或者用placeholder。

**❌ SVG 画 imagery**
不要试图用SVG画：人物、场景、设备、物品、抽象艺术。AI画的SVG imagery一眼就是AI味，幼稚且廉价。**一个灰色矩形+"插画位 1200×800"的文字标签，比一个拙劣的SVG hero illustration强100倍**。

唯一可以用SVG的场景：
- 真正的icon（16×16到32×32级别）
- 几何图形做装饰元素
- Data viz的chart

**❌ 过多iconography**
不是每个标题/feature/section都需要icon。滥用icon会让界面像toy。Less is more。

**❌ "Data slop"**
编造的stats装饰：
- "10,000+ happy customers" （你都不知道有没有）
- "99.9% uptime" （没有真数据就别写）
- 用图标+数字+词组成的装饰"metric cards"
- Mock table里的假数据装点得花里胡哨

如果没真数据，留placeholder或问用户要。

**❌ "Quote slop"**
编造的用户评价、名人名言装饰页面。留placeholder问用户要真quote。

### 字体陷阱

**❌ 避免这些烂大街字体**：
- Inter（AI生成的网页默认）
- Roboto
- Arial / Helvetica
- 纯system font stack
- Fraunces（AI发现了这个就用滥了）
- Space Grotesk（最近AI的最爱）

**✅ 用有特点的display+body配对**。灵感方向：
- 衬线display + 无衬线body（editorial feel）
- Mono display + sans body（technical feel）
- Heavy display + light body（contrast）
- Variable font做hero的粗细动画

字体资源：
- Google Fonts的冷门好选项（Instrument Serif、Cormorant、Bricolage Grotesque、JetBrains Mono）
- 开源字体站（Fraunces的兄弟字体、Adobe Fonts）
- 不要凭空发明字体名

### 色彩陷阱

**❌ 凭空发明颜色**
不要从头设计一整套不熟悉的色彩。这通常不和谐。

**✅ 策略**：
1. 有品牌色 → 用品牌色，缺的color token用oklch插值
2. 没有品牌色但有参考 → 从参考产品截图吸色
3. 完全从零 → 选一个known的配色系统（Radix Colors / Tailwind默认palette / Anthropic brand），不要自己调

**oklch定义色彩**是最现代的做法：
```css
:root {
  --primary: oklch(0.65 0.18 25);      /* 温暖的terracotta */
  --primary-light: oklch(0.85 0.08 25); /* 同色系浅色 */
  --primary-dark: oklch(0.45 0.20 25);  /* 同色系深色 */
}
```
oklch能保证调整亮度时色相不漂移，比hsl好用。

**❌ 夜间模式随手加反色**
不是简单invert颜色。好的dark mode需要重新调整饱和度、对比度、accent色。不想做dark mode就别做。

### Layout陷阱

**❌ Bento grid 过度泛滥**
每个AI生成的landing page都想搞bento。除非你的信息structure确实适合bento，否则用其他layout。

**❌ 大hero + 3-column features + testimonials + CTA**
这个landing page模板被用烂了。想创新就真创新。

**❌ Card grid里每个card长一样**
Asymmetric、不同大小的cards、有的带image有的只有文字、有的跨列——这才像真设计师做的。

## 内容准则

### 1. Don't add filler content

每个元素都必须earn its place。空白是设计问题，用**构图**解决（对比、节奏、留白），**不是**靠内容填满。

**判断filler的问题**：
- 如果去掉这段内容，设计会变差吗？答案若是"不会"，就去掉。
- 这个元素解决了什么真问题？如果是"让页面不那么空"，删掉。
- 这个stats/quote/feature有真数据支持吗？没有就不要凭空写。

「One thousand no's for every yes」。

### 2. Ask before adding material

你觉得多加一段/一页/一个section会更好？先问用户，不要单方面加。

原因：
- 用户知道他的受众比你清楚
- 加内容有成本，用户可能不想要
- 单方面加内容违反了"junior designer汇报工作"的关系

### 3. Create a system up front

探索完design context后，**先口头说出你要用的系统**，让用户确认：

```markdown
我的设计系统：
- 色彩：#1A1A1A主体 + #F0EEE6背景 + #D97757 accent（来自你的品牌）
- 字型：Instrument Serif做display + Geist Sans做body
- 节奏：section title用full-bleed彩色背景 + 白字；普通section用白背景
- 图像：hero用full-bleed照片，feature section用placeholder等你提供
- 最多用2种背景色，避免杂乱

确认这个方向我就开始做。
```

用户确认后再动手。这个check-in能避免"做完一半发现方向错"。

## Scale 规范

### 幻灯片（1920×1080）

- 正文最小 **24px**，理想 28-36px
- 标题 60-120px
- Section title 80-160px
- Hero headline 可以用 180-240px 的大字
- 永远不要用 <24px 的字放幻灯片

### 印刷文档

- 正文最小 **10pt**（≈13.3px），理想 11-12pt
- 标题 18-36pt
- Caption 8-9pt

### Web和移动端

- 正文最小 **14px**（老年人友好用16px）
- 移动端正文 **16px**（避免iOS自动缩放）
- Hit target（可点击元素）最小 **44×44px**
- 行高 1.5-1.7（中文1.7-1.8）

### 对比度

- 正文 vs 背景 **至少 4.5:1**（WCAG AA）
- 大字 vs 背景 **至少 3:1**
- 用Chrome DevTools的accessibility工具检查

## CSS 神器

**高级CSS特性**是设计师的好朋友，大胆用：

### 排版

```css
/* 让标题换行更自然，不会最后一行孤单单一个词 */
h1, h2, h3 { text-wrap: balance; }

/* 正文换行，避免寡孀和孤儿 */
p { text-wrap: pretty; }

/* 中文排版神器：标点挤压、行首行尾控制 */
p { 
  text-spacing-trim: space-all;
  hanging-punctuation: first;
}
```

### Layout

```css
/* CSS Grid + named areas = 可读性爆表 */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid对齐卡片内容 */
.card { display: grid; grid-template-rows: subgrid; }
```

### 视觉效果

```css
/* 有设计感的滚动条 */
* { scrollbar-width: thin; scrollbar-color: #666 transparent; }

/* 玻璃拟态（克制使用） */
.glass {
  backdrop-filter: blur(20px) saturate(150%);
  background: color-mix(in oklch, white 70%, transparent);
}

/* View transitions API让页面切换丝滑 */
@view-transition { navigation: auto; }
```

### 交互

```css
/* :has()选择器让条件样式变容易 */
.card:has(img) { padding-top: 0; } /* 有图片的卡片无顶padding */

/* container queries让组件真的响应式 */
@container (min-width: 500px) { ... }

/* 新的color-mix函数 */
.button:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
```

## 决策速查：当你犹豫时

- 想加个渐变？→ 大概率不加
- 想加个emoji？→ 不加
- 想给卡片加圆角+border-left accent？→ 不加，换其他方式
- 想用SVG画个hero插画？→ 不画，用placeholder
- 想加一段quote装饰？→ 先问用户有没有真quote
- 想加一排icon features？→ 先问要不要icon，可能不需要
- 用Inter？→ 换一个更有特点的
- 用紫色渐变？→ 换一个有根据的配色

**当你觉得"加一下会更好看"的时候——那通常是AI slop的征兆**。先做最简的版本，只在用户要求时加。
