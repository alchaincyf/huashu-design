# 模块 · 网页 / 落地页 / 官网 / 界面原型

可点击的站点、落地页、官网、Dashboard 和桌面端界面原型走这里（手机 App 走 `references/app-prototype.md`）。先过 SKILL.md 的窄桥，再按这份手册做。

## 首屏：先放题材世界里最有特点的东西

首屏是观众第一眼看到的。用这个题材世界里最有特点的东西开场，形式选最合适的那种：一句标题、一张图、一段动画、一个能玩的 demo、一个交互瞬间。

「大数字＋小标签＋一排辅助数据＋渐变点缀」是首屏的默认答案，只有它真的最合适时才用。「大 hero＋三栏特性＋用户评价＋CTA」这套落地页模板同理。

## 往下每一屏都要被设计过

首屏有设计、往下全是「小标题＋三张一样的卡片」，是落地页最常见的失败。每个内容块都值得问一遍：这段内容最适合的形式是什么——
一张图表、一个可以拨动的演示、一段大字、一张产品界面、一条时间线——而不是默认装进卡片。

**产品要看得见。** 介绍 App、工具、硬件的页面，页面上要有这个产品本身：有截图用截图，没有截图就按用户给的真实内容把界面画出来
（手机 App 用 `assets/ios_frame.jsx`，桌面软件用 `assets/macos_window.jsx`）。只用文字描述产品的落地页不算完成。
产品的核心机制能做成可以玩的小演示时（拨一下海拔看天气怎么变、拖一下滑块看价格），它往往就是全页最好的那一屏。

## 做的顺序

1. 三方向：每方向 1 个完整 HTML＋首屏截图＋整页长截图（`references/directions.md`）
2. 选定后先写 assumptions＋占位结构给用户看，再填组件（`references/workflow.md` 的标准流程）
3. 结构、节奏定了再加 Tweaks（`references/tweaks-system.md`），让用户自己调颜色、字号、文案
4. 打磨环至少 2 轮（`references/polish-loop.md`），桌面和手机都逐屏看

## 硬规则

- 正文 ≥14px（移动端 16px），可点元素 ≥44×44px，正文对比度 ≥4.5:1
- 响应式：至少验 1440 和 375 两个宽度（`python3 "$HD/scripts/verify.py" page.html --viewports 1440x900,375x812`）
- 交互要真能点：导航、tab、展开、表单状态做出来，控制台零报错
- 不编造数据、评价和 logo 墙；没有就留诚实占位或问用户要
- 动效：一次编排好的页面载入，胜过每个区块都 fade-up；回应用户动作的动效（展开、确认）才是好动效

## 起手组件

| 文件 | 用途 |
|---|---|
| `assets/browser_window.jsx` | 把网页放进浏览器窗口里展示（URL 栏＋标签栏） |
| `assets/macos_window.jsx` | 桌面 App 窗口外壳 |
| `assets/design_canvas.jsx` | 多个静态变体并排对比 |

React＋Babel 的写法与三条技术红线（样式对象必须唯一命名、多个 babel script 之间用 `Object.assign(window, …)` 共享、不用 `scrollIntoView`）：`references/react-setup.md`。

## 相关文件

| 要做什么 | 读 |
|---|---|
| 风格库与样张（秒数轮盘的网页分区，外加跨媒介的中文与东亚分区） | `references/design-styles.md` |
| 字体配对与中文排印 | `references/typography.md` |
| 用户有 codebase / design system | `references/design-context.md` |
| 交付前验证 | `references/verification.md` |
