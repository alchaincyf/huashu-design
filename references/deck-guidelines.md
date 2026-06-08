# Deck Guidelines（HTML 幻灯片规范）

HTML deck 是本 skill 对幻灯片任务的默认基础产物。本文件是精简版，详细制作规范见 `references/slide-decks.md`。

## 默认交付形态

- **HTML deck** 始终是基础产物（浏览器直接开、键盘翻页）
- PDF/PPTX 是衍生物，不作为默认交付要求
- 永远不要为 PPTX 兼容牺牲 HTML 设计质量

## 架构选择

| 场景 | 架构 | 交付 |
|------|------|------|
| 5 页及以上 | 多文件 + `assets/deck_index.html` 聚合 | 默认 |
| 5 页及以下极简 pitch | 单文件 `assets/deck_stage.js` | 特例 |
| 需要跨页共享 JS 状态 | 单文件 | 特例 |

## 每页规范

- 每页独立 `<section>`，尺寸 1920×1080
- **不写竖向平铺长页**——给 deck 不是 scroll landing page
- 每页内容不自带页码（由 deck 外壳统一承载）
- 字号 >= 24px（投影观看）

## 导出

- PDF：`scripts/export_deck_pdf.mjs`
- PPTX（可编辑）：`scripts/export_deck_pptx.mjs`（需 HTML 符合 4 条硬约束，见 `references/editable-pptx.md`）

## 禁止

- ❌ 嵌入视频、音频、voiceover
- ❌ 做 cinematic demo 嵌入 deck
- ❌ 为导出 PPTX 限制 HTML 设计自由度
- ❌ 在 deck 内嵌入 BGM/SFX
