# Content Guidelines：反AI slop、内容准则、Scale规范

AI slop 是默认值，不主动避开就会发生。但「默认值」会随时间变：2024 年是紫渐变和 emoji，2026 年变成了更「有品位」的样子。只禁上一代的 slop，等于在打上一场仗。

## 2026 年的 AI 默认外观（先读这个）

Anthropic 官方 frontend-design skill（2026）把当下 AI 生成页面的聚类写得很清楚（[原文](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)）：

1. **暖奶油底（接近 #F4F1EA）＋高反差衬线标题＋陶土色点缀（接近 #D97757）**。这是 Claude 自己的交互配色，也是你——模型——最容易滑进去的地方：别让它成为你没想就落下的那一个。
2. **近黑底＋单一亮色点缀**（酸绿或朱红）。
3. **报纸式版面**：细线分栏、零圆角、密集的报纸栏。
4. **SaaS 卡片套件**：内容切成一样的圆角卡片，所有东西同一个圆角、同一层浅灰阴影，渐变当装饰。
5. **模板装饰**：每个标题上面一行拉开字距的全大写小标签；用中点连成的「A · B · C」；「WORD — 片段」式标签；用 #0B0B0B、#111 代替黑；等宽字体做小数据标签；链接和按钮后面加「→」。

还有三个排版上的默认动作：标题里只给一个词换色或换斜体；所有小标签全大写；内容上方加不必要的小标签。编号（01 / 02 / 03）只在内容真是序列时才用。

**两类要分开对待：**

- **1–4 是外观家族。** 它们成为默认，正是因为它们好看；深底单点缀、暖纸衬线的方向在盲选里照样被用户认可。用了不算错，错的是三个方向挤在同一个家族、或者每个项目都长这样。`design_lint.py check` 只把它们列成「提示」，真正管它们的是 `compare`（三版挤在一起）和外观账本（和最近的项目撞了）。曾经把它们当黄灯来躲，三版一起退到浅冷规整，被评「太规整，太无聊了」。
- **5 和下面三个排版动作是模板装饰。** 它们是顺手出现的小动作，删掉几乎没有代价，`check` 列成黄灯：brief 要就照做，否则删掉那个结构。量不出来的（比如用 #111 代替黑）靠你自己看。

## 上一代 slop（2024 年前后，仍然要避开）

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

**❌ 用 SVG 手画人物和动物**
人物、动物、写实的实物和场景不要用 SVG 手画——画出来五官错位、比例诡异，一眼廉价。用真图、生成图，或一个诚实的占位（灰色矩形加「插画位 1200×800」）。

几何图形、图标、数据图表、地图与等高线、剖面示意、程序化的纹理和材质不在此列，而且往往是纯 HTML 能做出的最好的主角素材（做法见 `references/materials.md` 的 T0 档）。判断标准是做出来经不经得起逐屏看：打磨时自己看着别扭，就换成真图或占位。

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
3. 完全从零 → 从题材里采色（它的材料、产地、器物、真图里的主导色），按 `references/design-styles.md` 的「色彩推导协议」采样→收敛→论证。**不要拿 Anthropic / Claude 的品牌色当「安全默认」**——那正是 2026 年 AI 默认外观的第一条

**oklch定义色彩**是最现代的做法：
```css
:root {
  --primary: oklch(0.62 0.14 155);      /* 示例：从题材真图里采到的苔绿，色值随内容变 */
  --primary-light: oklch(0.85 0.06 155); /* 同色系浅色 */
  --primary-dark: oklch(0.42 0.15 155);  /* 同色系深色 */
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

## 正向做什么

- **胆量只花在一处**：让一个元素成为被记住的那个，周围安静克制。品味是在合适的地方足够精致，不是均匀用力——一个细节做到 120%，其余 80%。出门前照镜子，摘掉一件配饰。
- **结构件要承载信息**：边框、编号、分隔线、小标签是在编码内容关系，不是装饰。加之前问它说了什么。
- 排版细节是「品味税」：`text-wrap: pretty`、CSS Grid、`oklch()`；中文用「」引号（`references/typography.md`）。
- 不凭空发明颜色：品牌资产里吸色、内容真图里采色、题材的文化语境里取色（`references/design-styles.md` 色彩推导协议）。

**反例要看得出是反例**：任务本身要展示反设计（讲「什么是 AI slop」、做对比评测）时，别整页堆 slop，用诚实的反例容器隔离——虚线边框加「反例 · 不要这样做」角标，让反例服务叙事，不污染页面主调。

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
- 这里说的是**内容**：新的段落、页面、卖点、数据。设计上的决定（版式、图形、动效、素材）是你的本职，不用问

### 3. Create a system up front

探索完design context后，**先把你要用的系统写下来**（写进方向卡或 HTML 开头的注释）。没走三方向的任务，说给用户确认：

```markdown
我的设计系统：
- 色彩：#14261F主体 + #E6EDE4背景 + #C8553D accent（背景和主体取自你产品图里的苔绿，accent 取自 logo）
- 字型：Schibsted Grotesk做display + Source Serif 4做body
- 节奏：section title用full-bleed彩色背景 + 白字；普通section用白背景
- 图像：hero用full-bleed照片，feature section用placeholder等你提供
- 最多用2种背景色，避免杂乱

确认这个方向我就开始做。
```

走过三方向的任务，用户选定的方向已经确认了系统，不用再问一遍。

## Scale 规范

### 幻灯片（1920×1080）

- 正文最小 **24px**，理想 28-36px
- 标题 60-120px
- Section title 80-160px
- Hero headline 可以用 180-240px 的大字
- 正文永远不要 <24px；标签、注释、图表刻度不小于 16px

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

## 犹豫时问三句

想加一样东西（一段渐变、一个图标、一处动效、一张图）拿不准时，不查禁令清单，问三句：

1. **它从哪来？** 从这个题材里长出来的（它的材料、器物、数据、故事），还是从「页面一般都有这个」来的？
2. **去掉它，信息更清楚还是更糊？** 更清楚就去掉；更糊，说明它在承载内容，留下并做到位。
3. **它是这一屏唯一的主角吗？** 一屏里只让一样东西出风头，其余的安静。

过了这三句的东西，大胆做、做到位——半心半意的大胆比老实的克制更难看。没过的，不加。
编造的数据、评价、logo 墙不在此列：那是内容诚实的问题，没有就是没有。
