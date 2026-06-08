# Animations：时间轴动画引擎

做动画/motion design HTML时读这个。原理、用法、典型模式。

## 核心模式：Stage + Sprite

我们的动画系统（`assets/animations.jsx`）提供一个时间轴驱动的引擎：

- **`<Stage>`**：整个动画的容器，自动提供auto-scale（fit viewport）+ scrubber + play/pause/loop控制
- **`<Sprite start end>`**：时间片段。一个Sprite只在`start`到`end`这段时间内显示。内部可以通过`useSprite()` hook读取自己的本地进度`t` (0→1)
- **`useTime()`**：读当前全局时间（秒）
- **`Easing.easeInOut` / `Easing.easeOut` / ...**：缓动函数
- **`interpolate(t, from, to, easing?)`**：根据t插值

这套模式借鉴Remotion/After Effects思路，但轻量、零依赖。

## 起手

```html
<script type="text/babel" src="animations.jsx"></script>
<script type="text/babel">
  const { Stage, Sprite, useTime, useSprite, Easing, interpolate } = window.Animations;

  function Title() {
    const { t } = useSprite();  // 本地进度 0→1
    const opacity = interpolate(t, [0, 1], [0, 1], Easing.easeOut);
    const y = interpolate(t, [0, 1], [40, 0], Easing.easeOut);
    return (
      <h1 style={{ 
        opacity, 
        transform: `translateY(${y}px)`,
        fontSize: 120,
        fontWeight: 900,
      }}>
        Hello.
      </h1>
    );
  }

  function Scene() {
    return (
      <Stage duration={10}>  {/* 10秒动画 */}
        <Sprite start={0} end={3}>
          <Title />
        </Sprite>
        <Sprite start={2} end={5}>
          <SubTitle />
        </Sprite>
        {/* ... */}
      </Stage>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<Scene />);
</script>
```

## 常用动画模式

### 1. Fade In / Fade Out

```jsx
function FadeIn({ children }) {
  const { t } = useSprite();
  const opacity = interpolate(t, [0, 0.3], [0, 1], Easing.easeOut);
  return <div style={{ opacity }}>{children}</div>;
}
```

**注意范围**：`[0, 0.3]`意思是在sprite的前30%时间完成渐入，后面保持opacity=1。

### 2. Slide In

```jsx
function SlideIn({ children, from = 'left' }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, 0.4], [0, 1], Easing.easeOut);
  const offset = (1 - progress) * 100;
  const directions = {
    left: `translateX(-${offset}px)`,
    right: `translateX(${offset}px)`,
    top: `translateY(-${offset}px)`,
    bottom: `translateY(${offset}px)`,
  };
  return (
    <div style={{
      transform: directions[from],
      opacity: progress,
    }}>
      {children}
    </div>
  );
}
```

### 3. 逐字打字机

```jsx
function Typewriter({ text }) {
  const { t } = useSprite();
  const charCount = Math.floor(text.length * Math.min(t * 2, 1));
  return <span>{text.slice(0, charCount)}</span>;
}
```

### 4. 数字计数

```jsx
function CountUp({ from = 0, to = 100, duration = 0.6 }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, duration], [0, 1], Easing.easeOut);
  const value = Math.floor(from + (to - from) * progress);
  return <span>{value.toLocaleString()}</span>;
}
```

### 5. 分段解释（典型教学动画）

```jsx
function Scene() {
  return (
    <Stage duration={20}>
      {/* Phase 1: 展示问题 */}
      <Sprite start={0} end={4}>
        <Problem />
      </Sprite>

      {/* Phase 2: 展示思路 */}
      <Sprite start={4} end={10}>
        <Approach />
      </Sprite>

      {/* Phase 3: 展示结果 */}
      <Sprite start={10} end={16}>
        <Result />
      </Sprite>

      {/* 全程显示的字幕 */}
      <Sprite start={0} end={20}>
        <Caption />
      </Sprite>
    </Stage>
  );
}
```

## Easing函数

预设的easing curves：

| Easing | 特性 | 用在 |
|--------|------|------|
| `linear` | 匀速 | 滚动字幕、持续动画 |
| `easeIn` | 慢→快 | 退场消失 |
| `easeOut` | 快→慢 | 入场出现 |
| `easeInOut` | 慢→快→慢 | 位置变化 |
| **`expoOut`** ⭐ | **指数缓出** | **Anthropic 级主 easing**（物理重量感）|
| **`overshoot`** ⭐ | **弹性回弹** | **Toggle / 按钮弹出 / 强调交互** |
| `spring` | 弹簧 | 交互反馈、几何体归位 |
| `anticipation` | 先反向再正向 | 强调动作 |

**默认主 easing 用 `expoOut`**（不是 `easeOut`）—— 见 `animation-best-practices.md` §2。
入场用 `expoOut`、出场用 `easeIn`、toggle 用 `overshoot`——Anthropic 级动画的基础规律。

## 节奏和时长指南

### 微交互（0.1-0.3秒）
- 按钮hover
- 卡片expand
- Tooltip出现

### UI过渡（0.3-0.8秒）
- 页面切换
- 模态框出现
- 列表item加入

### 叙事动画（2-10秒每段）
- 概念解释的一个phase
- 数据图表的reveal
- 场景转换

### 单段叙事动画最长不超过10秒
人类注意力有限。10秒讲一件事，讲完换下一件。

## 设计动画的思考顺序

### 1. 先有内容/故事，再有动画

**错误**：先想要做fancy动画，再塞内容进去
**正确**：先想清楚要传达什么信息，再用动画手段serve这个信息

动画是**signal**，不是**装饰**。一个fade-in强调的是"这里很重要，请看"——如果什么都fade-in，signal就失效。

### 2. 分Scene写时间轴

```
0:00 - 0:03   问题出现（fade in）
0:03 - 0:06   问题放大/展开（zoom+pan）
0:06 - 0:09   解法出现（slide in from right）
0:09 - 0:12   解法展开说明（typewriter）
0:12 - 0:15   结果演示（counter up + chart reveal）
0:15 - 0:18   总结一句话（static，读3秒）
0:18 - 0:20   CTA或fade out
```

写完时间轴再写组件。

### 3. 资源先行

动画要用的图片/图标/字体**先**准备好。不要画到一半去找素材——打断节奏。

## 常见问题

**动画卡顿**
→ 主要是layout thrashing。用`transform`和`opacity`，不要动`top`/`left`/`width`/`height`/`margin`。浏览器GPU加速`transform`。

**动画太快，看不清楚**
→ 人读一个汉字需要100-150ms，一个词300-500ms。如果你用文字讲故事，单句至少留3秒。

**动画太慢，观众无聊**
→ 有趣的视觉变化要密集。静态画面超过5秒就会闷。

**多个动画互相影响**
→ 用CSS的`will-change: transform`提前告诉浏览器这个元素会动，减少reflow。

**录制成视频**
→ 用 skill 自带工具链（一条命令出三种格式）：见 `video-export.md`
- `scripts/render-video.js` — HTML → 25fps MP4（Playwright + ffmpeg）
- `scripts/convert-formats.sh` — 25fps MP4 → 60fps MP4 + 优化 GIF
- 想要更精确的帧渲染？让 render(t) 成为 pure function，见 `animation-pitfalls.md` 第 5 条

## 和视频工具的配合

这个skill做的是**HTML动画**（在浏览器里跑的）。如果最终产出要作为视频素材：

- **短动画/concept demo**：用这里的方法做HTML动画 → 屏幕录制
- **长视频/叙事**：本 skill 专注 HTML 动画，长视频用 AI 视频生成类 skill 或专业视频软件
- **motion graphics**：专业的After Effects/Motion Canvas更合适

## 关于Popmotion等库

如果你真的需要物理动画（spring、decay、keyframes with precise timing），我们的engine搞不定，可以fallback到Popmotion：

```html
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

但**先试试我们的engine**。90%的情况够用。
