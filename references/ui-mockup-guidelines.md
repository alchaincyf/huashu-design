# UI Mockup Guidelines

App/Web 原型制作的精简规范。详细技术参考见 `assets/` 下的框架组件。

## 默认交付形态

**平铺 + 可操作**，不做静态摆拍：

- 平铺 4-6 个主界面（覆盖核心功能面）
- 每台可交互（tab 切换、按钮点击、弹层）
- 每台上方一行标签说明是哪个界面

## 框架绑定

| 平台 | 必须使用 | 禁止 |
|------|---------|------|
| iOS | `assets/ios_frame.jsx` | 手写 Dynamic Island / status bar / home indicator |
| Android | `assets/android_frame.jsx` | 手写设备框 |
| macOS | `assets/macos_window.jsx` | 手写窗口 chrome |
| Web | `assets/browser_window.jsx` | — |

## 取图原则

- 默认去取真实内容图（产品或场景相关的真实图片）
- 渠道优先级：Wikimedia Commons（公共领域）> Unsplash > 用户提供
- 取不到 → 诚实 placeholder，不画 SVG 冒充
- **真图诚实性测试**：去掉这张图，信息是否有损？有损才用

## 信息密度分型

| 类型 | 密度策略 | 举例 |
|------|---------|------|
| 内容展示型 | 克制：少容器、少装饰、给内容呼吸 | 读书笔记、文章阅读 |
| 数据智能型 | 高密度：每屏 ≥3 处差异化信息 | AI 工具、Dashboard、Tracker、健康监测 |

## 验证

- 交付前用 Playwright 跑 3 项最小点击测试：进入详情 / tab 切换 / 关键交互
- 检查 `pageerror` 为 0
