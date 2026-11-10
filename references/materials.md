# 素材先行：画面的主角不该只是字和卡片

纯 HTML/CSS 能做的材料如果只剩「字＋卡片＋表格＋细线」，换什么风格都会显得单调——这是旧版产出单调的第二个根因。这份文件解决两件事：每个方向先定主角素材；按用户手里实际有的能力分档，没有的能力推荐安装但绝不卡住。

## 原则

1. **每个方向先定主角素材**，写进方向卡（`references/directions.md`）。别让三个方向都是「纯排版」；用纯排版时要是有意的排版——字本身成为图像（巨字、竖排、裁切），不是标题加正文的默认排法。
2. **内容必需的图先取齐再设计**。介绍动物、地点、人物、产品、历史的设计，图是内容不是装饰；鹦鹉网站没有鹦鹉 = 失败。拿不准时按内容必需处理。
3. **真图诚实性测试**：去掉这张图，信息有没有损失？没有损失 = 装饰，不加。别配 stock「灵感图」。
4. **人物、动物、实物、场景不用 SVG 手画**——画出来五官错位、比例诡异。用真图、生成图，或诚实的占位。几何、图标、数据图、地图线框不在此列；剪影遮罩只用于构图（裁切照片、做形状），不能拿来代替产品图。

**涉及用户本人或他的产品时，真实素材优先**：先查用户私有 memory / config 目录下的 `personal-asset-index.json`（首次使用把 `assets/personal-asset-index.example.json` 复制过去填真实数据；真实数据不放 skill 目录，免得随分发泄露）。找不到就问用户要，不编造。

## 先探测能力

```bash
# $HD = 本 skill 的根目录（SKILL.md 所在目录），不是用户的项目目录
python3 "$HD/scripts/capabilities.py"
```

它查本机装了哪些相关 skill、有没有生图的 key、ffmpeg / playwright 在不在，给出档位和缺什么时的安装建议。探测不到不代表没有（比如 Codex 自带 image_gen），用户说有就以用户为准。

## 三档

### T0 · 所有用户都有（默认，不依赖任何额外能力）

- **真图**：`python3 "$HD/scripts/fetch_images.py" --query "英文关键词" --out 项目/assets/img --count 2 --width 1600`（Wikimedia Commons，带许可输出）。用户自己的产品走品牌资产协议取官方图。
- **具名产品的 logo**：设计里出现几个可识别的产品就取几个（svgl → simpleicons → favicon，见 `references/brand-asset-protocol.md`）。清单里有一个没取到就补，实在取不到才退诚实占位并明说。
- **程序化材质**（单文件可用，不需要 fetch）：
  - SVG 滤镜：`feTurbulence` + `feDisplacementMap` 做纸纹、噪点、墨迹晕染、印刷错版
  - CSS：多层 `radial-gradient` 做光照和体积，`mask-image` / `clip-path` 做剪影与裁切，`mix-blend-mode` 做套印
  - canvas 生成图：等高线、点阵、流场、星图、织物纹理（固定随机种子，截图可复现）
  - Three.js（`<script src>` 从 cdnjs 加载，`file://` 下可用）做程序化几何、材质与光照
- **数据即图像**：把内容里的数字做成主视觉——一条横跨全页的刻度、按比例缩放的实物、地图上的路线——而不是三个大数字卡片
- **实物仿制**：用 HTML 做票据、标签、证件、说明书、明信片、报纸版面，带纸张、打孔、印章、折痕
- **字即图**：超大字形切出画面、竖排、字形与图片咬合

### T1 · 有 AI 生图能力

判定：本机装了 `huashu-gpt-image`、`nano-banana-pro` 之类的生图 skill，或你所在的 runtime 自带生图工具（如 Codex 的 image_gen——你自己知道有没有），或用户明说有。只有 API key 不算：本 skill 没有直接调生图 API 的脚本。

- **方向板阶段先出探针图**：每个方向生成一张氛围或主视觉图（材质、光线、主体），和 HTML 初稿一起摆给用户。写代码之前先有视觉层，用户选的是「看得见的样子」。
- **选定后生成主视觉、插画、纹理、人物与场景**。提示词写具体视觉特征和真实参照名，不写「高级感」「极简」这种形容词——方法见 `huashu-gpt-image`。
- 生成图要过真图诚实性测试，品牌产品图要以官方参考图为基底生成，不凭空画产品。

### T2 · 装了兄弟 skill

| skill | 能多做什么 | 公开地址 |
|---|---|---|
| huashu-gpt-image | 生图 prompt 方法论，配图、海报、信息图、UI mockup | `npx skills add alchaincyf/huashu-gpt-image` |
| huashu-art-motion | 36 种艺术与解说动画风格，口播驱动整片 | `npx skills add alchaincyf/huashu-art-motion` |
| huashu-md-html | md 转出版级 html / PDF / EPUB | `npx skills add alchaincyf/huashu-md-html` |
| huashu-3djs、huashu-flow-diagram | 程序化 3D 场景、会流动的架构图 | 尚未公开，本机装了就用 |

## 缺能力时怎么说

不阻塞，降到 T0 继续，交付时一句话告诉用户能多拿到什么：

> 这版主视觉用的是程序化纸纹＋公共领域插画。装上 huashu-gpt-image（`npx skills add alchaincyf/huashu-gpt-image`）后，下次可以直接生成主视觉和探针图。

只推荐和这次任务相关的一个，不要列清单推销。

## 取图失败的三级兜底

1. 公共领域库找不到 → 换 Unsplash / Pexels
2. 全网找不到合适的 → 有 T1 就以参考图为基底生成
3. 仍不行 → 诚实占位「图待补」继续，交付时明说。取图失败是降级继续，不是停下
