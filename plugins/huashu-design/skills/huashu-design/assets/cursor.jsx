/**
 * Cursor — 产品UI演示光标组件包
 *
 * 配合 browser_window.jsx / macos_window.jsx 使用，配方与参数出处见
 * references/ui-demo-animation.md 八式④（轨迹算法：animation-best-practices §3.5；
 * ripple 参数：shotcraft·type-and-filter + 解耦配方；seek 安全规则：gsap-recipes §6）。
 *
 * 帧确定性：全文件禁 Math.random / Date.now，随机感一律 mulberry32 种子推导。
 * 同一帧无论 seek 多少次，画面完全一致。
 *
 * ── 用法A · Stage 时钟（animations.jsx）─────────────────────────
 *
 *   const { Stage, Sprite } = window.Animations;
 *   const { CursorSprite, ClickRipple, HoverHighlight } = window;
 *
 *   <Stage duration={8}>
 *     <Sprite start={1} end={2.2}>   {/* 光标弧线移到按钮，末段收敛手抖 *\/}
 *       <CursorSprite points={[[220, 480], [860, 300]]} seed={7} clickAt={0.96} />
 *     </Sprite>
 *     <Sprite start={2.1} end={3.0}> {/* 点击涟漪：双圈解耦 *\/}
 *       <ClickRipple x={860} y={300} color="#D97757" duration={0.9} />
 *     </Sprite>
 *   </Stage>
 *
 *   hover 联动高亮（时间驱动命中，非事件驱动）：
 *     const sampler = window.CursorKit.buildCursorSampler(points, { seed: 7 });
 *     const hovered = window.CursorKit.hoverIndexAt(sampler, easedU, [
 *       { id: 'save', rect: { x: 820, y: 270, w: 96, h: 44 } },
 *     ]);
 *     <HoverHighlight rect={{...}} intensity={hovered === 'save' ? 1 : 0} />
 *
 *   拖拽：光标传 dragRange={[0.2, 0.8]}（区间内切抓取手型+微缩），
 *   被拖元素用同一 sampler 采样减去抓取点偏移驱动，光标和元素永远同步。
 *
 * ── 用法B · GSAP timeline（HyperFrames 渲染）───────────────────
 *
 *   const K = window.CursorKit;
 *   const sampler = K.buildCursorSampler([[220, 480], [860, 300]], { seed: 7 });
 *   K.attachCursorTween(tl, '#cursor', sampler, { duration: 1.1, position: 's1+=0.5' });
 *   K.attachClickTween(tl, '#cursor', { position: '>' });
 *   K.attachRippleTween(tl, '#rip1', '#rip2', { position: '<' });
 *   // 别忘了 gsap-recipes §6.3 的首帧保险：注册 timeline 后手动补一次初始 set
 *
 * 光标形状：arrow（macOS 箭头，默认）/ hand（可点手型）/ grab（拖拽中）/ text（I-beam）
 */

/* ══════════════ 工具层（纯函数，两种驱动共用）══════════════ */

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CursorEasing = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inQuad: (t) => t * t,
};

// Catmull-Rom 单段插值（p1→p2，p0/p3 是相邻控制点）
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

/**
 * buildCursorSampler(points, opts) → sample(u) → {x, y}
 *
 * - points 只有 2 个时自动插一个偏离中点的控制点做弧线
 *   （真人鼠标不走直线，best-practices §3.5），偏移方向由 seed 决定
 * - ≥3 个点走 Catmull-Rom 平滑（huarec 光标平滑同款插值）
 * - 手抖：两条不可通约频率正弦叠加，幅度 ±wobble px，
 *   随 u→1 收敛到 0（接近目标时人手会稳）
 */
function buildCursorSampler(points, opts) {
  const o = Object.assign({ seed: 7, wobble: 2, arc: 0.18 }, opts);
  const rand = mulberry32(o.seed);
  const ph1 = rand() * 6.283, ph2 = rand() * 6.283;
  const side = rand() < 0.5 ? -1 : 1;

  let pts = points.map((p) => [p[0], p[1]]);
  if (pts.length === 2) {
    const [a, b] = pts;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const mid = [a[0] + dx * 0.5 - dy * o.arc * side, a[1] + dy * 0.5 + dx * o.arc * side];
    pts = [a, mid, b];
  }
  // 首尾补虚拟点，让 Catmull-Rom 覆盖全程
  const ext = [pts[0], ...pts, pts[pts.length - 1]];
  const segs = pts.length - 1;

  return function sample(u) {
    const uu = Math.max(0, Math.min(1, u));
    const f = uu * segs;
    const i = Math.min(segs - 1, Math.floor(f));
    const lt = f - i;
    const [x0, y0] = catmullRom(ext[i], ext[i + 1], ext[i + 2], ext[i + 3], lt);
    const damp = o.wobble * (1 - uu);            // 接近目标收敛
    return {
      x: x0 + Math.sin(uu * 47.13 + ph1) * damp, // 47.13 / 33.7 不可通约
      y: y0 + Math.sin(uu * 33.7 + ph2) * damp,
    };
  };
}

// hover 命中：时间驱动的确定性 hit test（不是事件监听）
function hoverIndexAt(sampler, u, targets, pad) {
  const p = sampler(u);
  const m = pad || 0;
  for (const t of targets) {
    const r = t.rect;
    if (p.x >= r.x - m && p.x <= r.x + r.w + m && p.y >= r.y - m && p.y <= r.y + r.h + m) return t.id;
  }
  return null;
}

/**
 * rippleRingState(tSec, opts) → { scale, opacity }
 * 双圈 ripple 的单圈状态。扩散与消散解耦（shotcraft 实测配方）：
 *   扩散 out-cubic EXPAND 帧（冲），消散线性 FADE 帧（匀），FADE > EXPAND。
 * 默认 22f/26f@30fps；紧凑场景（type-and-filter）可压到各 10f。
 */
function rippleRingState(tSec, opts) {
  const o = Object.assign({ delayF: 0, expandF: 22, fadeF: 26, r0: 14, r1: 54, fps: 30 }, opts);
  const t = tSec - o.delayF / o.fps;
  if (t < 0) return { scale: o.r0 / o.r1, opacity: 0 };
  const pe = Math.min(1, t / (o.expandF / o.fps));
  const pf = Math.min(1, t / (o.fadeF / o.fps));
  return {
    scale: (o.r0 + (o.r1 - o.r0) * CursorEasing.outCubic(pe)) / o.r1,
    opacity: 1 - pf,
  };
}

/* ══════════════ 光标形状（SVG，黑体白描边，paintOrder 保准确轮廓）══════════════ */

const CURSOR_PATHS = {
  // macOS 箭头：左缘垂直、斜边到右翼、带点击尾。热点在 (0,0)
  arrow: {
    viewBox: '0 0 17 22',
    d: 'M1.5 1.5 L1.5 18.6 L6.4 13.9 L9.1 20.3 L11.9 19.1 L9.2 12.8 L14.5 12.8 Z',
    hotspot: [1.5, 1.5],
  },
  // 可点手型（简化食指手）。热点在指尖
  hand: {
    viewBox: '0 0 22 24',
    d: 'M9.2 1.9 c1 0 1.5 .7 1.5 1.6 v6.1 l1 .1 v-4.4 c0-1.9 2.8-1.9 2.8 0 v4.7 l.9 .1 v-3.2 c0-1.8 2.6-1.8 2.6 0 v3.6 l.9 .2 v-1.6 c0-1.6 2.3-1.6 2.3 0 v5.6 c0 4.3-2.9 7.3-7.3 7.3 h-2.1 c-2.9 0-4.5-1.3-5.9-3.7 L3.1 13.4 c-.7-1.2 .8-2.4 1.9-1.5 l2.7 2.3 V3.5 c0-.9 .6-1.6 1.5-1.6 Z',
    hotspot: [9.9, 1.9],
  },
  // 拖拽中（握拳）：hand 的收指变体
  grab: {
    viewBox: '0 0 22 22',
    d: 'M5.4 7.2 c0-1.7 2.5-1.7 2.5 0 v2.1 l.9 0 v-3.3 c0-1.8 2.7-1.8 2.7 0 v3.3 l.9 0 v-2.9 c0-1.8 2.6-1.8 2.6 0 v3 l.9 .1 v-1.7 c0-1.6 2.3-1.6 2.3 0 v5.1 c0 4.2-2.8 7-7.1 7 h-1.9 c-2.8 0-4.4-1.2-5.7-3.6 L2.5 13.1 c-.6-1.2 .8-2.3 1.8-1.4 l1.1 .9 Z',
    hotspot: [10, 8],
  },
  // 文本 I-beam。热点在中心
  text: {
    viewBox: '0 0 10 22',
    d: 'M1 1.5 h3 v0 c.4 0 .7 .2 1 .5 c.3-.3 .6-.5 1-.5 h3 v2 h-2.6 c-.2 0-.4 .2-.4 .4 v14.2 c0 .2 .2 .4 .4 .4 H9 v2 H6 c-.4 0-.7-.2-1-.5 c-.3 .3-.6 .5-1 .5 H1 v-2 h2.6 c.2 0 .4-.2 .4-.4 V3.9 c0-.2-.2-.4-.4-.4 H1 Z',
    hotspot: [5, 11],
  },
};

function CursorIcon({ variant = 'arrow', size = 22 }) {
  const s = CURSOR_PATHS[variant] || CURSOR_PATHS.arrow;
  return (
    <svg width={size} height={size * 1.25} viewBox={s.viewBox}
      style={{ display: 'block', overflow: 'visible' }}>
      <path d={s.d} fill="#111" stroke="#fff" strokeWidth="1.4"
        strokeLinejoin="round" style={{ paintOrder: 'stroke' }} />
    </svg>
  );
}

/* ══════════════ Stage 时钟组件（配合 animations.jsx）══════════════ */

/**
 * CursorSprite — 放在 <Sprite> 内，沿路径移动的光标
 *
 * props:
 *   points     [[x,y],...] 路径点（舞台坐标）。2 个点自动成弧
 *   seed       随机种子（换 seed = 换一版弧线和手抖）
 *   wobble     手抖幅度 px（默认 2，best-practices §3.5 的 ±2px）
 *   ease       进度缓动，默认 inOutQuad（起步加速+到达减速的对称人手感）
 *   clickAt    0-1，此进度处做点击下压（scale 0.85 dip + 回弹，Anticipation）
 *   dragRange  [u0,u1]，区间内切 grab 手型 + scale 0.94
 *   variant    基础形状，默认 'arrow'
 *   size       光标宽 px，默认 22
 */
function CursorSprite({
  points, seed = 7, wobble = 2, ease = CursorEasing.inOutQuad,
  clickAt = null, dragRange = null, variant = 'arrow', size = 22, style,
}) {
  const { useSprite } = window.Animations;
  const { t } = useSprite();
  const sampler = React.useMemo(
    () => buildCursorSampler(points, { seed, wobble }),
    [JSON.stringify(points), seed, wobble]
  );
  const u = ease(t);
  const p = sampler(u);

  let scale = 1;
  let shape = variant;
  if (dragRange && u >= dragRange[0] && u <= dragRange[1]) {
    shape = 'grab';
    scale = 0.94;
  }
  if (clickAt !== null) {
    const d = (u - clickAt) / 0.05;              // 点击窗口 ±5% 进度
    if (d >= 0 && d < 1) scale *= 0.85 + 0.15 * CursorEasing.outCubic(d);      // 回弹
    else if (d >= -0.6 && d < 0) scale *= 1 - 0.15 * CursorEasing.inQuad(1 + d / 0.6); // 下压
  }

  const hs = (CURSOR_PATHS[shape] || CURSOR_PATHS.arrow).hotspot;
  const k = size / 17;                            // 视觉尺寸归一
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, zIndex: 999, pointerEvents: 'none',
      transform: `translate(${p.x - hs[0] * k}px, ${p.y - hs[1] * k}px) scale(${scale})`,
      transformOrigin: `${hs[0] * k}px ${hs[1] * k}px`,
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
      ...style,
    }}>
      <CursorIcon variant={shape} size={size} />
    </div>
  );
}

/**
 * ClickRipple — 双圈同心涟漪（放在独立 <Sprite> 里，从点击帧开始）
 * 双圈起点差 3f；半径 14→54 / 14→78；扩散 out-cubic 22f、消散线性 26f 解耦。
 * duration = 所在 Sprite 的时长（秒），用于把本地进度换算回秒。
 */
function ClickRipple({ x, y, color = '#D97757', r1 = 54, r2 = 78, duration = 0.9, fps = 30 }) {
  const { useSprite } = window.Animations;
  const { t } = useSprite();
  const tSec = t * duration;
  const rings = [
    { rMax: r1, st: rippleRingState(tSec, { delayF: 0, r1, fps }) },
    { rMax: r2, st: rippleRingState(tSec, { delayF: 3, r1: r2, fps }) },
  ];
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 998, pointerEvents: 'none' }}>
      {rings.map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: -r.rMax, top: -r.rMax, width: r.rMax * 2, height: r.rMax * 2,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          boxShadow: `0 0 40px ${color}55`,
          transform: `scale(${r.st.scale})`,      // 固定尺寸 + scale，不 tween 宽高
          opacity: r.st.opacity,
        }} />
      ))}
    </div>
  );
}

/**
 * HoverHighlight — 光标 hover 目标的联动高亮
 * intensity 0→1 由调用方从时间推导（配 hoverIndexAt），本组件只负责渲染：
 * hairline 描边浮现 + 轻微提亮，光标离开即撤。
 */
function HoverHighlight({ rect, intensity = 0, color = '#D97757', radius = 8 }) {
  if (intensity <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: rect.x - 3, top: rect.y - 3,
      width: rect.w + 6, height: rect.h + 6,
      borderRadius: radius, pointerEvents: 'none',
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 0 3px ${color}22`,
      opacity: intensity,
      backdropFilter: `brightness(${1 + 0.06 * intensity})`,
    }} />
  );
}

/* ══════════════ GSAP 驱动层（HyperFrames 渲染管线）══════════════ */

/**
 * attachCursorTween — proxy tween 驱动光标 DOM 元素沿 sampler 路径移动
 * （gsap-recipes §3.5 的组件化封装；一切由 proxy.u 推导，seek-safe）
 */
function attachCursorTween(tl, target, sampler, opts) {
  const o = Object.assign({ duration: 1.1, ease: 'power1.inOut', position: '>' }, opts);
  const proxy = { u: 0 };
  tl.to(proxy, {
    u: 1, duration: o.duration, ease: o.ease,
    onUpdate: () => {
      const p = sampler(proxy.u);
      gsap.set(target, { x: p.x, y: p.y });
    },
  }, o.position);
  return proxy;
}

/** attachClickTween — 点击 Anticipation：下压 0.85 再 back.out 回弹 */
function attachClickTween(tl, target, opts) {
  const o = Object.assign({ position: '>' }, opts);
  tl.to(target, { scale: 0.85, duration: 0.08, ease: 'power1.in' }, o.position);
  tl.to(target, { scale: 1, duration: 0.25, ease: 'back.out' }, '>');
}

/**
 * attachRippleTween — 双圈 ripple。ring1/ring2 是两个固定尺寸的圆环元素
 * （直径 = 2×终态半径，初始 scale = r0/r1），只 tween scale 和 opacity。
 */
function attachRippleTween(tl, ring1, ring2, opts) {
  const o = Object.assign({ r0: 14, r1: 54, r2: 78, fps: 30, position: '>' }, opts);
  const F = (n) => n / o.fps;
  [[ring1, o.r1, 0], [ring2, o.r2, 3]].forEach(([el, rMax, delayF]) => {
    const at = delayF === 0 ? o.position : '<+=' + F(delayF);
    tl.fromTo(el, { scale: o.r0 / rMax, autoAlpha: 1 },
      { scale: 1, duration: F(22), ease: 'power3.out' }, at);          // 扩散：冲
    tl.to(el, { autoAlpha: 0, duration: F(26), ease: 'none' }, '<');   // 消散：匀，解耦
  });
}

/* ══════════════ 导出 ══════════════ */

if (typeof window !== 'undefined') {
  window.CursorIcon = CursorIcon;
  window.CursorSprite = CursorSprite;
  window.ClickRipple = ClickRipple;
  window.HoverHighlight = HoverHighlight;
  window.CursorKit = {
    mulberry32,
    CursorEasing,
    buildCursorSampler,
    hoverIndexAt,
    rippleRingState,
    attachCursorTween,
    attachClickTween,
    attachRippleTween,
    CURSOR_PATHS,
  };
}
