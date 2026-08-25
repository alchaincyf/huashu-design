# Cinematic Patterns · Workflow Demo 的 Best Practice

> 从「PPT 动画」升级到「发布会级 cinematic」的 5 个关键 pattern。
> 蒸馏自 2026-04 「聊聊 skill」 deck 的两个 cinematic demo（Nuwa workflow + Darwin workflow），实测可复现。

---

## 0 · 这份文档解决什么问题

当你需要做「演示一个工作流的 demo 动画」时（典型场景：skill 工作流、产品 onboarding、API 调用流程、agent 任务执行），有两种常见做法：

| 范式 | 长什么样 | 后果 |
|---|---|---|
| **PPT 动画**（差） | step 1 fade in → step 2 fade in → step 3 fade in，4 个 box 同屏排列 | 观众感觉「就是一个 PPT 加了 fade 效果」，没有 wow moment |
| **Cinematic**（好） | scene-based，一次只 focus 一件事，scene 之间是 dissolve / focus pull / morph | 观众感觉「这是一个产品发布会片段」，会想截图分享 |

差异的根源**不是动画技术**，是**叙事范式**。本文档讲怎么从前者升级到后者。

---

## 1 · 五个核心 pattern

### Pattern A · Dashboard + Cinematic Overlay 双层结构

**问题**：单纯的 cinematic 默认是黑屏 + 一个 ▶ 按钮，用户翻到这页如果没点，什么都看不到。

**解决**：
```
DEFAULT 状态 (永远显示)：完整静态 workflow dashboard
  └── 观众一眼看清这个 skill / 工作流怎么跑

POINT ▶ 触发 (overlay 浮上来)：22 秒 cinematic
  └── 跑完自动 fade 回 DEFAULT

```

**实现要点**：
- `.dash` 默认 visible，`.cinema` 默认 `opacity: 0; pointer-events: none`
- `.play-cta` 是右下角金色小按钮（不是中央大覆盖）
- 点击 → `cinema.classList.add('show')` + `dash.classList.add('hide')`
- 用 `requestAnimationFrame` 跑一次（不是循环），结束后 `endCinematic()` reverse 状态

**反 pattern**：默认 = 中央大 ▶ overlay 覆盖一切，没点之前页面是空白的。

---

### Pattern B · Scene-based, NOT Step-based

**问题**：把动画拆成「step 1 显示 → step 2 显示 → ...」就是 PPT 思维。

**解决**：拆成 5 个 scene，每个 scene 是**独立的镜头**，全屏只 focus 一件事：

| Scene 类型 | 职责 | 时长 |
|---|---|---|
| 1 · Invoke | 用户输入触发（终端 typewriter）| 3-4s |
| 2 · Process | 核心工作流的可视化（独特视觉语言）| 5-6s |
| 3 · Result/Insight | 提炼出的关键产物（可视化）| 4-5s |
| 4 · Output | 实际产物展示（文件 / diff / 数字）| 3-4s |
| 5 · Hero Reveal | 收尾 hero moment（大字 + 价值主张）| 4-5s |

**总时长 ≈ 22 秒**——这是经过测试的黄金长度：
- 短于 18 秒：PM 还没进入状态就结束了
- 长于 25 秒：失去耐心
- 22 秒刚好够「钩住 → 展开 → 收束 → 留下印象」

**实现要点**：
- `T = { DURATION: 22.0, s1_in: [0, 0.7], s2_in: [3.8, 4.6], ... }` 全局时间轴
- 单个 `requestAnimationFrame(render)` 跑所有 scene 的 opacity / transform 计算
- 不要用 setTimeout 链（容易断掉、难调试）
- Easing 必用 `expoOut` / `easeOut` / cubic-bezier，**禁止 linear**

---

### Pattern C · 每个 demo 的视觉语言必须独立

**问题**：做完第一个 cinematic 后，做第二个时偷懒复用同一个模板（同样的 orbit + pentagon + typewriter + hero 大字），只换了文案。

**后果**：观众发现两个 skill「长得一模一样」，等于在说「这两个 skill 没区别」。

**解决**：每个工作流的核心隐喻不同，视觉语言就必须不同。

**对照案例**：

| 维度 | Nuwa（蒸馏人）| Darwin（优化 skill）|
|---|---|---|
| 核心隐喻 | 收集 → 提炼 → 写 | 循环 → 评估 → 棘轮 |
| 视觉运动 | 漂浮 / 辐射 / pentagon | 循环 / 上升 / 对比 |
| Scene 2 | 3D Orbit · 8 张档案在透视椭圆漂浮 | Spin Loop · token 沿 6 节点圆环跑 5 圈 |
| Scene 3 | Pentagon · 5 token 从中央辐射 | v1 vs v5 · 并列 diff（红版 vs 金版） |
| Scene 4 | SKILL.md typewriter | Hill-Climb · 全屏曲线绘制 |
| Scene 5 hero | 「21 分钟」serif italic 大字 | 旋转齿轮 ⚙ + 「KEPT +1.1」金色 tag |

**判断标准**：盖住文案，只看视觉，能不能区分这是哪个 demo？区分不了就是偷懒。

---

### Pattern D · 用 AI 生成的真实素材，不要 emoji 或 SVG 手画

**问题**：3D orbit / gallery 里需要素材碎片漂浮，emoji（📚🎤）丑且无品牌、SVG 手画书脊永远不像真书。

**解决**：用 `huashu-gpt-image` 跑一张 4×2 grid 大图（8 件主题相关物品 · 白底 · 60px breathing space · unified style），用 `extract_grid.py --mode bbox` 抠成 8 张独立透明 PNG。

**Prompt 要点**（详细 prompt patterns 见 `huashu-gpt-image` skill）：
- IP 锚定（"1960s Caltech archive aesthetic" / "Hearthstone-style consistent treatment"）
- 白底（便于抠图，灰底氛围好但抠透明背景困难）
- 4×2 不要 5×5（避免末行压缩 bug）
- Persona finishing（"You are a Wired magazine curator preparing an exhibition photo"）

**反 pattern**：用 emoji 当 icon、用 CSS 剪影代替产品图。

---

### Pattern E · BGM + SFX 双轨制

**问题**：只有动画没有声音，观众潜意识感觉「这玩意像个穷酸 demo」。

**解决**：BGM 长音 + 11 个 SFX cues。

**通用 SFX cue 配方**（适用于工作流 demo）：

| 时点 | SFX | 触发场景 |
|---|---|---|
| 0.10s | whoosh | 终端从下方升起 |
| 3.0s | enter | typewriter 完成、按 enter |
| 4.0s | slide-in | scene 2 元素入场 |
| 5-9s × 5 次 | sparkle | 关键过程节点（每代 / 每个 token / 每个数据点）|
| 14s | click | 切换到 output scene |
| 17.8s | logo-reveal | hero reveal 时刻 |
| typewriter | type | 每 2 字符触发一次（密度别太高）|

**频段隔离**：BGM volume 0.32（低频底噪），SFX volume 0.55（中高频 punch），sparkle 0.7（要醒目），logo-reveal 0.85（最强 hero moment）。

**用户控制**：
- 必须有 ▶ 启动覆盖（浏览器 autoplay 限制）
- 右上角小 mute 按钮（用户随时切静音）
- 不要做成「翻到这页就强制响」

---

## 2 · 静态 Dashboard 设计要点

Dashboard 是双层结构的 Layer 1，PM 不点 ▶ 也能看懂这个 skill。

**布局**：3 列 grid（或 1 大 + 2 小），每个 panel 解决一个问题：

| Panel 类型 | 解决什么问题 | 案例 |
|---|---|---|
| **Pipeline / Flow Diagram** | 「这个 skill 的工作流程是什么？」| Nuwa 4 阶段 pipeline · Darwin autoresearch loop |
| **Snapshot / State** | 「跑出来的真实数据长什么样？」| Darwin 8 维 rubric snapshot |
| **Trajectory / Evolution** | 「多次运行后怎么变化？」| Darwin 5 代 hill-climb 曲线 |
| **Examples / Gallery** | 「已经产出过哪些东西？」| Nuwa 21 personas gallery |
| **Strip · Example I/O** | 「输入什么 → 输出什么」| Nuwa example strip：`› nuwa 蒸馏 费曼 → feynman.skill (21 min)` |

**关键约束**：
- 信息密度要够（每个 panel 都要承载差异化信息）
- 但不能塞数据 slop（每个数字都要有意义）
- 配色与 cinematic 一致（同色系，方便切换不突兀）

---

## 3 · 调试与开发工具

任何长动画必须配三个 dev 工具，否则调试会爆炸。

### 工具 1 · `?seek=N` 冻结到第 N 秒

```js
const seek = parseFloat(params.get('seek'));
if (!isNaN(seek)) {
  started = true; muted = true;
  frozenT = seek;  // render() 用这个 t 而不是 elapsed
  cinema.classList.add('show'); dash.classList.add('hide');
}

// render() 里：
let t = frozenT !== null ? frozenT : (elapsed % T.DURATION);
```

用法：`http://.../slide.html?seek=12` 直接看第 12 秒画面，不用等播放。

### 工具 2 · `?autoplay=1` 跳过 ▶ overlay

方便 playwright 自动截图测试，也方便嵌入 iframe 时 force 启动。

### 工具 3 · 手动 REPLAY 按钮

右上角小按钮，用户/调试时可以重播任意次。CSS：

```css
.replay{position:absolute;top:18px;right:18px;background:rgba(212,165,116,0.1);
  border:1px solid rgba(212,165,116,0.3);color:#D4A574;
  font-family:monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;
  padding:6px 12px;border-radius:1px;cursor:pointer;backdrop-filter:blur(6px);z-index:6}
```

---

## 4 · iframe 嵌入坑（如果 cinematic 嵌在 deck 里）

### 坑 1 · 父窗口的 click zone 拦截 iframe 内按钮

如果 deck index.html 加了「左右 22vw 透明 click zone 翻页」，会**覆盖到 iframe 内的 ▶ play 按钮**——用户点按钮被吞成「下一页」。

**修复**：click zone 加 `top: 12vh; bottom: 25vh`，给顶部和底部 25% 不拦截，让 iframe 内的中央 ▶ 和右下角 ▶ 都能点。

### 坑 2 · iframe 抢焦点后键盘事件丢失

用户点过 iframe 后，焦点在 iframe 里，父窗口的 ←/→ 键盘事件收不到。

**修复**：
```js
iframe.addEventListener('load', () => {
  // 注入键盘转发器
  const doc = iframe.contentDocument;
  doc.addEventListener('keydown', (e) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, ... }));
  });
  // 点击后焦点拽回父窗口
  doc.addEventListener('click', () => setTimeout(() => window.focus(), 0));
});
```

### 坑 3 · file:// vs https:// 行为差异

本地 file:// 测好的 cinematic 部署后可能崩，因为：
- file:// 下 iframe contentDocument 同源
- https:// 下也同源（如果同 host），但 audio autoplay 限制更严格

**修复**：
- 部署前用 `python3 -m http.server` 起本地 HTTP 测试一遍
- BGM 必须等用户点击 ▶ 后再 `bgm.play()`，不要 page-load 立刻播

---

## 5 · 反 pattern 速查表

| ❌ 反 pattern | ✅ 正 pattern |
|---|---|
| 默认 = 黑屏 ▶ overlay | 默认 = 静态 dashboard，▶ 是辅助 |
| 4 个 step 横排同屏 fade in | 5 个 scene 全屏切换，每场只 focus 一件事 |
| 复用模板换文案做不同 demo | 每个 demo 独立视觉语言（盖文案能区分） |
| emoji / SVG 手画当素材 | gpt-image-2 大图 + extract_grid 抠图 |
| 无 BGM 无 SFX | BGM + 11 SFX cues 双轨制 |
| 用 setTimeout 链 schedule | requestAnimationFrame + 全局时间轴 T 对象 |
| linear 动画 | Expo / cubic-bezier easing |
| 没有 dev 工具 | `?seek=N` + `?autoplay=1` + REPLAY 按钮 |
| iframe 内的按钮被父 click zone 吞 | click zone 加 top/bottom margin 给按钮让位 |

---

## 6 · 时间预算

按这套 pattern，一个完整 cinematic demo（含 dashboard）：

| 任务 | 时间 |
|---|---|
| 设计 5-scene narrative + 视觉语言 | 30 分钟（要慎重，决定独立性）|
| Dashboard 静态布局 + 内容 | 1 小时 |
| Cinematic 5 scenes 实现 | 1.5 小时 |
| Audio cues 调时序 + replay 按钮 | 30 分钟 |
| Playwright 截图验证 5 个关键时刻 | 15 分钟 |
| **单个 demo 总计** | **3-4 小时** |

第二个 demo 复用框架但**视觉语言必须独立**，时间约 2-3 小时。
