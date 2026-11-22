/**
 * Showboard — App／小程序原型的展示板：三种有构图的摆法，代替「一排等大的手机」。
 *
 *   <Showboard layout="hero" theme={{ bg: '#16241E', fg: '#EDE7DA', muted: '#9FB3A8', accent: '#F06A2B', font: '"Noto Serif SC", serif' }}
 *     title="洗个澡吧" kicker="方向一 · 时刻表" lede="一两句：这个方向的 form 从哪来、为哪个入口设计。"
 *     screens={[
 *       { label: '今天', note: '门口扫码进来，第一眼看到几点有空', main: true, node: <WechatFrame …/> },
 *       { label: '洗什么', note: '…', node: <WechatFrame …/> },
 *       …
 *     ]}
 *     closeup={{ label: '时刻表放大', note: '一只狗占住一个台子 70 分钟', node: <TimeGrid />, scale: 2 }}
 *     aside={<WechatShareCard …/>}            // 转发卡片、色板说明、参照来源……放在一个角落
 *   />
 *
 * layout：
 *   hero     主次：main 那台放大居中偏左，其余缩小错落在右侧两列（几乎都适用，首选）
 *   flow     流程：按 screens 的顺序斜着往下走，屏与屏之间画连线，线上写 screens[i].via（「点了『去选服务』」）
 *   closeup  特写：main 那台在左，closeup 放大占中间，其余两三台叠在右侧
 * 三个方向各用一种，展示板就不会长得一样。不合适时照 references/app-prototype.md「展示板」自己摆，这只是起点。
 *
 * screens[].node 放整台手机（WechatFrame／IosFrame），每台仍然能点；缩放只是摆放，交付包（mp_handoff.py）按原尺寸截。
 * 宽度固定 1440，高度按内容算。
 */

function ShowboardLabel({ s, theme, width }) {
  return (
    <div style={{ width, marginBottom: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: theme.fg, lineHeight: 1.3 }}>{s.label}</div>
      {s.note && <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.5, marginTop: 2 }}>{s.note}</div>}
    </div>
  );
}

function ShowboardPhone({ s, theme, x, y, scale, phoneW, phoneH }) {
  // 机身原尺寸约 395×832（外壳 375×812 加 10px 边）；缩放后占 phoneW*scale
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: phoneW * scale }}>
      <ShowboardLabel s={s} theme={theme} width={phoneW * scale} />
      <div style={{ width: phoneW * scale, height: phoneH * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: phoneW }}>{s.node}</div>
      </div>
    </div>
  );
}

function Showboard({ layout = 'hero', theme = {}, title, kicker, lede, screens = [], closeup, aside, phoneW = 395, phoneH = 832, footnote }) {
  const t = { bg: '#F2F1EC', fg: '#1B1B1B', muted: '#6B6B66', accent: '#C2410C', font: 'inherit', ...theme };
  const W = 1440, M = 56;
  const mainIdx = Math.max(0, screens.findIndex((s) => s.main));
  const main = screens[mainIdx], rest = screens.filter((_, i) => i !== mainIdx);
  const LABEL = 56;   // 标签占的高度
  const placed = [];
  let lines = [], close = null, asidePos = null, height = 0;

  if (layout === 'hero') {
    const big = 0.95, small = 0.76;   // 主屏比其余大 1.25 倍；单台不窄于 300
    const my = 250;
    placed.push({ s: main, x: M, y: my, scale: big });
    const colX = [M + phoneW * big + 56, M + phoneW * big + 56 + phoneW * small + 36];
    rest.forEach((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      placed.push({ s, x: colX[col], y: my - 40 + (col ? 140 : 0) + row * (phoneH * small + LABEL + 36), scale: small });
    });
    asidePos = { x: colX[1] + phoneW * small + 56, y: my + 40, w: W - M - (colX[1] + phoneW * small + 56) };
  } else if (layout === 'flow') {
    const sc = 0.8, step = phoneW * sc + 70;
    const perRow = Math.max(1, Math.floor((W - 2 * M + 70) / step));
    screens.forEach((s, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      const x = M + col * step, y = 250 + row * (phoneH * sc + LABEL + 90) + col * 46;
      placed.push({ s, x, y, scale: sc });
      if (i > 0 && col > 0) {
        const p = placed[i - 1];
        lines.push({ x1: p.x + phoneW * sc - 6, y1: p.y + LABEL + phoneH * sc * 0.55, x2: x + 6, y2: y + LABEL + phoneH * sc * 0.45, via: s.via });
      }
    });
    asidePos = { x: W - M - 300, y: 40, w: 300 };
  } else {   // closeup
    const sc = 1.0;
    placed.push({ s: main, x: M, y: 240, scale: sc });
    const cx = M + phoneW * sc + 60, cw = 520;
    close = { x: cx, y: 240, w: cw };
    rest.slice(0, 3).forEach((s, i) => placed.push({ s, x: cx + cw + 56, y: 150 + i * (phoneH * 0.62 + LABEL + 24), scale: 0.62 }));
    rest.slice(3).forEach((s, i) => placed.push({ s, x: cx + i * (phoneW * 0.62 + 30), y: 240 + LABEL + 560 + 40, scale: 0.62 }));
    asidePos = { x: cx, y: 40, w: cw };
  }
  placed.forEach((p) => { height = Math.max(height, p.y + LABEL + phoneH * p.scale + M); });
  if (close) height = Math.max(height, close.y + 600);

  return (
    <div data-showboard={layout} style={{ position: 'relative', width: W, height, background: t.bg, color: t.fg, fontFamily: t.font, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: M, top: 56, width: layout === 'closeup' ? 340 : 760 }}>
        {kicker && <div style={{ fontSize: 14, color: t.accent, fontWeight: 700, marginBottom: 10 }}>{kicker}</div>}
        <div style={{ fontSize: layout === 'flow' ? 64 : 56, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
        {lede && <div style={{ fontSize: 16, lineHeight: 1.65, color: t.fg, opacity: 0.86, marginTop: 18 }}>{lede}</div>}
      </div>
      {lines.length > 0 && (
        <svg width={W} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {lines.map((l, i) => (
            <g key={i}>
              <path d={`M${l.x1},${l.y1} C${(l.x1 + l.x2) / 2},${l.y1} ${(l.x1 + l.x2) / 2},${l.y2} ${l.x2},${l.y2}`} fill="none" stroke={t.accent} strokeWidth="2" strokeDasharray="5 5" />
              <circle cx={l.x2} cy={l.y2} r="4" fill={t.accent} />
              {l.via && <text x={(l.x1 + l.x2) / 2} y={(l.y1 + l.y2) / 2 - 10} textAnchor="middle" fontSize="13" fill={t.muted}>{l.via}</text>}
            </g>
          ))}
        </svg>
      )}
      {placed.map((p, i) => <ShowboardPhone key={i} {...p} theme={t} phoneW={phoneW} phoneH={phoneH} />)}
      {close && closeup && (
        <div style={{ position: 'absolute', left: close.x, top: close.y, width: close.w }}>
          <ShowboardLabel s={closeup} theme={t} width={close.w} />
          <div style={{ width: close.w, height: 560, overflow: 'hidden', borderRadius: 18, background: t.fg === '#1B1B1B' ? '#fff' : 'rgba(255,255,255,0.06)', padding: 24 }}>
            <div style={{ zoom: closeup.scale || 2, width: (close.w - 48) / (closeup.scale || 2) }}>{closeup.node}</div>
          </div>
        </div>
      )}
      {aside && asidePos && <div style={{ position: 'absolute', left: asidePos.x, top: asidePos.y, width: asidePos.w }}>{aside}</div>}
      {footnote && <div style={{ position: 'absolute', left: M, bottom: 28, fontSize: 12, color: t.muted }}>{footnote}</div>}
    </div>
  );
}

Object.assign(window, { Showboard });
