# Launch Film 工作流：先写万字 director's notes，再做动画

> 高规格视觉作品（≥ 20 秒、含品牌叙事、含 slogan reveal、可能上 X / 公众号 / B 站推广）的标准工作流。
>
> 触发条件：任务是「产品升级宣传片 / 品牌 launch film / launch trailer / superbowl-tier ad / brand campaign / hero animation video」，且**用户对质量有明确预期**（如「超级碗品质感」「10x 细节」「Apple 级别」）。
>
> 反触发：不要在「快速做个动画 demo」「简单 motion graphic」「单个图标动画」时用这条流程——会过度工程化。

---

## 1. 为什么先写 director's notes

实战教训（2026-05-11 huashu-md-html v2.0 项目）：

第一轮直接动手写 HTML，产出的是「程序员视角的动画」——每个 capability 平均用力、节奏匀速、slogan 撞在一起、缺少叙事弧。
第二轮接到用户「停下，先按苹果导演视角写 1 万字分镜脚本」的指令，写了 v5-director-notes.md（11500 字、13 镜 shot-by-shot spec），然后按脚本实施——一次过、每帧 pause 都耐看、节奏起伏有 climax。

**核心差异**：写脚本是 think，写 HTML 是 execute。先 think 透了，execute 就是机械翻译。先 execute，每个 shot 都是临场决策，必然乱。

写 director's notes 不是「装」，是把所有视觉决策**在动手之前**沉淀成文档——每一镜都已经在脑里 visualize 过、reasoning 过、和上下文 trace 过。HTML 实施时不需要再做创意决策，只需要忠实翻译。

---

## 2. 触发判断（先问自己 3 个问题）

启动 launch film 工作流前问：

1. **这支片承担品牌叙事吗？**（有 thesis / slogan reveal / 升级仪式感）—— 是 → 走 director's notes 流程
2. **观众会暂停看吗？**（可能截图、做 X 海报、做封面、慢速 review）—— 是 → 每帧要耐看
3. **客户/用户有「我希望像 XXX 那样」的参照？**（Apple / Anthropic / Nike / Penguin / 某导演）—— 是 → 必须明确视觉语境

任一为「是」就走流程。三个都「否」就跳过，直接用 [animations.md](animations.md) 的标准流程。

> 🔴 **前置门（先于本流程）**：launch film 也必须先过 SKILL.md 的三方向硬门——每方向一张「方向板」（hero 关键帧真实静帧 + 色板 + 气质句 + 参照），用户选定方向后，万字 director's notes 才围绕选定方向展开。指定了「Apple 级」等风格词不豁免（2026-07-18 HuaStudio 实锤）。

---

## 3. Director's Notes 的 5 大部分结构

万字（10000-12000 字中文 / 等量英文）director's notes 必须包含这 5 大部分。**任一部分缺失都属于不完整，质量会受影响**。

### Part I · Director's Statement（创作论，约 1500-2000 字）

回答 5 个问题：

1. **这部片不是什么？**（明确排除——如「这不是功能介绍片」「不是 demo」）
2. **核心 thesis 一行**——观众看完只记一句话是哪句？
3. **跟谁的语境对话？**——列出 5-8 个视觉参照（导演 / 设计师 / 品牌 / 摄影师 / 作品名 + 年份），说明每个参照学了什么
4. **三类观众画像 + 对每类的承诺**：主受众 / 次受众 / 外受众，各对应一段
5. **节奏哲学**——慢拍 / 加速 / 顶峰 / 缓收的曲线说明 + emotional climax 在第几秒（**不一定是最后一秒**）

最后加一段 anti-slop checklist：**这部片不做的事**（具体列出，不模糊）。

### Part II · Visual System（视觉系统全谱，约 1500-2500 字）

这是工程化的视觉 spec。完整后任何执行者拿到都能产出一致的视觉。

必含子节：

- **完整色板**：至少 8-10 色，每色含 HEX + 功能定义 + 占画面比例上限
- **字体系统**：至少 6 个字号层级，每层级含字体名 + weight + size + letter-spacing + 用途
- **网格系统**：画布尺寸 + 外边距 + column grid + baseline grid + 关键安全区 + 黄金分割锚点
- **动画系统**：easing 库（4 条以内）+ duration 字典 + stagger 法则 + scene 过渡规则
- **Chrome 元素**：贯穿全片的小细节（counter / chip / ticker / watermark / texture），每个含位置 + 入退场时机
- **音频系统**：BGM 30 秒走向曲线（分层）+ SFX 字典（10+ cues 含时间码 + 音量 + 频段隔离）
- **反 AI slop checklist**：per-shot 自检表（10-15 项）

铁律：**所有视觉决策都从 Visual System 推导，不要在 shot list 里临时发明新值**。

### Part III · Story Arc（故事弧，约 500-800 字）

三幕结构 + 情绪曲线：

- **Act I · SETUP**（0 → 第 1/5 时长，e.g. 0-6s for 30s）：观众进入，问题被提出
- **Act II · ESCALATION**（中间 2/3）：答案展开，主题铺陈
- **Act III · PAYOFF**（最后 1/4）：升华、slogan reveal、品牌印章

含 ASCII 情绪曲线图 + emotional climax 时刻标记。

**关键决策**：climax 不一定在末尾。30s 片子 climax 通常在 22-25s（不是 29s）——最后几秒是 resolution / decay，不是 peak。这条规则违反必然让作品「虎头蛇尾」。

### Part IV · Shot-by-Shot Storyboard（分镜脚本，约 5000-7000 字 · 占 60% 篇幅）

每镜含 11 个字段（缺一不可）：

```
SHOT NN · NAME
[TIMECODE]    起止时间 + 时长
[FUNCTION]    这一镜在故事弧中的功能（一句话）
[VISUAL]      画面构图 + 元素位置 + 运动方向
[CAMERA]      景别（远/全/中/近/特，对应 zoom 档位）+ 运镜动作 + 一句动机；「静止」也要写为什么静止；push-in 必须写具象锚点（词汇与预算见 camera-language.md，景别体系见 storyboard-basics.md §3）
[TYPE]        排版 spec（字体 / 字号 / 字距 / 行高 / 颜色 / 对齐）
[ANIM]        每元素 in/out 时机 + easing + duration + stagger + delay
[AUDIO]       music beat + SFX cue（每镜对应 BGM 节奏 + 必含 SFX 时间表）
[CHROME]      四角元素状态（哪些 chrome 在 / 哪些 fade in/out / 哪个 pulse）
[ANTI-SLOP]   这一镜通过了哪些自检项 + 有什么 120% 细节签名
[WHY]         承接上一镜的逻辑 + 推进下一镜的钩子
```

**字段平均 30-80 字 → 每镜 400-700 字 → 12-15 镜 → 5000-7000 字**。

实战经验：写完 storyboard 后**自己读一遍**——任意一镜删掉，整支片是否还成立？如果可以删，那镜就是多余的，删掉。

### Part V · Production Manifest（制作清单，约 800-1200 字）

工程交付清单：

- 字体加载 URL（含 preconnect）
- CSS 变量（直接可粘贴）
- BGM 来源选择标准 + Suno/Udio prompt 关键词 + 备选库
- SFX 字典（按时间码逐 cue 列出文件路径 + 音量）
- **关键帧验证计划**：12-15 张 pause-and-check 关键帧时间码，每帧验证项列出（fonts / positions / chrome state）
- 录制参数（fps / codec / bitrate / preset）
- ffmpeg 音频混合命令（含 audio stream 验证）
- 交付物清单（mp4 / mp4-60fps / gif / poster.png / silent.mp4 / shot-list.csv）
- 全链路时间估算（小时级精度）

---

## 4. 写 director's notes 的 5 条建议

**4.1 用导演的口吻，不用 PM 的口吻**

❌「This shot displays the product features.」
✅「This is the hero shot — if the audience pauses anywhere, I want it to be here.」

导演笔记是给执行者读的，但也是给未来的自己读的。第一人称 + judgment 表达比 description 表达留更多决策线索。

**4.2 引用具体作品（含年份），不只是流派名**

❌「Apple-inspired」
✅「Apple 'Designed by Apple in California' (2013, dir. Mark Romanek) — 学的是慢拍 + 衬线 + 大白底」

引用具体作品的好处：(a) 任何观众都能上网搜到对照 (b) 你逼自己想清楚学的是什么具体技术 (c) 防止「灵感模糊」。

**4.3 每个决策都 trace 回 first principle**

整支片有一句 first principle（如 "Markdown is the new typewriter."）。每个具体决策——配色 / 字体 / 节奏 / chrome——都要能 trace 回这句话。

trace 不上的决策就是装饰，删掉。

**4.4 写 anti-slop 比写 do-this 更重要**

「这部片不做的事」清单（紫渐变 / emoji / Lorem ipsum / Inter display / SVG 画人物 / 圆角卡 + 左 border accent）比「这部片做的事」清单更能保护质量。

正向决策无穷多，负向 checklist 是有限的——但负向 checklist 一旦违反就是 slop。

**4.5 写完不要立即实施——隔 30 分钟再读一遍**

写作时大脑在「生产模式」，看不见 inconsistency。隔 30 分钟读自己写的 storyboard，会发现：
- 某两镜功能重复（删一个）
- 某镜叙事跳跃太大（加过渡）
- emotional climax 位置错（移动）
- chrome 元素和 shot 数量不匹配（重新对齐）

这 30 分钟省下的是后期 2 小时的返工。

---

## 5. Director's Notes → HTML 实施流程

写完 director's notes 后，HTML 实施步骤：

1. **复用 starter components**（`assets/animations.jsx` 的 Stage/Sprite/Easing/interpolate）— 不重新发明
2. **CSS 变量直接从 Visual System Part II 粘贴** — 不在 HTML 里临时改色
3. **按 Sprite start/end 时间轴对照 Part IV 时间码** — 不擅自加镜
4. **chrome 元素抽成独立组件**（ChromeA/B/C/D），用 useTime() 驱动状态切换
5. **destination cards 内容必须真实可读**（不是 fake bar lines）—— 这是 v5 项目里最被反复提及的 120% 细节签名
6. **每写完一镜就立即截关键帧验证**（用 `?t=NN` URL 参数 + Playwright），不要写完全片再统一验证

---

## 6. 关键帧验证流程

URL 参数实现（必须在 Stage 组件加）：

```js
const urlMatch = window.location.search.match(/[?&]t=([\d.]+)/);
const frozenTime = urlMatch ? parseFloat(urlMatch[1]) : null;
const [time, setTime] = useState(frozenTime != null ? frozenTime : 0);
const [playing, setPlaying] = useState(frozenTime == null);
```

→ 这样 `file:///path/animation.html?t=14.5` 直接 freeze 在 14.5 秒。

批量截图：

```bash
for t in 0.5 2.5 4.9 7.0 10.5 13.5 16.5 19.0 21.5 23.4 25.5 28.0 29.9; do
  npx -y playwright screenshot \
    "file://$PWD/animation.html?t=$t" \
    "keyframes/t-$t.png" \
    --viewport-size=1920,1136 \
    --wait-for-timeout=2500
done
```

每张截图必须验证：
- [ ] 元素无溢出 1920×1080 canvas
- [ ] 字距、行高 visually correct（不挤、不散）
- [ ] 关键 typography 细节（句点颜色 / em-dash / italic / small caps）可识别
- [ ] chrome 元素位置 + 状态正确
- [ ] 反 AI slop checklist 通过
- [ ] 「pause 时值得看」的 120% 细节存在

---

## 7. 多视角并行策略（advanced）

复杂项目（如 launch film 选不出方向 / 想看多个美学差异 / 客户没拍板风格）可以**启动多个 subagent 并行做不同导演视角的版本**。

实战配置（2026-05-11 huashu-md-html 项目，并行 6 个版本）：

```
v5  · 基线（Anthropic / Penguin Classics 出版社品位）
v5a · Wes Anderson（对称 + 复古 + 章节卡片）
v5b · Saul Bass（剪纸 + 60s 大字 + 几何切割）
v5c · 王家卫（中文衬线 + 慢动作 + 怀旧）
v5d · Massimo Vignelli（现代主义 grid + 红黑）
v5e · 原研哉 Kenya Hara（极简日式 + 留白）
v5f · 草间彌生 Yayoi Kusama（圆点 + 重复 + 单一强色）
```

每个 subagent 接到独立 brief：
- 项目背景（同一份）
- 必读参考（同一份 v5-director-notes.md 作为方法论模板）
- **指定的艺术家 DNA**（色板 / 字体 / 视觉语言 / 节奏 / 招牌元素 / 反 slop 强化版本，每条 30-50 字）
- 统一任务清单（director-notes.md + animation.html + keyframes/ + README.md）
- 统一约束（30s / 1920×1080 / file:// / Google Fonts）

并行启动 + 后台运行，约 30-60 分钟出 6 套完整版本。

完成后审校对比：
1. 各版本核心美学决策表
2. 关键帧并排对比（每版同时刻一帧）
3. 投票：哪个最贴合用户的真实需求

**关键**：不要让 subagent 之间相互参考——它们必须独立产出，否则就会撞到「平均值」。每个 subagent 的指令里要明说「不要重复 v5 的美学」。

---

## 8. 触发的几种典型场景

| 用户场景 | 是否触发 | 备注 |
|---------|---------|------|
| 「做个 SaaS 升级宣传片」 | ✅ 触发 | 默认走完整流程 |
| 「Apple 级别 / 超级碗品质感的视频」 | ✅ 触发 + 升级 | 强力推荐多视角并行 |
| 「30 秒品牌 launch film」 | ✅ 触发 | |
| 「这个项目 1 万字脚本再做动画」 | ✅ 触发 | 用户明确指明 |
| 「简单 motion graphic，logo 转一下」 | ❌ 不触发 | 用 animations.md 标准流程 |
| 「做个 onboarding 动画 demo」 | ❌ 不触发 | 用 animations.md |
| 「教程视频带配音」 | ❌ 不触发 | 走 voiceover-pipeline.md |
| 「单个 hero animation」 | ⚠️ 看复杂度 | 如果是高规格 hero，触发；普通 hero 用 hero-animation-case-study.md |

---

## 9. 参考样本

完整 director's notes 参考样本（self-contained，本 skill 内）：

`assets/director-notes-samples/launch-film-30s-sample.md`（约 78KB · 11500 字 · 13 镜 · 5 大部分齐全）

原始项目位置（含对应实施 HTML + 关键帧）：

- v5-director-notes.md（director's notes，作者本地，未随仓库分发）
- v5-six-forms.html（HTML 实施，作者本地，未随仓库分发）
- v5-keyframes/（关键帧验证截图，作者本地，未随仓库分发）

写新项目时强烈建议**先 Read 这份样本**，理解工作量和细节密度，再决定要不要全套走流程。

---

## 10. 反模式（不要这样做）

❌ **写 1000 字的精简版 director's notes 就动手**
→ 精简版必然漏 Visual System 的某个子项，导致 HTML 实施时不停回头补 spec。要做就做万字级，要省就直接跳过。

❌ **storyboard 只写 5-8 镜**
→ 30 秒片至少 12-15 镜（每镜 2-3 秒）。镜少 = 节奏匀速 = 没 climax。

❌ **director's notes 写完就交付，不做实施**
→ 文档不是交付物，动画才是。文档 + 动画一起交付，文档作为「设计依据」附录。

❌ **多视角并行时让 subagent 看其他版本**
→ 各 subagent 必须独立，否则趋同。审校阶段才对比。

❌ **跳过关键帧验证直接录 MP4**
→ 必然返工。关键帧验证是最便宜的 quality gate。

❌ **把动画细节决策推迟到「等我录的时候再想」**
→ 录制阶段是机械执行，不能做创意决策。所有决策必须在 director's notes 写死。

---

*最后修订：2026-05-11*
*真实案例：huashu-md-html v2.0 launch film（v5-director-notes.md）*
