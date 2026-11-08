# 可编辑 PPTX 导出：HTML 硬约束 + 尺寸决策 + 常见错误

本文档讲的是**用 `scripts/html2pptx.js` + `pptxgenjs` 把 HTML 逐元素翻译成真·可编辑 PowerPoint 文本框**的路径，也是 `export_deck_pptx.mjs` 唯一支持的路径。

> ## 🔴 先选路：这份文档只讲两条路里的一条
>
> | 情况 | 走哪条 |
> |---|---|
> | **HTML 还没写**，从头做 deck | **本文**（按 4 条硬约束写 → `html2pptx.js`）。结构最干净，最适合后续编辑 |
> | **HTML 已经写好**，是视觉驱动的（flex / 居中 / 裸文字 / 背景图 / SVG 图表） | → `references/pptx-from-rendered-html.md`（读渲染后坐标，**零改造**） |
> | **甲方要求「必须用我们的模板」** | → 同上，**只能走那条**。pptxgenjs 无法以现有 pptx 为基底继承母版 |
>
> 两条路不要在同一个项目里混用。下面的 4 条约束只对本文这条路成立——
> 已经写好的视觉稿**不需要**为了转 PPTX 去重写成合规结构。
>
> **核心前提**：要走这条路，HTML 必须从第一行就按下面 4 条约束写。**不是写完再转**——事后补救会触发 2-3 小时返工（2026-04-20 期权私董会项目实测踩坑）。

---

## 画布尺寸：用 960×540pt（LAYOUT_WIDE）

PPTX 单位是 **inch**（物理尺寸），不是 px。决策原则：body 的 computedStyle 尺寸要**匹配 presentation layout 的 inch 尺寸**（±0.1"，由 `html2pptx.js` 的尺寸一致性校验强制检查）。

### 3 个候选尺寸对比

| HTML body | 物理尺寸 | 对应 PPT layout | 何时选 |
|---|---|---|---|
| **`960pt × 540pt`** | **13.333″ × 7.5″** | **pptxgenjs `LAYOUT_WIDE`** | ✅ **默认推荐**（现代 PowerPoint 16:9 标配） |
| `720pt × 405pt` | 10″ × 5.625″ | 自定义 | 仅当用户指定「老版 PowerPoint Widescreen」模板时 |
| `1920px × 1080px` | 20″ × 11.25″ | 自定义 | ❌ 走本文这条路时是非标尺寸，投影后字体显得异常小。⚠️ 但**继承甲方模板时画布必须跟模板走**（实测遇到过 26.67″×15″），那条路见 `pptx-from-rendered-html.md` |

**别把 HTML 尺寸当分辨率想。** PPTX 是矢量文档，body 尺寸决定的是**物理尺寸**不是清晰度。超大 body（20″×11.25″）不会让文字更清晰——只会让字号 pt 相对画布变小，投影/打印时反而更难看。

### body 写法三选一（等价）

```css
body { width: 960pt;  height: 540pt; }    /* 最清晰，推荐 */
body { width: 1280px; height: 720px; }    /* 等价，px 习惯 */
body { width: 13.333in; height: 7.5in; }  /* 等价，英寸直觉 */
```

配套的 pptxgenjs 代码：

```js
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, 无需自定义
```

---

## 4 条硬约束（违反会直接报错）

`html2pptx.js` 对 DOM 做一次遍历，按标签和 computed style 把每个元素分类成「文本框 / 形状 / 图片 / 忽略」。分类规则背后是 PowerPoint 文件格式本身的限制，投射到 HTML 上就是下面 4 条——写的时候脑子里过一遍，能省掉转出来再逐页返工的时间。

### 规则 1：DIV 里不能直接躺文字 — 用 `<p>` 或 `<h1>`-`<h6>` 包一层

```html
<!-- ❌ 错误：文字是 div 的直接子文本节点 -->
<div class="metric">日活 12.4 万，环比 +8%</div>

<!-- ✅ 正确：文字包进 <p>/<h1>-<h6>，div 只负责定位/背景 -->
<div class="metric"><p>日活 12.4 万，环比 +8%</p></div>
```

**判定方式**：脚本检查的是 div 的**直接子节点**里有没有非空白的文本节点——嵌套在 `<p>`/`<h1>`-`<h6>` 里的文字不算，只有「字直接贴在 div 上」才算违规。报错里会带上违规文字的前 50 个字（超出用 `...`收尾），方便定位是哪一段。

**span 同理不能单独顶用**：span 是行内元素，脚本只会把它当成 `<p>`/`<h1>`-`<h6>` 内部的一段局部样式覆盖（加粗、换色、下划线），不会把它单独提成一个文本框。想要一段独立可编辑的文字，外面必须有 `<p>`/`<h1>`-`<h6>`。

### 规则 2：不支持 CSS 渐变（本质是「不支持 background-image」的一种）

```css
/* ❌ 错误：linear-gradient/radial-gradient 都算 background-image */
.banner { background: linear-gradient(135deg, #FF6B6B, #4ECDC4); }

/* ✅ 正确：纯色 */
.banner { background: #FF6B6B; }

/* ✅ 需要多色过渡观感，用几个纯色 flex 子块错位排列，靠透明度或色阶模拟渐变感 */
.banner { display: flex; }
.banner div { flex: 1; }
.banner .c1 { background: #FF6B6B; }
.banner .c2 { background: #FF9B6B; }
.banner .c3 { background: #4ECDC4; }
```

**为什么**：脚本对 div 的校验只看 computed `background-image` 是不是 `none`——只要不是 `none`，不管里面是一张图还是一个 CSS 渐变函数，都会被拦下来（渐变本质上就是一种特殊的 background-image）。PowerPoint 的原生 shape fill 只有纯色这一种是 pptxgenjs 稳定支持的，渐变需要单独一套 OOXML 结构，工具链目前没做。

### 规则 3：背景/边框/阴影只能挂在 DIV 上，文字标签（含 `<ul>`/`<ol>`）一概不行

```html
<!-- ❌ 错误：<h2> 自己带了背景和圆角 -->
<h2 style="background: #FFD700; border-radius: 6pt; padding: 6pt 10pt;">核心结论</h2>

<!-- ✅ 正确：外层 div 扛背景/边框，<h2> 只管文字 -->
<div style="background: #FFD700; border-radius: 6pt; padding: 6pt 10pt;">
  <h2>核心结论</h2>
</div>
```

**为什么**：脚本对每一个 `<p>`/`<h1>`-`<h6>`/`<ul>`/`<ol>`（以及它们内部收编的 `<li>`）都会先单独检查一遍自身的 background/border/box-shadow——三者任意一个非空就直接报错，连是不是同时命中"占位符"（`class` 里带 `placeholder`）这类其它规则都不管，直接判定为违规。这条检查发生在所有其它分类之前，因为 PowerPoint 里"能画背景/边框/阴影的 shape"和"能装文字的 text frame"是两种不同对象，`<p>`/`<h*>` 只会被翻成后者，没有地方安放前者的属性。

### 规则 4：DIV 不能用 `background-image` — 图片一律用 `<img>` 标签

```html
<!-- ❌ 错误 -->
<div style="background-image: url('trend.png'); width: 300pt; height: 200pt;"></div>

<!-- ✅ 正确 -->
<img src="trend.png" style="position: absolute; left: 60pt; top: 80pt; width: 300pt; height: 200pt;" />
```

**为什么**：脚本只从 `<img>` 元素读取（浏览器解析后的）绝对 `src` 来生成图片对象；它完全不解析 div 的 `background-image` 属性里那个 `url(...)`。命中这条时脚本不会连累这个 div 的子孙——`div` 自己不产出任何东西，但内部如果还包了 `<p>`/`<img>` 等，仍会各自继续被单独处理，只是这层背景图没了。想要图片和文字叠在一起，就把 `<img>` 和文字层分别摆成两个独立元素，靠定位对齐。

---

## 合并文本框（`data-pptx-merge`）

**默认行为**：HTML 里每个 `<p>`/`<h1>`-`<h6>` 在 PPTX 里都是**独立文本框**。卡片里写 3 个 `<p>` → PPT 里 3 个文本框摞着，编辑时不能整段回车换行加段，得逐个改字号/对齐。

**解决方法**：给外层 div 加 `data-pptx-merge="true"`，容器内的所有 `<p>/<h*>` 会合并为**一个可编辑文本框**，每段之间用段落分隔符隔开，PPT 里就是一段一段连续编辑。

```html
<!-- ✅ 合并写法：4 段全部在一个文本框里 -->
<div class="card" data-pptx-merge="true"
     style="position: absolute; top: 60pt; left: 60pt; width: 420pt;
            background: #1A4A8A; border-radius: 8pt; padding: 20pt 24pt;">
  <h2 style="font-size: 24pt; color: #FFFFFF;">标题</h2>
  <p  style="font-size: 14pt; color: #DDEEFF;">第一段正文。</p>
  <p  style="font-size: 14pt; color: #FFD166;">第二段：换颜色作为强调。</p>
  <p  style="font-size: 14pt; color: #DDEEFF;">第三段：同一个文本框里继续写。</p>
</div>
```

**保留的样式**（per-paragraph 作为 run options 写入）：`font-size`、`color`、`font-family`、`font-weight`（bold）、`font-style`（italic）、`text-decoration: underline`、`<b>/<i>/<u>/<strong>/<em>/<span>` 内联样式。

**取自第一段、整框统一**：`text-align`、`line-height`。因为 PowerPoint 的对齐和行距是 paragraph/textbox 级别——一框里只能有一种对齐。如果几段对齐不同，请别用 merge，让它们各自独立。

**容器自身的 `background`/`border`/`box-shadow`/`border-radius`** 照常作为 shape 渲染，行为和普通 div 完全一样——也就是说蓝色卡片底 + 文本仍然是「shape + text frame」两层，只是文本层从 3-4 个文本框塌缩成 1 个。

**限制**：
- 不能嵌套 `data-pptx-merge`（会报错）。
- 容器不能用 `background-image`（同 4 条硬约束规则 4）。
- 容器内不要再放有 `background`/`border` 的子 div——它们仍会被当作独立 shape 渲染，但里面的文字已被合并走了，可能产生视觉错位。

**什么时候用**：内容会反复改、要在 PPT 里继续编辑的场景。一次性导出归档的不用加，行为一致。

---

## Path A HTML 模板骨架

每张 slide 一个独立 HTML 文件，彼此作用域隔离（避开单文件 deck 的 CSS 污染）。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 960pt; height: 540pt;           /* ⚠️ 匹配 LAYOUT_WIDE */
    font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
    background: #FEFEF9;                    /* 纯色，不能渐变 */
    overflow: hidden;
  }
  /* DIV 负责布局/背景/边框 */
  .card {
    position: absolute;
    background: #1A4A8A;                    /* 背景在 DIV 上 */
    border-radius: 4pt;
    padding: 12pt 16pt;
  }
  /* 文字标签只负责字体样式，不加背景/边框 */
  .card h2 { font-size: 24pt; color: #FFFFFF; font-weight: 700; }
  .card p  { font-size: 14pt; color: rgba(255,255,255,0.85); }
</style>
</head>
<body>

  <!-- 标题区：外层 div 定位，内层文字标签 -->
  <div style="position: absolute; top: 40pt; left: 60pt; right: 60pt;">
    <h1 style="font-size: 36pt; color: #1A1A1A; font-weight: 700;">标题用断言句，不是主题词</h1>
    <p style="font-size: 16pt; color: #555555; margin-top: 10pt;">副标题补充说明</p>
  </div>

  <!-- 内容卡片：div 负责背景，h2/p 负责文字 -->
  <div class="card" style="top: 130pt; left: 60pt; width: 240pt; height: 160pt;">
    <h2>要点一</h2>
    <p>简短说明文字</p>
  </div>

  <!-- 列表：使用 ul/li，不用手动 • 符号 -->
  <div style="position: absolute; top: 320pt; left: 60pt; width: 540pt;">
    <ul style="font-size: 16pt; color: #1A1A1A; padding-left: 24pt; list-style: disc;">
      <li>第一条要点</li>
      <li>第二条要点</li>
      <li>第三条要点</li>
    </ul>
  </div>

  <!-- 插图：用 <img> 标签，不用 background-image -->
  <img src="illustration.png" style="position: absolute; right: 60pt; top: 110pt; width: 320pt; height: 240pt;" />

</body>
</html>
```

---

## 常见错误速查

| 错误信息 | 原因 | 修复方法 |
|---------|------|---------|
| `<div> 里直接写了文字「XXX」` | div 里有裸文字 | 把文字包进 `<p>`、`<h1>`-`<h6>` 或 `<ul>`/`<ol>` |
| `<div> 背景不能用 CSS 渐变` | 用了 linear/radial-gradient | 换成纯色 background-color，或把渐变先导出成 PNG 再用 `<img>` / `slide.addImage()` 放上去 |
| `文字标签 <p> 上设置了 background…` | `<p>` 标签加了背景/边框/阴影 | 外套 `<div>` 承载背景，`<p>` 只写文字 |
| `<div> 不能用 background-image` | div 用了 background-image | 改为 `<img>` 标签 |
| `内容纵向超出页面 Xpt` | 内容超出 540pt | 减少内容或缩小字号，或 `overflow: hidden` 截断 |
| `页面尺寸不一致` | body 尺寸和 pres layout 对不上 | body 用 `960pt × 540pt` 配 `LAYOUT_WIDE`；或 defineLayout 自定义尺寸 |
| `文本框「XXX」离页面底边只有…` | 大字号 `<p>` 距离 body 底边 < 0.5 inch | 往上挪，留足下边距；PPT 底部本身就会被遮住一部分 |

---

## 基本工作流（3 步出 PPTX）

### Step 1：按约束写每页独立 HTML

```
我的Deck/
├── slides/
│   ├── 01-cover.html    # 每个文件都是完整 960×540pt HTML
│   ├── 02-agenda.html
│   └── ...
└── illustration/        # 所有 <img> 引用的图片
    ├── chart1.png
    └── ...
```

### Step 2：写 build.js 调用 `html2pptx.js`

```js
const pptxgen = require('pptxgenjs');
const html2pptx = require('../scripts/html2pptx.js');  // 本 skill 脚本

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch，匹配 HTML 的 960×540pt

  const slides = ['01-cover.html', '02-agenda.html', '03-content.html'];
  for (const file of slides) {
    await html2pptx(`./slides/${file}`, pres);
  }

  await pres.writeFile({ fileName: 'deck.pptx' });
})();
```

### Step 3：打开检查

- PowerPoint/Keynote 打开导出 PPTX
- 双击任意文字应能直接编辑（如果是图片说明第 1 条违反了）
- 验证 overflow：每页应该在 body 范围内，没有被截

---

## 这条路径 vs 其他选项（什么时候选什么）

| 需求 | 选什么 |
|------|------|
| 同事会改 PPTX 里的文字 / 发给非技术人员继续编辑 | **本文路径**（editable，需从头按 4 条约束写 HTML） |
| 只是演讲用 / 发存档，不再改 | `export_deck_pdf.mjs`（多文件）或 `export_deck_stage_pdf.mjs`（单文件 deck-stage），出矢量 PDF |
| 视觉自由度优先（动画、web component、CSS 渐变、复杂 SVG），接受不可编辑 | **PDF**（同上）——PDF 既保真又跨平台，比「图片 PPTX」更合适 |

**绝不要在视觉自由写好的 HTML 上硬跑 html2pptx**——实测视觉驱动的 HTML pass 率 < 30%，剩下的逐页改造比重写还慢。这种场景应该出 PDF，不是硬挤 PPTX。

---

## Fallback：已有视觉稿但用户坚持要 editable PPTX

偶尔会遇到这个场景：你/用户已经写好一份视觉驱动的 HTML（渐变、web component、复杂 SVG 都用上了），本来出 PDF 最合适，但用户明确说「不行，必须是可编辑的 PPTX」。

**不要硬跑 `html2pptx` 期待它 pass**——实测视觉驱动 HTML 在 html2pptx 上 pass 率 <30%，剩下 70% 会报错或走样。

> 🔴 **2026-09 起，先试第三条路再考虑下面的 A/B**：`scripts/pptx_from_rendered.py` 读的是浏览器
> **渲染完之后**的坐标，不是源码，所以视觉驱动的 HTML 可以零改造直接转（实测 20 页全过），
> 也不必让用户在「丢视觉」和「丢可编辑」之间二选一。见 `references/pptx-from-rendered-html.md`。
> 下面的 A/B 只在那条路也不适用时才提。

正确的 fallback 是：

### Step 1 · 先告知局限性（透明沟通）

一句话跟用户说清三件事：

> 「你现在的 HTML 用了 [具体列出：渐变 / web component / 复杂 SVG / ...]，直接转 editable PPTX 会 fail。我有两个方案：
> - A. **出 PDF**（推荐）——视觉 100% 保留，接收方能看能印但不能改文字
> - B. **以视觉稿为蓝本，重写一版 editable HTML**（保留色彩/布局/文案的设计决策，但按 4 条硬约束重新组织 HTML 结构，**牺牲**渐变、web component、复杂 SVG 等视觉能力）→ 再导出 editable PPTX
>
> 你选哪个？」

不要把 B 方案说得云淡风轻——明确告知**会丢失什么**。让用户做取舍。

### Step 2 · 如果用户选 B：AI 主动改写，不要求用户自己写

这里的 doctrine 是：**用户给的是设计意图，你负责翻译成合规实现**。不是让用户去学 4 条硬约束然后自己重写。

改写时的遵循原则：
- **保留**：色彩系统（主色/辅色/中性色）、信息层级（标题/副标题/正文/注解）、核心文案、layout 骨架（上中下 / 左右分栏 / 网格）、页面节奏
- **降级**：CSS 渐变 → 纯色或 flex 分段、web component → 段落级 HTML、复杂 SVG → 简化的 `<img>` 或纯色几何、阴影 → 删除或降为极弱、自定义字体 → 向系统字体靠齐
- **重写**：裸文字 → 包进 `<p>` / `<h*>`、`background-image` → `<img>` 标签、`<p>` 上的背景边框 → 外层 div 承载

### Step 3 · 产出对照清单（透明交付）

改写完成后给用户一份 before/after 对照，让他知道哪些视觉细节被简化了：

```
原设计 → editable 版调整
- 标题区紫色渐变 → 主色 #5B3DE8 纯色背景
- 数据卡片阴影 → 删除（改为 2pt 描边区分）
- 复杂 SVG 折线图 → 简化为 <img> PNG（从 HTML 截图生成）
- Hero 区 web component 动效 → 静态首帧（web component 无法翻译）
```

### Step 4 · 导出 & 双格式交付

- `editable` 版 HTML → 跑 `scripts/export_deck_pptx.mjs` 出可编辑 PPTX
- **建议同时保留**原视觉稿 → 跑 `scripts/export_deck_pdf.mjs` 出高保真 PDF
- 双格式交付给用户：视觉稿的 PDF + 可编辑的 PPTX，各司其职

### 什么情况下直接拒绝 B 方案

个别场景下改写代价过高，应该劝用户放弃 editable PPTX：
- HTML 核心价值是动画或交互（改写后只剩静态首帧，信息量损失 50%+）
- 页数 > 30，改写成本超过 2 小时
- 视觉设计深度依赖精确 SVG / 自定义 filter（改写后和原图几乎无关）

此时告诉用户：「这个 deck 改写代价过高，建议出 PDF 而不是 PPTX。如果接收方确实要 pptx 格式，就接受视觉会大幅朴素化——要不要换成 PDF？」

---

## 为什么 4 条约束不是 Bug 而是物理约束

这 4 条不是 `html2pptx.js` 作者偷懒——它们是 **PowerPoint 文件格式（OOXML）本身的约束**投射到 HTML 上的结果：

- PPTX 里文字必须在 text frame（`<a:txBody>`），对应段落级 HTML 元素
- PPTX 的 shape 和 text frame 是两个对象，无法在同一 element 上同时画背景和写文字
- PPTX 的 shape fill 对 gradient 支持有限（仅某些 preset gradients，不支持 CSS 任意角度渐变）
- PPTX 的 picture 对象必须引用真实图片文件，不是 CSS 属性

理解这点后，**不要期待工具变聪明** —— 是 HTML 写法要适配 PPTX 格式，不是反过来。
