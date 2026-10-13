/**
 * IosFrame — iPhone设备边框
 *
 * 参考iPhone 15 Pro（393×852 logical pixels）
 * 含：灵动岛 + 状态栏（时间/信号/电池）+ Home Indicator + 圆角
 *
 * 用法：
 *   <IosFrame time="9:41" battery={85}>
 *     <YourAppContent />
 *   </IosFrame>
 *
 * 自定义：
 *   <IosFrame width={390} height={844} darkMode showKeyboard>
 *     ...
 *   </IosFrame>
 */

const iosFrameStyles = {
  wrapper: {
    display: 'inline-block',
    padding: 12,
    background: '#000',
    borderRadius: 60,
    boxShadow: '0 0 0 2px #1f2937, 0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  screen: {
    position: 'relative',
    borderRadius: 48,
    overflow: 'hidden',
    background: '#fff',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px 0 32px',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: '-apple-system, "SF Pro Text", sans-serif',
    zIndex: 20,
    pointerEvents: 'none',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 124,
    height: 36,
    background: '#000',
    borderRadius: 999,
    zIndex: 30,
  },
  statusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  signalIcon: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 12,
  },
  signalBar: {
    width: 3,
    background: 'currentColor',
    borderRadius: 1,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    position: 'relative',
  },
  batteryIcon: {
    width: 26,
    height: 12,
    border: '1.5px solid currentColor',
    borderRadius: 3,
    padding: 1,
    position: 'relative',
    opacity: 0.8,
  },
  batteryCap: {
    position: 'absolute',
    top: 3,
    right: -3,
    width: 2,
    height: 6,
    background: 'currentColor',
    borderRadius: '0 1px 1px 0',
  },
  content: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    bottom: 34,
    overflow: 'auto',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 140,
    height: 5,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    zIndex: 10,
  },
  homeIndicatorDark: {
    background: 'rgba(255,255,255,0.5)',
  },
};

function IosFrame({
  children,
  width = 393,
  height = 852,
  time = '9:41',
  battery = 100,
  darkMode = false,
  showStatusBar = true,
  showDynamicIsland = true,
  showHomeIndicator = true,
}) {
  const textColor = darkMode ? '#fff' : '#000';

  return (
    <div style={iosFrameStyles.wrapper}>
      <div style={{
        ...iosFrameStyles.screen,
        width,
        height,
        background: darkMode ? '#000' : '#fff',
      }}>
        {showStatusBar && (
          <div style={{ ...iosFrameStyles.statusBar, color: textColor }}>
            <span>{time}</span>
            <div style={iosFrameStyles.statusIcons}>
              <div style={iosFrameStyles.signalIcon}>
                <div style={{ ...iosFrameStyles.signalBar, height: 4 }} />
                <div style={{ ...iosFrameStyles.signalBar, height: 6 }} />
                <div style={{ ...iosFrameStyles.signalBar, height: 9 }} />
                <div style={{ ...iosFrameStyles.signalBar, height: 11 }} />
              </div>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ color: textColor }}>
                <path d="M8 11.5a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
                <path d="M3 7.5a7 7 0 0110 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M1 4.5a11 11 0 0114 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7" />
              </svg>
              <div style={iosFrameStyles.batteryIcon}>
                <div style={{
                  width: `${battery}%`,
                  height: '100%',
                  background: 'currentColor',
                  borderRadius: 1,
                  opacity: 0.9,
                }} />
                <div style={iosFrameStyles.batteryCap} />
              </div>
            </div>
          </div>
        )}

        {showDynamicIsland && <div style={iosFrameStyles.dynamicIsland} />}

        <div style={iosFrameStyles.content}>
          {children}
        </div>

        {showHomeIndicator && (
          <div style={{
            ...iosFrameStyles.homeIndicator,
            ...(darkMode ? iosFrameStyles.homeIndicatorDark : {}),
          }} />
        )}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.IosFrame = IosFrame;
}
