# App / iOS 原型专属守则 · 完整操作手册

> SKILL.md 路由到这里的 App / iOS 原型完整手册：架构选型、取图渠道与代码、AppPhone JSX 骨架、ios_frame 用法、品位锚点。
> 单文件 inline React 的三条技术红线（样式对象必须唯一命名，如 `const terminalStyles = {}`；多个 babel script 之间用 `Object.assign(window, …)` 共享组件；不用 `scrollIntoView`）和 pinned 版本见 `references/react-setup.md`，写之前先读。三方向门照走（`references/directions.md`），三版手机并排时 compare 加 `--ignore-layout`。


做 iOS/Android/移动 app 原型时（触发：「app 原型」「iOS mockup」「移动应用」「做个 app」），下面四条**覆盖**通用 placeholder 原则——app 原型是 demo 现场，静态摆拍和米白占位卡没有说服力。

### 先定形态，再画屏

动手前先回答一个问题：**这个 App 管的那件事，在现实里长什么样？** 一天是一条有长短的时间线，潮水是一条曲线，相机是一台有拨杆的机器。两届 App Store Awards 入围作品里做得出色的那些，主屏几乎都不是「导航栏＋卡片列表＋底部五个 tab」，而是从这个形状里长出来的。

`references/app-paradigms.md` 把它们拆成了八条范式（界面即世界、签名物件、时间有形状、一套语义色、内容当主角、AI 落在物上、角色承载状态、可达性定形式），每条有证据 App、什么时候别用，总览图是 `assets/style-specimens/sheet-paradigm.jpg`。构思六个候选时翻一遍。它是参考不是配额：不要求套用，也不要求三个方向各占一条。

每个方向卡里写清这五件事，三个方向至少有三件不一样：

| 定什么 | 问自己 |
|---|---|
| 主屏形态 | 是列表、一个场景、一个大数、一面内容墙，还是一条时间线？ |
| 签名处 | 用户每天碰得最多的那一下，在这里长成什么只有这里才有的样子？ |
| 数据的形状 | 最重要的那份数据是胶囊、环、曲线、水位，还是就该是一张表？ |
| 颜色回答什么 | 彩色在这个 App 里只用来分清哪一件事？ |
| 嗓音 | 字体和文案是谁在说话？按钮和空状态上写的是这个产品才会说的话吗？ |

要看真实 App 怎么做的，用 `python3 "$HD/scripts/appstore_shots.py" <id 或名字…>` 把它们的商店截图拉成参考板（id 在范式卡文末）；这就是三方向门里「现实参照」那两个候选的来源。界面定稿后要做上架图，走 `references/modules/appstore.md`。

### 0. 架构选型（必先决定）

**默认单文件 inline React**——所有 JSX/data/styles 直接写进主 HTML 的 `<script type="text/babel">...</script>` 标签，**不要**用 `<script src="components.jsx">` 外部加载。原因：`file://` 协议下浏览器把外部 JS 当跨 origin 拦截，强制用户起 HTTP server 违反「双击就能开」的原型直觉。引用本地图片必须 base64 内嵌 data URL，别假设有 server。

**拆外部文件只在两种情况**：
- (a) 单文件 >1000 行难维护 → 拆成 `components.jsx` + `data.js`，同时明确交付说明（`python3 -m http.server` 命令 + 访问 URL）
- (b) 需要多 subagent 并行写不同屏 → `index.html` + 每屏独立 HTML（`today.html`/`graph.html`...），iframe 聚合，每屏也都是自包含单文件

**选型速查**：

| 场景 | 架构 | 交付方式 |
|------|------|----------|
| 单人做 4-6 屏原型（主流） | 单文件 inline | 一个 `.html` 双击开 |
| 单人做大型 App（>10 屏） | 多 jsx + server | 附启动命令 |
| 多 agent 并行 | 多 HTML + iframe | `index.html` 聚合，每屏独立可开 |

### 1. 先找真图，不是 placeholder 摆着

界面里该是图的地方（头像、菜品、商品、封面、场景、角色）默认主动放上真的图，不要画 SVG、不要用 emoji 顶替、不要拿米白卡摆着、不要等用户要求。来源顺序见 `references/materials.md`「图从哪来」：能生图就生成（你所在环境自带的工具，或 `scripts/gen_image.py` 借本机 Codex），同一处出两三张挑最合适的；不能生图再找开放许可的真图。要的是某个具体的真实对象（一件文物、一个地点）时直接用真图。真图的常用渠道：

| 场景 | 首选渠道 |
|------|---------|
| 美术/博物馆/历史内容 | Wikimedia Commons（公共领域）、Met Museum Open Access、Art Institute of Chicago API |
| 通用生活/摄影 | Unsplash、Pexels（免版权） |
| 用户本地已有素材 | `~/Downloads`、项目 `_archive/` 或用户配置的素材库 |

Wikimedia 下载避坑（本机 curl 走代理 TLS 会炸，Python urllib 直接走得通）：

```python
# 合规 User-Agent 是硬性要求，否则 429
UA = 'ProjectName/0.1 (https://github.com/you; you@example.com)'
# 用 MediaWiki API 查真实 URL
api = 'https://commons.wikimedia.org/w/api.php'
# action=query&list=categorymembers 批量拿系列 / prop=imageinfo+iiurlwidth 取指定宽度 thumburl
```

生成和取图都走不通时，告诉用户缺哪几张、怎么能补上，那几处空着并在交付说明里写明；这是没做完的状态，不拿 SVG 或 emoji 填。

**真图诚实性测试**（关键）：取图之前先问自己——「如果去掉这张图，信息是否有损？」

| 场景 | 判断 | 动作 |
|------|------|------|
| 文章/Essay 列表的封面、Profile 页的风景头图、设置页的装饰 banner | 装饰，与内容无内在关联 | **不要加**。加了就是 AI slop，等同紫色渐变 |
| 博物馆/人物内容的肖像、产品详情的实物、地图卡片的地点 | 内容本身，有内在关联 | **必须加** |
| 图谱/可视化背景的极淡纹理 | 氛围，服从内容不抢戏 | 加，但 opacity ≤ 0.08 |

**反例**：给文字 Essay 配 Unsplash「灵感图」、给笔记 App 配 stock photo 模特——都是 AI slop。取真图的许可不等于滥用真图的通行证。

### 2. 交付形态：默认「平铺 + 可操作」，不要问用户

iOS App 原型的**默认交付形态就一种，不要再问用户「要平铺还是可操作」**：**平铺 4-6 个主界面，且每一台都能交互**。一眼看全貌（多台 iPhone 并排），又每台都能点 tab 切换、在界面上做基本操作（展开、切换、选中、打开弹层）。两个好处一次给齐，别让用户二选一。

| 维度 | 默认做法 |
|------|---------|
| **屏数** | 平铺 **4-6 个主界面**（覆盖 app 的核心功能面，不是随便摆几个）。多于 6 个抓最主要的 4-6 个，其余可在单台内通过 tab/导航到达 |
| **布局** | 一块有构图的展示板，不是一排等大的手机（见下「展示板」）；每台旁边一行标签说明这是哪个界面 |
| **每台交互** | 每台都是独立的迷你状态机：tab bar 可切、界面内按钮/卡片/开关可点、能弹 modal——不是静态摆拍 |

**只有两种特例才偏离默认**（用户明确说了才走，否则一律默认）：
- 用户明确「只要静态截图 / 不用能点 / 就看 layout」→ 退回纯静态 overview（每台只渲染 `ScreenComponent`，不挂状态机）
- 用户明确「只演示一条流程 / 走一遍 onboarding / 单机 demo」→ 单台 `AppPhone` 走完整 flow

**默认骨架**（平铺多台，每台各自一个带 state 的 AppPhone）：

```jsx
// 每台 = 一个独立状态机，初始落在自己负责的主界面
function AppPhone({ initial }) {
  const [screen, setScreen] = React.useState(initial);
  const [modal, setModal] = React.useState(null);
  // 按 screen 渲染对应 ScreenComponent，传入 onTabChange/onOpen/onClose/onToggle 等 callback
  return (
    <IosFrame>
      <ScreenComponent
        screen={screen}
        onTabChange={setScreen}
        onOpen={setModal}
        onClose={() => setModal(null)}
      />
    </IosFrame>
  );
}

// 平铺：4-6 台并排，每台 initial 落在不同主界面
<div style={{display: 'flex', gap: 32, flexWrap: 'wrap', padding: 48, alignItems: 'flex-start'}}>
  {mainScreens.map(s => (
    <div key={s.id}>
      <div style={{fontSize: 13, color: '#666', marginBottom: 8, fontStyle: 'italic'}}>{s.label}</div>
      <AppPhone initial={s.id} />
    </div>
  ))}
</div>
```

Screen 组件接 callback props（`onTabChange`、`onOpen`、`onClose`、`onToggle`、`onAnnotation`），不硬编码状态。TabBar、按钮、作品卡、开关加 `cursor: pointer` + hover 反馈。每台落在不同主界面，但 tab 切换后能到达彼此——平铺给全貌，点击给纵深。

上面的 flex 只是能跑起来的最小骨架，交付前换成展示板构图。

#### 展示板：别把手机排成一排

盲选里，App 原型无论哪个方向，只要是五六台等大手机等距排开，用户的评价都是「太规整，太无聊了」。界面本身做得再好，第一眼看到的是一张规整的表格。展示板是这个方向的第一张海报，它自己也要有设计：

| 手法 | 做法 | 适合 |
|---|---|---|
| 主次 | 最能代表这个 App 的那一屏放大到 1.2–1.4 倍放在视觉中心，其余缩小错落围着它，高低不齐 | 几乎都适用，首选 |
| 流程串联 | 按用户真实任务的顺序摆，屏与屏之间用细线从「点了哪里」连到「去了哪屏」，标注写在线旁 | 有一条主任务流的 App（下单、记录、出差模式） |
| 局部特写 | 在某一屏旁边放一个关键组件的 2–3 倍特写：签名交互、数据可视化、一个精心做的控件 | 有一个值得被记住的细节 |
| 语境底 | 展示板背景用这个 App 的使用语境：真图、题材色、它的材质，而不是白画布 | 题材有很强的场景（户外、厨房、夜晚） |
| 板面排版 | 展示板自己有标题区：App 名、一句定位、屏幕标签，字体和颜色用这个方向自己的系统 | 都适用 |

规则只有三条：展示板的底色和字体跟着这个方向走（暗色方向用暗底板，不要统一白画布）；每台手机仍然能点；屏幕不缩到看不清字（单台宽度不小于 300px）。三个方向的展示板构图也要不一样——这是三个方向最容易被忽略的差异。

### 3. 交付前跑真实点击测试

静态截图只能看 layout，交互 bug 要点过才发现。用 Playwright 跑 3 项最小点击测试：进入详情 / 关键标注点 / tab 切换。检查 `pageerror` 为 0 再交付。Playwright 可用 `npx playwright` 调用，或按本机全局安装路径（`npm root -g` + `/playwright`）。

### 4. 品位锚点（pursue list，fallback 首选）

没有 design system 时默认往这些方向走，避免撞 AI slop：

| 维度 | 首选 | 避免 |
|------|------|------|
| **字体** | display 按题材选（`references/typography.md` 配对表），`-apple-system` body | 全场 SF Pro 或 Inter——太像系统默认 |
| **色彩** | 从产品题材和真图里采色（色彩推导协议），一个主色贯穿全场 | 多色聚类（除非数据真的有 ≥3 个分类维度） |
| **信息密度·克制型**（默认）| 少一层容器、少一个 border、少一个**装饰性** icon——给内容留气口 | 每条卡片都配无意义的 icon + tag + status dot |
| **信息密度·高密度型**（例外）| 当产品核心卖点是「智能 / 数据 / 上下文感知」时（AI 工具、Dashboard、Tracker、Copilot、番茄钟、健康监测、记账类），每屏需**至少 3 处可见的产品差异化信息**：非装饰性数据、对话/推理片段、状态推断、上下文关联 | 只放一个按钮一个时钟——AI 的智能感没表达出来，跟普通 App 没区别 |
| **细节签名** | 留一处「值得截图」的质感：一个自己造的控件或进度图形（范式卡 02）、极淡油画底纹、serif 斜体引语、全屏黑底录音波形 | 到处平均用力，结果处处平淡 |

**两条原则同时生效**：
1. 品位 = 一个细节做到 120%，其它做到 80%——不是所有地方都精致，而是在合适的地方足够精致
2. 减法是 fallback，不是普适律——产品核心卖点需要信息密度支撑时（AI / 数据 / 上下文感知类），加法优先于克制。详见下文「信息密度分型」

### 5. iOS 设备框必须用 `assets/ios_frame.jsx`——禁止手写 Dynamic Island / status bar

做 iPhone mockup 时**硬性绑定** `assets/ios_frame.jsx`。这是已经对齐过 iPhone 15 Pro 精确规格的标准外壳：bezel、Dynamic Island（124×36、top:12、居中）、status bar（时间/信号/电池、两侧避让岛、vertical center 对齐岛中线）、Home Indicator、content 区 top padding 都处理好了。

**禁止在你的 HTML 里自己写**以下任何一项：
- `.dynamic-island` / `.island` / `position: absolute; top: 11/12px; width: ~120; 居中的黑圆角矩形`
- `.status-bar` with 手写的时间/信号/电池图标
- `.home-indicator` / 底部 home bar
- iPhone bezel 的圆角外框 + 黑描边 + shadow

自己写 99% 会撞位置 bug——status bar 的时间/电池被岛挤压、或 content top padding 算错导致第一行内容盖在岛下。iPhone 15 Pro 的刘海是**固定 124×36 像素**，留给 status bar 两侧的可用宽度很窄，不是你凭空估的。

**用法（严格三步）**：

```jsx
// 步骤 1: Read 本 skill 的 assets/ios_frame.jsx（相对本 SKILL.md 的路径）
// 步骤 2: 把整个 iosFrameStyles 常量 + IosFrame 组件贴进你的 <script type="text/babel">
// 步骤 3: 你自己的屏组件包在 <IosFrame>...</IosFrame> 里，不碰 island/status bar/home indicator
<IosFrame time="9:41" battery={85}>
  <YourScreen />  {/* 内容从 top 54 开始渲染，下边留给 home indicator，你不用管 */}
</IosFrame>
```

**例外**：只有用户明确要求「假装是 iPhone 14 非 Pro 的刘海」「做 Android 不是 iOS」「自定义设备形态」时才绕过——此时读对应 `android_frame.jsx` 或修改 `ios_frame.jsx` 的常量，**不要**在项目 HTML 里另起一套 island/status bar。
