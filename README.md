# 花叔Design · Huashu-Design

![花叔Design Brand Film](./demo/huashu-design-brand.gif)

> 25 秒品牌片由本 skill 自己完成：Junior Designer 工作流 → 3 个方向假设 → 用户选 → variations → 五维评审 → 一键导出。
> **[下载 MP4（60fps, 2.2MB）](./demo/huashu-design-brand.mp4)** · [25fps 版](./demo/huashu-design-brand-25fps.mp4)

把「AI 当设计师」落到实处的 Skill。

不是让 AI 生成一张图，而是让 AI 进入「资深 Junior Designer」的工作模式：先给假设 + 占位 + 理由，show 给 manager 看，得到方向反馈，再做 variation，再迭代细节。最后还能请一位「严苛评审」打分。

适用于任何支持 Skill 规范的 AI agent：Claude Code、Codex、Cursor、Trae、OpenClaw、Hermes Agent 等。

---

## 它能做什么

一条 skill 同时覆盖四件事：

1. **高保真 HTML 视觉产出**
   交互原型、App / iOS mockup、幻灯片、动画 Demo、设计变体探索、信息图 —— 用 HTML 做，而不是用 Figma 截图或 placeholder 拼贴。

2. **设计方向顾问（Fallback）**
   当你的需求只是「给我做个好看的页面」时，skill 会从 5 个流派、20 种设计哲学里推荐 3 个差异化方向（信息建筑派 / 运动诗学派 / 极简主义派 / 实验先锋派 / 东方哲学派），再并行生成 3 个视觉 Demo 让你挑。

3. **Junior Designer 工作流**
   不直接闷头做大招。先写 assumptions + reasoning + placeholder，尽早 show；方向错了，晚改比早改贵 100 倍。

4. **专家级评审**
   交付后可选一轮 5 维度评分（哲学一致性 / 视觉层级 / 细节执行 / 功能性 / 创新性），外加具体的 Quick Fixes 清单。

---

## 附带的工程工具链

- **Starter Components**：iOS / Android / macOS / Browser 的设备边框，design_canvas（变体画布），animations.jsx（Stage + Sprite 时间轴引擎），deck_stage.js（幻灯片外壳）。
- **视频导出**：HTML 动画一键导出 25fps MP4 → 60fps 插帧 MP4 → palette 优化 GIF，配 6 首场景化 BGM（科技 / 广告 / 教育 / 教程）自动 fade。
- **幻灯片导出**：HTML → PDF（矢量）/ PPTX（图片铺底）。
- **Playwright 验证**：截图 + 控制台错误检查，交付前跑一遍。

---

## 安装

把整个目录放到你 agent 读取 skills 的位置即可。

**Claude Code**：

```bash
git clone https://github.com/alchaincyf/huashu-design-skill.git ~/.claude/skills/huashu-design
```

**其他 agent**（Codex / Cursor / Trae / OpenClaw / Hermes Agent 等）：按各自的 skills 约定放置，SKILL.md 的 frontmatter + markdown 结构是通用的。

安装完成后，用任意包含触发词的话开启：

> 「做个 iOS App 原型」「帮我做 pitch deck」「导出 MP4」「评审这个设计」「做个好看的页面（我没想法）」

触发词完整清单见 `SKILL.md` frontmatter 的 description 字段。

---

## 使用前需要自己配置的东西

大部分能力开箱即用，下面几项在需要时再弄：

| 能力 | 需要 |
|------|------|
| 视频导出 | `npm i -g playwright` + `brew install ffmpeg`（或等价方案） |
| 幻灯片导出 PDF | `npm i -g playwright pdf-lib` |
| 幻灯片导出 PPTX | `npm i -g playwright pptxgenjs` |
| Playwright 截图验证 | `npm i -g playwright` |
| 个人品牌锚定（可选） | 复制 `assets/personal-asset-index.example.json` 到你的 agent 私有 memory 目录并填真实信息 |

---

## 目录结构

```
huashu-design-skill/
├── SKILL.md                       # 主干文件：哲学 + 工作流 + 路由表
├── references/                    # 深度参考：按需加载
│   ├── workflow.md                # 开工问什么问题
│   ├── content-guidelines.md      # 反 AI slop 完整清单
│   ├── react-setup.md             # React + Babel 最佳实践
│   ├── slide-decks.md             # 幻灯片架构
│   ├── animations.md              # 动画引擎用法
│   ├── animation-pitfalls.md      # 动画踩坑 + T0 黑屏修复
│   ├── tweaks-system.md           # 实时调参 UI
│   ├── design-context.md          # 没有 design system 怎么办
│   ├── design-styles.md           # 20 种设计哲学
│   ├── scene-templates.md         # 按输出类型的场景模板
│   ├── critique-guide.md          # 评审打分标准
│   ├── verification.md            # 产出验证流程
│   └── video-export.md            # 视频导出命令链
├── scripts/                       # 可执行脚本
│   ├── render-video.js            # HTML → 25fps MP4
│   ├── convert-formats.sh         # 25fps MP4 → 60fps MP4 + GIF
│   ├── add-music.sh               # BGM 叠加 + 自动 fade
│   ├── export_deck_pdf.mjs        # HTML → PDF
│   ├── export_deck_pptx.mjs       # HTML → PPTX
│   └── verify.py                  # Playwright 截图 + 控制台检查
└── assets/                        # 起手组件 + BGM + 示例
    ├── deck_stage.js              # 幻灯片外壳（单文件架构）
    ├── deck_index.html            # 幻灯片拼接器（多文件架构）
    ├── animations.jsx             # Stage + Sprite 时间轴引擎
    ├── design_canvas.jsx          # 变体画布
    ├── ios_frame.jsx              # iPhone 设备边框
    ├── android_frame.jsx          # Android 设备边框
    ├── macos_window.jsx           # macOS 窗口 chrome
    ├── browser_window.jsx         # 浏览器 chrome
    ├── bgm-{tech,ad,educational,tutorial,*-alt}.mp3
    ├── personal-asset-index.example.json
    └── showcases/                 # 24 个预制 showcase（8 场景 × 3 风格）
```

---

## 设计原则（写进 DNA 的五条）

1. **从 existing context 出发**，不凭空画 hi-fi。没有 design system / brand / Figma 就先找，真没有就明确告知「我会基于通用直觉做」。
2. **Junior Designer 模式**：先 show 假设，再执行。不要一头扎进去闷头做大招。
3. **给 variations，不给最终答案**。3+ 个变体，跨视觉 / 交互 / 色彩 / 布局 / 动画维度递进，让用户 mix and match。
4. **Placeholder > 烂实现**。没图标就留灰色方块 + 文字标签，不画烂 SVG；没数据不编造假数据。
5. **反 AI slop**：激进渐变、满屏 emoji、圆角卡片 + 左 accent border、SVG 画人画物、Inter / Roboto 填所有文字 —— 每一条都是默认避开项（用户可按品牌 override）。

完整哲学和工作流见 `SKILL.md`。

---

## BGM 版权说明

`assets/bgm-*.mp3` 为原创 / 授权音乐，仅限配合本 skill 生成的演示 / 宣传视频使用。商业投放前请确认你的素材来源许可；若替换成自己的 BGM，只需保留相同文件名或改脚本参数。

---

## License

MIT。自由 fork、魔改、开分支。PR 欢迎，尤其欢迎：

- 新的设计哲学流派（在 `references/design-styles.md` 里）
- 新的 scene template（在 `references/scene-templates.md` 里）
- 新的 showcase（在 `assets/showcases/` 里）
- 其他 agent 环境的适配笔记（尤其欢迎 Codex / Cursor / Trae 的使用报告）

---

## 致谢

- Skill 规范：Anthropic Claude Code
- 设计哲学蒸馏：Pentagram、Field.io、Kenya Hara、Stefan Sagmeister、Dieter Rams、Massimo Vignelli 等 20 位设计师 / 机构
- 工程实践：Remotion / After Effects（Stage + Sprite 思路）、Playwright（验证 + 录制）、ffmpeg（视频后处理）
- 灵感来源：AI Artifacts 原生设计能力 → 搬到 Skill 架构 → 跨 agent 可用
