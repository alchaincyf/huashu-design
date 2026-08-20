# 场景模板库：按输出类型组织

> 与 design-styles.md 的「提示词DNA」组合使用。
> 公式：`[风格提示词DNA] + [场景模板] + [具体内容描述]`

---

## 1. 公众号封面 / 文章题图

**规格**：
- 封面图：2.35:1（900×383px 或 1200×510px）
- 正文插图：16:9（1200×675px）或 4:3（1200×900px）

**关键设计要素**：
- 视觉冲击力优先（用户在信息流中快速扫过）
- 文字极少或无文字（公众号标题会覆盖在上面）
- 色彩饱和度适中（微信阅读环境偏白）
- 避免过度细节（缩略图也要可辨识）

**推荐风格**：01 Pentagram / 11 Build / 12 Sagmeister / 18 Kenya Hara / 07 Field.io

**场景提示词模板**：
```
[风格DNA插入此处]
- Article cover image for WeChat subscription
- Landscape format, 2.35:1 aspect ratio
- Bold visual impact, minimal or no text
- Moderate color saturation for white reading environment
- Must remain recognizable as thumbnail
- Clean composition with clear focal point
```

---

## 2. 正文配图 / 概念插画

**规格**：
- 16:9（1200×675px）最通用
- 1:1（800×800px）适合强调
- 4:3（1200×900px）适合信息密集

**关键设计要素**：
- 服务于文章论点，不是装饰
- 与上下文形成视觉节奏
- 简洁表达一个核心概念
- AI生成优先，HTML截图仅在精确数据表格时用

**推荐风格**：根据文章调性选择，常用 01/04/10/17/18

**场景提示词模板**：
```
[风格DNA插入此处]
- Article illustration, concept visualization
- [16:9 / 1:1 / 4:3] aspect ratio
- Single clear concept: [描述核心概念]
- Serve the argument, not decoration
- [Light/Dark] background to match article tone
```

---

## 3. 信息图 / 数据可视化

**规格**：
- 竖版长图：1080×1920px（手机阅读）
- 横版：1920×1080px（文章内嵌）
- 方形：1080×1080px（社交媒体）

**关键设计要素**：
- 信息层级清晰（标题 → 核心数据 → 细节）
- 数据准确，不编造
- 视觉引导线（用户阅读路径）
- 适当使用图标/图表辅助理解

**推荐风格**：04 Fathom / 10 Müller-Brockmann / 02 Stamen / 17 Takram

**场景提示词模板**：
```
[风格DNA插入此处]
- Infographic / data visualization
- [Vertical 1080x1920 / Horizontal 1920x1080 / Square 1080x1080]
- Clear information hierarchy: title → key data → details
- Visual flow guiding reader's eye path
- Icons and charts for comprehension
- Data-accurate, no decorative distortion
```

---

## 4. PPT / Keynote 演示

**规格**：
- 标准：16:9（1920×1080px）
- 宽屏：16:10（1920×1200px）

**关键设计要素**：
- 每页一个核心信息（不堆砌）
- 字号层级明确（标题40pt+ / 正文24pt+ / 注释16pt+）
- 大量留白，投影时更清晰
- 图文比例至少 60:40
- 一致的视觉系统（颜色、字体、间距）

**推荐风格**：01 Pentagram / 10 Müller-Brockmann / 11 Build / 18 Kenya Hara / 04 Fathom

**场景提示词模板**：
```
[风格DNA插入此处]
- Presentation slide design, 16:9
- One core message per slide
- Clear type hierarchy (title 40pt+, body 24pt+)
- Generous whitespace for projection clarity
- Consistent visual system throughout
- [Light/Dark] theme
```

---

## 5. PDF 白皮书 / 技术报告

**规格**：
- A4 纵向（210×297mm / 595×842pt）
- Letter 纵向（216×279mm / 612×792pt）

**关键设计要素**：
- 长文阅读优化（行宽66字符、行高1.5-1.8）
- 清晰的章节导航系统
- 页眉/页脚/页码的统一设计
- 图表与正文的优雅共存
- 引用/注释系统
- 封面页设计精致

**推荐风格**：10 Müller-Brockmann / 04 Fathom / 03 Information Architects / 17 Takram / 19 Irma Boom

**场景提示词模板**：
```
[风格DNA插入此处]
- PDF document / white paper design
- A4 portrait format (210×297mm)
- Long-form reading optimized (66 char line width, 1.5 line height)
- Clear chapter navigation system
- Elegant header/footer/page number design
- Charts integrated with body text
- Professional cover page
```

---

## 6. 落地页 / 产品官网

**规格**：
- Desktop: 1440px 宽度设计（响应至320px）
- 首屏高度：100vh

**关键设计要素**：
- 首屏5秒内传达核心价值
- 清晰的CTA（行动按钮）
- 滚动叙事结构（问题→方案→证明→行动）
- 移动端适配
- 加载速度

**推荐风格**：05 Locomotive / 01 Pentagram / 11 Build / 08 Resn / 06 Active Theory

**场景提示词模板**：
```
[风格DNA插入此处]
- Landing page / product website
- Desktop 1440px width, responsive
- Hero section 100vh, core value in 5 seconds
- Clear CTA button design
- Scroll narrative: problem → solution → proof → action
- Modern web aesthetic
```

---

## 7. App UI / 原型界面

**规格**：
- iOS: 390×844pt（iPhone 15）
- Android: 360×800dp
- 平板: 1024×1366pt（iPad Pro）

**关键设计要素**：
- 触摸友好（最小点击区44×44pt）
- 系统设计语言一致性
- 状态栏/导航栏/Tab栏的标准处理
- 信息密度适中（移动端不宜过密）

**推荐风格**：17 Takram / 11 Build / 03 Information Architects / 01 Pentagram

**场景提示词模板**：
```
[风格DNA插入此处]
- Mobile app UI design
- iOS [390×844pt] / Android [360×800dp]
- Touch-friendly (44pt minimum tap targets)
- Consistent design system
- Standard status bar / navigation / tab bar
- Moderate information density
```

---

## 8. 小红书配图

**规格**：
- 竖版：3:4（1080×1440px）最佳
- 方形：1:1（1080×1080px）
- 首图决定点击率

**关键设计要素**：
- 视觉吸引力第一（在瀑布流中竞争）
- 可以有少量文字（但不超过画面20%）
- 色彩鲜明但不俗
- 生活感/质感/氛围感

**推荐风格**：12 Sagmeister / 11 Build / 20 Neo Shen / 09 Experimental Jetset

**场景提示词模板**：
```
[风格DNA插入此处]
- Social media image for Xiaohongshu (RED)
- Vertical 3:4 (1080×1440px)
- Eye-catching in waterfall feed
- Minimal text overlay (under 20% of area)
- Vivid but tasteful colors
- Lifestyle/texture/atmosphere feel
```

---

## 组合示例

**场景**：公众号封面，介绍一款AI编程工具，想要专业但有温度

**Step 1**：选风格 → 17 Takram（专业+温度）
**Step 2**：取Takram提示词DNA + 公众号封面模板

```
Takram Japanese speculative design:
- Elegant concept prototypes and diagrams
- Soft tech aesthetic (rounded corners, gentle shadows)
- Charts and diagrams as art pieces
- Modest sophistication
- Neutral natural colors (beige, soft gray, muted green)
- Design as philosophical inquiry

Article cover image for WeChat subscription
- Landscape format, 2.35:1 aspect ratio (1200×510px)
- Bold visual impact, minimal text
- Moderate color saturation for white reading environment
- Must remain recognizable as thumbnail
- Clean composition with clear focal point

Content: An AI coding assistant tool, showing the concept of human-AI collaboration
in software development, warm and professional atmosphere
```

---

**版本**：v1.0
**更新日期**：2026-02-13
