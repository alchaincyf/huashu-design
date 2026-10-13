# 设计风格库：网页 20 种 + PPT 20 种 + 信息图 20 种（HTML 原生优先）

> **2026-06 重构**。基于对全球 10 大网站类型 + 10 大演示类型、各 top5 公认最佳设计（共 100 个真实案例）的调研反推。
> 旧版 20 种「平面/装置设计师哲学」库的致命问题：大胆风格几乎全是 AI-生成-only（粒子/光影/手绘），**用户默认无生图能力、default 全走 HTML 时，大胆半场直接清零，只剩极简——这是「default 千篇一律」的根因**。本库每一种都标了「纯 HTML/CSS 无生图」下的**还原度**。
>
> ⚖️ **但记住定位**：这是**「没思路时翻的弹药」，不是「必须从这里选」的清单**。用户给了内容/品牌/参考，设计就从那里展开，别套库。skill 的职责是帮用户规避最差，不是规定好设计长什么样——好设计从用户的真实需求里长出来。

## 这个库怎么用

1. **先按输出类型选分区（三选一，不是两选一）**：做网页/落地页/官网 → 网页 20 种；做 PPT/deck/演示 → PPT 20 种；做信息图/数据可视化/单张长图 → 信息图 20 种。
   - 判据是**产出形态不是题材**：可点击的站点走网页区，要翻页的走 PPT 区，**一张(或一组)以数据为主角、能脱离交互独立阅读的图走信息图区**。
   - 拿不准的两个常见情形：Dashboard 原型走网页区（它是产品界面）；一页 deck 里嵌的数据页仍走 PPT 区（它要翻页）。
2. **温度体系**：每种标了 `大胆 / 中性 / 安静`。**故意让大胆款占多数**——模型的确定性偏差天然偏安静极简，库的配比要把它往大胆推。
   - 方向 A（稳妥底盘）从安静/中性里按需求选；方向 B 取不同温度拉反差；**方向 C 由 SKILL 的「秒数轮盘」强制注入大胆款**。
   - ❌ 三个方向不要都落在「米白+留白+一个点缀色」——那是最常见的失败模式。
3. **还原度**：≥90% 闭眼做；70-90% 主体可做、个别细节降级；<70%（如 Memphis 做旧纹理）必须在产出里**明确标注哪部分用纯色块降级**，不假装能做出原版质感。
4. **字体**：每种给了开源替代（Inter/Geist/Manrope/Space Grotesk/Fraunces/Playfair 等），不要写付费字体（Söhne/Circular 等）。
5. 配套：SKILL「设计方向顾问」Phase 3-5 用本库推 3 方向；`assets/showcases/` 有预制截图画廊。

---

## 色彩推导协议（用任何风格前先走这三步）

> ⚠️ **以下所有风格条目里的 hex 是示例锚点，不是配方。** 同一风格用于不同内容，应通过本协议推导出不同色值——直接复制条目 hex，只是在生产品味更好的 slop。为什么：写死配方让 100 个用户拿到 100 份同色产出，色彩的信息量归零；推导让色彩成为「这个内容独有」的证据。
>
> **字体同理**：条目里的字体名也是示例锚点。选定风格后，display+body 配对先过 `references/typography.md` 的配对逻辑与「已被用烂名单」——**名单与条目冲突时以 typography.md 为准**（如条目写 Fraunces，按名单换 Newsreader 等平替）。

### 三步法：采样 → 收敛 → 论证

| 步骤 | 做什么 | 为什么 |
|------|--------|--------|
| **1. 采样** | 主色从三个来源取，不凭空发明：①品牌资产（logo/已有 VI 直接吸色）②内容真图（产品截图/摄影素材里的主导色）③文化语境（内容主题自带的色彩记忆，见下表） | 凭空选色=从模型先验里抽签，抽出来的永远是那几个网红色；从内容里采的色天然带「为什么」 |
| **2. 收敛** | 用 oklch 把调色板压到 **2-3 个有彩色 + 1 组中性色**。中性色写成明度序列（如 L 0.15/0.35/0.65/0.92/0.98），有彩色之间拉开 oklch 色相角 H ≥60° 或明度 L 差 ≥0.3 | 色多必乱；oklch 的 L 通道感知均匀，明度序列写出来就是层级系统，比一堆孤立 hex 可推理 |
| **3. 论证** | 一句话写出「为什么是这个色」，写进产出注释或交付说明。例：「主色取自用户 logo 的赭石，压低 chroma 到 0.08 模拟油墨」 | **写不出这句话=你在抄配方。** 论证是防 slop 的自检门，不是仪式 |

### 印刷色质感：为什么低饱和比纯屏幕色高级

油墨印在纸上永远达不到屏幕 RGB 的最大饱和度——CMYK 色域更窄、纸张吸墨、环境光反射，都会把颜色「压灰」。人眼几十年被印刷品训练出的「高级感」，本质是这层物理灰度。所以屏幕设计里刻意压 chroma，等于借用印刷的质感记忆。

| 用途 | oklch chroma 参考 | 效果 |
|------|------------------|------|
| 大面积底色 | 0.01–0.04 | 纸感、不刺眼 |
| 品牌主色/强调 | 0.08–0.15 | 油墨感，够醒目但不塑料 |
| 小面积点睛（按钮/链接） | 0.15–0.22 | 保留活力，仅限小面积 |
| >0.25 满版铺 | 慎用 | 屏幕荧光感，只适合 Wrapped/糖果这类刻意「电子原生」的风格 |

### 文化语境速查：同一色相，不同语境

选色不只是选色相，是选它背后的文化坐标。同是「红」，落点差之千里：

| 色相 | 语境 A | 语境 B | 差在哪 |
|------|--------|--------|--------|
| 红 | 故宫朱红（偏橙、带灰，oklch 低 L 低 C，比可乐红更暗更浊）→ 传统/庄重 | 可乐红（高饱和正红）→ 消费/兴奋 | chroma 一降，从货架跳到宫墙 |
| 蓝 | 日本蓝染/琉璃绀（深、偏紫灰）→ 手工/沉静 | 科技蓝 #0066FF 系 → SaaS/效率 | 后者是模型最爱的默认蓝，用之前先问自己是不是在抽签 |
| 绿 | 抹茶/苔绿（黄相、低饱和）→ 自然/日式 | 荧光绿 #39FF14 → 终端/hacker | 同为绿，一个喝茶一个敲代码 |
| 黄 | 藤黄/芥末（带棕灰）→ 复古印刷 | 警示黄/Mailchimp 黄 → 醒目/玩味 | 灰度决定它是旧书页还是安全帽 |
| 白 | 奶油纸白 #F5F0E8 → 出版物/暖 | 纯白 #FFF → 实验室/瑞士 | 底色的 2% 色温差就是气质分野 |

---

## 网页风格库(20种)

#### 大胆派

**媒体级粗野主义 Editorial Brutalism（巨号Helvetica压小正文）** `大胆·还原98%`
- 参考:Bloomberg Businessweek（Richard Turley 2010-2014 改版，Code and Theory操刀）；Neue Haas Grotesk谱系
- 适配:媒体/内容出版、AI产品发布、品牌官网hero、调研报告封面、观点型长文头图
- 视觉DNA:配色纯黑#000+纯白#FFF+超链接蓝#0000EE，点缀信号橙红#FF433D/终端绿#00A33E。字体Helvetica/Neue Haas Grotesk，120px+巨号headline左对齐紧字距直接压住14px小正文，极端字号反差。布局模块化网格+1px规则线分栏切割，高信息密度刻意不留白。标志元素：rule line分栏、超链接蓝下划线、黑白底大色块。
- HTML实现:纯CSS可1:1还原。CSS Grid做模块网格+border做规则线分栏，clamp()做超大响应式字号+letter-spacing收紧，系统Helvetica/Arial栈或Inter兜底，超链接直接#0000EE下划线。零素材依赖。
- 字体:Inter（替Helvetica/Neue Haas Grotesk），代码用Geist Mono

**新粗野主义撞色信息流 Neo-Brutalism（粗黑描边卡片+高饱和撞色）** `大胆·还原95%`
- 参考:The Verge 2022 redesign（in-house team，PolySans + Mānuka）
- 适配:媒体/内容站、AI产品聚合页、活动landing、社区榜单页、小红书风信息卡
- 视觉DNA:配色电光紫#5200FF~品红#E1306C高饱和主色+亮黄#F8E000强调+纯黑#08080D+白，大面积撞色块刻意不柔和。字体几何无衬线大标题+衬线正文反差。布局卡片化feed流、2-4px粗黑描边、硬色块分区、近乎无圆角。标志元素：粗描边卡片hover撞色翻转、未完成界面气质。
- HTML实现:纯CSS强项。border:3px solid #000粗描边+box-shadow硬投影偏移(4px 4px 0 #000)+grid/flex卡片流+:hover切换background撞色翻转。无3D/光影障碍。
- 字体:Space Grotesk（替PolySans）+ 任一衬线如Fraunces

**孟菲斯复古拼贴最大化 Memphis Maximalism（撞色块+错位叠放+复古字体）** `大胆·还原72%`
- 参考:Gucci Vault概念店（Alessandro Michele）；Memphis设计运动 / Sagmeister叛逆基因
- 适配:电商概念店、创意活动页、品牌实验campaign、Y2K复古主题、节日营销页
- 视觉DNA:配色复古红/芥末黄/宝蓝/紫/橄榄绿大面积撞色并置+做旧米色暖底，浓烈刻意不和谐。字体复古衬线+装饰字混用、印刷质感、打破网格错位叠放。布局反网格拼贴策展、模块大小不一错落叠压、像逛数字房间。标志元素：撞色块、错位叠放、非常规导航彩蛋。
- HTML实现:transform:rotate()做错位叠放+position:absolute叠压+高饱和background撞色块+复古Google Fonts。真实做旧纹理无法CSS还原，降级为纯色块+mix-blend-mode/contrast滤镜模拟肌理，几何拼贴版成立、archival做旧版会降级。
- 字体:DM Serif Display + Bungee（装饰）+ Space Mono

**糖果色凸起立体按钮游戏化 Friendly Geometric Candy** `大胆·还原85%`
- 参考:Duolingo（Johnson Banks + Monotype，Feather Bold字体）；反硅谷极简
- 适配:教育语言学习、消费级App landing、游戏化产品、面向大众亲和产品、活动报名页
- 视觉DNA:配色Duo绿#58CC02+鸭子黄#FFC800+天蓝#1CB0F6糖果高饱和+白底，圆润友好。字体超粗圆体（Feather Bold感）。布局大圆角卡片、凸起3D按钮（底部硬阴影=可按压感）、吉祥物位+进度气泡。标志元素：3px实底阴影立体按钮、按下位移动画、超圆角。
- HTML实现:纯CSS。box-shadow:0 4px 0生硬底阴影做凸起按钮+:active translateY(4px)消阴影模拟按压，border-radius大圆角，纯色块。吉祥物无生图时用CSS几何形或emoji占位（轻微降级）。
- 字体:Baloo 2 / Nunito（超粗圆体替Feather）

**纯CSS几何插画+响应式变形彩蛋 Pure-CSS Art** `大胆·还原80%`
- 参考:Lynn Fisher（lynnandtonic.com，纯CSS艺术传奇，Adobe专文报道）
- 适配:个人主页、创意404/彩蛋页、品牌玩味landing、技术博客头图、设计师自我展示
- 视觉DNA:配色2-4色高对比扁平面（每个breakpoint换调色）。字体粗几何无衬线标题。布局核心是「图随视口变形」——一组CSS形状在不同断点重组成不同画面（如建筑随屏宽变换层数）。标志元素：纯CSS绘制的几何插画、断点驱动的重排彩蛋、零图片。
- HTML实现:纯CSS的炫技战场，零素材是优势。div+border-radius/clip-path/transform/box-shadow堆叠几何形，@media断点改变形状尺寸位置实现变形。难度在设计构思而非技术，但需要精心手搓每个形状。
- 字体:Rubik / Archivo（粗几何替自定义）

**巨型字黑白高对比时装大字报 Bold Big-Type Editorial** `大胆·还原88%`
- 参考:Jacquemus官网 / Rik Oostenbroek / Domestika；时装杂志大字报
- 适配:电商时尚、作品集、媒体专题、品牌宣言页、视频课程封面、调研报告大字版
- 视觉DNA:配色极简黑白+单一克制点缀色（裸粉#E8C4C0或正红）。字体超大Display无衬线/高反差衬线，标题占满整屏。布局全幅网格、巨字与负空间博弈、图文1:1分割。标志元素：屏占比巨型headline、奢侈级留白、左右对位排版。
- HTML实现:纯CSS完美还原。clamp()巨号字+CSS Grid全幅分割+大量padding留白+vh单位让标题占满视口。无图时用纯色块/文字块替代时装大片占位（轻降级但版式成立）。
- 字体:Archivo Expanded / Anton（Display）+ Playfair Display（高反差衬线）

**复古未来太空图录 Cosmic Retro-Futurism** `大胆·还原75%`
- 参考:Perplexity Comet浏览器发布站（The Brand Identity：Black/Blue/Cream；《2001太空漫游》气质）
- 适配:AI产品发布站、科技品牌宣言页、活动倒计时页、未来感landing、概念发布会
- 视觉DNA:配色纯黑#0A0A0A+奶油纸白cream#F0EAD8+一抹钴蓝-孔雀蓝#2B4F91，低饱和像老式天文图录。字体高反差衬线（古典天文图册感）+留白。布局线描轨道/抛物线SVG、行星圆点、奶油底压黑字、古籍式排印。标志元素：SVG天体轨道线、奶油+蓝+黑三色、复古衬线大字、天文图录质感。
- HTML实现:纯CSS+SVG还原静态版八成气质。SVG path画轨道抛物线+CSS径向定位行星圆点+三色变量+高反差衬线。缺口是「太空落到地球」的全屏视频转场（灵魂部分）——降级为CSS scroll视差+SVG轨道旋转近似。
- 字体:Cormorant Garamond / EB Garamond（高反差衬线）+ Space Mono

**电影感声波可视化 Cinematic Sound-Viz Dark** `大胆·还原72%`
- 参考:ElevenLabs；电影片头title sequence（Saul Bass式极简动态）× 音频工程界面
- 适配:音频/语音AI产品、音乐科技站、播客平台、媒体发布页、影院级品牌hero
- 视觉DNA:配色纯黑#000底+纯白文字+蓝紫渐变accent波形。字体大号无衬线标题Saul Bass式极简。布局全幅暗场、声波/频谱可视化贯穿、巨标题压波形、卡片功能区。标志元素：彩色audio-waveform波形带、电影片头式极简、高对比黑白+单渐变、声音可视化母题。
- HTML实现:纯CSS+SVG还原70%气质（骨架完美，波形是降级点）。SVG polyline画静态波形或多条不等高div柱阵+CSS animation做『假波形』跳动近似。缺口：随声音实时跳动的Web Audio/Canvas频谱不可纯CSS还原，静态版像、动态灵魂还不了。
- 字体:Inter / Sora（大号无衬线）

**像素游戏横版叙事 Pixel-Game Side-Scroller** `大胆·还原70%`
- 参考:Robby Leonardi交互简历（8/16-bit平台动作游戏叙事，致敬任天堂SNES）
- 适配:创意简历/作品集、品牌玩味campaign、游戏化landing、活动彩蛋页、个人趣味主页
- 视觉DNA:配色复古游戏多段分区——森林绿#4CAF50草地+天蓝#5DADE2，过渡太空紫#2C2A4A、火山橙红#E8743B、海底青#1ABC9C，每『关卡』换一套高饱和卡通调色。字体像素字体（8-bit感）+粗无衬线。布局横版/纵向滚动分关卡场景、视差分层、scroll触发位移。标志元素：分关卡换色、像素美学、视差滚动、游戏HUD式UI。
- HTML实现:纯CSS+少量JS还原骨架（原作就是HTML+CSS+jQuery无WebGL）。视差分层position+scroll位移、image-rendering:pixelated、CSS逐帧background-position做sprite动画、分段背景色。缺口：原创角色/场景手绘像素插画——无生图时用CSS方块拼简易像素图标替代（美术降级，技术不降）。
- 字体:Press Start 2P / VT323（像素字）+ Inter


#### 中性派

**包豪斯几何标志+扁平插画系统 Bauhaus Geometric** `中性·还原90%`
- 参考:Khan Academy rebrand（六边形+花瓣logomark + Wonder Blocks设计系统）；Bauhaus几何构成
- 适配:教育课程站、品牌logo系统、信息图、儿童亲和向产品、活动KV
- 视觉DNA:配色三原色谱系——包豪斯红#E63946/黄#FFB703/蓝#0077B6+黑白，纯色块拼接。字体几何无衬线（圆润几何感）。布局圆/三角/方基本几何单元搭建插画，对齐栅格、模块化拼图。标志元素：纯几何形态logomark、扁平无渐变插画、原色块构成。
- HTML实现:纯CSS几何全能。border-radius:50%做圆、clip-path/border三角形、方块div拼几何插画，CSS Grid栅格对齐，纯色fill无需素材。插画用CSS形状或内联SVG几何路径手搓。
- 字体:Poppins / Manrope（几何圆润替Wonder Blocks）

**暗色双色侧栏开发者作品集 Dark Editorial（深底+单荧光accent+等宽字）** `中性·还原96%`
- 参考:Brittany Chiang（brittanychiang.com v4，dev portfolio事实标准）
- 适配:作品集个人主页、开发者向产品、技术品牌站、简历页、AI工具landing
- 视觉DNA:配色深墨绿/海军底#0A192F+板岩灰文字#8892B0+单一荧光青绿accent#64FFDA。字体无衬线正文+等宽字（编号/标签）。布局左固定侧栏导航+右滚动主区双栏，section编号01/02、链接hover下划线滑入。标志元素：单accent色、等宽编号标签、侧栏锚点高亮。
- HTML实现:纯CSS完全还原。position:sticky做固定侧栏+CSS Grid双栏+单accent变量+等宽字标签+:hover下划线transform滑入。零素材，纯版式与微交互。
- 字体:Inter + JetBrains Mono（等宽）

**暖色出版物 Warm Editorial（奶油纸底+赤陶橙+衬线无衬线混排）** `中性·还原97%`
- 参考:Anthropic / Claude（DBCo + Geist Studio，Styrene×Tiempos）；Penguin/Pelican平装书排印
- 适配:AI产品站、品牌官网、长文阅读页、橙皮书电子书、调研报告、培训材料
- 视觉DNA:配色奶油纸底#F5F0E8+赤陶橙#CC785C/#D97757点缀+近黑文字#191919，温暖低饱和。字体衬线标题（Tiempos感）×无衬线正文（Styrene感）混排。布局书籍式单栏阅读流、舒适行高、节制分隔线。标志元素：纸感暖底、赤陶橙、出版级排印节奏。
- HTML实现:纯CSS 100%还原，零素材。背景色变量+衬线无衬线字体栈混排+max-width限制阅读宽度+line-height 1.7舒适行高。这是Anthropic赤陶橙暖色版的安全主场。
- 字体:Fraunces / Newsreader（替Tiempos衬线）+ Inter（替Styrene）

**Linear暗色发光+Bento网格 Glassmorphism Bento** `中性·还原85%`
- 参考:Linear / Cursor（'The Linear Look'现象级流派，Frontend Horse有代码配方）
- 适配:SaaS/AI产品站、开发者工具、技术品牌hero、产品功能展示、深色dashboard演示
- 视觉DNA:配色近黑底#08090A+去饱和蓝紫品牌#5E6AD2+低饱和青紫微光渐变#4EA7FC→#B59AFF。字体几何无衬线负字距紧凑。布局便当盒bento网格分块、发丝分割线、玻璃拟态卡片。标志元素：暗底发光渐变边框、bento分块、流光streamer、磨砂玻璃。
- HTML实现:纯CSS强还原。box-shadow/filter blur+radial-gradient做发光晕，backdrop-filter:blur玻璃拟态，conic/linear-gradient边框，CSS Grid拼bento。缺口仅「真实产品UI截图」——用色块+文字拼简化假UI替代（这部分降级）。
- 字体:Inter / Geist（负字距）+ Geist Mono

**斜切流体渐变带 Angled Fluid Gradient** `中性·还原92%`
- 参考:Stripe（标志性angled gradient banner，Klim定制Söhne字体）
- 适配:SaaS/Fintech落地页、品牌官网hero、产品发布页、活动banner、AI产品营销页
- 视觉DNA:配色多色流体渐变（靛蓝#635BFF→青→粉→橙暖调）做hero背景+纯白内容区+近黑文字。字体精致无衬线（Söhne感）。布局倾斜分割色块（skew切角分区）、渐变hero压结构化栅格正文。标志元素：angled斜切边界、多色流体渐变、理性栅格压表达渐变。
- HTML实现:纯CSS。transform:skewY()或clip-path:polygon()做斜切分区，linear-gradient多色叠加（可加CSS animation缓慢流动）做流体渐变带，Grid做下方结构化正文。零素材。
- 字体:Inter / Hanken Grotesk（替Söhne）

**实用主义彩虹分类文档 Utility-First Colorful Docs** `中性·还原98%`
- 参考:Tailwind CSS Docs（Sky/Cyan品牌色+功能分类彩虹色相条）
- 适配:技术文档、API参考、设计系统站、教程站、开发者knowledge base、SaaS帮助中心
- 视觉DNA:配色Sky蓝#38BDF8品牌+teal→cyan→sky青蓝渐变+Slate灰阶#0F172A/#64748B/#F8FAFC，文档用彩虹色相条区分功能分类（粉#EC4899/紫#A855F7/绿#10B981/橙）。字体清爽无衬线+等宽代码。布局左侧栏导航+中正文+右TOC三栏，彩色高亮代码块、分类色标。标志元素：青蓝渐变hero、彩虹分类色、三栏文档骨架、语法高亮代码块。
- HTML实现:纯CSS 98%还原（它本身就是CSS框架文档）。Grid三栏+linear-gradient青蓝hero+分类色变量+代码块语法色用span着色。Inter开源，唯暗色切换/copy需轻量JS。零光影/3D/手绘。
- 字体:Inter + JetBrains Mono / Fira Code（代码）

**终端核软未来 Terminal-Core Soft-Futurism（等宽字+等距立方）** `中性·还原80%`
- 参考:Cursor (Anysphere)；开发者终端美学 × Teenage Engineering工业极简
- 适配:AI编程工具站、CLI产品landing、开发者基础设施、技术品牌hero、终端类产品
- 视觉DNA:配色炭黑#0B0D14底+暖白文字#F2F0EF+克制蓝紫渐变accent点缀按钮与光晕。字体等宽字为主角（命令行感）+无衬线辅助。布局命令行/代码块前景、bento分区、2.5D等距cube示意。标志元素：等宽字命令行、等距投影立方体、暖白×炭黑、克制渐变光晕、工业极简。
- HTML实现:纯CSS 80%还原。等宽字代码块+暗色bento+box-shadow光晕；2.5D等距cube用CSS 3D transform(rotateX/Y+skew)或SVG等距投影手搓。缺口：可点击切换的多界面demo需JS+假UI拼接。无WebGL刚需。
- 字体:Geist Mono / JetBrains Mono（主角）+ Inter（辅助）


#### 安静派

**功能主义网格社区 Functional Brutalism（灰线分割+系统字+蓝链接）** `安静·还原98%`
- 参考:Are.na / Lobsters / Quartz；Müller-Brockmann栅格数字落地 + Tufte信息密度
- 适配:社区/UGC平台、内容聚合站、文档知识库、移动优先内容流、极客向产品
- 视觉DNA:配色近白底#FBFBFB+黑文字+1px灰分割线#E0E0E0+经典链接蓝#0000EE/已访问紫。字体系统字栈（-apple-system/无装饰）。布局高密度信息列表、细灰线分栏、极小留白、紧凑行距。标志元素：发丝灰分割线、蓝链接、系统字、信息密度优先。
- HTML实现:纯CSS最易还原，这是Brutalist Web的本色。border-bottom:1px灰线列表+system-ui字栈+紧凑padding+蓝链接。几乎不需要任何素材或JS，纯结构。
- 字体:system-ui系统字栈 / IBM Plex Sans（兜底）

**深色画廊裱框 Gallery Dark（深黑负空间+单列大图+EXIF小字）** `安静·还原75%`
- 参考:Glass (glass.photo) / Bottega Veneta；美术馆暗房 + Apple Photos内容至上
- 适配:摄影作品集、奢侈品电商、视觉内容沉浸展示、个人画廊页、高端产品陈列
- 视觉DNA:配色纯黑底#0A0A0A+作品图本身提供唯一色彩+极淡灰EXIF小字#666。字体极细无衬线小字。布局单列居中大图、巨幅负空间裱框、图下metadata小字。标志元素：暗房黑底、内容至上UI退隐、EXIF式小字注脚、大图独占视口。
- HTML实现:纯CSS还原版式骨架。纯黑底+居中max-width单列+巨幅padding裱框留白+小字metadata。缺口是「真实摄影作品」本身——用占位图/纯色块代替则失灵魂，但暗房氛围与版式100%可搭。
- 字体:Inter（细字重300）/ Cormorant（衬线奢侈感可选）

**Swiss极致黑白 Swiss Monochrome（Vercel式纯黑白+Geist+锐利边角）** `安静·还原98%`
- 参考:Vercel / Next.js Docs（自研Geist已开源）；Massimo Vignelli少即是多
- 适配:开发者工具文档、技术品牌官网、AI产品站、SaaS落地页、极简调研报告
- 视觉DNA:配色纯黑#000+纯白#FFF+灰阶#888，零彩色或仅一抹蓝链接。字体Geist几何无衬线+Geist Mono。布局锐利直角（无圆角或极小）、高对比、精密栅格、克制留白。标志元素：纯黑白、锐利边角、Geist字体、三角/箭头几何标记。
- HTML实现:纯CSS 100%还原，Geist开源可直接引。CSS Grid精密栅格+纯黑白变量+border-radius:0锐角+发丝边框。这是HTML最舒适的极简主场，零素材依赖。
- 字体:Geist + Geist Mono（Vercel开源原版）

**日式留白白盒画廊 Kenya Hara White Gallery** `安静·还原80%`
- 参考:Cosmos (cosmos.so) / Aesop伊索官网；原研哉『白』的空寂 + 瑞士网格混血
- 适配:高端电商、创意画廊、内容策展平台、设计师作品集、品牌精品店、moodboard站
- 视觉DNA:配色近全白#FAFAFA底+纯黑文字#0A0A0A+极淡灰分割#EFEFEF，内容图提供全部色彩、UI退到背景。字体极简系统/几何无衬线小字、大字距。布局masonry瀑布网格、极致留白、淡灰发丝分隔、东方空寂。标志元素：白盒美学、奢侈留白、内容至上UI隐退、瀑布流策展。
- HTML实现:纯CSS还原静态版式（与暗色画廊区分在『白』）。CSS columns或Grid做masonry+近白变量+大padding留白+淡灰分隔。缺口是Lenis/GSAP丝滑惯性滚动与图片入场缓动（高级感60%在此），CSS仅基础transition，动效层降级。
- 字体:Inter（细字重）/ Cooper Hewitt（Aesop同款开源）


## PPT风格库(20种)

#### 大胆派

**新瑞士大字报 / Neo-Swiss Billboard Editorial** `大胆·还原98%`
- 参考:Scribe $75M、Flock Safety $47M 等 AI/SaaS 路演 deck 的 Big-Number Editorial 流派；Bloomberg Businessweek 信息图；Pentagram
- 适配:融资路演、QBR/业务回顾、年度趋势复盘、产品发布关键页
- 视觉DNA:配色=纯白(#FFFFFF)或近黑(#0A0A0A)底+单一高饱和强调色(电光蓝#2D5BFF/荧光绿#00E676/品牌橙#FF6B2C)+中性网格线#E5E5E5。字体=超大粗体无衬线，标题占半屏，数字tabular-nums等宽收紧字距。母版=①大色块章节页一个词②巨型数字占半屏(3.2x)+小注③左右分栏对比④全幅扁平折线/柱状。标志=billboarding大字、严格基线网格、大色块章节页
- HTML实现:超大数字用clamp()；严格网格用CSS Grid；大色块章节页background-color；折线柱状用纯div+CSS或内联SVG(比贴图更锐利)；数字对齐font-variant-numeric:tabular-nums。零插画零3D
- 字体:Inter / Geist / Söhne替代Neue Haas Grotesk；数字配Geist Mono

**黑底巨型数字剧场 / Black Big-Number Stage** `大胆·还原97%`
- 参考:Steve Jobs 2007 iPhone Keynote、小米SU7 Ultra雷军发布会、Spotify Wrapped、Presentation Zen(Garr Reynolds)
- 适配:产品发布主题演讲、思想演示、全员town hall、情绪向年度回顾
- 视觉DNA:配色=纯黑#000000底+纯白#FFFFFF字高反差，一页只一个品牌强调色高亮(小米橙#FF6900/Spotify绿#1ED760/Apple蓝#2997FF)。字体=几何无衬线粗体，一屏一词或一个超大数字占满视野，字距收紧。母版=①标题页黑底居中一行大字②数据高潮页巨型数字+单位+一行注③左右参数对比双栏(强调色vs灰)④slogan单页。大量负空间
- HTML实现:黑底白字几行CSS；巨型数字clamp()+flex居中；强调色highlight单独span；左右对比CSS Grid两列+条形高亮；tabular-nums。去掉产品照改纯文字反而更接近Zen本质
- 字体:Geist / Inter / 思源黑替代SF Pro

**高饱和单色品牌撞色海报 / Mono-Brand Type-as-Hero** `大胆·还原96%`
- 参考:Spotify Wrapped视觉系统、Mailchimp Brand Book(Collins)、Netflix红黑现代复刻、COLLINS品牌系统
- 适配:品牌/营销策略、campaign宣讲、town hall文化页、活动主视觉
- 视觉DNA:配色=单一品牌主色满版铺底(Spotify绿#1ED760/Mailchimp黄#FFE01B/Netflix红#E50914)+黑或白反差字，撞色两层。字体=超大字体即主视觉(type-as-hero)顶天立地。母版=①满色块底+反白巨字②双色块上下/左右分割③巨型数字撑满。标志=单色满版、字体当图、高对比撞色
- HTML实现:满版background-color；超大字clamp()占满；双色用两个100vh色块；字体当图靠font-weight900+负letter-spacing。纯色块零素材，HTML原生最爽
- 字体:Inter / Manrope / Archivo(超粗)替代Circular/Cavendish

**全幅渐变宣言版式 / Full-Bleed Gradient Manifesto** `大胆·还原82%`
- 参考:Zuora『Tell a Different Story』销售deck(Andy Raskin拆解)、Nike『Just Do It』campaign、National Geographic跨页
- 适配:销售提案愿景页、品牌宣言、keynote转折页、使命愿景单页
- 视觉DNA:配色=满版CSS渐变(暖橙→品红/深蓝→青)或纯色出血+反白宣言大字+hashtag口号(#shifthappens)。字体=厚重无衬线全大写标语横贯。母版=①满幅渐变+居中反白宣言②应许之地愿景页③客户logo墙。标志=full-bleed出血、反白大标语、hashtag口号
- HTML实现:linear-gradient/radial-gradient满版(不做粒子/光影，纯CSS渐变是允许的)；反白字position居中；logo墙用grid灰度SVG/文字占位。原本靠纪实大照片的部分降级为CSS渐变铺底+大字，照片缺失这一项还原度降约15%
- 字体:Archivo / Anton / Manrope(超粗)

**CS50单概念糖果舞台 / Candy-Color Lecture Stage** `大胆·还原94%`
- 参考:Harvard CS50(David Malan)、Lessig Method/高桥流、Presentation Zen
- 适配:教育课件、技术讲座、概念解释、代码教学
- 视觉DNA:配色=深黑底#0A0A0A+高饱和糖果色大字轮换(品红#FF2D95/青#00E5FF/明黄#FFD500/绿#39FF14)。字体=无衬线超大字漂浮居中，一屏一概念，文字极少。母版=①深黑底单个糖果色大词②等宽代码块语法高亮③舞台聚光感大字。标志=深黑漂浮糖果色大字、等宽代码高亮、强舞台聚光、极少文字
- HTML实现:深黑背景+单色超大字clamp()居中；代码块用pre+等宽字+span上色做语法高亮；聚光感用极淡radial-gradient暗角(非粒子光效)。还原度高
- 字体:Inter超粗 + JetBrains Mono(代码)

**玩味手绘极简 / Playful Maximalist Editorial (Collins式)** `大胆·还原75%`
- 参考:Mailchimp Brand Book(Collins 2018)、New Yorker漫画气质、Cooper圆润衬线、Cavendish荧光黄
- 适配:有态度的品牌deck、创意机构提案、文化向town hall、反SaaS极简的营销页
- 视觉DNA:配色=Cavendish荧光黄#FFE01B大面积+黑+少量撞色，反SaaS极简。字体=Cooper式圆润衬线大标题(playful)+杂志式留白编排。母版=①荧光黄满底+怪诞标题②杂志式不规则留白排版③大字玩梗文案。标志=荧光黄、圆润衬线、playful编排、怪诞手绘气质(降级为几何色块/emoji替代真插画)
- HTML实现:荧光黄background；圆润衬线font-family；杂志留白用非对称Grid。手绘猩猩/插画这一核心元素无AI生图无法做，降级为CSS几何色块+大号emoji+不规则transform旋转的文字块替代，插画缺失还原度降约20%
- 字体:Fraunces(可调圆润)/ Bree Serif替代Cooper；正文Inter

**不羁玩梗流行版 / Irreverent Pop (Reddit式)** `大胆·还原80%`
- 参考:Reddit Ads销售deck(被Dock列为最有性格)、David Carson式不羁排版、90年代web复古、Memphis玩味
- 适配:Z世代品牌、玩梗营销deck、社区/创作者向、敢于不正经的提案
- 视觉DNA:配色=Reddit橙红#FF4500+撞色，90s web复古色。字体=混排/打破网格的David Carson式排版，玩梗口语文案。母版=①fun页玩梗大字②facts页节奏转折严肃数据③口语标题。标志=打破网格混排、橙红、玩梗口语、fun→facts节奏反转、复古web质感
- HTML实现:故意打破网格用transform旋转/重叠定位/混合字号；橙红+撞色块；复古质感用粗黑边border+硬阴影box-shadow(无blur)。自定义meme插画降级为emoji+几何拼贴，但混排排版本身HTML可还原
- 字体:Archivo / Space Grotesk + 混搭Inter制造对比

**Y2K膨胀大字 / Maximalist 3D-Type (Wrapped式)** `大胆·还原78%`
- 参考:Spotify Wrapped 2022/2023/2025、Memphis撞色、Y2K/Maximalism、duotone人像渐变
- 适配:年度回顾(情绪出圈向)、个性化数据卡、社交分享竖屏卡、品牌年终
- 视觉DNA:配色=高饱和撞色满版背景(品红+青+橙)+Spotify绿点睛+duotone双色渐变。字体=顶天立地巨型数字，年份/数字做3D膨胀/金属质感。母版=①撞色满版+巨型膨胀数字②duotone人像/色块底+反白大字③竖屏可分享卡。标志=巨型膨胀3D数字、撞色满版、duotone渐变、年份金属质感、竖屏story卡
- HTML实现:撞色满版background；3D膨胀数字用CSS text-shadow多层叠加+transform:perspective或SVG+stroke制造立体(非真3D渲染)；duotone用mix-blend-mode+渐变叠在灰度图占位块上。金属质感降级为渐变填充文字background-clip:text，还原度降约15%
- 字体:Archivo Black / Anton超粗 + 数字Clash Display


#### 中性派

**Bento便当格模块网格 / Bento Grid** `中性·还原95%`
- 参考:Apple Keynote Bento Grid时代、新一代MBB Bento/Big-Type deck(2024-2026)、Stripe年报指标卡矩阵、Pitch.com QBR模板
- 适配:产品功能汇总、咨询/QBR数据汇报、销售成果页、town hall指标页
- 视觉DNA:配色=浅灰/奶白底(#F5F5F7/cream)或近黑底+品牌主色+1-2强调色，卡片浅色分区底+圆角+微描边/微阴影。字体=超大display标题+常规正文，字重对比强烈，KPI数字tabular figures。母版=①标题页巨型单句+留白②bento页2×2/3列不等高卡片每卡一洞见(数字/线性icon/sparkline)③one-insight超大数字页。标志=不等高卡片网格、圆角微描边、呼吸感
- HTML实现:CSS Grid的grid-template-areas做不等高bento；卡片border-radius+box-shadow微阴影+1px hairline；sparkline用内联SVG；线性icon用inline SVG stroke。零贴图
- 字体:Inter / Geist + 数字Geist Mono

**Neo-Swiss暗色终端美学 / Dark Hairline Terminal** `中性·还原94%`
- 参考:Linear pitch deck、Vercel设计语言、CS50深黑舞台课件；字体Inter Tight+JetBrains Mono
- 适配:开发者工具/技术产品发布、技术路演、工程向汇报
- 视觉DNA:配色=近黑底(#0D0D0F/#111113)+hairline细线#262629网格+单一紫蓝强调(#5B5BD6/#7C7CFF)。字体=Inter Tight大标题+JetBrains Mono做标签/数据。母版=①极简标题页一句话+mono小标②hairline分隔的数据网格③mono标签的特性列表。标志=1px细线网格、mono单等宽标签、极致留白、近黑非纯黑
- HTML实现:近黑背景+border:1px solid的hairline网格；mono标签用等宽font-family；微光用极淡box-shadow/border highlight而非真光效(降级避开赛博霓虹禁区)。注意避开#0D1117深蓝禁区，用中性近黑
- 字体:Inter Tight + JetBrains Mono / IBM Plex Mono

**双字体咨询版 / Two-Font Consulting (Bower式)** `中性·还原90%`
- 参考:McKinsey 2019品牌系统(Wolff Olins设计，Bower衬线+无衬线)、BCG Executive Perspectives、深蓝细线pattern
- 适配:咨询报告、高管汇报、行业研究、权威机构提案
- 视觉DNA:配色=深蓝(#051C2C/McKinsey深蓝)×白二元+单一品牌色高亮(BCG绿#00805A)，暖灰底带呼吸感。字体=characterful衬线大标题(Bower式)与无衬线正文高对比并置。母版=①左上角结论式action-title②蓝色细线pattern装饰③杂志式左右分工(结论文字+视觉)④大数字data-point卡。标志=衬线×无衬线高对比、深蓝细线pattern、action-title、暖灰高级感
- HTML实现:双字体font-family并置(衬线标题+无衬线正文)；细线pattern用repeating-linear-gradient或SVG line；data-point卡纯CSS；照片灰度处理这一项无照片可省。蓝紫edge shimmer降级为纯色边
- 字体:Playfair Display / Fraunces衬线标题 + Inter正文(替代Bower)

**图谱箭头企业版 / Diagram-Driven Isotype** `中性·还原88%`
- 参考:Salesforce销售deck、Isotype(Otto Neurath)谱系、Gene Zelazny《Say It With Charts》、Hans Rosling/Gapminder
- 适配:平台/架构讲解、客户旅程、流程方法论、生态地图
- 视觉DNA:配色=企业蓝色块+产品线分色区分+图标化能力网格。字体=清晰无衬线。母版=①横向客户旅程箭头流②分层平台架构图③图标化能力网格④2×2/瀑布/金字塔结构图。标志=箭头流程、分层架构盒、Isotype图标网格、流程即叙事
- HTML实现:箭头流程用Flexbox+CSS clip-path三角或SVG arrow；架构分层用嵌套带边框div；图标用inline SVG stroke统一描边；瀑布/金字塔用Grid+斜切。气泡图可用CSS圆形+定位。纯矢量绘制
- 字体:Inter / IBM Plex Sans(图表友好)

**单图母图概念图解 / Diagrammatic Minimalism** `中性·还原95%`
- 参考:Simon Sinek黄金圆环(Golden Circle)TED、Bauhaus几何抽象、信息建筑『一图定全场』
- 适配:理论框架讲解、TED式思想传播、模型/方法论可视化、单概念keynote
- 视觉DNA:配色=极简白/浅底+黑+1个强调色，几何纯色。字体=无衬线，标签大写嵌入图形。母版=①唯一几何母图(同心圆/三角/矩阵)承载全部概念②由内向外箭头③对比案例。标志=单一几何母图、嵌套同心圆/三角、大写标签、一图承载概念
- HTML实现:同心圆用border-radius:50%嵌套div或SVG circle；三角用clip-path/SVG polygon；箭头SVG marker；标签absolute定位贴在图形上。纯几何，HTML完美还原
- 字体:Manrope / Futura系(Jost开源替代)几何感

**Sparkline叙事波形 / Narrative Sparkline (Duarte式)** `中性·还原91%`
- 参考:Nancy Duarte《Resonate》Sparkline叙事图谱、Al Gore《An Inconvenient Truth》、Duarte Inc.数据叙事
- 适配:演讲结构设计、变革叙事、before/after对照、数据故事弧线
- 视觉DNA:配色=深底或白底+品牌橙强调转折点+灰化对照。字体=无衬线，annotation标注点。母版=①横贯全屏的振荡波形线②波形上text标注点③上下并置对照波形④全黑底孤悬一条数据线⑤逐步reveal。标志=横贯波形线、波形标注点、橙色转折、对照波形、爬出画面的曲线
- HTML实现:波形线用内联SVG path(平滑贝塞尔)；标注点用SVG circle+text定位；对照波形上下两条path；reveal用CSS动画stroke-dashoffset。纯SVG绘制无素材
- 字体:Inter + 数字Geist Mono


#### 安静派

**断言-证据 / Tufte信息设计** `安静·还原93%`
- 参考:Michael Alley Assertion-Evidence(Penn State实证)、McKinsey/BCG action-title、Edward Tufte数据墨水比、Barbara Minto金字塔原理
- 适配:学术/工程汇报、数据严谨型咨询页、政策研报、技术评审
- 视觉DNA:配色=白/极浅灰底+黑正文+单一克制强调色(深蓝/砖红)。字体=整句话标题(非名词短语)，标题下独占一张图，文字标注嵌进图里。母版=①整句action-title②标题下单图证据③零bullet。标志=整句标题、单图证据、嵌入式标注、零chartjunk、高数据墨水比
- HTML实现:整句标题靠排版层级；图表用纯CSS/内联SVG画极简折线散点(去网格线去图例，标注直接text定位在数据点旁)；零装饰。Tufte的克制正是HTML强项
- 字体:Source Serif / Lora标题 + Inter正文(双字体阅读级)

**瑞士机构极简 / Institutional Swiss Minimal** `安静·还原96%`
- 参考:Sequoia官方10页pitch模板、Airbnb 2009种子轮deck、Müller-Brockmann网格、Massimo Vignelli
- 适配:投资路演、标准商业提案、问题-解法叙事、品牌去装饰提案
- 视觉DNA:配色=纯白底+黑灰正文+单一品牌强调色(Airbnb珊瑚红#FF5A3C/中性蓝)。字体=Helvetica系无衬线，标题中号粗体一句话，正文短句大间距。母版=①居中logo+slogan②顶部一句话标题带+下方3栏对仗(Problem/Solution三点)③TAM大数字分层④2×2竞品矩阵。标志=顶部标题带、三栏对仗、单色强调、2×2矩阵
- HTML实现:Flexbox三栏对仗；2×2矩阵纯CSS Grid+border画；TAM分层用嵌套div或同心方块；一页一信息。几乎纯排版网格，HTML理想对象
- 字体:Inter / Helvetica Now替代Helvetica；正文Inter

**杂志编辑长文流 / Editorial Longform** `安静·还原95%`
- 参考:Stripe Annual Letter($1.9T)、Amazon六页叙事备忘录、Benedict Evans『X eats the world』、Stripe Press
- 适配:年度信/复盘叙事、深度思想长文、内部更新、研报型阅读物
- 视觉DNA:配色=奶白/米白底(#FBFAF8)+深墨字+品牌色点睛(Stripe紫#635BFF)。字体=衬线或高品质无衬线，散文体段落+内联数据卡，超大display数字穿插。母版=①刊头大标题②多栏散文+内联指标卡③超大数字段落锚点。标志=出版物阅读节奏、内联数据卡、克制留白、散文体而非bullet
- HTML实现:多栏column-count或Grid；内联数据卡float/inline-block嵌入正文；衬线正文max-width控制行宽65ch；超大数字穿插。纯排版，零素材
- 字体:Newsreader / Source Serif正文 + Inter辅助；数字tabular

**人文圆角卡片 / Humanist Rounded Cards (Khan式)** `安静·还原80%`
- 参考:Khan Academy Wonder Blocks设计系统、Source Serif Pro衬线、森林绿品牌、友善人文主义
- 适配:教育产品、亲和力课件、公益/非盈利deck、温暖品牌提案
- 视觉DNA:配色=森林绿#14BF96/#0A5C4B+米白底+暖色辅助，柔和不刺眼。字体=Source Serif衬线标题(人文气)+无衬线正文。母版=①圆角卡片组件组②衬线标题+亲和正文③真实摄影位(降级为绿色系几何/圆角色块)。标志=森林绿、衬线标题、大圆角卡片、人文温暖、不完美亲和质感
- HTML实现:大圆角border-radius卡片+柔和box-shadow；衬线标题font-family；暖米白底。真实师生摄影这一项无AI生图，降级为绿色系几何插画块/大圆角纯色占位+emoji人物，照片缺失还原度降约18%
- 字体:Source Serif 4标题 + Nunito Sans / Inter正文(Nunito圆润呼应人文)

**研报密集图表 / Dense Research Report (Meeker式)** `安静·还原92%`
- 参考:Mary Meeker《Internet Trends》(BOND)、CB Insights《State of AI》、McKinsey Global Institute《Year in Charts》、FT/Bloomberg数据新闻
- 适配:趋势研报、行业数据复盘、密集数据汇报、市场地图
- 视觉DNA:配色=白底+品牌色(BOND/CB Insights亮蓝#0066FF)阶梯单色高亮其余灰化，几乎零留白。字体=结论式句子标题，每页1图密度，极小来源脚注。母版=①结论句标题+满页单图②logo网格market map③大数字KPI卡④密集多图网格+脚注。标志=结论句标题、零留白研报感、单色阶梯高亮、logo市场地图、来源脚注规范
- HTML实现:密集图表全用纯CSS/内联SVG画(柱/折线/堆叠/散点)；logo market map用Grid+文字/SVG占位格；KPI卡CSS；脚注小字。极致信息密度正是HTML擅长，零素材
- 字体:Inter + IBM Plex Sans + 数字tabular Geist Mono

**纯文字宣言备忘录 / All-Text Manifesto (Netflix/Amazon式)** `安静·还原97%`
- 参考:Netflix Culture Deck(2009，125页)、Amazon六页叙事备忘录(Bezos)、Tufte反PowerPoint主张、Matthew Carter阅读级排印
- 适配:文化宣言、价值观宣讲、深度备忘录、反PPT的纯文档演示
- 视觉DNA:配色=纯白或纯黑底+单一强调色(Netflix红#E50914)做唯一高亮，极致克制。字体=阅读级排印，一页一观点金句断言/纯散文零bullet零图。母版=①满版底+金句断言②口语化坦诚段落③制度名词高亮(Keeper Test)④六页散文+附录表。标志=纯文字一页一观点、零图零bullet、单色高亮金句、口语坦诚、silent-read文档感
- HTML实现:纯排版：金句用大字clamp()左对齐层级；散文max-width控制行宽；唯一强调色span高亮关键短语；附录用极简table。零素材零图，纯文字是HTML最稳的还原
- 字体:Newsreader / Source Serif(阅读级)或Inter(宣言式)；标题可Archivo超粗


---

## 信息图风格库(20种)

> **2026-08 新增**。此前本库只有网页与 PPT 两个半区，但「信息图/可视化」在 SKILL 里是四大适用场景之一——做信息图时轮盘只能落进网页半区，抽到的是社区站/落地页的风格，硬套上去。这个半区补的就是这个洞。
> 判据：**产出是一张(或一组)以数据为主角、可脱离交互独立阅读的图**，就走这里；是可点击的站点走网页分区，是要翻页的走 PPT 分区。

#### 大胆派

**个人数据印刷年报 / Personal Annual Report（Feltron式）** `大胆·还原94%`
- 参考:Nicholas Felton《Feltron Annual Report》2005–2014（2006-2011 卷入 MoMA 永久馆藏）；Stefanie Posavec；Bloomberg Businessweek 年度特辑
- 适配:个人或团队年度总结、quantified-self、产品年度回顾、Wrapped 类复盘、长周期自我审计
- 视觉DNA:配色=未涂布纸暖白底+单一朱红做贯穿accent+石板蓝第二数据序列+第三色只绑一个语义绝不复用。字体=Helvetica系紧排，巨号数字压顶，小字注脚密集。母版四件套：①巨数字模块条 ②极坐标周期图(24h/12月) ③日历热力格 ④贯穿全幅的时间或地理带。标志=把私人琐碎数据当企业年报做的反差、模块化印刷网格、1px分割线、黑白打印仍可读
- HTML实现:CSS Grid分模块+1px border切网格；极坐标图内联SVG手算极角(不引图表库)；日历用Grid+子元素高度填充。纯排版+SVG，零素材，HTML极强项
- 字体:Archivo / Helvetica Neue(紧排巨数字) + Inter(小字注脚)

**解释性图解 / Explanation Graphics（Nigel Holmes式）** `大胆·还原76%`
- 参考:Nigel Holmes(1978–1994任TIME图表总监，1994创立Explanation Graphics)；主张用图画与幽默解释抽象数字，也是chartjunk之争的靶心
- 适配:科普解释、把复杂概念讲给外行、大众媒体专栏配图、儿童与教育向
- 视觉DNA:配色=高饱和平涂三四色+黑描边。字体=圆润无衬线+手写感标注。母版=把图表本体画成实物隐喻(钞票摞成柱、温度计当量表、跑道当进度条)。标志=拟物化图表、幽默、小人像、粗描边、零渐变
- HTML实现:图表骨架CSS/SVG可做，**灵魂在手绘插画**——纯HTML下只能降级为几何色块，须明确标注降级；有生图能力时用huashu-gpt-image生插画元素再合成
- 字体:Nunito / Baloo 2(圆润) + Caveat(手写标注)

**巨幅剖面手绘 / Cross-Section Epic（SCMP Arranz式）** `大胆·还原55%`
- 参考:Adolfo Arranz(SCMP资深图表编辑，Malofiej国际信息图奖多枚金奖，代表作《City of Anarchy》九龙城寨剖面)；Malofiej被称为信息图界的普利策
- 适配:建筑/历史/器物解剖、单张读十分钟的长卷、博物馆级科普
- 视觉DNA:配色=暗底(深墨/深褐)+暖色高光+做旧纸质感。构图=单张巨幅、等距或正剖视角、密集引线标注环绕主体。标志=手绘细节、引线标注、剖面视角、一张图讲完整个故事
- HTML实现:🔴 **纯HTML做不出手绘剖面**——本风格必须有插画素材，无素材时不要假装。HTML只承担引线标注层与缩放滚动交互。拿不到素材就换风格
- 字体:Source Serif(标题) + Inter(标注)

**杂志撞色数据页 / Magazine Pop Data（Businessweek式）** `大胆·还原90%`
- 参考:Bloomberg Businessweek(Richard Turley时期)、WIRED图表页、The Economist的Graphic Detail专栏
- 适配:商业/科技媒体图表、观点专栏配图、社媒方图、公众号内嵌数据图
- 视觉DNA:配色=撞色双主色(荧光黄+黑、品红+藏青)+纸白留白，不用第三色调和。字体=超粗压缩体大标题+极小说明字，字号对比10倍以上。母版=一图一个论点、图表本身就是版式主角、标题直接说结论。标志=极端字号对比、撞色、图表出血到版心外、结论式标题
- HTML实现:纯CSS可完全还原；图表用内联SVG或CSS Grid条；出血靠负margin。零素材
- 字体:Archivo Black / Anton(压缩粗体) + IBM Plex Sans(说明)

**ISOTYPE图形统计 / Neurath–Arntz** `大胆·还原88%`
- 参考:Otto Neurath与Gerd Arntz于1920s维也纳创立的ISOTYPE国际图形教育系统
- 适配:人口/社会/公共政策数据、面向低识字门槛的公共传播、教育海报
- 视觉DNA:配色=有限套色(黑+红+蓝+土黄)平涂，无渐变无阴影。母版=同一图标重复N次表示数量——**放大图标表示更多是错的**，这是该体系最核心的规矩。标志=剪影图标阵列、横向排列、左侧文字标签、极强秩序感
- HTML实现:图标用内联SVG剪影+CSS repeat布局，HTML天然适配。图标可自绘几何剪影，不需外部素材
- 字体:Jost / Archivo(Futura替代)

**数据人文主义手绘图谱 / Data Humanism（Lupi式）** `大胆·还原80%`
- 参考:Giorgia Lupi(Pentagram合伙人)与Stefanie Posavec《Dear Data》；Lupi的Data Humanism宣言主张「数据是人不是数字」
- 适配:个人化情感化数据、小样本深描、把私人经验做成可读图谱、非量化维度多的题材
- 视觉DNA:配色=手账米白底+4-5个各自绑定语义的柔和色(珊瑚/松绿/芥黄/墨紫)，**没有一个颜色是装饰**。母版=①先定一套视觉语言(大小/形状/刺/尾巴各编码一维)②必配一张图例教读者解码③元素沿有机路径排布不用网格。标志=可解码的自定义符号、必带图例、有机排布
- HTML实现:符号用内联SVG参数化生成(半径/刺数/尾长绑数据字段)；路径用贝塞尔曲线穿点。纯SVG零素材，唯一做不出的是真手绘笔触
- 字体:Georgia / Source Serif(标题) + Inter(图例)

**滚动叙事数据长卷 / Scrollytelling（The Pudding式）** `大胆·还原85%`
- 参考:The Pudding(数据新闻杂志)、NYT The Upshot、Reuters Graphics滚动专题
- 适配:需要一步步揭示的复杂论证、长篇数据故事、网页端专题
- 视觉DNA:配色随章节切换但保持单一accent贯穿。母版=左侧文字步进、右侧图形随scroll变形；每一屏只推进一个变量。标志=图形不换只变形、文字与图形严格绑定、章节色变、结尾给完整全景
- HTML实现:IntersectionObserver触发状态切换+CSS transition或SVG属性插值，纯前端可完整还原。⚠️ 交付形态必须是网页，**导PDF/PNG会丢掉全部叙事**——用户要静态图时不要选它
- 字体:Inter / Source Serif(长文可读性优先)

**地图即主角 / Cartographic Lead（Stamen式）** `大胆·还原65%`
- 参考:Stamen Design(2001年Eric Rodenbeck于旧金山创立，客户含National Geographic)，其Watercolor/Toner地图砖是公开经典
- 适配:地理分布数据、城市/交通/环境题材、位置即叙事的内容
- 视觉DNA:配色=地图底图定调(水彩或单色Toner)+数据层用高对比点线。母版=地图占满版心、数据以点密度或流线叠加、图例极小压角。标志=底图本身有作者性、数据层克制、地理形状即构图
- HTML实现:🔴 **需要真实地理数据(GeoJSON)与底图**，纯HTML无法凭空生成正确地形——拿不到数据就换风格，**绝不手绘假地图**。有数据时可用内联SVG投影绘制
- 字体:Inter / IBM Plex Sans(地名标注需大量小字)

#### 中性派

**数据新闻图表规范 / Newsroom Chart System（FT式）** `中性·还原96%`
- 参考:Financial Times的Chart Doctor团队与公开的Visual Vocabulary(按Deviation/Correlation/Ranking/Distribution/Change-over-Time/Part-to-Whole/Magnitude/Spatial分类选图表)
- 适配:财经与行业数据、「选对图表类型」比「好看」更重要的场合、系列图表需统一规范时
- 视觉DNA:配色=标志性粉橘报纸底+一组有序色阶(单色渐变表连续量、对比双色表偏离)。母版=①标题即结论②副标题说明口径③图表本体去边框去网格④左下角必标数据来源。标志=先按数据关系选图型再谈美感、来源标注不可省、坐标轴极简
- HTML实现:纯CSS/SVG画折线柱状；关键是**先查Visual Vocabulary选对图型**再动手。零素材
- 字体:Inter / Source Sans(正文) + 等宽体标数字

**计算式数据肖像 / Computational Portrait（Fathom式）** `中性·还原78%`
- 参考:Ben Fry与其波士顿工作室Fathom Information Design(Fry为Processing联合创造者、《Visualizing Data》作者，作品曾入Whitney双年展)
- 适配:超大规模数据集、需要「让数据自己长出形状」的题材、基因/交通/时间序列
- 视觉DNA:配色=白或近黑底+极细线条+单色透明度叠加出密度。母版=不做摘要做全量呈现，用海量细元素的叠加密度形成图形。标志=发丝线、透明度堆叠、无装饰、形状由算法而非版式决定
- HTML实现:Canvas或大量SVG path程序化绘制，数据量大时必须Canvas。**要求真实全量数据**，小样本做不出这个风格的密度感
- 字体:Inter / Roboto Mono(数据标注)

**美丽信息 / Beautiful Information（McCandless式）** `中性·还原90%`
- 参考:David McCandless《Information is Beautiful》与其同名网站，以「把大数据集做成一眼可比的彩色图形」著称
- 适配:科普对比、榜单、大众向数据聚合、社媒传播型图表
- 视觉DNA:配色=多色但同明度同饱和的和谐色环(不是随机撞色)。母版=气泡图/树状图/桑基图等「面积即数量」的图型为主，标签直接压在色块上。标志=面积编码、同调多色、图例内嵌、一张图容纳几十个条目
- HTML实现:树状图与气泡用CSS Grid或SVG计算布局(需自己写简单装箱算法)；桑基图用SVG贝塞尔。零素材
- 字体:Nunito Sans / Inter

**学术开放数据 / Open Research Data（Our World in Data式）** `中性·还原94%`
- 参考:Our World in Data(牛津Global Change Data Lab)，准则是图表可交互、口径写清楚、数据可下载
- 适配:严谨议题、需要经得起质疑的数据展示、长期趋势对比
- 视觉DNA:配色=白底+一组区分度高但不刺眼的分类色+灰色做非重点系列。母版=①一句话结论标题②口径与时间范围写在副标题③图内直接在线末标标签(不用图例)④底部注来源与许可。标志=线末标签替代图例、灰化非重点、口径透明、克制
- HTML实现:纯SVG折线+末端text定位，HTML最稳的一类。零素材
- 字体:Inter / Lato

**东方思辨科技图 / Speculative Tech Diagram（Takram式）** `中性·还原84%`
- 参考:Takram(东京与伦敦的设计工程工作室，横跨设计与工程的speculative design实践)
- 适配:技术概念图、未来场景推演、研究型白皮书配图、产品架构叙事
- 视觉DNA:配色=米灰砂色基底+低饱和自然色(苔绿/陶土)+一处金属灰。字体=细字重、大字距、中英混排考究。母版=图表被当作艺术品排布、大量留白、几何图形有精密感。标志=柔和科技感、精密几何、克制的自然色、图表如装置
- HTML实现:纯CSS/SVG可还原；关键在留白比例与线宽克制(0.5-1px)。零素材
- 字体:Inter(细字重) / Noto Sans JP + Cormorant(标题可选)

**系统图标化图解 / Pictogram System（Otl Aicher式）** `中性·还原92%`
- 参考:Otl Aicher为1972慕尼黑奥运设计的图标系统与Ulm学派栅格方法
- 适配:流程图、导视与指南类信息图、多语言场景、需要一整套图标保持一致时
- 视觉DNA:配色=一套受限色板(奥运版为浅蓝/绿/银)+黑。母版=所有图标共用同一网格与同一笔画角度(仅0/45/90°)、图标与短标签成对出现。标志=严格角度约束、系统一致性、无衬线短标签、栅格可见
- HTML实现:图标用内联SVG按45°约束自绘；栅格用CSS Grid。零素材，但要自己守住角度纪律
- 字体:Jost / Archivo(Univers替代)

#### 安静派

**Tufte小倍数矩阵 / Small Multiples** `安静·还原95%`
- 参考:Edward Tufte《Envisioning Information》的small multiples与sparkline概念
- 适配:多维度横向对比、时间序列分组、一个变量在几十个切片上的表现
- 视觉DNA:配色=白底+黑线+一个强调色标异常项。母版=同一张小图重复N次只换数据，**共用坐标轴范围——范围不统一就失去可比性，这是本流派唯一的致命错误**；标签极小压在图旁。标志=网格化重复小图、共享刻度、零图例、零网格线、高数据墨水比
- HTML实现:CSS Grid排小图+每格内联SVG折线。务必统一domain。零素材
- 字体:Source Serif(标题) + Inter(小标签)

**拓扑简化路网图 / Topological Transit Map（Beck/Vignelli式）** `安静·还原86%`
- 参考:Harry Beck 1933年伦敦地铁图、Massimo Vignelli 1972年纽约地铁图
- 适配:流程与关系网络、组织架构、系统拓扑、任何「连接关系比真实距离重要」的图
- 视觉DNA:配色=白或浅底+每条线一个高饱和纯色。母版=所有线段只走0/45/90°、站点等距——**牺牲地理准确性换可读性**是本流派的立身之本；换乘点用空心圆。标志=八方向约束、等距节点、纯色线、空心节点
- HTML实现:内联SVG polyline严格约束角度；节点用circle。纯几何，HTML完美适配
- 字体:Jost / Inter(站名可全大写)

**白之留白信息图 / Ma & Emptiness（原研哉式）** `安静·还原82%`
- 参考:原研哉《白》与无印良品视觉体系，「留白不是空，是容纳想象的容器」
- 适配:品牌年报、慢节奏叙事、少量但重要的数据、需要庄重感的场合
- 视觉DNA:配色=纯白或宣纸白+极浅灰+一处极小的墨色或朱色点。母版=一屏一个数据、巨幅留白、元素靠边缘或黄金位置放置、绝不填满。标志=极端留白、单点强调、细若无物的线、东方式的「间」
- HTML实现:纯CSS排版。🔴 **本库风险最高的一种**——留白必须是构图(有明确视觉锚点)，做过头就是「页面渲染坏了」；正文仍须≥14px，不许为了气质缩字号
- 字体:Noto Serif SC / Source Han Serif + Inter

**书籍级信息排印 / Bookcraft Data（Irma Boom式）** `安静·还原80%`
- 参考:Irma Boom(荷兰书籍设计师，作品入MoMA永久馆藏，以极端排印与材质实验著称)
- 适配:长篇数据报告、需要被当作出版物收藏的年报、图文混排的深度内容
- 视觉DNA:配色=纸色+一到两种油墨色，色块大面积压版。字体=排印本身即主角，字号跨度极大、页边距非对称、文字可竖排或旋转。母版=把数据嵌进文本流、章节页用满版色块分隔。标志=非对称版心、极端字号跨度、排印实验、出版物质感
- HTML实现:CSS多栏+writing-mode可做竖排；非对称版心用Grid。**做不到的是纸张材质与裁切**，屏幕上须靠排印张力补偿
- 字体:Fraunces / EB Garamond + Archivo(对比)

**科学期刊图版 / Scientific Figure Plate** `安静·还原96%`
- 参考:Nature与Science的figure规范、USGS与NASA的公开科学图版
- 适配:研究结论、方法对比、需要同行审阅质感的严谨数据、多子图组合
- 视觉DNA:配色=白底+色盲友好色板(用蓝橙对比而非红绿)+灰阶。母版=子图用(a)(b)(c)标号、图注在图下方成段、误差棒与样本量必标、坐标轴带刻度线。标志=子图编号、图下长图注、误差棒、色盲安全、零装饰
- HTML实现:CSS Grid排子图+SVG画图与误差棒；图注用小字段落。零素材，HTML完全胜任
- 字体:Inter / Source Sans + Roboto Mono(数字)

**瑞士网格年报 / Swiss Grid Report（Müller-Brockmann式）** `安静·还原97%`
- 参考:Josef Müller-Brockmann《Grid Systems in Graphic Design》、Ulm学派、瑞士国际主义年报传统
- 适配:企业年报、机构报告、需要长期沿用一套版式的系列文档
- 视觉DNA:配色=白底+黑+单一强调色。母版=严格模块网格(常12栏)、所有元素吸附栏线、左对齐齐头不齐尾、大量呼吸性留白但不空。标志=可见的网格逻辑、Helvetica系、非居中排版、层级靠字号与间距而非装饰
- HTML实现:CSS Grid直接映射栏网格，是本库与HTML最同构的一种。零素材
- 字体:Inter / Archivo(Helvetica替代)

---

## ⚠️ AI 生图专用风格（仅在确认用户有生图能力时才推，default 不可选）

下面这些风格的灵魂在**动态生成视觉 / 3D / 粒子 / 电影级光影 / 手绘插画**，纯 HTML/CSS 无生图下只能做出严重劣化的 mock，**从 default 推荐池剔除**。用户明确有生图能力（走 `huashu-gpt-image`）时才作为候选：

| 风格 | 灵魂 | 为什么 HTML 做不了 |
|------|------|------------------|
| Active Theory（WebGL 粒子） | 3D 粒子系统/实时渲染 | 纯 CSS 无法 |
| Field.io（生成艺术） | 算法生成图形 | 静态 SVG 只能做僵化简化版 |
| Resn（插画交互） | 角色插画+游戏化 | 依赖手绘素材 |
| Zach Lieberman（实时生成） | creative coding 笔触 | 依赖实时生成 |
| Raven Kwok（分形参数） | 递归分形 | CSS 做不出复杂度 |
| Ash Thorp（电影光影） | 电影级体积光/概念美术 | CSS 光影是劣化 |
| Territory Studio（FUI 全息） | 科幻全息界面 | 依赖大量发光层叠素材 |
| Neo Shen（水墨晕染） | 水墨有机晕染 | CSS 渐变≠水墨 |
| Sagmeister & Walsh（色彩爆发） | 手作实物+实验排版 | 撞色骨架可做（已并入网页「Memphis/孟菲斯」与 PPT「单色撞色海报」），手作质感做不了 |

> 这些款不是「不好」，是「载体不对」——它们的原生载体是 AI 直出图，不是浏览器 DOM。

---

## 默认审美禁区（用户可按自己品牌 override）

- ❌ **GitHub-dark 偷懒解**：均匀深蓝底（#0D1117）+ 通用青/紫霓虹 glow——只禁这一种烂大街组合，不是「暗色一律禁」
- ✅ **不在禁区**：电影级戏剧光影、暖色赛博（Ash Thorp 橙/青）、运动诗学暗场叙事——有作者意图的暗色保留（本库「Linear 暗色发光」「黑底数字剧场」「CS50 糖果舞台」都是合法暗色）
- ❌ 激进紫渐变万能公式、emoji 当图标、圆角卡片+左彩 border accent（除非品牌本身用）
- ❌ 封面图加个人署名/水印

---

## 有生图能力时的提示词心法（Mood, Not Layout）

> 仅当走 AI 生图路径时适用；HTML 路径直接按上面各风格的「HTML 实现」写代码。

短提示词 > 长提示词。描述情绪和内容，比堆 30 行布局细节有效。

| 杀死多样性的写法 | 激发创造力的写法 |
|----------------|----------------|
| 指定颜色比例（60%/25%/15%） | 描述情绪（"warm like Sunday morning"） |
| 规定布局位置 | 引用具体美学（"Pentagram editorial feel"） |
| 列出所有视觉元素 | 描述观众应该感受到什么 |

完整 AI 生图方法论 → `huashu-gpt-image` skill。

---

**版本**：v3.1（2026-06 重构为 HTML 原生库；2026-08 补齐信息图分区，40 → 60 种）
**适用**：网页/PPT/PDF/信息图/封面/App 等所有视觉设计的 default HTML 路径
