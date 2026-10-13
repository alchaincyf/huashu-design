/**
 * AndroidFrame — Android设备边框（参考Pixel 8系列）
 *
 * 含：punch-hole相机 + 状态栏 + 导航栏 + 圆角
 *
 * 用法：
 *   <AndroidFrame time="9:41" battery={85}>
 *     <YourAppContent />
 *   </AndroidFrame>
 */

const androidFrameStyles = {
  wrapper: {
    display: 'inline-block',
    padding: 10,
    background: '#1a1a1a',
    borderRadius: 44,
    boxShadow: '0 0 0 2px #2a2a2a, 0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  screen: {
    position: 'relative',
    borderRadius: 36,
    overflow: 'hidden',
    background: '#fff',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'Roboto, -apple-system, sans-serif',
    zIndex: 20,
    pointerEvents: 'none',
  },
  punchHole: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 14,
    height: 14,
    background: '#000',
    borderRadius: '50%',
    zIndex: 30,
  },
  statusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 2,
  },
  content: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    bottom: 24,
    overflow: 'auto',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
    zIndex: 10,
  },
  navButton: {
    width: 36,
    height: 4,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
  },
};

function AndroidFrame({
  children,
  width = 412,
  height = 892,
  time = '9:41',
  battery = 100,
  darkMode = false,
  navStyle = 'gesture',
}) {
  const textColor = darkMode ? '#fff' : '#1a1a1a';

  return (
    <div style={androidFrameStyles.wrapper}>
      <div style={{
        ...androidFrameStyles.screen,
        width,
        height,
        background: darkMode ? '#000' : '#fff',
      }}>
        <div style={{ ...androidFrameStyles.statusBar, color: textColor }}>
          <span>{time}</span>
          <div style={androidFrameStyles.statusIcons}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
              <rect x="0" y="6" width="2" height="4" rx="0.5" />
              <rect x="4" y="4" width="2" height="6" rx="0.5" />
              <rect x="8" y="2" width="2" height="8" rx="0.5" />
              <rect x="12" y="0" width="2" height="10" rx="0.5" />
            </svg>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M7 9a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
              <path d="M3 6a5 5 0 018 0" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0.5 3.5a11 11 0 0113 0" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </svg>
            <div style={{
              width: 22,
              height: 10,
              border: '1.5px solid currentColor',
              borderRadius: 2,
              padding: 1,
              position: 'relative',
            }}>
              <div style={{
                width: `${battery}%`,
                height: '100%',
                background: 'currentColor',
                borderRadius: 1,
              }} />
            </div>
            <span style={androidFrameStyles.batteryText}>{battery}%</span>
          </div>
        </div>

        <div style={androidFrameStyles.punchHole} />

        <div style={androidFrameStyles.content}>
          {children}
        </div>

        {navStyle === 'gesture' && (
          <div style={androidFrameStyles.navBar}>
            <div style={{
              ...androidFrameStyles.navButton,
              width: 100,
              height: 4,
              background: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
            }} />
          </div>
        )}

        {navStyle === 'buttons' && (
          <div style={androidFrameStyles.navBar}>
            <span style={{ color: textColor, fontSize: 20 }}>◁</span>
            <span style={{ color: textColor, fontSize: 16 }}>○</span>
            <span style={{ color: textColor, fontSize: 16 }}>□</span>
          </div>
        )}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AndroidFrame = AndroidFrame;
}
