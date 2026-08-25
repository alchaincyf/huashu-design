# Tweaks：设计变体实时调参

Tweaks是这个skill里很核心的能力——让用户不改代码就能实时切换variations/调整参数。

**跨 agent 环境适配**：某些 design-agent 原生环境（如 Claude.ai Artifacts）依赖 host 的 postMessage 把 tweak 值回写源码做持久化。本 skill 采用**纯前端 localStorage 方案**——效果一致（刷新保留状态），但持久化发生在浏览器 localStorage 而不是源码文件。这个方案在任何 agent 环境（Claude Code / Codex / Cursor / Trae / etc.）都能工作。

## 何时加 Tweaks

- 用户明确要求"能调参"/"多个版本切换"
- 设计有多个variations需要对比时
- 用户没明说，但你主观判断**加几个有启发性的tweaks能帮用户看到可能性**

默认推荐：**每个设计都加2-3个tweaks**（颜色主题/字号/layout变体）即使用户没要求——让用户看到可能性空间是设计服务的一部分。

## 实现方式（纯前端版）

### 基本结构

```jsx
const TWEAK_DEFAULTS = {
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
};

function useTweaks() {
  const [tweaks, setTweaks] = React.useState(() => {
    try {
      const stored = localStorage.getItem('design-tweaks');
      return stored ? { ...TWEAK_DEFAULTS, ...JSON.parse(stored) } : TWEAK_DEFAULTS;
    } catch {
      return TWEAK_DEFAULTS;
    }
  });

  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      localStorage.setItem('design-tweaks', JSON.stringify(next));
    } catch {}
  };

  const reset = () => {
    setTweaks(TWEAK_DEFAULTS);
    try {
      localStorage.removeItem('design-tweaks');
    } catch {}
  };

  return { tweaks, update, reset };
}
```

### Tweaks面板UI

右下角浮动面板。可折叠：

```jsx
function TweaksPanel() {
  const { tweaks, update, reset } = useTweaks();
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
    }}>
      {open ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          width: 280,
          fontFamily: 'system-ui',
          fontSize: 13,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <strong>Tweaks</strong>
            <button onClick={() => setOpen(false)} style={{
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
            }}>×</button>
          </div>

          {/* 颜色 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>主色</div>
            <input 
              type="color" 
              value={tweaks.primaryColor} 
              onChange={e => update({ primaryColor: e.target.value })}
              style={{ width: '100%', height: 32 }}
            />
          </label>

          {/* 字号slider */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>字号 ({tweaks.fontSize}px)</div>
            <input 
              type="range" 
              min={12} max={24} step={1}
              value={tweaks.fontSize}
              onChange={e => update({ fontSize: +e.target.value })}
              style={{ width: '100%' }}
            />
          </label>

          {/* 密度选项 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>密度</div>
            <select 
              value={tweaks.density}
              onChange={e => update({ density: e.target.value })}
              style={{ width: '100%', padding: 6 }}
            >
              <option value="compact">紧凑</option>
              <option value="comfortable">舒适</option>
              <option value="spacious">宽松</option>
            </select>
          </label>

          {/* 暗黑模式toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <input 
              type="checkbox" 
              checked={tweaks.dark}
              onChange={e => update({ dark: e.target.checked })}
            />
            <span>暗黑模式</span>
          </label>

          <button onClick={reset} style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
          }}>重置</button>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >⚙ Tweaks</button>
      )}
    </div>
  );
}
```

### 应用Tweaks

在主组件里用Tweaks：

```jsx
function App() {
  const { tweaks } = useTweaks();

  return (
    <div style={{
      '--primary': tweaks.primaryColor,
      '--font-size': `${tweaks.fontSize}px`,
      background: tweaks.dark ? '#0A0A0A' : '#FAFAFA',
      color: tweaks.dark ? '#FAFAFA' : '#1A1A1A',
    }}>
      {/* 你的内容 */}
      <TweaksPanel />
    </div>
  );
}
```

CSS里用变量：

```css
button.cta {
  background: var(--primary);
  color: white;
  font-size: var(--font-size);
}
```

## 典型 Tweak 选项

给不同类型的设计加什么tweaks：

### 通用
- 主色（color picker）
- 字号（slider 12-24px）
- 字型（select：display font vs body font）
- 暗黑模式（toggle）

### 幻灯片deck
- 主题（light/dark/brand）
- 背景样式（solid/gradient/image）
- 字体对比（更装饰 vs 更克制）
- 信息密度（minimal/standard/dense）

### 产品原型
- 布局变体（layout A / B / C）
- 交互速度（animation speed 0.5x-2x）
- 数据量（mock数据条数 5/20/100）
- 状态（empty/loading/success/error）

### 动画
- 速度（0.5x-2x）
- 循环（once/loop/ping-pong）
- Easing（linear/easeOut/spring）

### Landing page
- Hero风格（image/gradient/pattern/solid）
- CTA文案（几种变体）
- 结构（single column / two column / sidebar）

## Tweaks设计原则

### 1. 有意义的选项，不是折腾人的

每个tweak必须展示**真实的设计选项**。别加那种谁都不会真切换的tweak（比如border-radius 0-50px的slider——用户调完发现所有中间值都丑）。

好的tweak暴露**离散的、有思考的variations**：
- "圆角风格"：无圆角 / 微圆角 / 大圆角（三个选项）
- 不是："圆角"：0-50px slider

### 2. 少即是多

一个设计的Tweaks面板**最多5-6个**选项。再多就变成"配置页面"，失去了快速探索variations的意义。

### 3. 默认值是完成设计

Tweaks是**锦上添花**。默认值必须本身就是一个完整、可发布的设计。用户关闭Tweaks面板后看到的就是产出。

### 4. 合理分组

选项多时分组显示：

```
---- 视觉 ----
主色 | 字号 | 暗黑模式

---- 布局 ----
密度 | 侧栏位置

---- 内容 ----
显示数据量 | 状态
```

## 向前兼容源码级持久化 host

如果你以后想把设计上传到支持源码级 tweaks（如 Claude.ai Artifacts）的环境也能跑，保留 **EDITMODE 标记块**：

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
}/*EDITMODE-END*/;
```

标记块在 localStorage 方案里**无作用**（只是个普通注释），但在支持源码回写的 host 里会被读取，实现源码级持久化。加上这个对当前环境无害，同时保持向前兼容。

## 常见问题

**Tweaks面板挡住设计内容**
→ 让它可关闭。默认关闭，显示一个小按钮，用户点了才展开。

**用户切换tweaks后还要重复设置**
→ 已经用localStorage。如果刷新后不持久，检查localStorage是否可用（无痕模式会失败，要catch）。

**多个HTML页面想共享tweaks**
→ 给localStorage key加project name：`design-tweaks-[projectName]`。

**我想让tweak之间有联动关系**
→ 在`update`里加逻辑：

```jsx
const update = (patch) => {
  let next = { ...tweaks, ...patch };
  // 联动：选dark mode时自动切换字体配色
  if (patch.dark === true && !patch.textColor) {
    next.textColor = '#F0EEE6';
  }
  setTweaks(next);
  localStorage.setItem(...);
};
```
