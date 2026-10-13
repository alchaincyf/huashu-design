/**
 * BrowserWindow — 浏览器窗口边框（Chrome风格）
 *
 * 含：traffic lights + tab bar + URL bar
 *
 * 用法：
 *   <BrowserWindow url="https://example.com" title="Example">
 *     <YourWebPage />
 *   </BrowserWindow>
 */

const browserWindowStyles = {
  window: {
    display: 'inline-block',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.15)',
  },
  chrome: {
    background: '#dee1e6',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    userSelect: 'none',
  },
  tabRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    position: 'relative',
  },
  trafficLights: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    paddingBottom: 10,
    marginRight: 8,
  },
  light: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '0.5px solid rgba(0,0,0,0.15)',
  },
  close: { background: '#ff5f57' },
  minimize: { background: '#febc2e' },
  maximize: { background: '#28c840' },
  tab: {
    background: '#fff',
    padding: '8px 30px 8px 14px',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    fontSize: 12,
    color: '#222',
    fontFamily: '-apple-system, sans-serif',
    maxWidth: 220,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  favicon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    background: '#999',
    flexShrink: 0,
  },
  navBar: {
    background: '#fff',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  navButtons: {
    display: 'flex',
    gap: 4,
    color: '#5f6368',
    fontSize: 16,
  },
  navButton: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  urlBar: {
    flex: 1,
    background: '#f1f3f4',
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 13,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: '-apple-system, sans-serif',
  },
  lockIcon: {
    color: '#5f6368',
    fontSize: 12,
  },
  content: {
    position: 'relative',
    overflow: 'auto',
    background: '#fff',
  },
};

function BrowserWindow({
  title = 'New Tab',
  url = 'https://example.com',
  width = 1200,
  height = 800,
  showTrafficLights = true,
  children,
}) {
  return (
    <div style={browserWindowStyles.window}>
      <div style={browserWindowStyles.chrome}>
        <div style={browserWindowStyles.tabRow}>
          {showTrafficLights && (
            <div style={browserWindowStyles.trafficLights}>
              <div style={{ ...browserWindowStyles.light, ...browserWindowStyles.close }} />
              <div style={{ ...browserWindowStyles.light, ...browserWindowStyles.minimize }} />
              <div style={{ ...browserWindowStyles.light, ...browserWindowStyles.maximize }} />
            </div>
          )}
          <div style={browserWindowStyles.tab}>
            <div style={browserWindowStyles.favicon} />
            <span>{title}</span>
          </div>
        </div>
      </div>

      <div style={browserWindowStyles.navBar}>
        <div style={browserWindowStyles.navButtons}>
          <div style={browserWindowStyles.navButton}>←</div>
          <div style={browserWindowStyles.navButton}>→</div>
          <div style={browserWindowStyles.navButton}>↻</div>
        </div>
        <div style={browserWindowStyles.urlBar}>
          <span style={browserWindowStyles.lockIcon}>🔒</span>
          <span>{url}</span>
        </div>
      </div>

      <div style={{ ...browserWindowStyles.content, width, height }}>
        {children}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.BrowserWindow = BrowserWindow;
}
