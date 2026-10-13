# Design Philosophy Showcases — 样例资产索引

> 8 种场景 × 3 种风格 = 24 个预制设计样例
> 用于 Phase 3 推荐设计方向时，直接展示「这个风格做出来长什么样」

## 风格说明

| 代号 | 流派 | 风格名称 | 视觉气质 |
|------|------|---------|---------|
| **Pentagram** | 信息建筑派 | Pentagram / Michael Bierut | 黑白克制、瑞士网格、强字体层级、#E63946红色强调 |
| **Build** | 极简主义派 | Build Studio | 奢侈品级留白(70%+)、微妙字重(200-600)、#D4A574暖金、精致 |
| **Takram** | 东方哲学派 | Takram | 柔和科技感、自然色(米色/灰/绿)、圆角、图表如艺术 |

## 场景速查表

### 内容设计场景

| # | 场景 | 规格 | Pentagram | Build | Takram |
|---|------|------|-----------|-------|--------|
| 1 | 公众号封面 | 1200×510 | `cover/cover-pentagram` | `cover/cover-build` | `cover/cover-takram` |
| 2 | PPT数据页 | 1920×1080 | `ppt/ppt-pentagram` | `ppt/ppt-build` | `ppt/ppt-takram` |
| 3 | 竖版信息图 | 1080×1920 | `infographic/infographic-pentagram` | `infographic/infographic-build` | `infographic/infographic-takram` |

### 网站设计场景

| # | 场景 | 规格 | Pentagram | Build | Takram |
|---|------|------|-----------|-------|--------|
| 4 | 个人主页 | 1440×900 | `website-homepage/homepage-pentagram` | `website-homepage/homepage-build` | `website-homepage/homepage-takram` |
| 5 | AI导航站 | 1440×900 | `website-ai-nav/ainav-pentagram` | `website-ai-nav/ainav-build` | `website-ai-nav/ainav-takram` |
| 6 | AI写作工具 | 1440×900 | `website-ai-writing/aiwriting-pentagram` | `website-ai-writing/aiwriting-build` | `website-ai-writing/aiwriting-takram` |
| 7 | SaaS落地页 | 1440×900 | `website-saas/saas-pentagram` | `website-saas/saas-build` | `website-saas/saas-takram` |
| 8 | 开发者文档 | 1440×900 | `website-devdocs/devdocs-pentagram` | `website-devdocs/devdocs-build` | `website-devdocs/devdocs-takram` |

> 每个条目同时有 `.html`（源码）和 `.png`（截图）两个文件

## 使用说明

### Phase 3 推荐时引用
推荐设计方向后，可展示对应场景的预制截图：
```
「这是 Pentagram 风格做公众号封面的效果 → [展示 cover/cover-pentagram.png]」
「Takram 风格做 PPT 数据页是这种感觉 → [展示 ppt/ppt-takram.png]」
```

### 场景匹配优先级
1. 用户需求的场景有精确匹配 → 直接展示对应场景
2. 无精确匹配但类型相近 → 展示最近似的场景（如「产品官网」→ 展示 SaaS 落地页）
3. 完全不匹配 → 跳过预制样例，直接进 Phase 3.5 现场生成

### 横向对比展示
同一场景的 3 个风格适合并排展示，帮助用户直观比较：
- 「这是同一个公众号封面，分别用 3 种风格实现的效果」
- 展示顺序：Pentagram（理性克制）→ Build（奢华极简）→ Takram（柔和温暖）

## 内容详情

### 公众号封面（cover/）
- 内容：Claude Code Agent 工作流 — 8 个并行 Agent 架构
- Pentagram：巨大红色「8」+ 瑞士网格线 + 数据条
- Build：超细字重「Agent」悬浮于 70% 留白中 + 暖金细线
- Takram：8 节点放射状流程图作为艺术品 + 米色底

### PPT数据页（ppt/）
- 内容：GLM-4.7 开源模型 Coding 能力突破（AIME 95.7 / SWE-bench 73.8% / τ²-Bench 87.4）
- Pentagram：260px「95.7」锚点 + 红/灰/浅灰对比条形图
- Build：三组 120px 超细数字悬浮 + 暖金渐变对比条
- Takram：SVG 雷达图 + 三色叠加 + 圆角数据卡片

### 竖版信息图（infographic/）
- 内容：AI 记忆系统 CLAUDE.md 从 93KB 优化到 22KB
- Pentagram：巨大「93→22」数字 + 编号区块 + CSS 数据条
- Build：极致留白 + 柔影卡片 + 暖金连接线
- Takram：SVG 环形图 + 有机曲线流程图 + 毛玻璃卡片

### 个人主页（website-homepage/）
- 内容：独立开发者 Alex Chen 的作品集首页
- Pentagram：112px 大名 + 瑞士网格分栏 + 编辑数字
- Build：玻璃态导航 + 悬浮统计卡片 + 超细字重
- Takram：纸质纹理 + 小圆形头像 + 发丝细分隔线 + 不对称布局

### AI导航站（website-ai-nav/）
- 内容：AI Compass — 500+ AI 工具目录
- Pentagram：方角搜索框 + 编号工具列表 + 大写分类标签
- Build：圆角搜索框 + 精致白色工具卡片 + 药丸标签
- Takram：有机错位卡片布局 + 柔和分类标签 + 图表式连接

### AI写作工具（website-ai-writing/）
- 内容：Inkwell — AI 写作助手
- Pentagram：86px 大标题 + 线框编辑器模型 + 网格特性列
- Build：漂浮编辑器卡片 + 暖金 CTA + 奢华写作体验
- Takram：诗意衬线标题 + 有机编辑器 + 流程图

### SaaS落地页（website-saas/）
- 内容：Meridian — 商业智能分析平台
- Pentagram：黑白分栏 + 结构化仪表盘 + 140px「3x」锚点
- Build：悬浮仪表盘卡片 + SVG 面积图 + 暖金渐变
- Takram：圆角柱状图 + 流程节点 + 柔和地球色

### 开发者文档（website-devdocs/）
- 内容：Nexus API — 统一 AI 模型网关
- Pentagram：左侧导航栏 + 方角代码块 + 红色字符串高亮
- Build：居中漂浮代码卡片 + 柔影 + 暖金图标
- Takram：米色代码块 + 流程图连接 + 虚线特性卡片

## 文件统计

- HTML 源文件：24 个
- PNG 截图：24 个
- 总资产：48 个文件

---

**版本**：v1.0
**创建日期**：2026-02-13
**适用于**：design-philosophy skill Phase 3 推荐环节
