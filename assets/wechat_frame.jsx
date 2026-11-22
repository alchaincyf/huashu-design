/**
 * WechatFrame — 微信小程序的屏幕外壳（手机＋状态栏＋导航栏＋右上角胶囊）
 *
 * 画布按小程序设计稿基准：375 宽（= 750rpx，1px = 2rpx），812 高。
 * 胶囊与导航栏用 iPhone 刘海屏实测值：状态栏 44，胶囊 87×32、距顶 48、距右 7，
 * 导航栏内容区高 40（真机以 wx.getMenuButtonBoundingClientRect 为准，安卓会差几 px）。
 * 胶囊是微信放的，开发者不能改内容，只能选深浅两种配色——设计时留出它的位置，别在它旁边放按钮。
 *
 * 用法：
 *   <WechatFrame page="pages/menu/menu" title="点单" tab="点单">
 *     <YourScreen />
 *   </WechatFrame>
 *
 *   nav="default"  微信默认导航栏：标题居中，背景色 navColor，文字 navText（只能 black / white）
 *   nav="custom"   自定义导航栏（app.json navigationStyle: custom）：只剩胶囊，顶部 84px 由你自己画
 *   back           次级页面左上角返回箭头（默认导航栏下）
 *   home           这一屏是小程序打开的第一页（app.json pages 的第一项）；不标就按 tabBar 顺序排
 *   展示板上可以把手机缩小摆放（transform: scale），导出交付包时会按 375 原尺寸截
 *   tabBar={{ list: [{ text, icon? }...], color, selectedColor, backgroundColor }}  原生 tabBar（2–5 个）
 *   footer={<结算条 />}  固定在底部、不跟内容滚的东西（结算条、报名按钮、购物车）。在 tabBar 上方；没有 tabBar 时贴底并让出 34px 安全区
 *                  不要把这类东西写成 children 里的 position: fixed / absolute——会跟着内容滚走或盖住内容
 *   自己画 tabBar 时不传 tabBar，把你的组件放进 children 底部，并给它加 data-mp-tabbar="custom"
 *
 * 外壳会在屏幕节点上写 data-mp-* 属性，scripts/mp_handoff.py 靠它们导出给 WorkBuddy／开发者的交付包。
 * 不要在页面里自己再画状态栏、胶囊或 home indicator。
 */

const wechatFrameStyles = {
  wrapper: {
    display: 'inline-block',
    padding: 10,
    background: '#0b0b0c',
    borderRadius: 54,
    boxShadow: '0 0 0 1.5px #2a2a2e, 0 24px 60px rgba(0,0,0,0.28)',
  },
  screen: { position: 'relative', borderRadius: 44, overflow: 'hidden' },
  statusBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 26px 0 30px', fontSize: 15, fontWeight: 600,
    fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif',
    zIndex: 40, pointerEvents: 'none',
  },
  nav: {
    position: 'absolute', top: 44, left: 0, right: 0, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
    fontFamily: '-apple-system, "PingFang SC", sans-serif',
  },
  navTitle: { fontSize: 17, fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  back: { position: 'absolute', left: 6, top: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  capsule: {
    position: 'absolute', top: 48, right: 7, width: 87, height: 32, boxSizing: 'border-box',
    borderRadius: 16, display: 'flex', alignItems: 'center', zIndex: 50, pointerEvents: 'none',
  },
  capsuleHalf: { flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  capsuleSep: { width: 0.5, height: 18 },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 49 + 34,
    paddingBottom: 34, boxSizing: 'border-box', display: 'flex', zIndex: 30,
    fontFamily: '-apple-system, "PingFang SC", sans-serif',
  },
  tabItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, cursor: 'pointer' },
  homeIndicator: { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 999, zIndex: 60, pointerEvents: 'none' },
};

function WechatCapsule({ dark }) {
  // dark = 深色胶囊（白底页面用）；false = 浅色胶囊（深色页面用）
  const fg = dark ? '#000' : '#fff';
  const bg = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.15)';
  const bd = dark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.25)';
  return (
    <div data-mp-capsule="" data-lint-skip="" style={{ ...wechatFrameStyles.capsule, background: bg, border: `0.5px solid ${bd}` }}>
      <div style={wechatFrameStyles.capsuleHalf}>
        <svg width="20" height="6" viewBox="0 0 20 6"><circle cx="3" cy="3" r="2" fill={fg} /><circle cx="10" cy="3" r="2.6" fill={fg} /><circle cx="17" cy="3" r="2" fill={fg} /></svg>
      </div>
      <div style={{ ...wechatFrameStyles.capsuleSep, background: bd }} />
      <div style={wechatFrameStyles.capsuleHalf}>
        <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="none" stroke={fg} strokeWidth="1.6" /><circle cx="9" cy="9" r="2.6" fill={fg} /></svg>
      </div>
    </div>
  );
}

function WechatTabBar({ list, active, onChange, color = '#7A7E83', selectedColor = '#111111', backgroundColor = '#ffffff' }) {
  return (
    <div data-mp-tabbar="native" data-lint-skip="" style={{ ...wechatFrameStyles.tabBar, background: backgroundColor, borderTop: '0.5px solid rgba(0,0,0,0.12)' }}>
      {list.map(it => {
        const on = it.text === active;
        return (
          <div key={it.text} style={{ ...wechatFrameStyles.tabItem, color: on ? selectedColor : color }} onClick={() => onChange && onChange(it.text)}>
            {it.icon ? (typeof it.icon === 'function' ? it.icon(on) : it.icon) : <div style={{ width: 24, height: 24, borderRadius: 6, background: 'currentColor', opacity: on ? 1 : 0.35 }} />}
            <span>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function wechatIsDark(css) {   // 'rgb(43, 74, 58)' → 是否深色
  const m = (css || '').match(/\d+(\.\d+)?/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

function WechatFrame({
  children,
  page = 'pages/index/index',
  title = '',
  home = false,
  nav = 'default',
  navColor = '#ffffff',
  navText = 'black',
  back = false,
  onBack,
  tab,
  tabBar,
  onTabChange,
  footer,
  background = '#ffffff',
  width = 375,
  height = 812,
  time = '9:41',
}) {
  const statusColor = navText === 'white' ? '#fff' : '#000';
  const hasNativeTab = tabBar && tabBar.list && tabBar.list.length;
  const top = 84;
  const bottom = hasNativeTab ? 83 : 0;
  const footRef = React.useRef(null);
  const [footH, setFootH] = React.useState(0);
  const [footBg, setFootBg] = React.useState(null);
  React.useLayoutEffect(() => {   // 让出 footer 的高度；底部安全区沿用 footer 自己的底色
    const el = footRef.current;
    setFootH(el ? el.offsetHeight : 0);
    const c = el && el.firstElementChild ? getComputedStyle(el.firstElementChild).backgroundColor : null;
    setFootBg(c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : null);
  });
  return (
    <div style={wechatFrameStyles.wrapper}>
      <div
        style={{ ...wechatFrameStyles.screen, width, height, background }}
        data-mp-page={page}
        data-mp-title={title}
        data-mp-home={home ? '1' : ''}
        data-mp-nav={nav}
        data-mp-nav-color={navColor}
        data-mp-nav-text={navText}
        data-mp-tab={tab || ''}
        data-mp-tabbar-config={hasNativeTab ? JSON.stringify({ list: tabBar.list.map(t => t.text), color: tabBar.color || '#7A7E83', selectedColor: tabBar.selectedColor || '#111111', backgroundColor: tabBar.backgroundColor || '#ffffff' }) : ''}
      >
        <div data-mp-chrome="" data-lint-skip="" style={{ ...wechatFrameStyles.statusBar, color: statusColor }}>
          <span>{time}</span>
          <svg width="66" height="12" viewBox="0 0 66 12" fill={statusColor}>
            <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="6" width="3" height="6" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" />
            <path d="M30 11.2a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM25.6 6.4a6.4 6.4 0 018.8 0l-1.1 1.1a4.8 4.8 0 00-6.6 0zM23 3.8a10 10 0 0114 0l-1.1 1.1a8.4 8.4 0 00-11.8 0z" />
            <rect x="41" y="0.75" width="22" height="10.5" rx="3" fill="none" stroke={statusColor} strokeOpacity="0.45" strokeWidth="1" /><rect x="43" y="2.75" width="16" height="6.5" rx="1.5" /><rect x="64" y="4" width="1.5" height="4" rx="0.75" fillOpacity="0.45" />
          </svg>
        </div>

        {nav === 'default' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top, background: navColor, zIndex: 25 }} />
        )}
        {nav === 'default' && (
          <div style={{ ...wechatFrameStyles.nav, color: statusColor }}>
            {back && (
              <div style={wechatFrameStyles.back} onClick={onBack}>
                <svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2L2 10l8 8" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            )}
            <div style={wechatFrameStyles.navTitle}>{title}</div>
          </div>
        )}

        <WechatCapsule dark={navText !== 'white'} />

        <div data-mp-scroll="" style={{ position: 'absolute', top: nav === 'default' ? top : 0, left: 0, right: 0, bottom: bottom + footH, overflow: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div ref={footRef} data-mp-footer="" style={{ position: 'absolute', left: 0, right: 0, bottom, zIndex: 40, paddingBottom: hasNativeTab ? 0 : 34, background: footBg || background }}>
            {footer}
          </div>
        )}

        {hasNativeTab && <WechatTabBar {...tabBar} active={tab} onChange={onTabChange} />}
        <div style={{ ...wechatFrameStyles.homeIndicator, background: (!hasNativeTab && (footBg ? wechatIsDark(footBg) : navText === 'white')) ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.85)' }} />
      </div>
    </div>
  );
}

/**
 * WechatShareCard — 聊天里收到的小程序卡片（转发 onShareAppMessage 的样子）
 * 小程序最常被看见的地方不是首页，是群聊里这张卡。图按 5:4 画（imageUrl 显示比例），标题一到两行。
 *   <WechatShareCard appName="小满咖啡" title="今天的燕麦拿铁第二杯半价" icon={<img…/>}>{5:4 的画面}</WechatShareCard>
 * children 是 5:4 那张图本身（宽 220，高 176），会被标上 data-mp-share，交付包会单独导出它。
 */
function WechatShareCard({ appName, title, icon, children, width = 236 }) {
  const imgW = width - 16;
  return (
    <div style={{ width, background: '#fff', borderRadius: 6, padding: '10px 8px 0', boxSizing: 'border-box', fontFamily: '-apple-system, "PingFang SC", sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
      <div data-lint-skip="" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888', marginBottom: 6 }}>
        <div style={{ width: 16, height: 16, borderRadius: 999, overflow: 'hidden', background: '#eee', flexShrink: 0 }}>{icon}</div>
        <span>{appName}</span>
      </div>
      <div style={{ fontSize: 14, color: '#111', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</div>
      <div data-mp-share="" style={{ width: imgW, height: imgW * 4 / 5, overflow: 'hidden', background: '#f2f2f2', position: 'relative' }}>{children}</div>
      <div data-lint-skip="" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999', borderTop: '0.5px solid #eee', marginTop: 8, padding: '6px 0' }}>
        <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="none" stroke="#7d7df0" strokeWidth="1.4" /><circle cx="6" cy="6" r="1.8" fill="#7d7df0" /></svg>
        <span>小程序</span>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  Object.assign(window, { WechatFrame, WechatCapsule, WechatTabBar, WechatShareCard });
}
