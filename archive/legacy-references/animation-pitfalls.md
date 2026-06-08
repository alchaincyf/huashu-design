# Animation Pitfalls：HTML 动画踩过的坑与规则

做动画时最常踩的 bug 和如何避免。每条规则都来自真实失败案例。

写动画之前读完这篇，能省一轮迭代。

## 1. 叠层布局 —— `position: relative` 是默认义务

**踩的坑**：一个 sentence-wrap 元素包了 3 个 bracket-layer（`position: absolute`）。没给 sentence-wrap 设 `position: relative`，结果 absolute 的 bracket 以 `.canvas` 为坐标系，飘到屏幕底部 200px 外。

**规则**：
- 任何包含 `position: absolute` 子元素的容器，**必须**显式 `position: relative`
- 即使视觉上不需要「偏移」，也要写 `position: relative` 作为坐标系锚点
- 如果你在写 `.parent { ... }`，其子元素里有 `.child { position: absolute }`，下意识给 parent 加 relative

**快速检查**：每出现一个 `position: absolute`，往上数 ancestor，确保最近的 positioned 祖先是你*想要的*坐标系。

## 2. 字符陷阱 —— 不依赖稀有 Unicode

**踩的坑**：想用 `␣` (U+2423 OPEN BOX) 可视化「空格 token」。Noto Serif SC / Cormorant Garamond 都没这个字形，渲染为空白/豆腐，观众完全看不到。

**规则**：
- **动画里出现的每个字符，都必须在你选定的字体里存在**
- 常见稀有字符黑名单：`␣ ␀ ␐ ␋ ␨ ↩ ⏎ ⌘ ⌥ ⌃ ⇧ ␦ ␖ ␛`
- 要表达「空格 / 回车 / 制表符」这类元字符，用 **CSS 构造的语义盒子**：
  ```html
  <span class="space-key">Space</span>
  ```
  ```css
  .space-key {
    display: inline-flex;
    padding: 4px 14px;
    border: 1.5px solid var(--accent);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.3em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  ```
- Emoji 也要验证：某些 emoji 在 Noto Emoji 以外字体会 fallback 成灰色方框，最好用 `emoji` font-family 或 SVG

## 3. 数据驱动的 Grid/Flex 模板

**踩的坑**：代码里 `const N = 6` 个 tokens，但 CSS 写死 `grid-template-columns: 80px repeat(5, 1fr)`。结果第 6 个 token 没有 column，整个矩阵错位。

**规则**：
- 当 count 从 JS 数组来（`TOKENS.length`），CSS 模板也应该数据驱动
- 方案 A：用 CSS 变量从 JS 注入
  ```js
  el.style.setProperty('--cols', N);
  ```
  ```css
  .grid { grid-template-columns: 80px repeat(var(--cols), 1fr); }
  ```
- 方案 B：用 `grid-auto-flow: column` 让浏览器自动扩展
- **禁用「固定数字 +  JS 常量」的组合**，N 改了 CSS 不会同步更新

## 4. 过渡断层 —— 场景切换要连续

**踩的坑**：zoom1 (13-19s) → zoom2 (19.2-23s) 之间，主句子已经 hidden，zoom1 fade out（0.6s）+ zoom2 fade in（0.6s）+ stagger delay（0.2s+）= 约 1 秒纯空白画面。观众以为动画卡住了。

**规则**：
- 连续切换场景时，fade out 和 fade in 要**交叉重叠**，不是前一个完全消失再开始下一个
  ```js
  // 差：
  if (t >= 19) hideZoom('zoom1');      // 19.0s out
  if (t >= 19.4) showZoom('zoom2');    // 19.4s in → 中间 0.4s 空白

  // 好：
  if (t >= 18.6) hideZoom('zoom1');    // 提前 0.4s 开始 fade out
  if (t >= 18.6) showZoom('zoom2');    // 同时 fade in（cross-fade）
  ```
- 或者用一个「锚点元素」（如主句子）作为场景之间的视觉连接，zoom 切换期间它短暂回显
- 配 CSS transition 的 duration 算清楚，避免 transition 还没结束就触发下一个

## 5. Pure Render 原则 —— 动画状态应可 seek

**踩的坑**：用 `setTimeout` + `fireOnce(key, fn)` 链式触发动画状态。正常播放没问题，但做逐帧录制/seek到任意时间点时，之前的 setTimeout 已经执行过就无法「回到过去」。

**规则**：
- `render(t)` 函数理想上是 **pure function**：给定 t 输出唯一 DOM 状态
- 如果必须用副作用（如 class 切换），用 `fired` set 配合显式 reset：
  ```js
  const fired = new Set();
  function fireOnce(key, fn) { if (!fired.has(key)) { fired.add(key); fn(); } }
  function reset() { fired.clear(); /* 清所有 .show class */ }
  ```
- 暴露 `window.__seek(t)` 供 Playwright / 调试用：
  ```js
  window.__seek = (t) => { reset(); render(t); };
  ```
- 动画相关的 setTimeout 不要跨越 >1 秒，否则 seek 回跳时会乱套

## 6. 字体加载前测量 = 测错

**踩的坑**：页面一 DOMContentLoaded 就调用 `charRect(idx)` 测量 bracket 位置，字体还没加载，每个字符宽度是 fallback 字体的宽度，位置全错。等字体一加载（约 500ms 后），bracket 的 `left: Xpx` 还是老值，永久偏移。

**规则**：
- 任何依赖 DOM 测量（`getBoundingClientRect`、`offsetWidth`）的布局代码，**必须**包在 `document.fonts.ready.then()` 里
  ```js
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      buildBrackets(...);  // 此时字体已就绪，测量准确
      tick();              // 动画开始
    });
  });
  ```
- 额外的 `requestAnimationFrame` 给浏览器一帧时间提交 layout
- 如果用 Google Fonts CDN，`<link rel="preconnect">` 加速首次加载

## 7. 录制准备 —— 为视频导出预留抓手

**踩的坑**：Playwright `recordVideo` 默认 25fps，从 context 创建就开始录。页面加载、字体加载的前 2 秒都被录进去。交付时视频前面 2 秒空白/闪白。

**规则**：
- 提供 `render-video.js` 工具处理：warmup navigate → reload 重启动画 → 等 duration → ffmpeg trim head + 转 H.264 MP4
- 动画的**第 0 帧**要是最终布局已就位的完整初始状态（不是空白或加载中）
- 想要 60fps？用 ffmpeg `minterpolate` 后处理，不指望浏览器源帧率
- 想要 GIF？两阶段 palette（`palettegen` + `paletteuse`），对 30s 1080p 动画能压到 3MB

参见 `video-export.md` 获取完整脚本调用方式。

## 8. 批量导出 —— tmp 目录必须带 PID 防并发冲突

**踩的坑**：用 `render-video.js` 3 个进程并行录 3 个 HTML。因为 TMP_DIR 只用 `Date.now()` 命名，3 个进程同毫秒启动时共用同一个 tmp 目录。最先完成的进程清理 tmp，另外两个读目录时 `ENOENT`，全部崩溃。

**规则**：
- 任何多进程可能共用的临时目录，命名必须带 **PID 或随机后缀**：
  ```js
  const TMP_DIR = path.join(DIR, '.video-tmp-' + Date.now() + '-' + process.pid);
  ```
- 如果确实想多文件并行，用 shell 的 `&` + `wait` 而不是在一个 node 脚本里 fork
- 批量录多个 HTML 时，保守做法：**串行**运行（2 个以内可并行，3 个以上老实排队）

## 9. 录屏里有进度条/重播按钮 —— Chrome 元素污染视频

**踩的坑**：动画 HTML 加了 `.progress` 进度条、`.replay` 重播按钮、`.counter` 时间戳，方便人类调试播放。录成 MP4 交付时这些元素出现在视频底部，像把开发者工具截进去了一样。

**规则**：
- HTML 里给人类用的「chrome 元素」（progress bar / replay button / footer / masthead / counter / phase labels）和视频内容本体分开管理
- **约定 class 名** `.no-record`：任何带这个 class 的元素，录屏脚本自动隐藏
- 脚本端（`render-video.js`）默认注入 CSS 隐藏常见 chrome class 名：
  ```
  .progress .counter .phases .replay .masthead .footer .no-record [data-role="chrome"]
  ```
- 用 Playwright 的 `addInitScript` 注入（会在每次 navigate 前生效，reload 也稳）
- 想看原样 HTML（带 chrome）时加 `--keep-chrome` flag

## 10. 录屏开头几秒动画重复 —— Warmup 帧泄漏

**踩的坑**：`render-video.js` 的旧流程 `goto → wait fonts 1.5s → reload → wait duration`。录制从 context 创建就开始，warmup 阶段动画已经播了一段，reload 后从 0 重启。结果视频前几秒是「动画中段 + 切换 + 动画从 0 开始」，重复感强。

**规则**：
- **Warmup 和 Record 必须用独立的 context**：
  - Warmup context（无 `recordVideo` 选项）：只负责 load url、等字体、然后 close
  - Record context（有 `recordVideo`）：fresh 状态开始，animation 从 t=0 开始录
- ffmpeg `-ss trim` 只能裁 Playwright 的一点点 startup latency（~0.3s），**不能**用来掩盖 warmup 帧；源头要干净
- 录制 context 关闭 = webm 文件写入磁盘，这是 Playwright 的约束
- 相关代码模式：
  ```js
  // Phase 1: warmup (throwaway)
  const warmupCtx = await browser.newContext({ viewport });
  const warmupPage = await warmupCtx.newPage();
  await warmupPage.goto(url, { waitUntil: 'networkidle' });
  await warmupPage.waitForTimeout(1200);
  await warmupCtx.close();

  // Phase 2: record (fresh)
  const recordCtx = await browser.newContext({ viewport, recordVideo });
  const page = await recordCtx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(DURATION * 1000);
  await page.close();
  await recordCtx.close();
  ```

## 11. 画面内别画「伪 chrome」—— 装饰版 player UI 与真 chrome 撞车

**踩的坑**：动画用 `Stage` 组件，已经自带 scrubber + 时间码 + 暂停按钮（属于 `.no-record` chrome，导出时自动隐藏）。我又在画面底部画了一条「`00:60 ──── CLAUDE-DESIGN / ANATOMY`」的"杂志页码感装饰进度条"，自我感觉良好。**结果**：用户看到两条进度条——一条是 Stage 控制器，一条是我画的装饰。视觉上完全撞车，认定为 bug。「视频内还有个进度条是怎么回事？」

**规则**：

- Stage 已经提供：scrubber + 时间码 + 暂停/重播按钮。**画面内不要再画**进度指示、当前时间码、版权署名条、章节计数器——它们要么和 chrome 撞车，要么就是 filler slop（违反「earn its place」原则）。
- 「页码感」「杂志感」「底部署名条」这些**装饰诉求**，是 AI 自动加上的高频 filler。每一个出现都要警觉——它真的传达了不可替代的信息吗？还是单纯填满空白？
- 如果你坚信某个底部条带必须存在（例如：动画主题就是讲 player UI），那它必须**叙事必要**，且**视觉上和 Stage scrubber 显著区分**（不同位置、不同形式、不同色调）。

**元素归属测试**（每个画进 canvas 的元素必须能回答）：

| 它属于什么 | 处理 |
|------------|------|
| 某一幕的叙事内容 | OK，留着 |
| 全局 chrome（控制/调试用） | 加 `.no-record` class，导出时隐藏 |
| **既不属于任何幕，又不是 chrome** | **删**。这就是无主之物，必然是 filler slop |

**自检（交付前 3 秒）**：截一张静态图，问自己——

- 画面里有没有「看起来像 video player UI 的东西」（横线进度条、时间码、控制按钮模样）？
- 如果有，删掉它叙事是否有损？无损就删。
- 同一类信息（进度/时间/署名）有没有出现两次？合并到 chrome 一处。

**反例**：底部画 `00:42 ──── PROJECT NAME`、画面右下角画"CH 03 / 06"章节计数、画面边缘画版本号"v0.3.1"——都是伪 chrome filler。

## 12. 录屏前置空白 + 录屏起点偏移 —— `__ready` × tick × lastTick 三联陷阱

**踩的坑（A · 前置空白）**：60 秒动画导出 MP4，前 2-3 秒是空白页面。`ffmpeg --trim=0.3` 剪不掉。

**踩的坑（B · 起点偏移，2026-04-20 真实事故）**：导出 24 秒视频，用户观感「视频 19 秒才开始播第一帧」。实际上动画从 t=5 开始录，录到 t=24 后 loop 回 t=0，再录 5 秒到 end——所以视频最后 5 秒才是动画真正的开头。

**根因**（两个坑共享一个根因）：

Playwright `recordVideo` 从 `newContext()` 那一刻就开始写 WebM，此时 Babel/React/字体加载共耗时 L 秒（2-6s）。录屏脚本等 `window.__ready = true` 作为「动画从这里开始」的锚点——它和动画 `time = 0` 必须严格 pair。有两种常见错法：

| 错法 | 症状 |
|------|------|
| `__ready` 在 `useEffect` 或同步 setup 阶段设（在 tick 第一帧之前） | 录屏脚本以为动画开始了，实际 WebM 还在录空白页 → **前置空白** |
| tick 的 `lastTick = performance.now()` 在**脚本顶层**初始化 | 字体加载 L 秒被算进首帧 `dt`，`time` 瞬间跳到 L → 录屏全程滞后 L 秒 → **起点偏移** |

**✅ 正确的完整 starter tick 模板**（手写动画必须用这个骨架）：

```js
// ━━━━━━ state ━━━━━━
let time = 0;
let playing = false;   // ❗ 默认不播，等字体 ready 再启动
let lastTick = null;   // ❗ sentinel——tick 首帧时 dt 强制为 0（别用 performance.now()）
const fired = new Set();

// ━━━━━━ tick ━━━━━━
function tick(now) {
  if (lastTick === null) {
    lastTick = now;
    window.__ready = true;   // ✅ pair：「录屏起点」与「动画 t=0」同一帧
    render(0);               // 再渲一次确保 DOM 就绪（此时字体已 ready）
    requestAnimationFrame(tick);
    return;
  }
  const dt = (now - lastTick) / 1000;   // 首帧之后 dt 才开始推进
  lastTick = now;

  if (playing) {
    let t = time + dt;
    if (t >= DURATION) {
      t = window.__recording ? DURATION - 0.001 : 0;  // 录制时不 loop，留 0.001s 保留末帧
      if (!window.__recording) fired.clear();
    }
    time = t;
    render(time);
  }
  requestAnimationFrame(tick);
}

// ━━━━━━ boot ━━━━━━
// 不要在顶层立即 rAF——等字体加载完才启动
document.fonts.ready.then(() => {
  render(0);                 // 先把初始画面画出来（字体已就绪）
  playing = true;
  requestAnimationFrame(tick);  // 首次 tick 会 pair __ready + t=0
});

// ━━━━━━ seek 接口（供 render-video 防御性矫正用）━━━━━━
window.__seek = (t) => { fired.clear(); time = t; lastTick = null; render(t); };
```

**为什么这个模板对**：

| 环节 | 为什么必须这样 |
|------|-------------|
| `lastTick = null` + 首帧 `return` | 避免「脚本加载到 tick 首次执行」的 L 秒被算进动画时间 |
| `playing = false` 默认 | 字体加载期间 `tick` 即使运行也不推进 time，避免渲染错位 |
| `__ready` 在 tick 首帧设 | 录屏脚本此刻开始计时，对应的画面是动画真正的 t=0 |
| `document.fonts.ready.then(...)` 里才启动 tick | 规避字体 fallback 宽度测量、避免首帧字体跳变 |
| `window.__seek` 存在 | 让 `render-video.js` 可以主动矫正——第二道防线 |

**录屏脚本端的对应防御**：
1. `addInitScript` 注入 `window.__recording = true`（先于 page goto）
2. `waitForFunction(() => window.__ready === true)`，记录此刻偏移作为 ffmpeg trim
3. **额外**：`__ready` 之后主动 `page.evaluate(() => window.__seek && window.__seek(0))`，把 HTML 可能的 time 偏差强制归零——这是第二道防线，对付不严格遵守 starter 模板的 HTML

**验证方法**：导出 MP4 后
```bash
ffmpeg -i video.mp4 -ss 0 -vframes 1 frame-0.png
ffmpeg -i video.mp4 -ss $DURATION-0.1 -vframes 1 frame-end.png
```
首帧必须是动画 t=0 的初始状态（不是中段，不是黑），末帧必须是动画终态（不是第二轮 loop 的某个时刻）。

**参考实现**：`assets/animations.jsx` 的 Stage 组件、`scripts/render-video.js` 都已按此协议实现。手写 HTML 必须套 starter tick 模板——每一行都是防过具体 bug。

## 13. 录制时禁止 loop —— `window.__recording` 信号

**踩的坑**：动画 Stage 默认 `loop=true`（浏览器里方便看效果）。`render-video.js` 录完 duration 秒还多等 300ms 缓冲才停止，这 300ms 让 Stage 进入下一循环。ffmpeg `-t DURATION` 截取时，最后 0.5-1s 落入下一循环——视频结尾突然回到第一帧（Scene 1），观众以为视频出 bug。

**根因**：录制脚本和 HTML 之间没有"我在录制"的握手协议。HTML 不知道自己被录，依然按浏览器交互场景循环。

**规则**：

1. **录制脚本**：在 `addInitScript` 里注入 `window.__recording = true`（先于 page goto）：
   ```js
   await recordCtx.addInitScript(() => { window.__recording = true; });
   ```

2. **Stage 组件**：识别这个信号，强制 loop=false：
   ```js
   const effectiveLoop = (typeof window !== 'undefined' && window.__recording) ? false : loop;
   // ...
   if (next >= duration) return effectiveLoop ? 0 : duration - 0.001;
   //                                                       ↑ 留 0.001 防止 Sprite end=duration 被关掉
   ```

3. **结尾 Sprite 的 fadeOut**：录制场景下应设 `fadeOut={0}`，否则视频末尾会渐变到透明/暗色——用户期望停在清晰的最后一帧，不是淡出。手写 HTML 时建议结尾 Sprite 都用 `fadeOut={0}`。

**参考实现**：`assets/animations.jsx` 的 Stage / `scripts/render-video.js` 都已内置握手。手写 Stage 必须实现 `__recording` 检测——否则录制必踩这个坑。

**验证**：导出 MP4 后 `ffmpeg -ss 19.8 -i video.mp4 -frames:v 1 end.png`，检查倒数 0.2 秒是否还是预期最后一帧，没有突然切换到另一个 scene。

## 14. 60fps 视频默认用帧复制 —— minterpolate 兼容性差

**踩的坑**：`convert-formats.sh` 用 `minterpolate=fps=60:mi_mode=mci...` 生成的 60fps MP4，在 macOS QuickTime / Safari 部分版本下无法打开（一片黑或直接拒打）。VLC / Chrome 能打开。

**根因**：minterpolate 输出的 H.264 elementary stream 包含某些播放器解析有问题的 SEI / SPS 字段。

**规则**：

- 默认 60fps 用简单 `fps=60` filter（帧复制），兼容性广（QuickTime/Safari/Chrome/VLC 都能开）
- 高质量插帧用 `--minterpolate` flag 显式启用——但**必须本地测过**目标播放器再交付
- 60fps 标签价值是**上传平台的算法识别**（Bilibili / YouTube 上 60fps 标记会优先推流），实际感知流畅度对 CSS 动画来说提升微弱
- 加 `-profile:v high -level 4.0` 提升 H.264 通用兼容性

**`convert-formats.sh` 已默认改成兼容模式**。如果你需要插帧高质量，加 `--minterpolate` flag：
```bash
bash convert-formats.sh input.mp4 --minterpolate
```

## 15. `file://` + 外部 `.jsx` 的 CORS 陷阱 —— 单文件交付必须内联引擎

**踩的坑**：动画 HTML 里用 `<script type="text/babel" src="animations.jsx"></script>` 外部加载引擎。本机双击打开（`file://` 协议）→ Babel Standalone 走 XHR 拉 `.jsx` → Chrome 报 `Cross origin requests are only supported for protocol schemes: http, https, chrome, chrome-extension...` → 整页黑屏，不报 `pageerror` 只报 console error，很容易当"动画没触发"误诊。

启 HTTP server 也未必救得了——本机有全局代理时 `localhost` 也会走代理，返回 502 / 连接失败。

**规则**：

- **单文件交付（双击打开即用的 HTML）** → `animations.jsx` 必须**内联**到 `<script type="text/babel">...</script>` 标签内，不要用 `src="animations.jsx"`
- **多文件项目（起 HTTP server 演示）** → 可以外部加载，但交付时明确写清 `python3 -m http.server 8000` 命令
- 判断标准：交付给用户的是"HTML 文件"还是"带 server 的项目目录"？前者用内联
- Stage 组件 / animations.jsx 经常 200+ 行——贴进 HTML `<script>` 块完全可接受，别怕体积

**最小验证**：双击你生成的 HTML，**不要**通过任何 server 打开。如果 Stage 正常显示动画首帧，才算通过。

## 16. 跨 scene 反色上下文 —— 画面内元素不要硬编码颜色

**踩的坑**：做多场景动画时，`ChapterLabel` / `SceneNumber` / `Watermark` 等**跨 scene 都出现**的元素，在组件里写死 `color: '#1A1A1A'`（深色文字）。前 4 个 scene 浅底 OK，到第 5 个黑底 scene 时"05"和水印直接消失——不报错、不触发任何检查、关键信息隐形。

**规则**：

- **跨多 scene 复用的画面内元素**（chapter 标签 / scene 编号 / 时间码 / 水印 / 版权条）**禁止硬编码颜色值**
- 改用三种方式之一：
  1. **`currentColor` 继承**：元素只写 `color: currentColor`，父 scene 容器设 `color: 计算值`
  2. **invert prop**：组件接受 `<ChapterLabel invert />` 手动切换深浅
  3. **基于底色自动计算**：`color: contrast-color(var(--scene-bg))`（CSS 4 新 API，或 JS 判断）
- 交付前用 Playwright 抽**每个 scene 的代表帧**，人眼过一遍"跨 scene 元素"是否都可见

这条坑的隐蔽性在于——**没有 bug 报警**。只有人眼或 OCR 能发现。

## 17. 离线/无 CDN 的真·自包含 —— React/Babel 全内联，且引擎也要 transpile

**踩的坑（2026-05 觅游宣传动画）**：动画 HTML 用 `<script src="https://unpkg.com/react...">` + `<script src=".../@babel/standalone">` 走 CDN。本机有全局代理，Playwright 录制时 chromium 连 unpkg / Google Fonts 全部 `net::ERR_CONNECTION_CLOSED`：

1. React/ReactDOM 没加载 → `window.React undefined`
2. Babel 没加载 → `<script type="text/babel">` 里的 JSX 当普通 JS 跑 → `Unexpected token '<'`

修了 React/Babel 后又踩第二个坑：**把 `animations.jsx` 引擎当普通 `<script>` 内联，依然报 `Unexpected token '<'` → `window.Animations is undefined`**。根因：**`animations.jsx` 引擎本身含 JSX**（`Stage`/`Sprite` 组件 `return (<div>...)`），它原设计是用 `<script type="text/babel">` 由 Babel 转译加载的。只 transpile 了 app 代码、忘了 transpile 引擎 → 引擎那段 JSX 没被编译。

**规则**（要做「双击即开 / 离线 / 能被 Playwright 录」的真自包含单文件时）：

- **React + ReactDOM 本地内联**：`curl` 下载 `react.production.min.js`（~10KB）+ `react-dom.production.min.js`（~131KB）到本地，inline 进 `<script>`，不走 CDN
- **构建期 Babel 预编译，运行期不带 Babel**：用 `@babel/standalone`（下载一次，仅构建用）在 node 里 `Babel.transform(src,{presets:['react']}).code`，把 JSX → `React.createElement`。**app 和 `animations.jsx` 引擎两段都要过 transform**——引擎含 JSX，漏了它必报 `Unexpected token '<'`
- **字体改系统字体**：Google Fonts CDN 同样会被代理掐断。中文动画用 `'PingFang SC'`（sans）/ `'Songti SC'`（serif）系统字体，不依赖网络。`document.fonts.ready` 对系统字体立即 resolve，录制不卡
- **base64 内联图片素材**：`<img src="png/x.png">` 相对路径在 `file://` 能渲染，但要真便携（移动文件不丢图）就 base64 data URL 内联；背景大图先转 JPEG 压一下再 base64
- **构建模板化**：HTML 模板留 `__REACT__/__REACTDOM__/__ASSETS__/__ENGINE__` token + 一段 `type="text/jsx-source"` 的 app 源码，node 构建脚本读 token 注入（vendor 原样、引擎+app 过 Babel）→ 写出最终单文件。改动画只改模板重跑构建

**验证**：Playwright `page.evaluate(()=>({React:typeof window.React, Animations:typeof window.Animations}))`——两个都该是 `object`。任一 `undefined` → 对应 `<script>` 抛了错（多半是没 transpile 的 JSX）。

**和坑 #15 的关系**：#15 讲「单文件别用 `src=` 外链 `.jsx`（file:// CORS）」；本坑更进一步——连 React/Babel/字体的**远程 CDN 在受限网络下也会断**，要做到真自包含必须全内联 + 构建期 transpile。

## 快速自查清单（开工前 5 秒）

- [ ] 每个 `position: absolute` 的父元素都有 `position: relative`？
- [ ] 动画里的特殊字符（`␣` `⌘` `emoji`）都在字体里存在？
- [ ] Grid/Flex 模板的 count 和 JS 数据的 length 一致？
- [ ] 场景切换之间有 cross-fade，没有 >0.3s 的纯空白？
- [ ] DOM 测量代码包在 `document.fonts.ready.then()` 里？
- [ ] `render(t)` 是 pure 的，或有明确的 reset 机制？
- [ ] 第 0 帧是完整初始状态，不是空白？
- [ ] 画面内没有「伪 chrome」装饰（进度条/时间码/底部署名条与 Stage scrubber 撞车）？
- [ ] 动画 tick 第一帧同步设 `window.__ready = true`？（用 animations.jsx 自带；手写 HTML 自己加）
- [ ] Stage 检测 `window.__recording` 强制 loop=false？（手写 HTML 必加）
- [ ] 结尾 Sprite 的 `fadeOut` 设为 0（视频末尾停清晰帧）？
- [ ] 60fps MP4 默认用帧复制模式（兼容性），高质量插帧才加 `--minterpolate`？
- [ ] 导出后抽第 0 帧 + 末帧验证是动画初始/最终状态？
- [ ] 涉及具体品牌（Stripe/Anthropic/Lovart/...）：走完了「品牌资产协议」（SKILL.md §1.a 五步）？有没有写 `brand-spec.md`？
- [ ] 单文件交付的 HTML：`animations.jsx` 是内联的，不是 `src="..."`？（file:// 下 external .jsx 会 CORS 黑屏）
- [ ] 跨 scene 出现的元素（chapter 标签/水印/scene 编号）没有硬编码颜色？在每个 scene 底色下都可见？
- [ ] 要离线/真自包含：React+ReactDOM 本地内联、**app 和 `animations.jsx` 引擎都过 Babel transpile**、字体用系统字体？（见坑 #17；引擎含 JSX，漏 transpile 必报 `Unexpected token '<'`）
