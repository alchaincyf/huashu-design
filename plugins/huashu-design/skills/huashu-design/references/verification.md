# Verification：输出验证流程

一些 design-agent 原生环境（如 Claude.ai Artifacts）有内置的 `fork_verifier_agent` 起 subagent 用 iframe 截图检查。大部分 agent 环境（Claude Code / Codex / Cursor / Trae / 等）里没有这个内置能力——用 Playwright 手动做就能覆盖相同的验证场景。

## 验证清单

每次产出HTML后，按这个清单做一遍：

### 1. 浏览器渲染检查（必做）

最基础：**HTML能不能打开**？在macOS上：

```bash
open -a "Google Chrome" "/path/to/your/design.html"
```

或者用Playwright截图（下一节）。

### 2. 控制台错误检查

HTML文件里最常见的问题是JS报错导致白屏。用Playwright跑一遍：

```bash
python ~/.claude/skills/huashu-design/scripts/verify.py path/to/design.html
```

这个脚本会：
1. 用headless chromium打开HTML
2. 截图保存到项目目录
3. 抓取控制台错误
4. 报告status

详见`scripts/verify.py`。

### 3. 多视口检查

如果是响应式设计，抓多个viewport：

```bash
python verify.py design.html --viewports 1920x1080,1440x900,768x1024,375x667
```

### 4. 交互检查

Tweaks、动画、按钮切换——默认的静态截图看不到。**建议让用户自己开浏览器点一遍**，或者用Playwright录屏：

```python
page.video.record('interaction.mp4')
```

### 5. 幻灯片逐页检查

Deck类HTML，一张张截：

```bash
python verify.py deck.html --slides 10  # 截前10张
```

生成 `deck-slide-01.png`、`deck-slide-02.png`... 方便快速浏览。

## Playwright Setup

首次使用需要：

```bash
# 如果还没装
npm install -g playwright
npx playwright install chromium

# 或者Python版
pip install playwright
playwright install chromium
```

如果用户已经全局安装 Playwright，直接用即可。

## 截图最佳实践

### 截完整页面

```python
page.screenshot(path='full.png', full_page=True)
```

### 截viewport

```python
page.screenshot(path='viewport.png')  # 默认只截可见区域
```

### 截特定元素

```python
element = page.query_selector('.hero-section')
element.screenshot(path='hero.png')
```

### 高清截图

```python
page = browser.new_page(device_scale_factor=2)  # retina
```

### 等动画结束再截

```python
page.wait_for_timeout(2000)  # 等2秒让动画settle
page.screenshot(...)
```

## 把截图发给用户

### 本地截图直接打开

```bash
open screenshot.png
```

用户会在自己的 Preview/Figma/VSCode/浏览器 里看。

### 上传图床分享链接

如果需要给远程协作者看（比如 Slack/飞书/微信），让用户用自己的图床工具或 MCP 上传截图，拿到一个永久链接，可以粘贴到任何地方。

## 验证出错时

### 页面白屏

控制台一定有错。先检查：

1. React+Babel script tag的integrity hash对不对（见`react-setup.md`）
2. 是不是`const styles = {...}`命名冲突
3. 跨文件的组件有没有export到`window`
4. JSX语法错误（babel.min.js不报错，换babel.js非压缩版）

### 动画卡

- 用Chrome DevTools Performance tab录一段
- 找layout thrashing（频繁的reflow）
- 动效优先用`transform`和`opacity`（GPU加速）

### 字体不对

- 检查`@font-face`的url是否可访问
- 检查fallback字体
- 中文字体加载慢：先显示fallback，加载完再切换

### 布局错位

- 检查`box-sizing: border-box`是否全局应用
- 检查`*  margin: 0; padding: 0`reset
- Chrome DevTools里打开gridlines看实际布局

## 验证=设计师的第二双眼

**永远要自己过一遍**。AI写代码时经常出现：

- 看起来对但interaction有bug
- 静态截图好但scroll时错位
- 宽屏好看但窄屏崩
- Dark mode忘了测
- Tweaks切换后某些组件没响应

**最后1分钟的验证可以省1小时的返工**。

## 常用验证脚本命令

```bash
# 基础：打开+截图+抓错
python verify.py design.html

# 多viewport
python verify.py design.html --viewports 1920x1080,375x667

# 多slide
python verify.py deck.html --slides 10

# 输出到指定目录
python verify.py design.html --output ./screenshots/

# headless=false，打开真实浏览器给你看
python verify.py design.html --show
```

## 视频产物硬校验（verify-video.sh）

渲染出的 MP4/成片不靠肉眼过，用脚本硬校验（HTML 合成侧的校验由 `hyperframes check` 五门审计负责，这个脚本只管产物侧）：

```bash
# 成品（默认要求有音轨）
bash scripts/verify-video.sh final.mp4 --duration=22 --fps=60 --width=1920 --height=1080

# 无声中间产物
bash scripts/verify-video.sh raw.mp4 --duration=10 --fps=60 --no-audio

# 刻意黑场开场的电影风
bash scripts/verify-video.sh film.mp4 --duration=30 --fps=60 --allow-black-open
```

检查项：分辨率/帧率、时长误差（±2%）、audio stream 存在性（无音轨=半成品铁律的机器执行）、首尾黑帧（blackdetect，录制起点偏移/loop 回跳的典型症状）、LUFS 响度（成品目标 -14±4）。exit code 非 0 就不许交付。
