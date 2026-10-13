/**
 * MacosWindow — macOS应用窗口边框（含traffic lights）
 *
 * 用法：
 *   <MacosWindow title="Finder">
 *     <YourAppContent />
 *   </MacosWindow>
 */

const macosWindowStyles = {
  window: {
    display: 'inline-block',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.15)',
  },
  titleBar: {
    height: 38,
    background: 'linear-gradient(to bottom, #e8e8e8, #d8d8d8)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
    position: 'relative',
    userSelect: 'none',
  },
  trafficLights: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
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
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 13,
    color: '#333',
    fontWeight: 500,
    fontFamily: '-apple-system, "SF Pro Text", sans-serif',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    overflow: 'auto',
  },
  titleBarDark: {
    background: 'linear-gradient(to bottom, #3c3c3c, #2c2c2c)',
    borderBottom: '0.5px solid rgba(255,255,255,0.1)',
  },
  titleDark: {
    color: '#ddd',
  },
};

function MacosWindow({ title = '', width = 900, height = 600, darkMode = false, children }) {
  return (
    <div style={{ ...macosWindowStyles.window, background: darkMode ? '#1e1e1e' : '#fff' }}>
      <div style={{
        ...macosWindowStyles.titleBar,
        ...(darkMode ? macosWindowStyles.titleBarDark : {}),
      }}>
        <div style={macosWindowStyles.trafficLights}>
          <div style={{ ...macosWindowStyles.light, ...macosWindowStyles.close }} />
          <div style={{ ...macosWindowStyles.light, ...macosWindowStyles.minimize }} />
          <div style={{ ...macosWindowStyles.light, ...macosWindowStyles.maximize }} />
        </div>
        {title && (
          <div style={{
            ...macosWindowStyles.title,
            ...(darkMode ? macosWindowStyles.titleDark : {}),
          }}>
            {title}
          </div>
        )}
      </div>
      <div style={{ ...macosWindowStyles.content, width, height }}>
        {children}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MacosWindow = MacosWindow;
}
