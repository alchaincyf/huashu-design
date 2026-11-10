# 设计风格库：网页 20 + PPT 20 + 信息图 20 + App 12 + 中文与东亚 12 + 小红书 8（HTML 原生优先，每种都有样张）

> **2026-06 重构**。基于对全球 10 大网站类型 + 10 大演示类型、各 top5 公认最佳设计（共 100 个真实案例）的调研反推。
> 旧版 20 种「平面/装置设计师哲学」库的致命问题：大胆风格几乎全是 AI-生成-only（粒子/光影/手绘），**用户默认无生图能力、default 全走 HTML 时，大胆半场直接清零，只剩极简——这是「default 千篇一律」的根因**。本库每一种都标了「纯 HTML/CSS 无生图」下的**还原度**。
>
> ⚖️ **但记住定位**：这是**「没思路时翻的弹药」，不是「必须从这里选」的清单**。用户给了内容/品牌/参考，设计就从那里展开，别套库。skill 的职责是帮用户规避最差，不是规定好设计长什么样——好设计从用户的真实需求里长出来。

## 这个库怎么用

0. **先看样张，再读文字。** 每个分区有一张总览 `assets/style-specimens/sheet-<web|ppt|info|app|east|xhs>.jpg`，每条风格末尾的「样张」是单张大图（同名 .html 是源码，可以直接读 CSS 学它的做法）。文字描述告诉你它是什么，样张告诉你做到位是什么样——模型只读名字，做出来的是它对这个风格的平均印象。样张里的题材和数字都是虚构的，借的是版式与气质，不是内容。
1. **先按输出类型选分区**：做网页/落地页/官网 → 网页 20 种；做 PPT/deck/演示 → PPT 20 种；做信息图/数据可视化/单张长图 → 信息图 20 种；做 App/移动端原型 → App 12 种；做小红书图文/封面/轮播 → 小红书 8 种（每个样张同时是模板）。**中文与东亚 12 种是跨媒介的**，任何形态都可以来选，中文内容尤其值得。
   - 判据是**产出形态不是题材**：可点击的站点走网页区，要翻页的走 PPT 区，**一张(或一组)以数据为主角、能脱离交互独立阅读的图走信息图区**。
   - 拿不准的两个常见情形：Dashboard 原型走网页区（它是产品界面）；一页 deck 里嵌的数据页仍走 PPT 区（它要翻页）。
2. **温度体系**：每种标了 `大胆 / 中性 / 安静`。**故意让大胆款占多数**——模型的确定性偏差天然偏安静极简，库的配比要把它往大胆推。
   - 本库是三方向里「秒数轮盘」的池子（见 `references/directions.md`）；最佳设计师、现实参照两套逻辑没思路时也可以来翻。
   - ❌ 三个方向不要都落在同一种气质（比如都是「米白+留白+一个点缀色」）。
3. **还原度**：≥90% 闭眼做；70-90% 主体可做、个别细节降级；<70%（如 Memphis 做旧纹理）必须在产出里**明确标注哪部分用纯色块降级**，不假装能做出原版质感。
4. **字体**：每种给了开源替代（Inter/Geist/Manrope/Space Grotesk/Fraunces/Playfair 等），不要写付费字体（Söhne/Circular 等）。
5. 配套：三方向里「秒数轮盘」从本库抽（`references/directions.md`）；需要真照片的风格（深色画廊、白盒画廊、地图即主角等），样张里是诚实的占位，真做时要先取图。

---

## 色彩推导协议（用任何风格前先走这三步）

> ⚠️ **以下所有风格条目里的 hex 是示例锚点，不是配方。** 同一风格用于不同内容，应通过本协议推导出不同色值——直接复制条目 hex，只是在生产品味更好的 slop。为什么：写死配方让 100 个用户拿到 100 份同色产出，色彩的信息量归零；推导让色彩成为「这个内容独有」的证据。
>
> **字体同理**：条目里的字体名也是示例锚点。选定风格后，display+body 配对先过 `references/typography.md` 的配对逻辑与「已被用烂名单」——**名单与条目冲突时以 typography.md 为准**（如条目写 Fraunces，按名单换平替）。

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
- 样张:assets/style-specimens/web/01-editorial-brutalism.jpg

**新粗野主义撞色信息流 Neo-Brutalism（粗黑描边卡片+高饱和撞色）** `大胆·还原95%`
- 参考:The Verge 2022 redesign（in-house team，PolySans + Mānuka）
- 适配:媒体/内容站、AI产品聚合页、活动landing、社区榜单页、小红书风信息卡
- 视觉DNA:配色电光紫#5200FF~品红#E1306C高饱和主色+亮黄#F8E000强调+纯黑#08080D+白，大面积撞色块刻意不柔和。字体几何无衬线大标题+衬线正文反差。布局卡片化feed流、2-4px粗黑描边、硬色块分区、近乎无圆角。标志元素：粗描边卡片hover撞色翻转、未完成界面气质。
- HTML实现:纯CSS强项。border:3px solid #000粗描边+box-shadow硬投影偏移(4px 4px 0 #000)+grid/flex卡片流+:hover切换background撞色翻转。无3D/光影障碍。
- 字体:Space Grotesk（替PolySans）+ 任一衬线如Fraunces
- 样张:assets/style-specimens/web/02-neo-brutalism.jpg

**孟菲斯复古拼贴最大化 Memphis Maximalism（撞色块+错位叠放+复古字体）** `大胆·还原72%`
- 参考:Gucci Vault概念店（Alessandro Michele）；Memphis设计运动 / Sagmeister叛逆基因
- 适配:电商概念店、创意活动页、品牌实验campaign、Y2K复古主题、节日营销页
- 视觉DNA:配色复古红/芥末黄/宝蓝/紫/橄榄绿大面积撞色并置+做旧米色暖底，浓烈刻意不和谐。字体复古衬线+装饰字混用、印刷质感、打破网格错位叠放。布局反网格拼贴策展、模块大小不一错落叠压、像逛数字房间。标志元素：撞色块、错位叠放、非常规导航彩蛋。
- HTML实现:transform:rotate()做错位叠放+position:absolute叠压+高饱和background撞色块+复古Google Fonts。真实做旧纹理无法CSS还原，降级为纯色块+mix-blend-mode/contrast滤镜模拟肌理，几何拼贴版成立、archival做旧版会降级。
- 字体:DM Serif Display + Bungee（装饰）+ Space Mono
- 样张:assets/style-specimens/web/03-memphis-maximalism.jpg

**糖果色凸起立体按钮游戏化 Friendly Geometric Candy** `大胆·还原85%`
- 参考:Duolingo（Johnson Banks + Monotype，Feather Bold字体）；反硅谷极简
- 适配:教育语言学习、消费级App landing、游戏化产品、面向大众亲和产品、活动报名页
- 视觉DNA:配色Duo绿#58CC02+鸭子黄#FFC800+天蓝#1CB0F6糖果高饱和+白底，圆润友好。字体超粗圆体（Feather Bold感）。布局大圆角卡片、凸起3D按钮（底部硬阴影=可按压感）、吉祥物位+进度气泡。标志元素：3px实底阴影立体按钮、按下位移动画、超圆角。
- HTML实现:纯CSS。box-shadow:0 4px 0生硬底阴影做凸起按钮+:active translateY(4px)消阴影模拟按压，border-radius大圆角，纯色块。吉祥物无生图时用CSS几何形或emoji占位（轻微降级）。
- 字体:Baloo 2 / Nunito（超粗圆体替Feather）
- 样张:assets/style-specimens/web/04-friendly-candy.jpg

**纯CSS几何插画+响应式变形彩蛋 Pure-CSS Art** `大胆·还原80%`
- 参考:Lynn Fisher（lynnandtonic.com，纯CSS艺术传奇，Adobe专文报道）
- 适配:个人主页、创意404/彩蛋页、品牌玩味landing、技术博客头图、设计师自我展示
- 视觉DNA:配色2-4色高对比扁平面（每个breakpoint换调色）。字体粗几何无衬线标题。布局核心是「图随视口变形」——一组CSS形状在不同断点重组成不同画面（如建筑随屏宽变换层数）。标志元素：纯CSS绘制的几何插画、断点驱动的重排彩蛋、零图片。
- HTML实现:纯CSS的炫技战场，零素材是优势。div+border-radius/clip-path/transform/box-shadow堆叠几何形，@media断点改变形状尺寸位置实现变形。难度在设计构思而非技术，但需要精心手搓每个形状。
- 字体:Rubik / Archivo（粗几何替自定义）
- 样张:assets/style-specimens/web/05-pure-css-art.jpg

**巨型字黑白高对比时装大字报 Bold Big-Type Editorial** `大胆·还原88%`
- 参考:Jacquemus官网 / Rik Oostenbroek / Domestika；时装杂志大字报
- 适配:电商时尚、作品集、媒体专题、品牌宣言页、视频课程封面、调研报告大字版
- 视觉DNA:配色极简黑白+单一克制点缀色（裸粉#E8C4C0或正红）。字体超大Display无衬线/高反差衬线，标题占满整屏。布局全幅网格、巨字与负空间博弈、图文1:1分割。标志元素：屏占比巨型headline、奢侈级留白、左右对位排版。
- HTML实现:纯CSS完美还原。clamp()巨号字+CSS Grid全幅分割+大量padding留白+vh单位让标题占满视口。无图时用纯色块/文字块替代时装大片占位（轻降级但版式成立）。
- 字体:Archivo Expanded / Anton（Display）+ Playfair Display（高反差衬线）
- 样张:assets/style-specimens/web/06-bold-big-type.jpg

**复古未来太空图录 Cosmic Retro-Futurism** `大胆·还原75%`
- 参考:Perplexity Comet浏览器发布站（The Brand Identity：Black/Blue/Cream；《2001太空漫游》气质）
- 适配:AI产品发布站、科技品牌宣言页、活动倒计时页、未来感landing、概念发布会
- 视觉DNA:配色纯黑#0A0A0A+奶油纸白cream#F0EAD8+一抹钴蓝-孔雀蓝#2B4F91，低饱和像老式天文图录。字体高反差衬线（古典天文图册感）+留白。布局线描轨道/抛物线SVG、行星圆点、奶油底压黑字、古籍式排印。标志元素：SVG天体轨道线、奶油+蓝+黑三色、复古衬线大字、天文图录质感。
- HTML实现:纯CSS+SVG还原静态版八成气质。SVG path画轨道抛物线+CSS径向定位行星圆点+三色变量+高反差衬线。缺口是「太空落到地球」的全屏视频转场（灵魂部分）——降级为CSS scroll视差+SVG轨道旋转近似。
- 字体:Cormorant Garamond / EB Garamond（高反差衬线）+ Space Mono
- 样张:assets/style-specimens/web/07-cosmic-retro-futurism.jpg

**电影感声波可视化 Cinematic Sound-Viz Dark** `大胆·还原72%`
- 参考:ElevenLabs；电影片头title sequence（Saul Bass式极简动态）× 音频工程界面
- 适配:音频/语音AI产品、音乐科技站、播客平台、媒体发布页、影院级品牌hero
- 视觉DNA:配色纯黑#000底+纯白文字+蓝紫渐变accent波形。字体大号无衬线标题Saul Bass式极简。布局全幅暗场、声波/频谱可视化贯穿、巨标题压波形、卡片功能区。标志元素：彩色audio-waveform波形带、电影片头式极简、高对比黑白+单渐变、声音可视化母题。
- HTML实现:纯CSS+SVG还原70%气质（骨架完美，波形是降级点）。SVG polyline画静态波形或多条不等高div柱阵+CSS animation做『假波形』跳动近似。缺口：随声音实时跳动的Web Audio/Canvas频谱不可纯CSS还原，静态版像、动态灵魂还不了。
- 字体:Inter / Sora（大号无衬线）
- 样张:assets/style-specimens/web/08-cinematic-sound-viz.jpg

**像素游戏横版叙事 Pixel-Game Side-Scroller** `大胆·还原70%`
- 参考:Robby Leonardi交互简历（8/16-bit平台动作游戏叙事，致敬任天堂SNES）
- 适配:创意简历/作品集、品牌玩味campaign、游戏化landing、活动彩蛋页、个人趣味主页
- 视觉DNA:配色复古游戏多段分区——森林绿#4CAF50草地+天蓝#5DADE2，过渡太空紫#2C2A4A、火山橙红#E8743B、海底青#1ABC9C，每『关卡』换一套高饱和卡通调色。字体像素字体（8-bit感）+粗无衬线。布局横版/纵向滚动分关卡场景、视差分层、scroll触发位移。标志元素：分关卡换色、像素美学、视差滚动、游戏HUD式UI。
- HTML实现:纯CSS+少量JS还原骨架（原作就是HTML+CSS+jQuery无WebGL）。视差分层position+scroll位移、image-rendering:pixelated、CSS逐帧background-position做sprite动画、分段背景色。缺口：原创角色/场景手绘像素插画——无生图时用CSS方块拼简易像素图标替代（美术降级，技术不降）。
- 字体:Press Start 2P / VT323（像素字）+ Inter
- 样张:assets/style-specimens/web/09-pixel-side-scroller.jpg


#### 中性派

**包豪斯几何标志+扁平插画系统 Bauhaus Geometric** `中性·还原90%`
- 参考:Khan Academy rebrand（六边形+花瓣logomark + Wonder Blocks设计系统）；Bauhaus几何构成
- 适配:教育课程站、品牌logo系统、信息图、儿童亲和向产品、活动KV
- 视觉DNA:配色三原色谱系——包豪斯红#E63946/黄#FFB703/蓝#0077B6+黑白，纯色块拼接。字体几何无衬线（圆润几何感）。布局圆/三角/方基本几何单元搭建插画，对齐栅格、模块化拼图。标志元素：纯几何形态logomark、扁平无渐变插画、原色块构成。
- HTML实现:纯CSS几何全能。border-radius:50%做圆、clip-path/border三角形、方块div拼几何插画，CSS Grid栅格对齐，纯色fill无需素材。插画用CSS形状或内联SVG几何路径手搓。
- 字体:Poppins / Manrope（几何圆润替Wonder Blocks）
- 样张:assets/style-specimens/web/10-bauhaus-geometric.jpg

**暗色双色侧栏开发者作品集 Dark Editorial（深底+单荧光accent+等宽字）** `中性·还原96%`
- 参考:Brittany Chiang（brittanychiang.com v4，dev portfolio事实标准）
- 适配:作品集个人主页、开发者向产品、技术品牌站、简历页、AI工具landing
- 视觉DNA:配色深墨绿/海军底#0A192F+板岩灰文字#8892B0+单一荧光青绿accent#64FFDA。字体无衬线正文+等宽字（编号/标签）。布局左固定侧栏导航+右滚动主区双栏，section编号01/02、链接hover下划线滑入。标志元素：单accent色、等宽编号标签、侧栏锚点高亮。
- HTML实现:纯CSS完全还原。position:sticky做固定侧栏+CSS Grid双栏+单accent变量+等宽字标签+:hover下划线transform滑入。零素材，纯版式与微交互。
- 字体:Inter + JetBrains Mono（等宽）
- 样张:assets/style-specimens/web/11-dark-editorial.jpg

**暖色出版物 Warm Editorial（奶油纸底+赤陶橙+衬线无衬线混排）** `中性·还原97%`
- 参考:Anthropic / Claude（DBCo + Geist Studio，Styrene×Tiempos）；Penguin/Pelican平装书排印
- 适配:AI产品站、品牌官网、长文阅读页、橙皮书电子书、调研报告、培训材料
- 视觉DNA:配色奶油纸底#F5F0E8+赤陶橙#CC785C/#D97757点缀+近黑文字#191919，温暖低饱和。字体衬线标题（Tiempos感）×无衬线正文（Styrene感）混排。布局书籍式单栏阅读流、舒适行高、节制分隔线。标志元素：纸感暖底、赤陶橙、出版级排印节奏。
- HTML实现:纯CSS 100%还原，零素材。背景色变量+衬线无衬线字体栈混排+max-width限制阅读宽度+line-height 1.7舒适行高。
- 注意：这也是模型最容易不假思索落下的外观（Claude 自己的配色，见 `references/content-guidelines.md`）。用它没问题，前提是选了它而不是滑进它：三个方向别都挤在这里，外观账本里最近用过就换一个。
- 字体:Fraunces / Newsreader（替Tiempos衬线）+ Inter（替Styrene）
- 样张:assets/style-specimens/web/12-warm-editorial.jpg

**Linear暗色发光+Bento网格 Glassmorphism Bento** `中性·还原85%`
- 参考:Linear / Cursor（'The Linear Look'现象级流派，Frontend Horse有代码配方）
- 适配:SaaS/AI产品站、开发者工具、技术品牌hero、产品功能展示、深色dashboard演示
- 视觉DNA:配色近黑底#08090A+去饱和蓝紫品牌#5E6AD2+低饱和青紫微光渐变#4EA7FC→#B59AFF。字体几何无衬线负字距紧凑。布局便当盒bento网格分块、发丝分割线、玻璃拟态卡片。标志元素：暗底发光渐变边框、bento分块、流光streamer、磨砂玻璃。
- HTML实现:纯CSS强还原。box-shadow/filter blur+radial-gradient做发光晕，backdrop-filter:blur玻璃拟态，conic/linear-gradient边框，CSS Grid拼bento。缺口仅「真实产品UI截图」——用色块+文字拼简化假UI替代（这部分降级）。
- 字体:Inter / Geist（负字距）+ Geist Mono
- 样张:assets/style-specimens/web/13-glassmorphism-bento.jpg

**斜切流体渐变带 Angled Fluid Gradient** `中性·还原92%`
- 参考:Stripe（标志性angled gradient banner，Klim定制Söhne字体）
- 适配:SaaS/Fintech落地页、品牌官网hero、产品发布页、活动banner、AI产品营销页
- 视觉DNA:配色多色流体渐变（靛蓝#635BFF→青→粉→橙暖调）做hero背景+纯白内容区+近黑文字。字体精致无衬线（Söhne感）。布局倾斜分割色块（skew切角分区）、渐变hero压结构化栅格正文。标志元素：angled斜切边界、多色流体渐变、理性栅格压表达渐变。
- HTML实现:纯CSS。transform:skewY()或clip-path:polygon()做斜切分区，linear-gradient多色叠加（可加CSS animation缓慢流动）做流体渐变带，Grid做下方结构化正文。零素材。
- 字体:Inter / Hanken Grotesk（替Söhne）
- 样张:assets/style-specimens/web/14-angled-fluid-gradient.jpg

**实用主义彩虹分类文档 Utility-First Colorful Docs** `中性·还原98%`
- 参考:Tailwind CSS Docs（Sky/Cyan品牌色+功能分类彩虹色相条）
- 适配:技术文档、API参考、设计系统站、教程站、开发者knowledge base、SaaS帮助中心
- 视觉DNA:配色Sky蓝#38BDF8品牌+teal→cyan→sky青蓝渐变+Slate灰阶#0F172A/#64748B/#F8FAFC，文档用彩虹色相条区分功能分类（粉#EC4899/紫#A855F7/绿#10B981/橙）。字体清爽无衬线+等宽代码。布局左侧栏导航+中正文+右TOC三栏，彩色高亮代码块、分类色标。标志元素：青蓝渐变hero、彩虹分类色、三栏文档骨架、语法高亮代码块。
- HTML实现:纯CSS 98%还原（它本身就是CSS框架文档）。Grid三栏+linear-gradient青蓝hero+分类色变量+代码块语法色用span着色。Inter开源，唯暗色切换/copy需轻量JS。零光影/3D/手绘。
- 字体:Inter + JetBrains Mono / Fira Code（代码）
- 样张:assets/style-specimens/web/15-utility-colorful-docs.jpg

**终端核软未来 Terminal-Core Soft-Futurism（等宽字+等距立方）** `中性·还原80%`
- 参考:Cursor (Anysphere)；开发者终端美学 × Teenage Engineering工业极简
- 适配:AI编程工具站、CLI产品landing、开发者基础设施、技术品牌hero、终端类产品
- 视觉DNA:配色炭黑#0B0D14底+暖白文字#F2F0EF+克制蓝紫渐变accent点缀按钮与光晕。字体等宽字为主角（命令行感）+无衬线辅助。布局命令行/代码块前景、bento分区、2.5D等距cube示意。标志元素：等宽字命令行、等距投影立方体、暖白×炭黑、克制渐变光晕、工业极简。
- HTML实现:纯CSS 80%还原。等宽字代码块+暗色bento+box-shadow光晕；2.5D等距cube用CSS 3D transform(rotateX/Y+skew)或SVG等距投影手搓。缺口：可点击切换的多界面demo需JS+假UI拼接。无WebGL刚需。
- 字体:Geist Mono / JetBrains Mono（主角）+ Inter（辅助）
- 样张:assets/style-specimens/web/16-terminal-core.jpg


#### 安静派

**功能主义网格社区 Functional Brutalism（灰线分割+系统字+蓝链接）** `安静·还原98%`
- 参考:Are.na / Lobsters / Quartz；Müller-Brockmann栅格数字落地 + Tufte信息密度
- 适配:社区/UGC平台、内容聚合站、文档知识库、移动优先内容流、极客向产品
- 视觉DNA:配色近白底#FBFBFB+黑文字+1px灰分割线#E0E0E0+经典链接蓝#0000EE/已访问紫。字体系统字栈（-apple-system/无装饰）。布局高密度信息列表、细灰线分栏、极小留白、紧凑行距。标志元素：发丝灰分割线、蓝链接、系统字、信息密度优先。
- HTML实现:纯CSS最易还原，这是Brutalist Web的本色。border-bottom:1px灰线列表+system-ui字栈+紧凑padding+蓝链接。几乎不需要任何素材或JS，纯结构。
- 字体:system-ui系统字栈 / IBM Plex Sans（兜底）
- 样张:assets/style-specimens/web/17-functional-brutalism.jpg

**深色画廊裱框 Gallery Dark（深黑负空间+单列大图+EXIF小字）** `安静·还原75%`
- 参考:Glass (glass.photo) / Bottega Veneta；美术馆暗房 + Apple Photos内容至上
- 适配:摄影作品集、奢侈品电商、视觉内容沉浸展示、个人画廊页、高端产品陈列
- 视觉DNA:配色纯黑底#0A0A0A+作品图本身提供唯一色彩+极淡灰EXIF小字#666。字体极细无衬线小字。布局单列居中大图、巨幅负空间裱框、图下metadata小字。标志元素：暗房黑底、内容至上UI退隐、EXIF式小字注脚、大图独占视口。
- HTML实现:纯CSS还原版式骨架。纯黑底+居中max-width单列+巨幅padding裱框留白+小字metadata。缺口是「真实摄影作品」本身——用占位图/纯色块代替则失灵魂，但暗房氛围与版式100%可搭。
- 字体:Inter（细字重300）/ Cormorant（衬线奢侈感可选）
- 样张:assets/style-specimens/web/18-gallery-dark.jpg

**Swiss极致黑白 Swiss Monochrome（Vercel式纯黑白+Geist+锐利边角）** `安静·还原98%`
- 参考:Vercel / Next.js Docs（自研Geist已开源）；Massimo Vignelli少即是多
- 适配:开发者工具文档、技术品牌官网、AI产品站、SaaS落地页、极简调研报告
- 视觉DNA:配色纯黑#000+纯白#FFF+灰阶#888，零彩色或仅一抹蓝链接。字体Geist几何无衬线+Geist Mono。布局锐利直角（无圆角或极小）、高对比、精密栅格、克制留白。标志元素：纯黑白、锐利边角、Geist字体、三角/箭头几何标记。
- HTML实现:纯CSS 100%还原，Geist开源可直接引。CSS Grid精密栅格+纯黑白变量+border-radius:0锐角+发丝边框。这是HTML最舒适的极简主场，零素材依赖。
- 字体:Geist + Geist Mono（Vercel开源原版）
- 样张:assets/style-specimens/web/19-swiss-monochrome.jpg

**日式留白白盒画廊 Kenya Hara White Gallery** `安静·还原80%`
- 参考:Cosmos (cosmos.so) / Aesop伊索官网；原研哉『白』的空寂 + 瑞士网格混血
- 适配:高端电商、创意画廊、内容策展平台、设计师作品集、品牌精品店、moodboard站
- 视觉DNA:配色近全白#FAFAFA底+纯黑文字#0A0A0A+极淡灰分割#EFEFEF，内容图提供全部色彩、UI退到背景。字体极简系统/几何无衬线小字、大字距。布局masonry瀑布网格、极致留白、淡灰发丝分隔、东方空寂。标志元素：白盒美学、奢侈留白、内容至上UI隐退、瀑布流策展。
- HTML实现:纯CSS还原静态版式（与暗色画廊区分在『白』）。CSS columns或Grid做masonry+近白变量+大padding留白+淡灰分隔。缺口是Lenis/GSAP丝滑惯性滚动与图片入场缓动（高级感60%在此），CSS仅基础transition，动效层降级。
- 字体:Inter（细字重）/ Cooper Hewitt（Aesop同款开源）
- 样张:assets/style-specimens/web/20-kenya-hara-white-gallery.jpg


## PPT风格库(20种)

#### 大胆派

**新瑞士大字报 / Neo-Swiss Billboard Editorial** `大胆·还原98%`
- 参考:Scribe $75M、Flock Safety $47M 等 AI/SaaS 路演 deck 的 Big-Number Editorial 流派；Bloomberg Businessweek 信息图；Pentagram
- 适配:融资路演、QBR/业务回顾、年度趋势复盘、产品发布关键页
- 视觉DNA:配色=纯白(#FFFFFF)或近黑(#0A0A0A)底+单一高饱和强调色(电光蓝#2D5BFF/荧光绿#00E676/品牌橙#FF6B2C)+中性网格线#E5E5E5。字体=超大粗体无衬线，标题占半屏，数字tabular-nums等宽收紧字距。母版=①大色块章节页一个词②巨型数字占半屏(3.2x)+小注③左右分栏对比④全幅扁平折线/柱状。标志=billboarding大字、严格基线网格、大色块章节页
- HTML实现:超大数字用clamp()；严格网格用CSS Grid；大色块章节页background-color；折线柱状用纯div+CSS或内联SVG(比贴图更锐利)；数字对齐font-variant-numeric:tabular-nums。零插画零3D
- 字体:Inter / Geist / Söhne替代Neue Haas Grotesk；数字配Geist Mono
- 样张:assets/style-specimens/ppt/01-neo-swiss-billboard.jpg

**黑底巨型数字剧场 / Black Big-Number Stage** `大胆·还原97%`
- 参考:Steve Jobs 2007 iPhone Keynote、小米SU7 Ultra雷军发布会、Spotify Wrapped、Presentation Zen(Garr Reynolds)
- 适配:产品发布主题演讲、思想演示、全员town hall、情绪向年度回顾
- 视觉DNA:配色=纯黑#000000底+纯白#FFFFFF字高反差，一页只一个品牌强调色高亮(小米橙#FF6900/Spotify绿#1ED760/Apple蓝#2997FF)。字体=几何无衬线粗体，一屏一词或一个超大数字占满视野，字距收紧。母版=①标题页黑底居中一行大字②数据高潮页巨型数字+单位+一行注③左右参数对比双栏(强调色vs灰)④slogan单页。大量负空间
- HTML实现:黑底白字几行CSS；巨型数字clamp()+flex居中；强调色highlight单独span；左右对比CSS Grid两列+条形高亮；tabular-nums。去掉产品照改纯文字反而更接近Zen本质
- 字体:Geist / Inter / 思源黑替代SF Pro
- 样张:assets/style-specimens/ppt/02-black-big-number-stage.jpg

**高饱和单色品牌撞色海报 / Mono-Brand Type-as-Hero** `大胆·还原96%`
- 参考:Spotify Wrapped视觉系统、Mailchimp Brand Book(Collins)、Netflix红黑现代复刻、COLLINS品牌系统
- 适配:品牌/营销策略、campaign宣讲、town hall文化页、活动主视觉
- 视觉DNA:配色=单一品牌主色满版铺底(Spotify绿#1ED760/Mailchimp黄#FFE01B/Netflix红#E50914)+黑或白反差字，撞色两层。字体=超大字体即主视觉(type-as-hero)顶天立地。母版=①满色块底+反白巨字②双色块上下/左右分割③巨型数字撑满。标志=单色满版、字体当图、高对比撞色
- HTML实现:满版background-color；超大字clamp()占满；双色用两个100vh色块；字体当图靠font-weight900+负letter-spacing。纯色块零素材，HTML原生最爽
- 字体:Inter / Manrope / Archivo(超粗)替代Circular/Cavendish
- 样张:assets/style-specimens/ppt/03-mono-brand-type-hero.jpg

**全幅渐变宣言版式 / Full-Bleed Gradient Manifesto** `大胆·还原82%`
- 参考:Zuora『Tell a Different Story』销售deck(Andy Raskin拆解)、Nike『Just Do It』campaign、National Geographic跨页
- 适配:销售提案愿景页、品牌宣言、keynote转折页、使命愿景单页
- 视觉DNA:配色=满版CSS渐变(暖橙→品红/深蓝→青)或纯色出血+反白宣言大字+hashtag口号(#shifthappens)。字体=厚重无衬线全大写标语横贯。母版=①满幅渐变+居中反白宣言②应许之地愿景页③客户logo墙。标志=full-bleed出血、反白大标语、hashtag口号
- HTML实现:linear-gradient/radial-gradient满版(不做粒子/光影，纯CSS渐变是允许的)；反白字position居中；logo墙用grid灰度SVG/文字占位。原本靠纪实大照片的部分降级为CSS渐变铺底+大字，照片缺失这一项还原度降约15%
- 字体:Archivo / Anton / Manrope(超粗)
- 样张:assets/style-specimens/ppt/04-full-bleed-gradient-manifesto.jpg

**CS50单概念糖果舞台 / Candy-Color Lecture Stage** `大胆·还原94%`
- 参考:Harvard CS50(David Malan)、Lessig Method/高桥流、Presentation Zen
- 适配:教育课件、技术讲座、概念解释、代码教学
- 视觉DNA:配色=深黑底#0A0A0A+高饱和糖果色大字轮换(品红#FF2D95/青#00E5FF/明黄#FFD500/绿#39FF14)。字体=无衬线超大字漂浮居中，一屏一概念，文字极少。母版=①深黑底单个糖果色大词②等宽代码块语法高亮③舞台聚光感大字。标志=深黑漂浮糖果色大字、等宽代码高亮、强舞台聚光、极少文字
- HTML实现:深黑背景+单色超大字clamp()居中；代码块用pre+等宽字+span上色做语法高亮；聚光感用极淡radial-gradient暗角(非粒子光效)。还原度高
- 字体:Inter超粗 + JetBrains Mono(代码)
- 样张:assets/style-specimens/ppt/05-candy-lecture-stage.jpg

**玩味手绘极简 / Playful Maximalist Editorial (Collins式)** `大胆·还原75%`
- 参考:Mailchimp Brand Book(Collins 2018)、New Yorker漫画气质、Cooper圆润衬线、Cavendish荧光黄
- 适配:有态度的品牌deck、创意机构提案、文化向town hall、反SaaS极简的营销页
- 视觉DNA:配色=Cavendish荧光黄#FFE01B大面积+黑+少量撞色，反SaaS极简。字体=Cooper式圆润衬线大标题(playful)+杂志式留白编排。母版=①荧光黄满底+怪诞标题②杂志式不规则留白排版③大字玩梗文案。标志=荧光黄、圆润衬线、playful编排、怪诞手绘气质(降级为几何色块/emoji替代真插画)
- HTML实现:荧光黄background；圆润衬线font-family；杂志留白用非对称Grid。手绘猩猩/插画这一核心元素无AI生图无法做，降级为CSS几何色块+大号emoji+不规则transform旋转的文字块替代，插画缺失还原度降约20%
- 字体:Fraunces(可调圆润)/ Bree Serif替代Cooper；正文Inter
- 样张:assets/style-specimens/ppt/06-playful-collins-editorial.jpg

**不羁玩梗流行版 / Irreverent Pop (Reddit式)** `大胆·还原80%`
- 参考:Reddit Ads销售deck(被Dock列为最有性格)、David Carson式不羁排版、90年代web复古、Memphis玩味
- 适配:Z世代品牌、玩梗营销deck、社区/创作者向、敢于不正经的提案
- 视觉DNA:配色=Reddit橙红#FF4500+撞色，90s web复古色。字体=混排/打破网格的David Carson式排版，玩梗口语文案。母版=①fun页玩梗大字②facts页节奏转折严肃数据③口语标题。标志=打破网格混排、橙红、玩梗口语、fun→facts节奏反转、复古web质感
- HTML实现:故意打破网格用transform旋转/重叠定位/混合字号；橙红+撞色块；复古质感用粗黑边border+硬阴影box-shadow(无blur)。自定义meme插画降级为emoji+几何拼贴，但混排排版本身HTML可还原
- 字体:Archivo / Space Grotesk + 混搭Inter制造对比
- 样张:assets/style-specimens/ppt/07-irreverent-pop.jpg

**Y2K膨胀大字 / Maximalist 3D-Type (Wrapped式)** `大胆·还原78%`
- 参考:Spotify Wrapped 2022/2023/2025、Memphis撞色、Y2K/Maximalism、duotone人像渐变
- 适配:年度回顾(情绪出圈向)、个性化数据卡、社交分享竖屏卡、品牌年终
- 视觉DNA:配色=高饱和撞色满版背景(品红+青+橙)+Spotify绿点睛+duotone双色渐变。字体=顶天立地巨型数字，年份/数字做3D膨胀/金属质感。母版=①撞色满版+巨型膨胀数字②duotone人像/色块底+反白大字③竖屏可分享卡。标志=巨型膨胀3D数字、撞色满版、duotone渐变、年份金属质感、竖屏story卡
- HTML实现:撞色满版background；3D膨胀数字用CSS text-shadow多层叠加+transform:perspective或SVG+stroke制造立体(非真3D渲染)；duotone用mix-blend-mode+渐变叠在灰度图占位块上。金属质感降级为渐变填充文字background-clip:text，还原度降约15%
- 字体:Archivo Black / Anton超粗 + 数字Clash Display
- 样张:assets/style-specimens/ppt/08-y2k-inflated-wrapped.jpg


#### 中性派

**Bento便当格模块网格 / Bento Grid** `中性·还原95%`
- 参考:Apple Keynote Bento Grid时代、新一代MBB Bento/Big-Type deck(2024-2026)、Stripe年报指标卡矩阵、Pitch.com QBR模板
- 适配:产品功能汇总、咨询/QBR数据汇报、销售成果页、town hall指标页
- 视觉DNA:配色=浅灰/奶白底(#F5F5F7/cream)或近黑底+品牌主色+1-2强调色，卡片浅色分区底+圆角+微描边/微阴影。字体=超大display标题+常规正文，字重对比强烈，KPI数字tabular figures。母版=①标题页巨型单句+留白②bento页2×2/3列不等高卡片每卡一洞见(数字/线性icon/sparkline)③one-insight超大数字页。标志=不等高卡片网格、圆角微描边、呼吸感
- HTML实现:CSS Grid的grid-template-areas做不等高bento；卡片border-radius+box-shadow微阴影+1px hairline；sparkline用内联SVG；线性icon用inline SVG stroke。零贴图
- 字体:Inter / Geist + 数字Geist Mono
- 样张:assets/style-specimens/ppt/09-bento-grid.jpg

**Neo-Swiss暗色终端美学 / Dark Hairline Terminal** `中性·还原94%`
- 参考:Linear pitch deck、Vercel设计语言、CS50深黑舞台课件；字体Inter Tight+JetBrains Mono
- 适配:开发者工具/技术产品发布、技术路演、工程向汇报
- 视觉DNA:配色=近黑底(#0D0D0F/#111113)+hairline细线#262629网格+单一紫蓝强调(#5B5BD6/#7C7CFF)。字体=Inter Tight大标题+JetBrains Mono做标签/数据。母版=①极简标题页一句话+mono小标②hairline分隔的数据网格③mono标签的特性列表。标志=1px细线网格、mono单等宽标签、极致留白、近黑非纯黑
- HTML实现:近黑背景+border:1px solid的hairline网格；mono标签用等宽font-family；微光用极淡box-shadow/border highlight而非真光效(降级避开赛博霓虹禁区)。注意避开#0D1117深蓝禁区，用中性近黑
- 字体:Inter Tight + JetBrains Mono / IBM Plex Mono
- 样张:assets/style-specimens/ppt/10-dark-hairline-terminal.jpg

**双字体咨询版 / Two-Font Consulting (Bower式)** `中性·还原90%`
- 参考:McKinsey 2019品牌系统(Wolff Olins设计，Bower衬线+无衬线)、BCG Executive Perspectives、深蓝细线pattern
- 适配:咨询报告、高管汇报、行业研究、权威机构提案
- 视觉DNA:配色=深蓝(#051C2C/McKinsey深蓝)×白二元+单一品牌色高亮(BCG绿#00805A)，暖灰底带呼吸感。字体=characterful衬线大标题(Bower式)与无衬线正文高对比并置。母版=①左上角结论式action-title②蓝色细线pattern装饰③杂志式左右分工(结论文字+视觉)④大数字data-point卡。标志=衬线×无衬线高对比、深蓝细线pattern、action-title、暖灰高级感
- HTML实现:双字体font-family并置(衬线标题+无衬线正文)；细线pattern用repeating-linear-gradient或SVG line；data-point卡纯CSS；照片灰度处理这一项无照片可省。蓝紫edge shimmer降级为纯色边
- 字体:Playfair Display / Fraunces衬线标题 + Inter正文(替代Bower)
- 样张:assets/style-specimens/ppt/11-two-font-consulting.jpg

**图谱箭头企业版 / Diagram-Driven Isotype** `中性·还原88%`
- 参考:Salesforce销售deck、Isotype(Otto Neurath)谱系、Gene Zelazny《Say It With Charts》、Hans Rosling/Gapminder
- 适配:平台/架构讲解、客户旅程、流程方法论、生态地图
- 视觉DNA:配色=企业蓝色块+产品线分色区分+图标化能力网格。字体=清晰无衬线。母版=①横向客户旅程箭头流②分层平台架构图③图标化能力网格④2×2/瀑布/金字塔结构图。标志=箭头流程、分层架构盒、Isotype图标网格、流程即叙事
- HTML实现:箭头流程用Flexbox+CSS clip-path三角或SVG arrow；架构分层用嵌套带边框div；图标用inline SVG stroke统一描边；瀑布/金字塔用Grid+斜切。气泡图可用CSS圆形+定位。纯矢量绘制
- 字体:Inter / IBM Plex Sans(图表友好)
- 样张:assets/style-specimens/ppt/12-diagram-isotype.jpg

**单图母图概念图解 / Diagrammatic Minimalism** `中性·还原95%`
- 参考:Simon Sinek黄金圆环(Golden Circle)TED、Bauhaus几何抽象、信息建筑『一图定全场』
- 适配:理论框架讲解、TED式思想传播、模型/方法论可视化、单概念keynote
- 视觉DNA:配色=极简白/浅底+黑+1个强调色，几何纯色。字体=无衬线，标签大写嵌入图形。母版=①唯一几何母图(同心圆/三角/矩阵)承载全部概念②由内向外箭头③对比案例。标志=单一几何母图、嵌套同心圆/三角、大写标签、一图承载概念
- HTML实现:同心圆用border-radius:50%嵌套div或SVG circle；三角用clip-path/SVG polygon；箭头SVG marker；标签absolute定位贴在图形上。纯几何，HTML完美还原
- 字体:Manrope / Futura系(Jost开源替代)几何感
- 样张:assets/style-specimens/ppt/13-diagrammatic-minimalism.jpg

**Sparkline叙事波形 / Narrative Sparkline (Duarte式)** `中性·还原91%`
- 参考:Nancy Duarte《Resonate》Sparkline叙事图谱、Al Gore《An Inconvenient Truth》、Duarte Inc.数据叙事
- 适配:演讲结构设计、变革叙事、before/after对照、数据故事弧线
- 视觉DNA:配色=深底或白底+品牌橙强调转折点+灰化对照。字体=无衬线，annotation标注点。母版=①横贯全屏的振荡波形线②波形上text标注点③上下并置对照波形④全黑底孤悬一条数据线⑤逐步reveal。标志=横贯波形线、波形标注点、橙色转折、对照波形、爬出画面的曲线
- HTML实现:波形线用内联SVG path(平滑贝塞尔)；标注点用SVG circle+text定位；对照波形上下两条path；reveal用CSS动画stroke-dashoffset。纯SVG绘制无素材
- 字体:Inter + 数字Geist Mono
- 样张:assets/style-specimens/ppt/14-narrative-sparkline.jpg


#### 安静派

**断言-证据 / Tufte信息设计** `安静·还原93%`
- 参考:Michael Alley Assertion-Evidence(Penn State实证)、McKinsey/BCG action-title、Edward Tufte数据墨水比、Barbara Minto金字塔原理
- 适配:学术/工程汇报、数据严谨型咨询页、政策研报、技术评审
- 视觉DNA:配色=白/极浅灰底+黑正文+单一克制强调色(深蓝/砖红)。字体=整句话标题(非名词短语)，标题下独占一张图，文字标注嵌进图里。母版=①整句action-title②标题下单图证据③零bullet。标志=整句标题、单图证据、嵌入式标注、零chartjunk、高数据墨水比
- HTML实现:整句标题靠排版层级；图表用纯CSS/内联SVG画极简折线散点(去网格线去图例，标注直接text定位在数据点旁)；零装饰。Tufte的克制正是HTML强项
- 字体:Source Serif / Lora标题 + Inter正文(双字体阅读级)
- 样张:assets/style-specimens/ppt/15-assertion-evidence.jpg

**瑞士机构极简 / Institutional Swiss Minimal** `安静·还原96%`
- 参考:Sequoia官方10页pitch模板、Airbnb 2009种子轮deck、Müller-Brockmann网格、Massimo Vignelli
- 适配:投资路演、标准商业提案、问题-解法叙事、品牌去装饰提案
- 视觉DNA:配色=纯白底+黑灰正文+单一品牌强调色(Airbnb珊瑚红#FF5A3C/中性蓝)。字体=Helvetica系无衬线，标题中号粗体一句话，正文短句大间距。母版=①居中logo+slogan②顶部一句话标题带+下方3栏对仗(Problem/Solution三点)③TAM大数字分层④2×2竞品矩阵。标志=顶部标题带、三栏对仗、单色强调、2×2矩阵
- HTML实现:Flexbox三栏对仗；2×2矩阵纯CSS Grid+border画；TAM分层用嵌套div或同心方块；一页一信息。几乎纯排版网格，HTML理想对象
- 字体:Inter / Helvetica Now替代Helvetica；正文Inter
- 样张:assets/style-specimens/ppt/16-institutional-swiss.jpg

**杂志编辑长文流 / Editorial Longform** `安静·还原95%`
- 参考:Stripe Annual Letter($1.9T)、Amazon六页叙事备忘录、Benedict Evans『X eats the world』、Stripe Press
- 适配:年度信/复盘叙事、深度思想长文、内部更新、研报型阅读物
- 视觉DNA:配色=奶白/米白底(#FBFAF8)+深墨字+品牌色点睛(Stripe紫#635BFF)。字体=衬线或高品质无衬线，散文体段落+内联数据卡，超大display数字穿插。母版=①刊头大标题②多栏散文+内联指标卡③超大数字段落锚点。标志=出版物阅读节奏、内联数据卡、克制留白、散文体而非bullet
- HTML实现:多栏column-count或Grid；内联数据卡float/inline-block嵌入正文；衬线正文max-width控制行宽65ch；超大数字穿插。纯排版，零素材
- 字体:Newsreader / Source Serif正文 + Inter辅助；数字tabular
- 样张:assets/style-specimens/ppt/17-editorial-longform.jpg

**人文圆角卡片 / Humanist Rounded Cards (Khan式)** `安静·还原80%`
- 参考:Khan Academy Wonder Blocks设计系统、Source Serif Pro衬线、森林绿品牌、友善人文主义
- 适配:教育产品、亲和力课件、公益/非盈利deck、温暖品牌提案
- 视觉DNA:配色=森林绿#14BF96/#0A5C4B+米白底+暖色辅助，柔和不刺眼。字体=Source Serif衬线标题(人文气)+无衬线正文。母版=①圆角卡片组件组②衬线标题+亲和正文③真实摄影位(降级为绿色系几何/圆角色块)。标志=森林绿、衬线标题、大圆角卡片、人文温暖、不完美亲和质感
- HTML实现:大圆角border-radius卡片+柔和box-shadow；衬线标题font-family；暖米白底。真实师生摄影这一项无AI生图，降级为绿色系几何插画块/大圆角纯色占位+emoji人物，照片缺失还原度降约18%
- 字体:Source Serif 4标题 + Nunito Sans / Inter正文(Nunito圆润呼应人文)
- 样张:assets/style-specimens/ppt/18-humanist-rounded-cards.jpg

**研报密集图表 / Dense Research Report (Meeker式)** `安静·还原92%`
- 参考:Mary Meeker《Internet Trends》(BOND)、CB Insights《State of AI》、McKinsey Global Institute《Year in Charts》、FT/Bloomberg数据新闻
- 适配:趋势研报、行业数据复盘、密集数据汇报、市场地图
- 视觉DNA:配色=白底+品牌色(BOND/CB Insights亮蓝#0066FF)阶梯单色高亮其余灰化，几乎零留白。字体=结论式句子标题，每页1图密度，极小来源脚注。母版=①结论句标题+满页单图②logo网格market map③大数字KPI卡④密集多图网格+脚注。标志=结论句标题、零留白研报感、单色阶梯高亮、logo市场地图、来源脚注规范
- HTML实现:密集图表全用纯CSS/内联SVG画(柱/折线/堆叠/散点)；logo market map用Grid+文字/SVG占位格；KPI卡CSS；脚注小字。极致信息密度正是HTML擅长，零素材
- 字体:Inter + IBM Plex Sans + 数字tabular Geist Mono
- 样张:assets/style-specimens/ppt/19-dense-research-report.jpg

**纯文字宣言备忘录 / All-Text Manifesto (Netflix/Amazon式)** `安静·还原97%`
- 参考:Netflix Culture Deck(2009，125页)、Amazon六页叙事备忘录(Bezos)、Tufte反PowerPoint主张、Matthew Carter阅读级排印
- 适配:文化宣言、价值观宣讲、深度备忘录、反PPT的纯文档演示
- 视觉DNA:配色=纯白或纯黑底+单一强调色(Netflix红#E50914)做唯一高亮，极致克制。字体=阅读级排印，一页一观点金句断言/纯散文零bullet零图。母版=①满版底+金句断言②口语化坦诚段落③制度名词高亮(Keeper Test)④六页散文+附录表。标志=纯文字一页一观点、零图零bullet、单色高亮金句、口语坦诚、silent-read文档感
- HTML实现:纯排版：金句用大字clamp()左对齐层级；散文max-width控制行宽；唯一强调色span高亮关键短语；附录用极简table。零素材零图，纯文字是HTML最稳的还原
- 字体:Newsreader / Source Serif(阅读级)或Inter(宣言式)；标题可Archivo超粗
- 样张:assets/style-specimens/ppt/20-all-text-manifesto.jpg


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
- 样张:assets/style-specimens/info/01-personal-annual-report.jpg

**解释性图解 / Explanation Graphics（Nigel Holmes式）** `大胆·还原76%`
- 参考:Nigel Holmes(1978–1994任TIME图表总监，1994创立Explanation Graphics)；主张用图画与幽默解释抽象数字，也是chartjunk之争的靶心
- 适配:科普解释、把复杂概念讲给外行、大众媒体专栏配图、儿童与教育向
- 视觉DNA:配色=高饱和平涂三四色+黑描边。字体=圆润无衬线+手写感标注。母版=把图表本体画成实物隐喻(钞票摞成柱、温度计当量表、跑道当进度条)。标志=拟物化图表、幽默、小人像、粗描边、零渐变
- HTML实现:图表骨架CSS/SVG可做，**灵魂在手绘插画**——纯HTML下只能降级为几何色块，须明确标注降级；有生图能力时用huashu-gpt-image生插画元素再合成
- 字体:Nunito / Baloo 2(圆润) + Caveat(手写标注)
- 样张:assets/style-specimens/info/02-explanation-graphics.jpg

**巨幅剖面手绘 / Cross-Section Epic（SCMP Arranz式）** `大胆·还原55%`
- 参考:Adolfo Arranz(SCMP资深图表编辑，Malofiej国际信息图奖多枚金奖，代表作《City of Anarchy》九龙城寨剖面)；Malofiej被称为信息图界的普利策
- 适配:建筑/历史/器物解剖、单张读十分钟的长卷、博物馆级科普
- 视觉DNA:配色=暗底(深墨/深褐)+暖色高光+做旧纸质感。构图=单张巨幅、等距或正剖视角、密集引线标注环绕主体。标志=手绘细节、引线标注、剖面视角、一张图讲完整个故事
- HTML实现:🔴 **纯HTML做不出手绘剖面**——本风格必须有插画素材，无素材时不要假装。HTML只承担引线标注层与缩放滚动交互。拿不到素材就换风格
- 字体:Source Serif(标题) + Inter(标注)
- 样张:assets/style-specimens/info/03-cross-section-epic.jpg

**杂志撞色数据页 / Magazine Pop Data（Businessweek式）** `大胆·还原90%`
- 参考:Bloomberg Businessweek(Richard Turley时期)、WIRED图表页、The Economist的Graphic Detail专栏
- 适配:商业/科技媒体图表、观点专栏配图、社媒方图、公众号内嵌数据图
- 视觉DNA:配色=撞色双主色(荧光黄+黑、品红+藏青)+纸白留白，不用第三色调和。字体=超粗压缩体大标题+极小说明字，字号对比10倍以上。母版=一图一个论点、图表本身就是版式主角、标题直接说结论。标志=极端字号对比、撞色、图表出血到版心外、结论式标题
- HTML实现:纯CSS可完全还原；图表用内联SVG或CSS Grid条；出血靠负margin。零素材
- 字体:Archivo Black / Anton(压缩粗体) + IBM Plex Sans(说明)
- 样张:assets/style-specimens/info/04-magazine-pop-data.jpg

**ISOTYPE图形统计 / Neurath–Arntz** `大胆·还原88%`
- 参考:Otto Neurath与Gerd Arntz于1920s维也纳创立的ISOTYPE国际图形教育系统
- 适配:人口/社会/公共政策数据、面向低识字门槛的公共传播、教育海报
- 视觉DNA:配色=有限套色(黑+红+蓝+土黄)平涂，无渐变无阴影。母版=同一图标重复N次表示数量——**放大图标表示更多是错的**，这是该体系最核心的规矩。标志=剪影图标阵列、横向排列、左侧文字标签、极强秩序感
- HTML实现:图标用内联SVG剪影+CSS repeat布局，HTML天然适配。图标可自绘几何剪影，不需外部素材
- 字体:Jost / Archivo(Futura替代)
- 样张:assets/style-specimens/info/05-isotype.jpg

**数据人文主义手绘图谱 / Data Humanism（Lupi式）** `大胆·还原80%`
- 参考:Giorgia Lupi(Pentagram合伙人)与Stefanie Posavec《Dear Data》；Lupi的Data Humanism宣言主张「数据是人不是数字」
- 适配:个人化情感化数据、小样本深描、把私人经验做成可读图谱、非量化维度多的题材
- 视觉DNA:配色=手账米白底+4-5个各自绑定语义的柔和色(珊瑚/松绿/芥黄/墨紫)，**没有一个颜色是装饰**。母版=①先定一套视觉语言(大小/形状/刺/尾巴各编码一维)②必配一张图例教读者解码③元素沿有机路径排布不用网格。标志=可解码的自定义符号、必带图例、有机排布
- HTML实现:符号用内联SVG参数化生成(半径/刺数/尾长绑数据字段)；路径用贝塞尔曲线穿点。纯SVG零素材，唯一做不出的是真手绘笔触
- 字体:Georgia / Source Serif(标题) + Inter(图例)
- 样张:assets/style-specimens/info/06-data-humanism.jpg

**滚动叙事数据长卷 / Scrollytelling（The Pudding式）** `大胆·还原85%`
- 参考:The Pudding(数据新闻杂志)、NYT The Upshot、Reuters Graphics滚动专题
- 适配:需要一步步揭示的复杂论证、长篇数据故事、网页端专题
- 视觉DNA:配色随章节切换但保持单一accent贯穿。母版=左侧文字步进、右侧图形随scroll变形；每一屏只推进一个变量。标志=图形不换只变形、文字与图形严格绑定、章节色变、结尾给完整全景
- HTML实现:IntersectionObserver触发状态切换+CSS transition或SVG属性插值，纯前端可完整还原。⚠️ 交付形态必须是网页，**导PDF/PNG会丢掉全部叙事**——用户要静态图时不要选它
- 字体:Inter / Source Serif(长文可读性优先)
- 样张:assets/style-specimens/info/07-scrollytelling.jpg

**地图即主角 / Cartographic Lead（Stamen式）** `大胆·还原65%`
- 参考:Stamen Design(2001年Eric Rodenbeck于旧金山创立，客户含National Geographic)，其Watercolor/Toner地图砖是公开经典
- 适配:地理分布数据、城市/交通/环境题材、位置即叙事的内容
- 视觉DNA:配色=地图底图定调(水彩或单色Toner)+数据层用高对比点线。母版=地图占满版心、数据以点密度或流线叠加、图例极小压角。标志=底图本身有作者性、数据层克制、地理形状即构图
- HTML实现:🔴 **需要真实地理数据(GeoJSON)与底图**，纯HTML无法凭空生成正确地形——拿不到数据就换风格，**绝不手绘假地图**。有数据时可用内联SVG投影绘制
- 字体:Inter / IBM Plex Sans(地名标注需大量小字)
- 样张:assets/style-specimens/info/08-cartographic-lead.jpg

#### 中性派

**数据新闻图表规范 / Newsroom Chart System（FT式）** `中性·还原96%`
- 参考:Financial Times的Chart Doctor团队与公开的Visual Vocabulary(按Deviation/Correlation/Ranking/Distribution/Change-over-Time/Part-to-Whole/Magnitude/Spatial分类选图表)
- 适配:财经与行业数据、「选对图表类型」比「好看」更重要的场合、系列图表需统一规范时
- 视觉DNA:配色=标志性粉橘报纸底+一组有序色阶(单色渐变表连续量、对比双色表偏离)。母版=①标题即结论②副标题说明口径③图表本体去边框去网格④左下角必标数据来源。标志=先按数据关系选图型再谈美感、来源标注不可省、坐标轴极简
- HTML实现:纯CSS/SVG画折线柱状；关键是**先查Visual Vocabulary选对图型**再动手。零素材
- 字体:Inter / Source Sans(正文) + 等宽体标数字
- 样张:assets/style-specimens/info/09-newsroom-chart.jpg

**计算式数据肖像 / Computational Portrait（Fathom式）** `中性·还原78%`
- 参考:Ben Fry与其波士顿工作室Fathom Information Design(Fry为Processing联合创造者、《Visualizing Data》作者，作品曾入Whitney双年展)
- 适配:超大规模数据集、需要「让数据自己长出形状」的题材、基因/交通/时间序列
- 视觉DNA:配色=白或近黑底+极细线条+单色透明度叠加出密度。母版=不做摘要做全量呈现，用海量细元素的叠加密度形成图形。标志=发丝线、透明度堆叠、无装饰、形状由算法而非版式决定
- HTML实现:Canvas或大量SVG path程序化绘制，数据量大时必须Canvas。**要求真实全量数据**，小样本做不出这个风格的密度感
- 字体:Inter / Roboto Mono(数据标注)
- 样张:assets/style-specimens/info/10-computational-portrait.jpg

**美丽信息 / Beautiful Information（McCandless式）** `中性·还原90%`
- 参考:David McCandless《Information is Beautiful》与其同名网站，以「把大数据集做成一眼可比的彩色图形」著称
- 适配:科普对比、榜单、大众向数据聚合、社媒传播型图表
- 视觉DNA:配色=多色但同明度同饱和的和谐色环(不是随机撞色)。母版=气泡图/树状图/桑基图等「面积即数量」的图型为主，标签直接压在色块上。标志=面积编码、同调多色、图例内嵌、一张图容纳几十个条目
- HTML实现:树状图与气泡用CSS Grid或SVG计算布局(需自己写简单装箱算法)；桑基图用SVG贝塞尔。零素材
- 字体:Nunito Sans / Inter
- 样张:assets/style-specimens/info/11-beautiful-information.jpg

**学术开放数据 / Open Research Data（Our World in Data式）** `中性·还原94%`
- 参考:Our World in Data(牛津Global Change Data Lab)，准则是图表可交互、口径写清楚、数据可下载
- 适配:严谨议题、需要经得起质疑的数据展示、长期趋势对比
- 视觉DNA:配色=白底+一组区分度高但不刺眼的分类色+灰色做非重点系列。母版=①一句话结论标题②口径与时间范围写在副标题③图内直接在线末标标签(不用图例)④底部注来源与许可。标志=线末标签替代图例、灰化非重点、口径透明、克制
- HTML实现:纯SVG折线+末端text定位，HTML最稳的一类。零素材
- 字体:Inter / Lato
- 样张:assets/style-specimens/info/12-open-research-data.jpg

**东方思辨科技图 / Speculative Tech Diagram（Takram式）** `中性·还原84%`
- 参考:Takram(东京与伦敦的设计工程工作室，横跨设计与工程的speculative design实践)
- 适配:技术概念图、未来场景推演、研究型白皮书配图、产品架构叙事
- 视觉DNA:配色=米灰砂色基底+低饱和自然色(苔绿/陶土)+一处金属灰。字体=细字重、大字距、中英混排考究。母版=图表被当作艺术品排布、大量留白、几何图形有精密感。标志=柔和科技感、精密几何、克制的自然色、图表如装置
- HTML实现:纯CSS/SVG可还原；关键在留白比例与线宽克制(0.5-1px)。零素材
- 字体:Inter(细字重) / Noto Sans JP + Cormorant(标题可选)
- 样张:assets/style-specimens/info/13-speculative-tech-diagram.jpg

**系统图标化图解 / Pictogram System（Otl Aicher式）** `中性·还原92%`
- 参考:Otl Aicher为1972慕尼黑奥运设计的图标系统与Ulm学派栅格方法
- 适配:流程图、导视与指南类信息图、多语言场景、需要一整套图标保持一致时
- 视觉DNA:配色=一套受限色板(奥运版为浅蓝/绿/银)+黑。母版=所有图标共用同一网格与同一笔画角度(仅0/45/90°)、图标与短标签成对出现。标志=严格角度约束、系统一致性、无衬线短标签、栅格可见
- HTML实现:图标用内联SVG按45°约束自绘；栅格用CSS Grid。零素材，但要自己守住角度纪律
- 字体:Jost / Archivo(Univers替代)
- 样张:assets/style-specimens/info/14-pictogram-system.jpg

#### 安静派

**Tufte小倍数矩阵 / Small Multiples** `安静·还原95%`
- 参考:Edward Tufte《Envisioning Information》的small multiples与sparkline概念
- 适配:多维度横向对比、时间序列分组、一个变量在几十个切片上的表现
- 视觉DNA:配色=白底+黑线+一个强调色标异常项。母版=同一张小图重复N次只换数据，**共用坐标轴范围——范围不统一就失去可比性，这是本流派唯一的致命错误**；标签极小压在图旁。标志=网格化重复小图、共享刻度、零图例、零网格线、高数据墨水比
- HTML实现:CSS Grid排小图+每格内联SVG折线。务必统一domain。零素材
- 字体:Source Serif(标题) + Inter(小标签)
- 样张:assets/style-specimens/info/15-small-multiples.jpg

**拓扑简化路网图 / Topological Transit Map（Beck/Vignelli式）** `安静·还原86%`
- 参考:Harry Beck 1933年伦敦地铁图、Massimo Vignelli 1972年纽约地铁图
- 适配:流程与关系网络、组织架构、系统拓扑、任何「连接关系比真实距离重要」的图
- 视觉DNA:配色=白或浅底+每条线一个高饱和纯色。母版=所有线段只走0/45/90°、站点等距——**牺牲地理准确性换可读性**是本流派的立身之本；换乘点用空心圆。标志=八方向约束、等距节点、纯色线、空心节点
- HTML实现:内联SVG polyline严格约束角度；节点用circle。纯几何，HTML完美适配
- 字体:Jost / Inter(站名可全大写)
- 样张:assets/style-specimens/info/16-topological-transit-map.jpg

**白之留白信息图 / Ma & Emptiness（原研哉式）** `安静·还原82%`
- 参考:原研哉《白》与无印良品视觉体系，「留白不是空，是容纳想象的容器」
- 适配:品牌年报、慢节奏叙事、少量但重要的数据、需要庄重感的场合
- 视觉DNA:配色=纯白或宣纸白+极浅灰+一处极小的墨色或朱色点。母版=一屏一个数据、巨幅留白、元素靠边缘或黄金位置放置、绝不填满。标志=极端留白、单点强调、细若无物的线、东方式的「间」
- HTML实现:纯CSS排版。🔴 **本库风险最高的一种**——留白必须是构图(有明确视觉锚点)，做过头就是「页面渲染坏了」；正文仍须≥14px，不许为了气质缩字号
- 字体:Noto Serif SC / Source Han Serif + Inter
- 样张:assets/style-specimens/info/17-ma-emptiness.jpg

**书籍级信息排印 / Bookcraft Data（Irma Boom式）** `安静·还原80%`
- 参考:Irma Boom(荷兰书籍设计师，作品入MoMA永久馆藏，以极端排印与材质实验著称)
- 适配:长篇数据报告、需要被当作出版物收藏的年报、图文混排的深度内容
- 视觉DNA:配色=纸色+一到两种油墨色，色块大面积压版。字体=排印本身即主角，字号跨度极大、页边距非对称、文字可竖排或旋转。母版=把数据嵌进文本流、章节页用满版色块分隔。标志=非对称版心、极端字号跨度、排印实验、出版物质感
- HTML实现:CSS多栏+writing-mode可做竖排；非对称版心用Grid。**做不到的是纸张材质与裁切**，屏幕上须靠排印张力补偿
- 字体:Fraunces / EB Garamond + Archivo(对比)
- 样张:assets/style-specimens/info/18-bookcraft-data.jpg

**科学期刊图版 / Scientific Figure Plate** `安静·还原96%`
- 参考:Nature与Science的figure规范、USGS与NASA的公开科学图版
- 适配:研究结论、方法对比、需要同行审阅质感的严谨数据、多子图组合
- 视觉DNA:配色=白底+色盲友好色板(用蓝橙对比而非红绿)+灰阶。母版=子图用(a)(b)(c)标号、图注在图下方成段、误差棒与样本量必标、坐标轴带刻度线。标志=子图编号、图下长图注、误差棒、色盲安全、零装饰
- HTML实现:CSS Grid排子图+SVG画图与误差棒；图注用小字段落。零素材，HTML完全胜任
- 字体:Inter / Source Sans + Roboto Mono(数字)
- 样张:assets/style-specimens/info/19-scientific-figure-plate.jpg

**瑞士网格年报 / Swiss Grid Report（Müller-Brockmann式）** `安静·还原97%`
- 参考:Josef Müller-Brockmann《Grid Systems in Graphic Design》、Ulm学派、瑞士国际主义年报传统
- 适配:企业年报、机构报告、需要长期沿用一套版式的系列文档
- 视觉DNA:配色=白底+黑+单一强调色。母版=严格模块网格(常12栏)、所有元素吸附栏线、左对齐齐头不齐尾、大量呼吸性留白但不空。标志=可见的网格逻辑、Helvetica系、非居中排版、层级靠字号与间距而非装饰
- HTML实现:CSS Grid直接映射栏网格，是本库与HTML最同构的一种。零素材
- 字体:Inter / Archivo(Helvetica替代)
- 样张:assets/style-specimens/info/20-swiss-grid-report.jpg

---

## App风格库(12种)

> 2026-10 新增。做 App / 移动端原型时用这个分区（以前只能从网页区借，抽到的是落地页风格）。样张是一块展示板：两到三个手机屏，构图本身也是示范（见 `references/app-prototype.md`「展示板」）。

#### 大胆派

**硬件面板 Hardware Panel（Teenage Engineering式，OP-1 / EP-133 的界面语言）** `大胆·还原85%`
- 参考:Teenage Engineering OP-1 / EP-133 K.O. II（橙、黑、灰配色，「super segment hybrid display」点阵混合显示屏，网格排布的方形按键与旋钮，丝印式标注）
- 适配:音频/创作类工具、采样器、节拍器、录音与硬件配套App、极客向小工具
- 视觉DNA:配色近黑#0B0B0B屏幕+信号橙#FF5A1F+米灰白#E9E9E4按键，浅灰#D8D8D4底板配细网格线。字体点阵/等宽，数字像液晶读数，标签像丝印（全大写+宽字距）。布局严格的方格网格，4×4按键阵列、圆形旋钮带单色指针、推子带橙色刻线；按键用「压下去的厚度」(inset 4px底边阴影)表达物理感。标志元素：点阵大字读数、方形按键、丝印小标签、一屏只有橙色一种强调色。
- HTML实现:CSS Grid做按键阵列+aspect-ratio:1；旋钮用radial-gradient+伪元素指针rotate；推子用绝对定位的横条；点阵字体用Doto，缺省退回Space Mono；展示板背景用repeating网格线模拟面板。注意橙色只给「当前激活」，别满屏刷。
- 字体:Doto（点阵读数）+ Space Mono（标签），中文标签用Noto Sans SC
- 样张:assets/style-specimens/app/01-hardware-panel.jpg

**液态玻璃 Liquid Glass（Apple iOS 26 新设计语言）** `大胆·还原70%`
- 参考:Apple Liquid Glass，WWDC 2025发布，随iOS 26 / macOS Tahoe 26等同步推出；Apple称之为一种会折射周围内容、随触控动态响应的半透明材质，用于控件、导航、图标与小组件
- 适配:天气/运动/媒体类原生感App、系统风格工具、需要「内容为主、控件悬浮」的界面、概念演示
- 视觉DNA:配色由背景内容本身决定——高饱和渐变底（珊瑚橙→洋红→靛蓝，或青绿→薄荷），控件是半透明白色玻璃。字体系统无衬线，大数字紧字距。布局内容铺满全屏，控件（返回键、标签栏、底部面板）作为圆角胶囊/大圆角面板「浮」在内容上，标签栏是悬浮胶囊而不是贴底整条。标志元素：白色渐变高光描边、顶部内高光、背景模糊+饱和度提升、圆形/胶囊形控件。
- HTML实现:backdrop-filter:blur(22px) saturate(180%)+半透明白渐变背景+1px白描边+inset高光阴影，是核心；背景必须是有色彩层次的渐变，玻璃才看得出来，纯色底上玻璃等于灰块。折射与镜面光效CSS做不到，只能降级为高光描边，要在产出里说明。
- 字体:Inter（替SF Pro）+ Noto Sans SC
- 样张:assets/style-specimens/app/02-liquid-glass.jpg

**玩味3D材质 Playful Tactile（Not Boring系列式，Andy Works）** `大胆·还原70%`
- 参考:(Not Boring)系列App（Andy Works，创始人Andy Allen与Mark Dawson；含Weather、Calculator、Timer、Habits），(Not Boring) Habits获2022 Apple Design Award；特点是饱和配色、触感反馈与3D动画，把平淡的工具做成「大胆、张扬」的体验
- 适配:计时器/习惯/天气/计算器等小工具、面向年轻人的轻工具、想让一个功能「好玩到被截图」的App
- 视觉DNA:每屏一个满版饱和主色（橙#FF7A2D、薰衣草#B6A2FF、酸绿#D4FF3F），搭配近黑#1B1330文字。字体粗圆的大号数字，紧字距。布局一屏一个主角（一个巨大的表盘/温度管/开关），其余元素围着它；卡片轻微旋转，屏幕之间错落旋转。标志元素：有厚度的按钮（底边实色硬阴影）、带高光的凸起表盘、会「按下去」的开关。
- HTML实现:多层box-shadow叠出厚度（实色下沿+内高光+外软阴影），radial-gradient做球面高光，rotate做错落。静态图只能呈现材质；触感反馈与动效在HTML里仅写transition，诚实标注。
- 字体:Bricolage Grotesque（800）+ Noto Sans SC（900）
- 样张:assets/style-specimens/app/03-playful-3d.jpg

**友好金融 Friendly Fintech（Monzo式，高饱和品牌色+大圆角）** `大胆·还原90%`
- 参考:Monzo（品牌主色Hot Coral约#FF4F40，来自标志性的半透明珊瑚色银行卡；搭配深海军蓝#091723～#14233C，圆润的人文无衬线，胶囊形按钮，口语化文案）
- 适配:个人记账、储蓄/预算、支付与转账、面向年轻用户的金融产品、任何要把「严肃的钱」说得亲切的场景
- 视觉DNA:配色珊瑚红#FF4F40大面积铺顶部+白色圆角底面板，罐子/分类用粉彩色块（黄#FFD66B、蓝#9AD8FF、绿#C8F0CE、粉#F9B9E8、紫#D8CBFF）。字体圆润的几何/人文无衬线，余额用58px以上粗体。布局顶部彩色区放余额与三个胶囊动作，下方白色面板像抽屉抬起；预算是2列大圆角方块「罐子」。标志元素：满版品牌色、34px以上大圆角、胶囊按钮、首字母/色块图标、口语化小标题（「钱去了哪里」）。
- HTML实现:纯CSS即可1:1还原。border-radius:28~34px，grid两列，色块用纯色，进度条双层div。图标不画具体图形，用单字+同色系深浅底色。
- 字体:Figtree（替Monzo自家MonzoSans）+ Noto Sans SC
- 样张:assets/style-specimens/app/04-friendly-fintech.jpg

**专业相机工具 Pro Camera（Halide式，深色+黄色强调+密集刻度）** `大胆·还原85%`
- 参考:Halide（Lux Optics，获Apple Design Award；界面为一只手操作而设计、受专业相机机身控件启发；自定义字体Ambrotype模仿胶片相机机身上的蚀刻文字；提供直方图、波形、彩色斑马纹（高光溢出提示）、对焦峰值等专业视图）
- 适配:相机/录音/测量/示波类专业工具、需要「一眼读数、单手调参」的界面、暗光环境下使用的App
- 视觉DNA:配色纯黑#000底+亮黄#FFCC00强调（只给「当前选中的参数」和中心刻度线）+灰白#EDEDED读数。黄色为本风格的取向，非对Halide配色的断言。字体等宽数字，参数标签小而宽字距。布局上半取景，下半固定为「参数行（快门/感光度/曝光/白平衡）+横向刻度尺+快门键」；刻度尺两端渐隐，中心一条黄线。标志元素：密集刻度尺、斑马纹高光提示、半透明直方图、一屏只有一个黄色焦点。
- HTML实现:repeating-linear-gradient画刻度（短刻2px/14px，长刻2px/70px双层），mask-image做两端渐隐；斑马纹用repeating-linear-gradient 135deg；取景区用渐变占位+「照片位」。黄色别超过三处。
- 字体:JetBrains Mono（数字与刻度）+ Noto Sans SC（标签）
- 样张:assets/style-specimens/app/05-pro-camera.jpg

#### 中性派

**户外地形工具 Topo Outdoor（Gaia GPS / AllTrails式等高线与轨迹）** `中性·还原90%`
- 参考:Gaia GPS（以等高线、山体阴影的Gaia Topo地形图著称）；AllTrails（路线页把距离、难度、爬升放在最前）
- 适配:徒步/骑行/越野路线、户外记录、露营与地图类工具、需要「地图是主角」的移动界面
- 视觉DNA:配色羊皮纸米#EFEBDA底+等高线棕#C09A68（每五条加粗为计曲线）+林地浅绿#D8E4C4+水体浅蓝#BFDDE6，轨迹用高对比橙红#E4572E外加白色描边。字体窄体数字（大号读数）+中文无衬线。布局地图铺满，底部一块白色面板放里程/爬升/用时三个大数字和海拔剖面；列表页每张卡带一个迷你等高线缩略图+难度色标（黄/绿/红）。标志元素：等高线、带白描边的轨迹线、海拔剖面面积图、难度色标。
- HTML实现:SVG path画等高线（嵌套的不规则闭合曲线，计曲线stroke更粗），轨迹两层path（白粗线叠橙细线）；展示板背景延续同一套等高线。等高线必须是不规则曲线，正圆/椭圆同心一眼假。
- 字体:Barlow Condensed（读数）+ Noto Sans SC
- 样张:assets/style-specimens/app/06-topo-outdoor.jpg

**中文内容瀑布流 Feed Waterfall（小红书式双列卡片流）** `中性·还原92%`
- 参考:小红书首页「发现」双列瀑布流（卡片按真实比例错落排列，图在上、标题两行、作者与点赞在下，顶部频道标签，底部导航中间是红色加号）
- 适配:内容社区、种草/攻略/探店类App、电商内容流、任何以「封面图+标题」做决策入口的中文产品
- 视觉DNA:配色白卡片#FFF+浅灰底#F5F5F7，品牌红#FF2442只用于选中下划线、加号按钮、关注、点赞态。字体系统中文无衬线，标题15px/两行截断。布局双列、列间距6px、卡片圆角10px，封面比例各不相同（约1:1到3:4）形成错落；卡片底部固定一行作者头像+昵称+点赞数。标志元素：错落的封面高度、两行标题、头像+昵称+点赞行、红色加号。
- HTML实现:flex两列，每列flex-direction:column，卡片flex:none，封面用不同height的渐变占位并标「照片位」；标题用-webkit-line-clamp:2；头像用首字母圆点，不画人像。
- 字体:Noto Sans SC
- 样张:assets/style-specimens/app/07-feed-waterfall.jpg

**键盘优先命令面板 Command Palette（Raycast式）** `中性·还原90%`
- 参考:Raycast（近黑底约#07080A、1px发丝边框约#242728、Inter正文加等宽键帽；以色块小图标标识命令，右侧对齐快捷键；用色阶层次而不是阴影区分层级）
- 适配:开发者工具、效率工具、命令行配套App、内部运维面板、任何「搜索即操作」的产品
- 视觉DNA:配色近黑#07080A画布+面板#121315+选中行#202225，命令图标用饱和小色块（红#FF6363、蓝#52A9FF、绿#59D499、紫#8A63F5、黄#FFC531）。字体Inter正文+等宽键帽/日志。布局顶部一行输入框（光标用红色竖线），下面按「建议/命令」分组的单行列表，每行：小色块图标+名称+灰色副标题+右对齐键帽；底部固定一条操作栏（「打开命令 ↵」「更多操作 ⌘K」）。标志元素：渐变键帽、分组小标题、选中行浅灰高亮、底部操作栏。Raycast本体是桌面端，样张用「桌面面板局部+手机适配」的方式呈现。
- HTML实现:flex行+border发丝线；键帽用渐变背景+border-bottom颜色更深+0 2px 0阴影；整体不用大阴影，只用外层一次深色投影。
- 字体:Inter + JetBrains Mono（键帽与日志）+ Noto Sans SC
- 样张:assets/style-specimens/app/08-command-palette.jpg

**健康数据颜色编码 Health Color-Code（Apple 健康 / Oura式）** `中性·还原92%`
- 参考:Apple 健康/活动圆环（黑底上红、绿、蓝三色同心圆环，分别对应活动、锻炼、站立）；Oura（Readiness/Sleep/Activity三个0–100分，蓝色表示达标，黄色表示一般，红色表示需关注）
- 适配:健康/睡眠/运动/体征数据产品、任何把一堆指标压成「今天怎么样」的仪表盘、可穿戴设备配套App
- 视觉DNA:配色纯黑#000底+卡片#1C1C1E，状态语义色（蓝#3498FF最佳、黄#FFCC00一般、红#FF453A注意），圆环色（#FA114F、#92E82A、#1EEAEF）。字体粗体大分数（76px以上）+小号灰色标签。布局顶部一个大圆环/大分数当主角，下面是卡片：构成项条形、睡眠分期柱、正常范围色带上的趋势线；每个数据旁一个小状态胶囊（良好/偏低/偏多）。标志元素：圆环进度、状态胶囊、「正常范围」半透明色带、颜色即结论。
- HTML实现:SVG circle+stroke-dasharray做圆环（轨道同色低亮度），条形用双层div，范围色带是半透明rect；状态胶囊=半透明底+同色文字。一屏里状态色与圆环色分开使用，别混成一团彩虹。
- 字体:Inter + Noto Sans SC
- 样张:assets/style-specimens/app/09-health-color-code.jpg

#### 安静派

**原生精修 Native Polish（Things 3式，Cultured Code）** `安静·还原95%`
- 参考:Things 3（Cultured Code，德国斯图加特；两获Apple Design Award；官网引用评论称其界面「像一张干净挺括的纸」；「今天」里有「今晚」分区，列表可加标题分隔，任务展开成卡片，右下角为可拖动的Magic Plus按钮）
- 适配:任务/待办/笔记/日程等效率类原生App、重度使用的个人工具、追求「用久了不累」的产品
- 视觉DNA:配色纯白#FFF+近黑文字#1D1D1F+一个蓝#3478F6（只给勾选、链接、加号按钮），黄色星标#F6C21B给「今天」，灰#8A8F9B给次要信息。字体系统无衬线，大标题32px粗体紧字距。布局列表为主，行间一条缩进的发丝线（从复选框右侧起），分组标题用小号粗体+下划线；任务展开成带大阴影的浮起卡片，里面是备注、清单、标签与截止日期。标志元素：圆角方形复选框、缩进发丝线、「今晚」月亮分区、浮起任务卡、蓝色圆形加号。
- HTML实现:纯CSS即可还原。复选框用border:2px+border-radius:7px，完成态灰填充+伪元素勾；行分隔线用:after左缩进；任务卡片双层阴影（0 2px 6px+0 26px 60px）。动效（展开、勾选）在静态图里体现不了，只做结构。
- 字体:Inter（iOS风格可降级为系统栈）+ Noto Sans SC
- 样张:assets/style-specimens/app/10-native-polish.jpg

**柔和鼓励式 Gentle Encouragement（Gentler Streak式，暗色变体）** `安静·还原80%`
- 参考:Gentler Streak（Gentler Stories，斯洛文尼亚；2024 Apple Design Award「社会影响」类别得主；强调个人进步而非与他人比较，核心视觉是「Activity Path」——把当天状态表示为从「休息」到「活跃」的区间；色调为柔和的蓝绿）。注：官方描述的主界面偏明亮通透，本条目的深夜蓝底为在其柔和蓝绿、圆润、不评判基调上做的暗色变体
- 适配:健身/康复/睡眠/正念类App、面向「容易放弃」人群的习惯产品、任何想把「落下进度」从内疚变成理解的场景
- 视觉DNA:配色深夜蓝渐变#18213A→#202C4A，卡片#26335A，强调色柔和薄荷#9BE0CC、薰衣草#BAC3FA、蜜桃#F4D0A8（三个都是低饱和粉彩）。字体圆润无衬线，大标题用「今天适合……」这类建议句，不用「已完成X%」。布局全是28px大圆角卡片竖向堆叠；核心卡片是一条圆头的渐变曲线路径+一个白色定位点；月度视图用圆点日历，休息日用蜜桃色，不断档。标志元素：圆头曲线路径、粉彩状态胶囊、圆点月历、「没有断档，休息也是计划的一部分」式文案。
- HTML实现:SVG path做路径（底轨深色+上层渐变描边stroke-dasharray截断），圆点日历用grid+border-radius:50%。关键在文案语气：全程陈述与建议，没有红色、没有感叹号、没有排名。
- 字体:Nunito（圆润）+ Noto Sans SC
- 样张:assets/style-specimens/app/11-gentle-encouraging.jpg

**编辑式阅读 Editorial Reader（Matter / Readwise Reader式）** `安静·还原90%`
- 参考:Matter（提供约10款阅读字体，含New York、Valkyrie、Lyon、Literata，多套主题；队列首页间距与字号克制；长按拖动即可高亮）；Readwise Reader（双击段落高亮，高亮与笔记同步）
- 适配:稍后读、长文阅读、笔记与高亮管理、播客/文章聚合、任何以「读完」为目标的内容产品
- 视觉DNA:配色暖纸白#FBF8F1+墨黑#26221C+一个赭红#B5532A（来源名、进度条、设置值），高亮用荧光黄#F4D35E。字体衬线正文（18px/行高1.85），UI标签用小号无衬线+宽字距。布局待读队列是纯文字条目——来源/时长、衬线标题、两行摘要、一条细进度线，不放缩略图；阅读页是窄栏居中正文，选中文字后浮出深色小工具条（高亮/笔记/复制）；高亮可以单独放大成一张带笔记的卡片。标志元素：衬线标题、荧光笔下划线式高亮、深色选择工具条、细进度线。
- HTML实现:mark用linear-gradient(transparent 12%, 黄 12%, 黄 92%, transparent 92%)模拟荧光笔，比纯背景色更像手划；工具条white-space:nowrap防止中文竖排换行；衬线中文用Noto Serif SC。
- 字体:Literata + Noto Serif SC（正文），Inter（标签）
- 样张:assets/style-specimens/app/12-editorial-reader.jpg

---

## 中文与东亚设计(12种)

> 2026-10 新增。跨媒介分区：网页、deck、海报、封面、信息图都能用，每条的「适配」写了适合什么。秒数轮盘每次除了在产出形态对应的分区抽一号，也在这里抽一号。中文内容尤其值得来翻：西方参考做中文版面，常常只剩配色。

> 这个分区的前提：中文版面有自己的语法——竖排、版心、界栏、题签、汉字结构——不是「西方风格 + 换成中文字体」。用法与其他分区相同：先看样张、先走色彩推导协议。
> 还原度说明：手写题签、做旧纸张、真实照片、铅字/刻本的肌理，纯 HTML/CSS 做不到，都按诚实降级处理，并在各条「HTML实现」里写明。
> 事实核实：设计师与作品只写查到来源的；各条「视觉DNA」是对这一风格版式语言的归纳，不是对某一页的逐像素描述。

**吕敬人书籍设计 Lü Jingren Bookcraft** `安静·还原85%`
- 参考:吕敬人（中国书籍设计师，被称「书衣大师」）；《朱熹千字文》（以纸张质感传达碑拓气息）、《中国记忆——五千年文明瑰宝》（2009 世界最美的书荣誉奖）、《怀袖雅物——苏州折扇》（2010 中国最美的书）。他把书籍设计看作与文本互动、编辑装帧印刷协同的系统工程，不只是封面。
- 适配:画册/年报跨页、长文专题页、口述史与档案类内容、展览图录、需要「慢读」的深度内容；网页上适合长文阅读页、deck 上适合章节扉页
- 视觉DNA:暖纸色底（#F4EFE4 一带）、深墨黑正文、**朱砂红只用一处**（一个大字或一方印）。版式动作是「版心呼吸」：版心不居中，上提并靠订口，天头小、地脚很大；切口一侧留一条窄旁注栏放注释；章节扉页只放一个大字加一行书名，其余全是留白。订口处用渐变模拟装订的凹陷。行距 2 以上，页码与书眉极小。
- HTML实现:CSS Grid/绝对定位排两个 560px 页面并列，订口用 linear-gradient 从深到浅做阴影；旁注栏用独立绝对定位列；朱印用纯色方块+一个字。纸张纤维、烫印、函套、实物翻页做不到，降级为纯色纸面+阴影。
- 字体:Noto Serif SC（中文标题、正文；拉丁与数字也用它自带的）+ Noto Sans SC（书眉、旁注标签这类小字）
- 样张:assets/style-specimens/east/01-lu-jingren-bookcraft.jpg

**宋刻本版式 Song Block-Print Leaf** `安静·还原80%`
- 参考:宋代雕版刻本的叶面形制——版框（北宋多左右双边，南宋渐有细黑口、书耳）、行格界栏、版心中缝的鱼尾（南宋出现单黑鱼尾、双黑鱼尾、花鱼尾）与书名页码；浙本工整、蜀本字形端庄雄健、版面疏朗；藏书家的朱笔批校是古籍常见的层次。
- 适配:观测/档案/文献类内容页、研究报告的「原始记录」页、文化品牌的内容页、deck 的引文页、需要「古籍感」的专题
- 视觉DNA:一整叶居中，四周版框外粗内细（外双内单或外粗内细），竖排文字每列之间有细界线；中缝（版心）居中，上下有黑口横线与倒三角鱼尾，其间竖排简称与页码，底部可放刻工名；纸色微黄（#EDE0BC 一带）+ 墨黑；**朱批**用红色小字竖排写在天头，重点句旁点朱圈（可用 text-emphasis 实现）。整页没有任何装饰，信息全部在格线里。
- HTML实现:writing-mode:vertical-rl 每列一个 div，row-reverse 的 flex 保证从右向左读；界栏用 border-left；鱼尾用 clip-path 三角；朱圈用 text-emphasis。刻印的墨色浓淡、笔画粗细不均、纸张破损做不到，降级为均匀墨色与淡黄纸色。
- 字体:Noto Serif TC（繁体刻本正文，最像宋体刻本的骨架）；简体内容用 Noto Serif SC。英文基本不用；若需要，跟正文同族即可
- 样张:assets/style-specimens/east/02-song-block-print.jpg

**民国书衣 Republic-Era Book Jacket** `中性·还原70%`
- 参考:鲁迅与陶元庆一代的书刊封面。陶元庆为鲁迅设计过《彷徨》（1926）《坟》《朝花夕拾》《唐宋传奇集》等；鲁迅自己也设计封面（如《呐喊》），大多以文字为主，简洁淡雅。
- 适配:书封与书籍平铺图、专辑/剧本集/游记类封面、文化类 landing 的首屏、展览海报、文创包装
- 视觉DNA:低饱和土黄/灰绿纸色底，墨黑+一点朱红共三色；**白色题签条**贴在封面上，书名竖排；外加细双线边框；图案是平涂的几何化图形（山、日、水纹），不写实、有排线；大面积留白；封面、书脊、封底平铺展开。
- HTML实现:flex 排封底/书脊/封面三栏，双线框用 border+伪元素，题签条是带细框的浅色块；图案用 SVG 几何多边形与线。**手写题签做不到**，降级为 LXGW WenKai（手写楷）；纸张做旧、烫印、套色错位做不到，降级为平涂纸色。
- 字体:书名与题签用 LXGW WenKai（备选 Ma Shan Zheng，更粗更毛）；作者、说明用 Noto Serif SC；英文基本不出现
- 样张:assets/style-specimens/east/03-republic-book-jacket.jpg

**上海摩登装饰艺术 Shanghai Moderne Deco** `大胆·还原78%`
- 参考:月份牌是起源于清末上海的广告宣传画，20–30 年代达到高峰，代表画家有郑曼陀、杭穉英、徐咏青，用「擦笔水彩」；1930–40 年代上海的装饰艺术被理解为「摩登」，影响了建筑与商业美术。
- 适配:海报、品牌促销页、咖啡/茶/食品包装与活动页、复古主题 landing、日历与节令物料
- 视觉DNA:深墨绿 #17352F + 金 #C9A24A + 朱红 #9E2A1D + 米黄纸色；**放射扇形（太阳）+ 阶梯塔形**的对称几何；双框（金外框+深色内线）；标题用有立体投影的粗美术字；右侧嵌一块**日历**（月份牌的本质是广告+日历）；底部一条朱红通栏放店名与地址。
- HTML实现:SVG 画扇形、同心圆、阶梯矩形；标题 text-shadow 做错位立体；日历用 CSS Grid 七列。月份牌特有的擦笔水彩人像与肌理做不到（也不应该用 SVG 画人像），降级为纯几何+平涂；用一个几何化的咖啡杯代替人物。
- 字体:ZCOOL XiaoWei（标题美术字）+ Noto Serif SC 900（副标）+ Noto Sans SC（日历与小字，拉丁数字一并用它；追求 Deco 味可把拉丁换 Josefin Sans）
- 样张:assets/style-specimens/east/04-shanghai-deco-calendar.jpg

**中文实验字体海报 Experimental Hanzi Poster** `大胆·还原85%`
- 参考:当代华人平面设计师以汉字结构做版面的谱系。已核实两位：韩家英（1961 年生于天津，AGI 会员，早期海报系统地呈现他对汉字「从笔画到结构、从字到篇、从面到空间」的认识，作品被 V&A 等收藏）；靳埭强（1942 年生，香港，把汉字造型与水墨融合，中国银行标志取古钱币意象）。这一谱系的共同点是把汉字当作可拆解的结构材料。
- 适配:展览/活动海报、品牌宣言页、deck 封面或章节页、专题长图的主视觉、课程封面
- 视觉DNA:**一个字被放大到占半个画面**，并按笔画拆成独立几何块，部分笔画移位或换成一抹高饱和色（朱红 #E4351E）；右侧用笔画分解小图（1–5 笔编号）把「拆」的过程讲清楚；黑+纸白+一个强调色，其余全是信息栏的细线和小字；标题是粗黑体，强调词变色。
- HTML实现:每一笔用 SVG rect/path 手工搭，所以字形是自己造的（先确认笔画数与笔顺正确）；分解小图用同一组 path 只高亮一笔。字形复杂的字不适合，选 4–6 笔的字。
- 字体:Noto Sans SC 900（标题）+ Noto Serif SC（导语）；大字不用字体，用几何块自己搭
- 样张:assets/style-specimens/east/05-hanzi-experimental-poster.jpg

**香港街招与招牌 Hong Kong Street Signs** `大胆·还原80%`
- 参考:香港手写招牌与霓虹招牌的视觉语言。1940–70 年代常见「北魏体」招牌字（起笔收笔转折分明、方正，书法家如区建公、苏世杰、卓少衡等推动流行）；招牌常见竖排、层叠密排、中英混排；香港霓虹招牌档案自 2015 年起记录了 400 多个仍存的霓虹招牌。
- 适配:零售/餐饮/唱片店/夜市类品牌页、活动海报、促销落地页、城市夜生活专题、deck 的「现场感」页
- 视觉DNA:深夜墙面做底，一栋楼上**层层叠放的招牌**：竖招压住另一块竖招、横招一块叠一块；每块招牌是高饱和纯底色（红、黄、蓝、绿；此配色属对夜景招牌的归纳，未逐一找到来源）配奶白边框与外发光；字是粗黑繁体、带硬投影；一块红色 LED 小牌；底部一块手写黑板价目表；电线横穿画面。信息密、字大、招牌之间有遮挡。
- HTML实现:绝对定位逐块摆放，box-shadow 做灯箱外发光，text-shadow 做字的硬投影，writing-mode:vertical-rl 做竖招。真实北魏体手写笔画与霓虹灯管的弯折做不到，降级为 Noto 粗黑与 Noto Serif 黑体的组合。
- 字体:Noto Sans TC 900（繁体粗黑竖招与小招）+ Noto Serif TC 900（横招主标）+ Archivo Black（英文副标）
- 样张:assets/style-specimens/east/06-hk-street-signs.jpg

**中国传统色·节气色谱 Solar-Term Palette** `中性·还原90%`
- 参考:《中国传统色：故宫里的色彩美学》（郭浩、李健明著，按四季排目录，收 384 种传统色，另有二十四节气色卡）；立春对应缥碧、黄白游、松花、缃叶、海天霞等传统色名。
- 适配:网页首屏、节令/时间类产品、deck 的目录页、文旅与户外内容、品牌色卡页、自带时间轴的信息图
- 视觉DNA:用**传统色名**而不是「红绿蓝」组织整套配色：24 条竖色条横贯页面底部，每条写节气名与色名，当前节气那一条升高变宽并成为全页的强调色；正文用暖纸色底+墨色，纹样克制到几乎没有。「节气 = 导航」是这个风格独有的版式动作。
- HTML实现:flex 24 等分色条，当前条 flex:1.6 + 加高；文字根据色条明度自动取深/浅色。色值是对各色名的近似（不同来源对同一色名的 hex 略有出入），实际项目请以自己采到的色为准，别当标准色卡。
- 字体:Noto Serif SC（标题、色名、正文）+ Noto Sans SC（导航、小标签）
- 样张:assets/style-specimens/east/07-traditional-colors-solar-terms.jpg

**杉浦康平信息曼荼罗 Sugiura Information Mandala** `大胆·还原72%`
- 参考:杉浦康平（1932 年生，东京，日本平面设计师与亚洲图像研究者）。以曼荼罗与亚洲宇宙观为研究中心，称亚洲传统图像为「万物照应」的世界；做过约 5000 册书，包括讲谈社「现代新书」系列约 1700 个封面；有《时间距离地图》图解实验与「曼荼罗」展（1980）。
- 适配:信息图、活动海报、年度/周期类数据页、科普专题、deck 的总览页
- 视觉DNA:**同心环盘居中**——外环是节气/刻度，中环是色块扇区，内环是月相小圆，中心一枚红圆点；四周围着带编号圆点的引线与说明、竖排大标题、一张时间距离图，信息密度高但每一块都对应盘上的一个位置。配色取近黑暖底+金+朱红+米白。竖排与横排并存是常见的亚洲式版面（此点属归纳，本次未找到逐页来源）。
- HTML实现:用脚本生成 SVG 扇形、刻度、沿圆周旋转的文字；说明文字绝对定位，引线用 SVG path。杉浦在印刷上做的叠印、特殊油墨与跨页书脊设计做不到，降级为纯色平涂。
- 字体:Noto Serif SC（竖排大标题与环上文字）+ Noto Sans SC（说明文字与时间图）
- 样张:assets/style-specimens/east/08-sugiura-info-mandala.jpg

**田中一光几何平面构成 Ikko Tanaka Geometric** `中性·还原90%`
- 参考:田中一光（1930–2002）。把日本传统与国际主义风格融合，《日本舞踊》海报（1981，用方块与矩形在网格上构成艺伎的发髻与脸）是代表作；1973 年起为西武剧场做海报、1975 年起任西武集团创意总监，1980 年起参与创立无印良品并长期主导其视觉；风格受琳派影响。
- 适配:展览/影展/演出海报、品牌宣言页、deck 封面、文化机构网页首屏
- 视觉DNA:**网格上的方、圆、四分之一圆**拼成一个抽象主图，红 #D9381E / 黑 / 芥黄 / 一点钢蓝，在米纸色底上；竖排粗宋体大标题；右侧信息按「会期 / 会场 / 主题 / 票价」小红标签分块；底部一条细黑线。扇形、圆日、条纹（幕）是传统母题的几何转译。
- HTML实现:一个 560px 方阵，70px 为单位，用 border-radius 做四分之一圆和半圆；条纹用 repeating-linear-gradient。丝网印刷的套色与纸面颗粒做不到，降级为纯色平涂。
- 字体:Noto Serif SC 900（竖排大标题）+ Noto Sans SC（信息）+ Zen Kaku Gothic New（英文小字）
- 样张:assets/style-specimens/east/09-tanaka-geometric-poster.jpg

**服部一成玩味错位 Hattori Playful Offset** `大胆·还原75%`
- 参考:服部一成（1964 年生，东京，艺术指导、多摩美术大学教授）。代表作包括 Kewpie Half 广告、《流行通信》艺术指导、三菱一号馆美术馆标志；2004 年获龟仓雄策奖；标志性手法之一是**把印刷的网点替换成条纹**（2007 年的「旗」海报起）。
- 适配:海报、封面、活动与媒体品牌页、需要「不严肃但很讲究」的天气/生活类内容
- 视觉DNA:一个字放得极大，用两层不同颜色的**水平条纹**填充并错开几个像素（像错套印），条纹本身就是质感；旁边是倾斜的纯色块（黄、黑、珊瑚红圆）与一笔粗黑的手绘波线；标题字手写感、逐字高低错位；信息栏反而排得老老实实。玩味集中在一处，不蔓延。
- HTML实现:巨字用 background-clip:text + repeating-linear-gradient 填条纹，复制一层偏移；色块 rotate；粗线用 SVG stroke-linecap:round。真正的手写笔触与油墨叠印做不到，降级为圆头粗线与错位条纹。巨字选笔画少的字（水、山、云），复杂字会糊。
- 字体:Noto Sans SC 900（巨字与数字）+ ZCOOL KuaiLe（玩味标题）+ Noto Sans SC（信息栏）
- 样张:assets/style-specimens/east/10-hattori-playful-offset.jpg

**佐藤可士和极简符号 Sato Minimal Symbol** `中性·还原92%`
- 参考:佐藤可士和（Kashiwa Sato，创意总监）。2006 年为优衣库做的品牌重塑：红色方块+白色粗体字+片假名，选红白是因为让人联想日章旗；还担任日清杯面博物馆的艺术总监。他的主张是品牌需要一个强标志（据 Design Singapore 的访谈整理）。
- 适配:品牌发布页、产品 landing、deck 封面、App 启动页、创业项目官网首屏
- 视觉DNA:**一个字（或一个标志）占去半个版面**，纯色满铺（#E60012 一带）；另一半是纯白、几乎没有装饰的信息区；标题粗黑无衬线；一个小的四色方块色板（红/黑/白/蓝）作为系统的暗示；数据行用三种颜色的粗顶线分格。整页最多三种颜色。
- HTML实现:左右两栏，flex 居中巨字；零图片零渐变。几乎没有降级，难度在克制，不在实现。
- 字体:Noto Sans SC 900（中文标题与标志字）+ Archivo 800/900（拉丁与数字）
- 样张:assets/style-specimens/east/11-sato-minimal-symbol.jpg

**日式生活杂志密排 Japanese Lifestyle Magazine Dense** `中性·还原78%`
- 参考:POPEYE（1976 年创刊，Magazine House，副题「Magazine for City Boys」）与 BRUTUS（1980 年创刊）；两本刊的标志都出自艺术指导堀内诚一，POPEYE 的标志 1976 年由他设计，他在 70 年代做了每一期。堀内诚一也是 an・an 的艺术指导。
- 适配:年报/数据专题跨页、城市与生活类内容、deck 的数据页、攻略与清单类长图、信息图
- 视觉DNA:白纸黑字，**高密度图解**：左页大标题（黄色马克笔下划线）+ 一张路线图，图上有编号圆点与**手写体红蓝笔注解**；右页是 3×3 的数据格（粗黑线格，黄格与黑格各用一两格强调）+ 一张热力图 + 一段读图提示；书眉、页码用窄体拉丁，横跨两页。「手写注解 + 图解」这一特征属对这类版面的归纳，本次未找到逐页来源，不要当作对 POPEYE 某期的还原。
- HTML实现:两个 600px 页并列，CSS Grid 做数据格，SVG 画路线图，热力图用 24×7 的 Grid 单元格。真实杂志的照片拼贴与印刷网点做不到，照片位用色块诚实标出。
- 字体:Noto Serif SC 900（大标题）+ Noto Sans SC（正文与数据）+ Long Cang（手写注解）+ Archivo Narrow（书眉页码、数据大数字）
- 样张:assets/style-specimens/east/12-japan-magazine-dense.jpg

---

## 小红书图文(8种)

> 2026-10 新增。一组 3:4 竖图（1242×1660，最多 18 张）左右滑着读，第一张是封面。用法见 `references/modules/xiaohongshu.md`。来源是一次真实发布：同一篇「鸟类贴纸开源」做过这八版，样张就是那组图的封面＋一张内页，所以题材都一样，借的是版式。
> 每个样张同时是模板：`assets/style-specimens/xhs/<编号>.html` 以 1200×750 打开是样张，按真实尺寸打开交给 `scripts/xhs_render.py` 切图。字号按 1242 宽的底线做（正文 ≥42px、标签 ≥32px），换内容时别往下缩。
> 示例色是鸣迹 App 的纸白、墨黑、太阳黄；真做时走色彩推导协议，从用户的品牌或内容里取。

**标本志 Specimen Journal** `中性·还原90%`
- 参考:博物学图版与自然类杂志封面的语法：刊头细线、超大衬线数字、一件主体标本占满半页、侧栏小数据
- 适配:自然、科普、文化类长文，需要权威和杂志感的知识笔记
- 视觉DNA:点阵纸底；宋体特大标题；一个 300px 级的高反差衬线数字当版面主角；主体贴纸压在数字下方并越出栏线；侧栏两三个「大数字＋两行注」；内页用编号清单＋在主体上标同号圆点，一条刻度尺给出位置
- HTML实现:全部绝对定位；编号圆点用 CSS counter；刻度尺用一条细线加两个绝对定位标记。无降级
- 字体:Noto Serif SC 900（标题与小数字）＋ Bodoni Moda（只用于 100px 以上的大数字）＋ Noto Sans SC（正文）
- 样张:assets/style-specimens/xhs/01-specimen-journal.jpg

**贴纸本 Product Notebook** `中性·还原95%`
- 参考:产品自己的界面（这里是鸣迹 App 的纸面、胶囊按钮、贴纸）；小红书原生的手账、拼贴笔记
- 适配:自家产品、App、品牌内容，想让读者一眼认出「这是那个东西」；亲切、可收藏
- 视觉DNA:App 的纸和点阵直接当底；黑色胶囊当标签和步骤号；2×3 贴纸格带名字；白卡片微微旋转、贴一条半透明胶带承载大标题；内页是白卡片做的「审核单」，勾选行＋圆环分数＋两块数字卡
- HTML实现:绝对定位卡片＋drop-shadow 暖棕投影；胶带是半透明色块。无降级
- 字体:Figtree 900（数字）＋ Noto Sans SC 700/900（中文）
- 样张:assets/style-specimens/xhs/02-sticker-notebook.jpg

**索引 Index Ink** `大胆·还原95%`
- 参考:瑞士风格的索引页与数据年报：墨底、单色强调、等距网格、编号行
- 适配:数字结论、排行、清单、对比；封面要在信息流里远看就醒目
- 视觉DNA:封面墨底，一个 340px 的黄色数字占上部，下方 5×3 细线网格里排小图；内页纸底，一个巨大的黑数字＋两行标题，编号表格行，底部一条实心＋斜线填充的比例条
- HTML实现:CSS Grid 网格；斜线用 repeating-linear-gradient；比例条用 flex 按真实数值分配。无降级
- 字体:Figtree 900 ＋ Noto Sans SC 900
- 样张:assets/style-specimens/xhs/03-index-ink.jpg

**长卷 Panorama Strip** `大胆·还原90%`
- 参考:横向卷轴与连续绘本；小红书轮播里「几张连成一幅」的滑动体验
- 适配:能排成一条线的内容：一组对象、时间线、流水线、路线；要让人一路往右滑
- 视觉DNA:三张图是同一幅画，一条贯穿的电线（或地平线）连起所有张；主角跨在接缝上，左图露约 2/3、右图露约 1/3；每张有自己的大数字或标题，单看也成立；页码只写 01 02 03
- HTML实现:一个 3726px 宽的 `.xhs-strip`，`XHS.wire()` 用一条余弦曲线画线（周期跨两张，最低点不落在缝上），`XHS.perch()` 按爪子位置把贴纸站到线上；`xhs_render.py` 自动切张并查字跨缝。贴纸爪子位置要人工量一次
- 字体:Figtree 900 ＋ Noto Sans SC 700/900
- 样张:assets/style-specimens/xhs/04-panorama-strip.jpg

**日报 Daily Paper** `中性·还原80%`
- 参考:报纸头版：刊头、双线、头条、分栏正文、首字下沉、灰度网点图、要闻导读框
- 适配:「事件」型内容：发布、复盘、深度方法稿、年度总结
- 视觉DNA:新闻纸底色加细噪点；宋体刊头字距拉开；双线分隔刊头与正文；头条里一个数字用黄色荧光笔划过；图片去色加对比；首字下沉的正文栏；内页一个方框装大比分，底部一排灰度小图作图解
- HTML实现:噪点用内联 SVG feTurbulence 做背景；网点图用 grayscale＋contrast 滤镜近似，真实的半调网点做不到；首字下沉用 ::first-letter
- 字体:Noto Serif SC 900/500（刊头、标题、正文）＋ Bodoni Moda（英文刊名与大比分）
- 样张:assets/style-specimens/xhs/05-daily-paper.jpg

**集换卡 Trading Cards** `大胆·还原85%`
- 参考:集换式卡牌与图鉴卡：金边卡框、等级签、编号、数据条
- 适配:一项一卡、可收集的清单：物种、产品、人物、工具、城市
- 视觉DNA:深色桌面径向渐变；金色渐变边框包纸面卡芯；封面一张大卡压一张斜放的小卡；卡上名字、学名、等级签、点阵图窗、#编号、两条数据条；内页 3×3 卡包按一个真实数值排序
- HTML实现:卡框是 padding 加 linear-gradient 背景；数据条宽度按真实数值算。烫金反光做不到，用多段渐变近似
- 字体:Figtree 800/900（数字）＋ Noto Sans SC 700/900
- 样张:assets/style-specimens/xhs/06-trading-cards.jpg

**留白 Blank & Vertical** `安静·还原90%`
- 参考:中文竖排书籍与印章；一页只放一件东西的画册
- 适配:慢内容、故事、单个对象的特写、金句；一组里穿插一两张换气
- 视觉DNA:大面积空白；宋体竖排大标题靠右；竖排副题细而长；一枚朱印；主体小而孤立，落在左下；左上一行编号，底部一条短线加学名
- HTML实现:writing-mode:vertical-rl；朱印是红色方块加竖排字。无降级。留白靠版面，不靠把字缩小：竖排正文也 ≥42px
- 字体:Noto Serif SC 900/500
- 样张:assets/style-specimens/xhs/07-blank-vertical.jpg

**信息图 Area Infographic** `中性·还原95%`
- 参考:矩形树图（Ben Shneiderman 在 1990 年代初提出）与华夫格
- 适配:有一组硬数字、要一眼看懂比例的结论页；构成、分布、达标率
- 视觉DNA:封面是面积等于数量的矩形树图，大格嵌主体贴纸，小格只放名字和数，再小的合并成「其余 N 个」；内页华夫格一格代表固定数量，四档颜色，下面一张图例写真实数字
- HTML实现:squarify 算法约 20 行 JS 内联在模板里；华夫格是 CSS Grid。无降级
- 字体:Figtree 900 ＋ Noto Sans SC 900
- 样张:assets/style-specimens/xhs/08-area-infographic.jpg

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

**版本**：v3.2（2026-06 重构为 HTML 原生库；2026-08 补齐信息图分区，40 → 60 种；2026-10 新增 App 与中文东亚两个分区、每种配样张，60 → 84 种；2026-10 新增小红书图文分区，84 → 92 种）
**适用**：网页/PPT/PDF/信息图/封面/App 等所有视觉设计的 default HTML 路径
