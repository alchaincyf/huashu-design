<div align="center">

# Product Visual Design Skill

> **通用产品视觉表达 skill** — 用 HTML / SVG / PPTX 生成产品展示图、商业化 PPT、UI mockup、信息图。反 AI slop，品牌资产优先，可编辑交付。

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent-Agnostic](https://img.shields.io/badge/Agent-Agnostic-blueviolet)](https://skills.sh)
[![Skills](https://img.shields.io/badge/skills.sh-Compatible-green)](https://skills.sh)

</div>

---

## 这是什么

一个面向 agent 的产品视觉表达 skill。说一句话，agent 用 HTML / SVG / PPTX / 图片资产生产可交付的产品视觉作品。

**装给任何需要产品视觉表达能力的 agent** — Hermes、Lurk、OpenClaw、Claude Code、Cursor、Codex 等都适用。

```bash
# After merge to master
npx skills add CCandle/product-design

# Development branch (if supported by your installer)
npx skills add CCandle/product-design --ref refactor/product-visual-design-trim
```

---

## 能做什么

| 能力 | 交付物 |
|------|--------|
| 产品展示图 | HTML 页面、封面图、hero section |
| 演讲幻灯片 / HTML deck | 浏览器演示 + 可导出 PDF/PPTX |
| UI mockup（App/Web） | 设备框 html · 可交互演示 |
| 商业化视觉页面 | landing section、功能对比页、产品介绍页 |
| 信息图 / 可视化排版 | CSS Grid 精准排版 · 可导出 |
| 设计方向探索 | 2~3 个视觉方向对比 · 轻量 preview |
| 设计评审 | 5 维度评分 + Keep/Fix/Quick Wins |

### 典型 prompt

```
「做一份 AI 工具的产品介绍 PPT，推荐 2-3 个风格方向让我选」
「做一个 iOS 番茄钟 App 原型，4 个核心屏幕可交互」
「帮我设计一个项目封面图，风格偏技术感」
「做一个功能对比信息图」
「帮我对这个设计做 5 维度评审」
「检查这个页面有没有 AI slop」
```

---

## 不做什么

- ❌ **视频 / 动画成片** — 不做 MP4/GIF 导出、ffmpeg、launch film、BGM/SFX
- ❌ **语音 / 解说** — 不做 TTS、voiceover、narration、字幕节奏
- ❌ **严肃工程制图** — 不画电路图、PCB、原理图、接线图
- ❌ **科研论文图** — 不画实验数据图、Nature-style figure
- ❌ **生产级 Web App** — 不做后端、SEO 网站、完整前端工程

---

## 核心机制

### Design context first

好的设计从已有上下文长出来。开工前先找品牌规范、logo、UI 截图、参考页面。没有 context 时声明 assumptions，做 2~3 个方向让用户选。

### 品牌资产协议

涉及真实品牌时优先收集真实资产（logo / 产品图 / UI 截图 / 色板 / 字体），不 CSS 硬画、不编造不存在元素。

### 反 AI slop

不紫渐变、不 emoji 图标、不圆角左 border 套娃、不 SVG 画人脸、不编假数据填充。每条规则有「为什么」——保护品牌识别度，不是审美洁癖。

### Placeholder 诚实原则

缺真实图就标注 placeholder，缺数据就标注待提供。一个诚实的 placeholder 比拙劣的假实现好 10 倍。

---

## 媒介意识

- 做 PPT 就是 PPT（横屏 1920×1080，一页一个主题）
- 做 App mockup 就是 App（设备框，可交互）
- 做产品图就要有主视觉焦点
- 做信息图要有视觉层级

---

## 仓库结构

```
product-visual-design/
├── SKILL.md                 # 主文档（给 agent 读）
├── README.md                # 本文件
├── README.en.md             # 英文 README
├── package.json             # 依赖：playwright / pptxgenjs / pdf-lib / sharp
├── assets/                  # Starter Components
│   ├── ios_frame.jsx        # iPhone 15 Pro bezel
│   ├── android_frame.jsx
│   ├── macos_window.jsx
│   ├── browser_window.jsx
│   ├── deck_index.html      # 多文件 deck 拼接器
│   ├── deck_stage.js        # 单文件 deck 引擎
│   ├── design_canvas.jsx    # 并排变体展示
│   ├── animations.jsx       # 轻量时间轴动效（仅 HTML 微交互）
│   └── showcases/           # 24 个预制样例（8 场景 × 3 风格）
├── references/              # 按任务深入读的子文档
├── scripts/                 # PPT/PDF 导出、截图验证
└── archive/
    ├── legacy-demos/        # 旧版 demo（视觉参考，不作为当前能力）
    └── legacy-references/   # 旧版 references（不参与当前 skill 路由）
```

---

## License

MIT License — 自由使用、修改、分发，包括商业用途。

---

## 起源

这个 skill 由 `huashu-design` 裁剪重构而来。原始版本覆盖了视频/音频/发布片等能力，此版本聚焦纯产品视觉表达，移除了所有视频 pipeline、音频系统、TTS/voiceover 和 launch film 流程。
