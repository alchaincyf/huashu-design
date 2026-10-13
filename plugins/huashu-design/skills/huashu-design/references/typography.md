# Typography：排印推理系统

> **这不是字体清单，是配对与排版的推理规则。** `design-styles.md` 已经给了 60 种风格各自的字体名；本文回答的是「为什么这样配」「拿到任意内容怎么推导出字号/行长/字重」。目标：同一个风格标签，落到不同内容上，能推导出不同的排印结果，而不是每次都抄同一套字号。
>
> 前置纪律不变：有 design context 先 lift 用户自己的字体（见 `design-context.md`），本文的一切只在「用户没有字体规范」时启用。

## 0. 排印决策顺序

拿到内容后按这个顺序推，每一步都由上一步决定，不许跳到「直接选个好看的字体」：

1. **内容类型** → 长文阅读 / 数据密集 / 营销大字 / UI 界面，决定音阶比例和正文字号
2. **语言构成** → 纯中文 / 中西混排 / 纯西文，决定 fallback 链写法和行高基准
3. **风格温度**（对齐 `design-styles.md` 的安静/中性/大胆三档）→ 决定字体配对的对比度来源
4. **最后才是字体名** → 从下面第 3 章配对表选，或从风格库对应条目取

为什么：先选字体名的做法，会让「内容是什么」对排印零影响，这正是千人一面的病根。

## 1. 字号音阶（modular scale）

字号不是拍脑袋，是从正文字号乘一个固定比例逐级推出来的。比例决定页面的「戏剧性」：

| 比例 | 名字 | 性格 | 适用 |
|------|------|------|------|
| 1.2 | 小三度 | 平缓、层级多而不吵 | dashboard、文档站、信息密集 UI |
| 1.25 | 大三度 | 通用、安全 | 大多数网页、产品落地页 |
| 1.333 | 纯四度 | 标题明显跳出 | editorial 长文、营销页、报告 |
| 1.5 | 纯五度 | 戏剧性、层级极少 | 大字报、slides、hero 一屏一句 |

**推导规则**：正文定 16-18px（中文正文建议 17-18px，汉字笔画密、同字号比西文显挤），然后按比例上推标题、下推 caption。层级超过 5 档就是失控，砍掉。

| 档位 | 1.25 比例下的参考值 | 用途 |
|------|--------------------|------|
| caption | 12-13px | 图注、meta 信息、EXIF 式小字 |
| small | 14px | 辅助说明、表格 |
| body | 16-18px | 正文，一切的基准 |
| h3 | ≈1.25x | 小节标题 |
| h2 | ≈1.56x | 章节标题 |
| h1 | ≈1.95x | 页面标题 |
| display | 3x-8x，脱离音阶自由发挥 | hero 巨字，由版面而非音阶决定 |

**流式字号写法**（display 档必用，避免大屏死板小屏溢出）：

```css
/* clamp(最小值, 首选值, 最大值)：首选值 = 基础rem + 视口系数 */
h1 { font-size: clamp(2rem, 1.2rem + 3.5vw, 4.5rem); }
.display { font-size: clamp(3rem, 1rem + 9vw, 9rem); }
/* 正文不要 clamp 出大幅波动，16→18 的窄区间即可 */
body { font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem); }
```

为什么 display 脱离音阶：hero 巨字是版面元素不是文本层级，它的尺寸由「占视口几成」决定，用 vw 推导比用音阶推导更合理。

## 2. 行长与行高

### 行长（比字体选择更影响可读性）

| 语言 | 舒适区 | CSS 实现 |
|------|--------|----------|
| 西文正文 | 45-75 字符，最佳 66 | `max-width: 65ch` |
| 中文正文 | 一行 22-38 字，最佳 28-32 字 | `max-width: 36em`（em 随字号缩放） |
| 图注/侧栏 | 更短，中文 15-20 字 | 窄容器天然限制 |

为什么中文更短：汉字是无空格的致密方块字，同宽度下承载的信息量明显高于西文，同样的眼跳次数中文读进更多内容，行太长回行时找不到下一行开头。

### 行高随行长联动

行高不是常数，是行长的函数。行越长，眼睛回行距离越远，需要更大的行间距当「轨道」：

| 场景 | 西文 | 中文 |
|------|------|------|
| display 大字（1-2 行） | 0.95-1.1 | 1.1-1.25 |
| 标题（h1-h3） | 1.1-1.3 | 1.3-1.4 |
| 短行正文（<30 字/行） | 1.4-1.5 | 1.6-1.7 |
| 长行正文（接近上限） | 1.6 | 1.8-2.0 |

中文全线比西文高 0.2 左右：汉字是满格方块，没有西文小写字母之间的天然空隙，行距不足会糊成一片。

### text-wrap（2024+ 浏览器都支持了，白拿的排印质量）

```css
h1, h2, h3 { text-wrap: balance; }  /* 标题多行时各行长度均衡，消灭孤字行 */
p { text-wrap: pretty; }            /* 正文消灭行尾孤词（西文效果明显，中文轻微） */
```

balance 只用于 ≤4 行的标题（算法限制 6 行且有性能成本）；pretty 全局给正文无副作用。

## 3. 十组开源字体配对（西文）

配对的三种对比度来源，配之前先想清楚用哪种：

- **形式对比**：衬线 display x 无衬线 body（最经典，但要 x-height 咬合，否则视觉字号跳）
- **同族咬合**：superfamily 同一设计骨架（零风险，代价是平淡）
- **时代对比**：古典字形 x 现代字形（谱系差 200 年以上才有张力，差 50 年只显得乱）

| # | 配对（display + body） | 配对逻辑 | 温度 | 获取 |
|---|------------------------|----------|------|------|
| 1 | Newsreader + Geist | 形式对比：屏显优化的过渡衬线，x-height 高、与 Geist 咬合好；**Fraunces 的正牌平替** | 安静 | Google Fonts / Vercel 官方仓库 |
| 2 | Source Serif 4 + Source Sans 3 | 同族咬合：Adobe 同设计系统，字高字重节奏完全对齐，报告和文档零翻车 | 安静 | Google Fonts |
| 3 | EB Garamond + IBM Plex Sans | 时代对比：16 世纪法国老衬线 x 2017 理性 grotesque，差 400 年的张力；注意 Garamond x-height 低，同行混用需字号补偿（+8% 是经验起点，系统解法用 `font-size-adjust`，见第 4 章） | 安静·文气 | Google Fonts |
| 4 | Lora + Hanken Grotesk | 形式对比：Lora 笔刷感衬线中等反差，屏显耐看；Hanken 是 Söhne 气质的开源近亲 | 中性 | Google Fonts |
| 5 | Instrument Serif + Geist | 形式对比：只有 400 一档字重，天生 display-only，正文必须交给 sans。⚠️ 正在被 AI 工具用烂的路上，2026 年慎用于「想显得独特」的场合 | 中性 | Google Fonts |
| 6 | Schibsted Grotesk + Source Serif 4 | 反转结构：grotesque 当 display、衬线当正文，媒体感；**Space Grotesk 泛滥后的平替**（挪威 Schibsted 报业定制开源，带新闻血统） | 中性 | Google Fonts |
| 7 | Bricolage Grotesque + Newsreader | 形式对比：Bricolage 的 ink trap 和不规则细节在大字号才显现，天生 display；配安静衬线正文形成粗野 x 文雅 | 大胆 | Google Fonts |
| 8 | Archivo（Expanded/Black）+ Inter | 大字报结构：Archivo 宽体黑重压场，Inter 只当 14-16px 正文工蜂（这是 Inter 的正确用法，见反模式） | 大胆 | Google Fonts |
| 9 | Cormorant Garamond + Work Sans | 高反差奢侈感：Cormorant 笔画极细，**必须 ≥40px 才成立**，小字号笔画会断；适合时尚/太空图录风 | 大胆 | Google Fonts |
| 10 | Geist Mono / JetBrains Mono + Geist | 等宽当主角：命令行感、工程感；等宽只用于标签/编号/代码，整段正文用等宽是灾难（行长膨胀 30%） | 中性·技术 | Vercel / JetBrains 官方，均 OFL |

**已被用烂名单**（AI 生成页面的指纹，用了等于自曝）：

| 烂大街 | 为什么烂 | 平替 |
|--------|----------|------|
| Fraunces 当 display | 2023-2025 所有 AI 设计工具的默认「有品位」选项 | Newsreader、Libre Caslon Text |
| Inter 当 display | Inter 是为 UI 小字设计的，大字号下匀质无表情 | Archivo、Anton、Schibsted Grotesk |
| Space Grotesk | 「科技感」的偷懒答案，泛滥于加密/AI 落地页 | Schibsted Grotesk、Familjen Grotesk |
| Playfair Display | 「优雅」的偷懒答案，婚礼请柬既视感 | Cormorant（更极端）、DM Serif Display（更憨） |

## 4. 中文排印（本文最重的一章）

西文排印有百年成熟工具链，中文没有。AI 设计工具在中文上集体摆烂（默认交给系统字体、直接套西文规则），这里是差异化所在。

### 4.1 开源/免费商用中文字体地图

| 字体 | 类别 | 气质 | 温度 | 获取 |
|------|------|------|------|------|
| 思源宋体（Noto Serif SC） | 宋体 | 出版正统、7 字重齐全，Heavy 可当 display | 安静-中性 | Google Fonts，OFL |
| 思源黑体（Noto Sans SC） | 黑体 | 中文界的 Inter：可靠、无表情，当默认正文没错但没个性 | 全温度兜底 | Google Fonts，OFL |
| 霞鹜文楷 | 楷体 | 手写温度、亲切，适合文艺/教育/个人博客正文与引文 | 安静·暖 | GitHub lxgw/LxgwWenKai，OFL |
| 霞鹜新晰黑 | 黑体 | 比思源黑更瘦更透气的屏显黑，正文久读不累 | 安静 | GitHub lxgw/LxgwNeoXiHei |
| 得意黑 Smiley Sans | 斜黑体 | **中文世界罕见的原生斜体**，运动感、标题专用；正文用它会晕 | 大胆 | GitHub atelier-anchor/smiley-sans，OFL |
| 汇文明朝体 | 旧字形明朝 | 老印刷铅字气、复古出版，适合书封/文化类 display | 中性-大胆·复古 | 猫啃网/GitHub，免费商用 |
| 京华老宋体 | 老宋 | 笔画方硬的标题宋，报头感 | 大胆·复古 | 猫啃网，免费商用 |
| 源流明体/源样明体 | 明朝体（繁向） | 思源宋改刻，保留传统字形细节，繁体内容首选 | 安静·古典 | GitHub ButTaiwan，OFL |
| 未来荧黑 Glow Sans | 几何黑 | 思源黑衍生的现代几何黑，多宽度（Compressed 可做窄长 display） | 中性-大胆·现代 | GitHub welai/glow-sans，OFL |
| MiSans / HarmonyOS Sans / OPPO Sans | 厂商 UI 黑 | 比思源黑略有性格的 UI 黑，App 原型合适 | 中性 | 各厂官网，免费商用 |

选型推理：**正文只在宋/黑/楷里选**（其余都是 display 字体，整段用会累）；display 想要个性时才去动得意黑/老宋/明朝体。中文字体一个顶西文十个（单文件 5-15MB），一页最多两个中文字体家族，为加载和统一性两个原因。

### 4.2 中西混排规则

**fallback 链是第一杠杆**：中文字体自带的西文字符普遍难看（思源黑的拉丁字母呆板），把西文字体放在前面，拉丁字符和数字被它接住，汉字自动落到后面的中文字体：

```css
/* 西文在前，中文在后，系统中文兜底，泛型收尾 */
font-family: "Geist", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
/* 衬线同理 */
font-family: "Newsreader", "Noto Serif SC", "Songti SC", serif;
```

为什么这个顺序：font-family 是逐字符匹配的，西文字体不含 CJK 码位，汉字自然穿透到中文字体。反过来写（中文在前）西文字符全被中文字体吃掉，等于白配。

**字号补偿**：同字号下西文小写视觉偏小（x-height 只占字身一半，汉字占满）。两种解法：

```css
/* 解法一：font-size-adjust 让 fallback 字体按 x-height 归一（Chrome 127+/FF/Safari 17+） */
:root { font-size-adjust: from-font; }
/* 解法二：选 x-height 高的西文体（Geist/Inter/Source Sans 都高），混排天然齐 */
```

**baseline 对齐**：中西 baseline 不一致时症状是英文单词在中文行里「下沉」。优先换 x-height 更高的西文体；个别 display 场景用 `vertical-align: -0.02em~-0.06em` 微调西文 span，正文别这么修（维护成本大于收益）。

**数字规则**：数字一律走西文字体（fallback 链已保证），数据表格必须加 `font-variant-numeric: tabular-nums`，否则 1 和 8 宽度不同，列会抖。

**中英之间不加空格**：这是本仓库规范（花叔明确不用盘古之白），靠 fallback 链的字体本身留白，不靠手动敲空格。

### 4.3 中文没有斜体

中文字形没有 italic 传统，浏览器遇到 `font-style: italic` 会机械倾斜汉字（faux italic），笔画变形、极丑。强调手段替换表：

| 西文习惯 | 中文替代 | CSS |
|----------|----------|-----|
| italic 强调 | 换字重 | `font-weight: 600`（前提：字体真有这档字重） |
| italic 书名/引用 | 底色高亮 | `background: linear-gradient(transparent 60%, #FFE9A8 60%)` 荧光笔式 |
| italic 引文块 | 换字体 | 引文整段换霞鹜文楷，楷体本身就是中文的「引用语气」 |
| italic 专名 | 颜色/着重号 | `text-emphasis: dot`（着重号，中文原生强调，支持度已可用） |

保险丝：`font-synthesis: none;` 全局禁掉合成斜体和合成加粗，宁可不强调也不接受变形字。

### 4.4 标点规范

| 规则 | 做法 | 为什么 |
|------|------|--------|
| 引号 | 直角引号「」『』，不用弯引号 "" | 弯引号在中文字体里是全角占位但形状是西文的，视觉漂浮；「」是本仓库硬规范 |
| 避头尾 | `line-break: strict;` | 禁止句号逗号出现在行首、开引号出现在行尾，这是中文排版的底线 |
| 标点悬挂 | `hanging-punctuation: first allow-end;`（仅 Safari）；跨浏览器用 `text-indent: -0.5em` 处理段首开引号 | 段首的开引号不悬挂会让首行看起来缩进了半格，视觉左边缘不齐 |
| 连续标点挤压 | `font-feature-settings: "halt";`（行尾挤压）或 `"palt"`（全比例宽度，需配合 letter-spacing） | 全角标点连排（如「）。」）会出现一个半字宽的空洞，halt 收窄它 |

### 4.5 中文 letter-spacing 区间

| 场景 | 区间 | 为什么 |
|------|------|--------|
| 正文 | 0 至 0.05em | 微加字距提升透气度；超过 0.05em 词的完形被打散，读速下降 |
| 标题（24-48px） | 0 | 汉字方块字距天然均匀，不需要西文式 tracking 调整 |
| display 巨字（>60px） | -0.02em 至 0 | 大字号下字面之间的空隙被放大，微收更紧凑；再负就笔画相撞 |
| 全大写西文小标签 | 0.08-0.15em | 唯一需要大正字距的场景，且只对西文大写生效 |

**中文永远不要用西文那套「display 收 -0.05em」**：汉字是满格设计，负字距直接笔画打架。

### 4.6 中文 display 大字

中文没有西文那种 Ultra Thin 到 Black 的 display 字体生态，大字的戏剧性要靠推理制造：

- **字重对比是主武器**：思源宋 Heavy 900 压 Light 300，同一字体两个极端字重同屏，比换字体更有张力且零加载成本
- **笔画密度决定可用字号下限**：笔画细/反差大的字体（宋体细横、Cormorant 式）只在大字号成立；小于 24px 细笔画开始断笔，正文必须回到黑体/中等笔画
- **反向也成立**：笔画重的字（黑体 Black、老宋）在超大字号下墨量过大，「一」和「灥」墨量差被放大，密度不均的标题考虑换低一档字重
- **竖排是中文独有的 display 武器**：`writing-mode: vertical-rl` 做书脊式标题、诗词、目录，西文做不到；注意竖排里的西文和数字用 `text-orientation: upright` 或 `text-combine-upright: all`（两位数字合体直立）

## 5. 反模式清单

| ❌ 反模式 | 为什么错 |
|-----------|----------|
| 全场 Inter（display+body 一把梭） | Inter 是 UI 小字工具，当 display 匀质无表情；这是「AI 生成页面」的头号指纹 |
| 中文交给 `sans-serif` 系统默认 | Windows 落到中易宋体/雅黑、macOS 落到苹方，同一页面跨设备完全两张脸，等于没做设计 |
| faux italic / faux bold | 浏览器合成变形：斜体扭曲汉字，合成加粗把笔画糊成墨团；用 `font-synthesis: none` 断根 |
| 大标题字距过松 | 西文 display 需要收紧（大字号空隙被放大），AI 常反着来加 +0.05em，标题松垮像临时占位 |
| 行长失控（无 max-width） | 大屏上一行 60 个汉字，读者回行必迷路；可读性问题里行长失控排第一，比字体选错伤害大 |
| 字号档位 >6 档 | 层级贬值，读者分不清什么重要；音阶的意义就是强制克制 |
| 只有 400/700 两档字重 | 层级全靠字号撑，页面平；variable font 时代 300-900 都是免费的表达维度 |
| 表格/数据不用 tabular-nums | 数字宽度不等，列左右抖动，数据可信感直接打折 |
| 中文正文用 display 字体（得意黑/老宋整段排） | display 字体的个性在正文里变成阅读阻力，200 字后就累 |
| 中西混排中文字体放 fallback 链最前 | 拉丁字符全被中文字体自带的难看西文吃掉，配好的西文体永远轮不到出场 |

## 6. CSS 实现要点

```css
:root {
  /* 1. fallback 链：西文 → 中文 → 系统中文 → 泛型（顺序即规则，见 4.2） */
  --font-body: "Geist", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-display: "Newsreader", "Noto Serif SC", "Songti SC", serif;

  /* 2. 禁合成：不接受浏览器伪造的斜体/加粗（中文场景必开） */
  font-synthesis: none;

  /* 3. 中文断行底线 */
  line-break: strict;        /* 避头尾 */
  overflow-wrap: break-word; /* 长 URL/英文串不撑破容器 */
}

body {
  font-family: var(--font-body);
  font-size: 17px;           /* 中文正文基准，见第 1 章 */
  line-height: 1.8;          /* 中文行高基准，见第 2 章 */
  /* 正文开启标准连字，关闭花哨特性 */
  font-feature-settings: "liga" 1, "calt" 1;
}

/* 数据场景：等宽数字 + 斜杠零（0 和 O 不混淆） */
.data, table { font-variant-numeric: tabular-nums slashed-zero; }

/* 西文小标签：全大写 + 大字距的唯一合法场景 */
.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; }

/* 标点挤压：中文 display 大字里全角标点的空洞收窄 */
.display-cjk { font-feature-settings: "halt" 1; }
```

**中文字体加载**（单文件 5-15MB，直接引全量会毁掉首屏）：

- 首选 Google Fonts 的 Noto SC 系（已按 unicode-range 自动切成上百个分片，浏览器只下用到的字）
- self-host 个性字体（霞鹜/得意黑等）必须先子集化：`cn-font-split` 或 fonttools 的 `pyftsubset`，正文字体按常用 3500 字切，display 字体按实际出现的字符切（一张海报往往只有 20 个字，子集能压到 50KB 以内）
- `font-display: swap` 保底，中文字体下载慢，白屏等字体是最差体验
