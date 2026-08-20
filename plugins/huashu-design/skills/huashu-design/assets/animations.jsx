/**
 * animations.jsx — 时间轴动画引擎
 *
 * Stage + Sprite 模式，借鉴Remotion但轻量化。
 *
 * 导出（挂到 window.Animations）：
 * - Stage: 整个动画容器，提供时间+控制
 * - Sprite: 时间片段，start/end内显示，提供本地进度
 * - useTime(): 读全局时间（秒）
 * - useSprite(): 读本地进度 {t: 0→1, elapsed: seconds, duration: seconds}
 * - Easing: {linear, easeIn, easeOut, easeInOut, spring, anticipation}
 * - interpolate(t, [input0, input1], [output0, output1], easing?)
 *
 * 用法：
 *   <Stage duration={10}>
 *     <Sprite start={0} end={3}>
 *       <Title />
 *     </Sprite>
 *     <Sprite start={2} end={5}>
 *       <Subtitle />
 *     </Sprite>
 *   </Stage>
 *
 * 在Sprite子组件里用 useSprite() 读当前片段进度。
 */

(function() {
  const { createContext, useContext, useState, useEffect, useRef, useCallback } = React;

  const TimeContext = createContext({ time: 0, duration: 10, playing: false });
  const SpriteContext = createContext(null);

  const Easing = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => 1 - (1 - t) * (1 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    // expoOut: Anthropic-level 主 easing (cubic-bezier(0.16, 1, 0.3, 1))
    // 迅速启动 + 缓慢刹车，给数字元素物理重量感
    expoOut: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    // overshoot: 带弹性的 toggle/按钮弹出 (cubic-bezier(0.34, 1.56, 0.64, 1))
    overshoot: t => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    spring: t => {
      const c = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c) + 1;
    },
    anticipation: t => {
      if (t < 0.2) return -0.3 * (t / 0.2) * (t / 0.2);
      const adjusted = (t - 0.2) / 0.8;
      return -0.012 + 1.012 * adjusted * adjusted * (3 - 2 * adjusted);
    },
  };

  function interpolate(t, input, output, easing) {
    const [inStart, inEnd] = input;
    const [outStart, outEnd] = output;

    if (t <= inStart) return outStart;
    if (t >= inEnd) return outEnd;

    let progress = (t - inStart) / (inEnd - inStart);
    if (easing) {
      progress = easing(progress);
    }

    return outStart + (outEnd - outStart) * progress;
  }

  function useTime() {
    const ctx = useContext(TimeContext);
    return ctx.time;
  }

  function useSprite() {
    const sprite = useContext(SpriteContext);
    if (!sprite) {
      return { t: 0, elapsed: 0, duration: 0 };
    }
    return sprite;
  }

  const stageStyles = {
    wrapper: {
      position: 'fixed',
      inset: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, sans-serif',
    },
    stageHolder: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    },
    canvas: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transformOrigin: 'center center',
      background: '#111',
      overflow: 'hidden',
    },
    controls: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      color: '#fff',
      fontSize: 12,
      zIndex: 100,
    },
    button: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.3)',
      color: '#fff',
      padding: '6px 14px',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 12,
    },
    timeDisplay: {
      fontFamily: 'ui-monospace, monospace',
      fontVariantNumeric: 'tabular-nums',
      minWidth: 90,
    },
    scrubber: {
      flex: 1,
      height: 4,
      background: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      position: 'relative',
      cursor: 'pointer',
    },
    scrubberFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      background: '#fff',
      borderRadius: 2,
      pointerEvents: 'none',
    },
    scrubberHandle: {
      position: 'absolute',
      top: '50%',
      width: 12,
      height: 12,
      background: '#fff',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    },
  };

  function Stage({ duration = 10, width = 1920, height = 1080, fps = 60, loop = true, children, bgColor = '#fff' }) {
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [scale, setScale] = useState(1);
    const rafRef = useRef(null);
    const startTimeRef = useRef(performance.now());
    const canvasRef = useRef(null);

    // Recording mode: render-video.js injects window.__recording = true before goto.
    // When set, force loop=false so the export ends on the final frame instead of
    // wrapping back to t=0 and capturing the start of the next cycle.
    // (Browsers viewing manually still loop because __recording is undefined there.)
    const effectiveLoop = (typeof window !== 'undefined' && window.__recording) ? false : loop;

    useEffect(() => {
      function updateScale() {
        const vw = window.innerWidth;
        const vh = window.innerHeight - 56;
        const s = Math.min(vw / width, vh / height);
        setScale(s);
      }
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, [width, height]);

    useEffect(() => {
      // Seek-render mode (render-video-seek.js sets window.__seekRender): freeze the
      // self-driven clock and let the external renderer advance each frame via
      // window.__seek(t). No rAF self-drive here — every frame is a deterministic seek.
      if (typeof window !== 'undefined' && window.__seekRender) {
        window.__ready = true;
        window.__seek = (t) => setTime(Math.min(t, duration - 0.001));
        return;
      }
      if (!playing) return;
      let cancelled = false;
      let last = null;

      function tick(now) {
        if (cancelled) return;
        if (last === null) {
          // First animation frame. Set last=now so delta starts at 0,
          // AND announce readiness for video export.
          // This pairing is critical: window.__ready must flip to true at
          // the exact moment WebM captures frame 0 of the animation, so
          // render-video.js's trim offset equals the pre-animation gap.
          last = now;
          if (typeof window !== 'undefined') window.__ready = true;
        }
        const delta = (now - last) / 1000;
        last = now;
        setTime(prev => {
          const next = prev + delta;
          if (next >= duration) {
            // effectiveLoop honors window.__recording (forced non-loop during export).
            // Stop just shy of duration so the final-frame state stays rendered
            // (avoids exiting all Sprites that end exactly at `duration`).
            return effectiveLoop ? 0 : duration - 0.001;
          }
          return next;
        });
        rafRef.current = requestAnimationFrame(tick);
      }

      // Wait for fonts before starting the clock — makes frame 0 the
      // real "finished-loading" frame users see, not a fallback-font flash.
      const startAfterFonts = () => {
        if (cancelled) return;
        rafRef.current = requestAnimationFrame(tick);
      };
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(startAfterFonts);
      } else {
        startAfterFonts();
      }

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafRef.current);
      };
    }, [playing, duration, effectiveLoop]);

    const handleScrub = useCallback((e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setTime(Math.max(0, Math.min(duration, ratio * duration)));
    }, [duration]);

    const handleSeek = useCallback((e) => {
      handleScrub(e);
      setPlaying(false);
    }, [handleScrub]);

    const progress = time / duration;

    const ctx = {
      time,
      duration,
      playing,
      setPlaying,
      setTime,
    };

    const canvasStyle = {
      ...stageStyles.canvas,
      width,
      height,
      background: bgColor,
      transform: `translate(-50%, -50%) scale(${scale})`,
    };

    return (
      <TimeContext.Provider value={ctx}>
        <div style={stageStyles.wrapper}>
          <div style={stageStyles.stageHolder}>
            <div ref={canvasRef} style={canvasStyle}>
              {children}
            </div>
          </div>

          <div style={stageStyles.controls}>
            <button
              style={stageStyles.button}
              onClick={() => setPlaying(p => !p)}
            >
              {playing ? '⏸ 暂停' : '▶ 播放'}
            </button>

            <button
              style={stageStyles.button}
              onClick={() => setTime(0)}
            >
              ⏮ 开始
            </button>

            <div style={stageStyles.timeDisplay}>
              {time.toFixed(2)}s / {duration.toFixed(2)}s
            </div>

            <div style={stageStyles.scrubber} onMouseDown={handleSeek}>
              <div style={{ ...stageStyles.scrubberFill, width: `${progress * 100}%` }} />
              <div style={{ ...stageStyles.scrubberHandle, left: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </TimeContext.Provider>
    );
  }

  function Sprite({ start = 0, end, children, style }) {
    const { time } = useContext(TimeContext);
    const actualEnd = end == null ? Infinity : end;

    if (time < start || time >= actualEnd) {
      return null;
    }

    const duration = actualEnd - start;
    const elapsed = time - start;
    const t = duration === 0 ? 1 : Math.max(0, Math.min(1, elapsed / duration));

    const spriteValue = { t, elapsed, duration, start, end: actualEnd };

    return (
      <SpriteContext.Provider value={spriteValue}>
        <div style={{ position: 'absolute', inset: 0, ...style }}>
          {children}
        </div>
      </SpriteContext.Provider>
    );
  }

  if (typeof window !== 'undefined') {
    window.Animations = {
      Stage,
      Sprite,
      useTime,
      useSprite,
      Easing,
      interpolate,
    };
  }
})();
