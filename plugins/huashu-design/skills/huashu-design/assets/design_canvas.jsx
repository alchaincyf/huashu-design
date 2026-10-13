/**
 * DesignCanvas — 变体并排网格布局
 *
 * 用于展示2+个静态设计variations让用户对比选择。
 * 每个variation有label，可hover放大。
 *
 * 用法：
 *   <DesignCanvas
 *     title="Hero区设计探索"
 *     subtitle="3个方向对比"
 *     columns={3}
 *   >
 *     <Variation label="Minimal" description="极简克制版">
 *       <div>...你的设计1...</div>
 *     </Variation>
 *     <Variation label="Editorial" description="杂志编辑风">
 *       <div>...你的设计2...</div>
 *     </Variation>
 *     <Variation label="Brutalist" description="粗粝原始">
 *       <div>...你的设计3...</div>
 *     </Variation>
 *   </DesignCanvas>
 *
 * 配合React+Babel使用。放在合适的script里，然后window.DesignCanvas/window.Variation可用。
 */

const canvasStyles = {
  container: {
    minHeight: '100vh',
    background: '#F5F5F0',
    padding: '40px 60px',
    fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif',
  },
  header: {
    marginBottom: 48,
    maxWidth: 900,
  },
  title: {
    fontSize: 36,
    fontWeight: 600,
    marginBottom: 12,
    color: '#1A1A1A',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gap: 32,
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cellHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #E0E0DA',
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1A1A',
    letterSpacing: '-0.01em',
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
  frame: {
    background: '#fff',
    borderRadius: 4,
    border: '1px solid #E0E0DA',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  frameInner: {
    position: 'relative',
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    zIndex: 10,
    pointerEvents: 'none',
  },
};

function DesignCanvas({ title, subtitle, columns = 3, children }) {
  const [expanded, setExpanded] = React.useState(null);

  const gridStyle = {
    ...canvasStyles.grid,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };

  return (
    <div style={canvasStyles.container}>
      {(title || subtitle) && (
        <div style={canvasStyles.header}>
          {title && <h1 style={canvasStyles.title}>{title}</h1>}
          {subtitle && <p style={canvasStyles.subtitle}>{subtitle}</p>}
        </div>
      )}

      <div style={gridStyle}>
        {React.Children.map(children, (child, idx) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                _index: idx,
                _expanded: expanded === idx,
                _onToggle: () => setExpanded(expanded === idx ? null : idx),
              })
            : child
        )}
      </div>

      {expanded !== null && (
        <div
          onClick={() => setExpanded(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 8,
              overflow: 'hidden',
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
            }}
          >
            {React.Children.toArray(children)[expanded]}
          </div>
        </div>
      )}
    </div>
  );
}

function Variation({ label, description, number, children, _index, _expanded, _onToggle, aspectRatio = '4 / 3' }) {
  const displayNumber = number || String(_index + 1).padStart(2, '0');

  return (
    <div style={canvasStyles.cell}>
      <div style={canvasStyles.cellHeader}>
        <span style={{ ...canvasStyles.label, color: '#999', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
          {displayNumber}
        </span>
        <span style={canvasStyles.label}>{label}</span>
        {description && <span style={canvasStyles.description}>— {description}</span>}
      </div>

      <div
        onClick={_onToggle}
        style={{
          ...canvasStyles.frame,
          aspectRatio,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={canvasStyles.frameInner}>
          {children}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  Object.assign(window, { DesignCanvas, Variation });
}
