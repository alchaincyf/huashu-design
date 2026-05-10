/**
 * narration_stage.jsx · 解说驱动 Stage
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛑 用这套工具之前必读：references/voiceover-pipeline.md         ║
 * ║                                                                  ║
 * ║  铁律 #1: 整片是一个连续的运动叙事，不是一组独立场景             ║
 * ║          You are not making 7 slides. You are directing 1 movie. ║
 * ║                                                                  ║
 * ║  铁律 #2: 选定 hero element 跨 scene 持续存在，不要每段一个新布局║
 * ║                                                                  ║
 * ║  铁律 #3: scene 之间禁止硬切（opacity 1→0/0→1）                  ║
 * ║          要 morph，不要 cut                                      ║
 * ║                                                                  ║
 * ║  失败模式 #1（本 skill v1 实战踩坑）：                           ║
 * ║          每个 Scene 各自独立 layout + cue 用 fade-up + scene 切换║
 * ║          整页 opacity 切换 = 带配音的 PowerPoint = 质感归零       ║
 * ║                                                                  ║
 * ║  正确做法：把 hero 直接放在 <NarrationStage> 子级（不进 Scene）  ║
 * ║          用 useNarration() 在 hero 里读 time/scene/cue 状态      ║
 * ║          hero 自己根据当前时间决定形态 → 跨 scene 连续运动       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 用法（inline 进 HTML 的 <script type="text/babel">）：
 *   const { NarrationStage, Scene, Cue, useNarration } = NarrationStageLib;
 *
 *   const App = () => (
 *     <NarrationStage timeline={TIMELINE} audioSrc="voiceover.mp3"
 *                     width={1920} height={1080}>
 *       <Scene id="intro">
 *         <h1>什么是 token</h1>
 *         <Cue id="question">
 *           {(triggered) => triggered && <p>↑ 这是问题</p>}
 *         </Cue>
 *       </Scene>
 *       <Scene id="token-2">
 *         <Cue id="split">
 *           {(triggered, progress) => (
 *             <div style={{opacity: triggered ? 1 : 0.3}}>...</div>
 *           )}
 *         </Cue>
 *       </Scene>
 *     </NarrationStage>
 *   );
 *
 * 时间源（自动二选一）：
 *   - 录视频模式（window.__recording === true）：走 window.__time（外部 driver 推帧）
 *   - 实播模式：走 <audio> 的 currentTime（用户点播放时和音频严格同步）
 *
 * 与 render-video.js 兼容：
 *   - tick 第一帧设 window.__ready = true
 *   - 录视频时检测 window.__recording 强制不播 audio、用 window.__time
 *   - 暴露 window.__totalDuration 给 driver 算总帧数
 *
 * 依赖：React 18 + ReactDOM 18 + Babel standalone（同 animations.jsx）
 */

const NarrationStageLib = (() => {
  const NarrationContext = React.createContext({
    time: 0,
    scene: null,
    sceneTime: 0,
    isCueTriggered: () => false,
    cueProgress: () => 0,
  });

  /**
   * 主组件：吃 timeline + audio，提供 context
   *
   * Props:
   *   timeline       timeline.json 对象（必需）
   *   audioSrc       voiceover.mp3 路径（必需）
   *   width/height   Stage 尺寸，默认 1920x1080
   *   background     默认 '#0e0e0e'
   *   controls       是否显示底部播放条，默认 true
   *   children       动画内容（用 <Scene>/<Cue> 组织）
   */
  function NarrationStage({
    timeline,
    audioSrc,
    width = 1920,
    height = 1080,
    background = '#0e0e0e',
    controls = true,
    children,
  }) {
    const audioRef = React.useRef(null);
    const [time, setTime] = React.useState(0);
    const [playing, setPlaying] = React.useState(false);
    const recording = typeof window !== 'undefined' && window.__recording === true;

    // 暴露给 render-video.js
    React.useEffect(() => {
      if (typeof window === 'undefined') return;
      window.__totalDuration = timeline.totalDuration;
      window.__ready = true;
    }, [timeline.totalDuration]);

    // 时间 tick
    React.useEffect(() => {
      let raf;
      if (recording) {
        // 录视频模式：rAF wall-clock 自驱动从 0 开始
        // 兼容 render-video.js（它依赖动画自然推进 + window.__seek 复位）
        let startedAt = null;
        const tick = (now) => {
          if (startedAt === null) startedAt = now;
          setTime(Math.min((now - startedAt) / 1000, timeline.totalDuration));
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        // 暴露 __seek 给 render-video.js 在 ready 后调 __seek(0) 复位
        if (typeof window !== 'undefined') {
          window.__seek = (t) => {
            startedAt = performance.now() - t * 1000;
            setTime(t);
          };
        }
      } else {
        // 实播模式：跟随 audio.currentTime
        const tick = () => {
          if (audioRef.current && !audioRef.current.paused) {
            setTime(audioRef.current.currentTime);
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      }
      return () => cancelAnimationFrame(raf);
    }, [recording, timeline.totalDuration]);

    // 当前 scene
    const currentScene = React.useMemo(() => {
      if (!timeline.scenes) return null;
      // 找到 start <= time < end 的段。最后一段保留到 end
      for (let i = 0; i < timeline.scenes.length; i++) {
        const s = timeline.scenes[i];
        const next = timeline.scenes[i + 1];
        if (time >= s.start && (!next || time < next.start)) return s;
      }
      return timeline.scenes[0];
    }, [time, timeline.scenes]);

    const sceneTime = currentScene ? Math.max(0, time - currentScene.start) : 0;

    // 找 cue 状态（按 absoluteTime 比较，跨 scene 也能查）
    const allCues = React.useMemo(() => {
      const map = {};
      for (const s of timeline.scenes || []) {
        for (const c of s.cues || []) {
          map[c.id] = c;
        }
      }
      return map;
    }, [timeline.scenes]);

    const isCueTriggered = React.useCallback(
      (cueId) => {
        const c = allCues[cueId];
        if (!c) return false;
        return time >= c.absoluteTime;
      },
      [allCues, time],
    );

    /** 触发后多少秒 0→1，>1 后保持 1。用于 cue 后做渐入动画 */
    const cueProgress = React.useCallback(
      (cueId, ramp = 0.5) => {
        const c = allCues[cueId];
        if (!c) return 0;
        const dt = time - c.absoluteTime;
        if (dt <= 0) return 0;
        if (dt >= ramp) return 1;
        return dt / ramp;
      },
      [allCues, time],
    );

    const ctx = { time, scene: currentScene, sceneTime, isCueTriggered, cueProgress, timeline };

    // play/pause/seek 控制
    const handlePlayPause = () => {
      if (!audioRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current.play();
        setPlaying(true);
      } else {
        audioRef.current.pause();
        setPlaying(false);
      }
    };

    const handleSeek = (e) => {
      if (!audioRef.current) return;
      const t = parseFloat(e.target.value);
      audioRef.current.currentTime = t;
      setTime(t);
    };

    const handleAudioEnded = () => setPlaying(false);

    return (
      <NarrationContext.Provider value={ctx}>
        <div
          style={{
            position: 'relative',
            width,
            height,
            background,
            overflow: 'hidden',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
          }}
        >
          {children}
        </div>
        {!recording && (
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="auto"
            onEnded={handleAudioEnded}
          />
        )}
        {!recording && controls && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: '#1a1a1a',
              color: '#ddd',
              fontFamily: 'monospace',
              fontSize: 13,
              width,
              boxSizing: 'border-box',
            }}
          >
            <button
              onClick={handlePlayPause}
              style={{
                padding: '6px 14px',
                background: '#fff',
                color: '#000',
                border: 0,
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
            <input
              type="range"
              min={0}
              max={timeline.totalDuration}
              step={0.01}
              value={time}
              onChange={handleSeek}
              style={{ flex: 1 }}
            />
            <span style={{ minWidth: 110, textAlign: 'right' }}>
              {time.toFixed(2)} / {timeline.totalDuration.toFixed(2)}s
            </span>
            <span
              style={{
                padding: '4px 10px',
                background: '#2a2a2a',
                borderRadius: 4,
                minWidth: 100,
                textAlign: 'center',
              }}
            >
              {currentScene ? currentScene.id : '—'}
            </span>
          </div>
        )}
      </NarrationContext.Provider>
    );
  }

  /**
   * Scene 包裹器：只在指定 scene id 激活时渲染 children
   *
   * Props:
   *   id        scene id（对应 timeline.scenes[].id）
   *   children  渲染内容；可以是 ReactNode 或 (sceneTime, sceneInfo) => ReactNode
   *   keepMounted 默认 false。设 true 则一直挂载只切换 visibility（动画连贯需要时用）
   */
  function Scene({ id, children, keepMounted = false }) {
    const { scene, sceneTime } = React.useContext(NarrationContext);
    const isActive = scene && scene.id === id;
    if (!isActive && !keepMounted) return null;
    const content = typeof children === 'function' ? children(sceneTime, scene) : children;
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? 'auto' : 'none',
          transition: keepMounted ? 'opacity 0.2s' : undefined,
        }}
      >
        {content}
      </div>
    );
  }

  /**
   * Cue 包裹器：监听 cue 触发状态
   *
   * Props:
   *   id        cue id（对应 timeline.scenes[].cues[].id）
   *   ramp      cue 触发后 progress 0→1 的 ramp 时长（秒），默认 0.5
   *   children  必须是函数：(triggered: bool, progress: 0-1) => ReactNode
   */
  function Cue({ id, ramp = 0.5, children }) {
    const { isCueTriggered, cueProgress } = React.useContext(NarrationContext);
    const triggered = isCueTriggered(id);
    const progress = cueProgress(id, ramp);
    return children(triggered, progress);
  }

  /** Hook：在自定义组件里直接拿 narration 状态 */
  function useNarration() {
    return React.useContext(NarrationContext);
  }

  /**
   * splitChunkToLines · 把一段文字按标点切成 ≤maxLen 字的短行
   *
   * 用于字幕显示——B 站标准是单行 ≤12 字便于阅读。本函数：
   * 1. 先按强标点（。！？\n）切句，绝不跨句号截断
   * 2. 每句 ≤ maxLen 直接用，否则按弱标点（，、；：）切片合并
   * 3. 中英混合：英文/数字按 0.5 字算视觉宽度
   * 4. 兜底硬切（罕见：单个标点段超 maxLen）
   *
   * @param text   原文
   * @param maxLen 单行最大视觉长度，默认 13（≈12 字 + 一个标点）
   * @returns 切好的字幕行数组
   */
  function visualLen(s) {
    let n = 0;
    for (const ch of s) n += /[a-zA-Z0-9 .,'":;\-]/.test(ch) ? 0.5 : 1;
    return n;
  }
  function splitChunkToLines(text, maxLen = 13) {
    const lines = [];
    const sentences = [];
    let buf = '';
    for (const ch of text) {
      buf += ch;
      if ('。！？\n'.includes(ch)) { if (buf.trim()) sentences.push(buf.trim()); buf = ''; }
    }
    if (buf.trim()) sentences.push(buf.trim());
    for (const sent of sentences) {
      if (visualLen(sent) <= maxLen) { lines.push(sent); continue; }
      const parts = [];
      let pbuf = '';
      for (const ch of sent) {
        pbuf += ch;
        if ('，、；：'.includes(ch)) { parts.push(pbuf); pbuf = ''; }
      }
      if (pbuf) parts.push(pbuf);
      let merged = '';
      for (const p of parts) {
        if (visualLen(merged) + visualLen(p) <= maxLen) merged += p;
        else { if (merged) lines.push(merged); merged = p; }
      }
      if (merged) {
        if (visualLen(merged) <= maxLen) lines.push(merged);
        else {
          let hbuf = '';
          for (const ch of merged) { hbuf += ch; if (visualLen(hbuf) >= maxLen) { lines.push(hbuf); hbuf = ''; } }
          if (hbuf) lines.push(hbuf);
        }
      }
    }
    return lines.filter(l => l.trim());
  }

  /**
   * Subtitles · B 站风格字幕组件（白光晕深墨字，无背景，按 chunks 时间显示）
   *
   * 自动从当前 scene.chunks 取活动 chunk，按 splitChunkToLines 切成短行，
   * 按字数比例分配 chunk 时间窗给每行显示。
   *
   * 必需：timeline.scenes[].chunks[]（narrate-pipeline.mjs 已默认输出）
   *
   * Props（可覆盖默认样式）：
   *   bottom    距底部像素，默认 90（不贴边）
   *   fontSize  字号，默认 32
   *   color     字色，默认深墨 #1a1a1a（适合浅纸白底）
   *   haloColor 光晕色，默认 rgba(245,241,232,0.9)（适合 #f5f1e8 底）
   *   maxLen    单行最大视觉长度，默认 13
   *
   * 深底场景：把 color 改成 '#fff'，haloColor 改成 'rgba(0,0,0,0.85)' 即可。
   */
  function Subtitles({ bottom = 90, fontSize = 32, color = '#1a1a1a', haloColor = 'rgba(245,241,232,0.9)', maxLen = 13 } = {}) {
    const { time, scene } = React.useContext(NarrationContext);
    if (!scene || !scene.chunks) return null;
    const active = scene.chunks.find(c => time >= c.absoluteStart && time < c.absoluteEnd);
    if (!active) return null;
    const lines = splitChunkToLines(active.text, maxLen);
    if (lines.length === 0) return null;
    const totalLen = lines.reduce((s, l) => s + visualLen(l), 0);
    const chunkDur = active.absoluteEnd - active.absoluteStart;
    let acc = active.absoluteStart;
    let activeLine = lines[lines.length - 1];
    let lineStart = active.absoluteStart;
    for (const line of lines) {
      const dur = (visualLen(line) / totalLen) * chunkDur;
      if (time < acc + dur) { activeLine = line; lineStart = acc; break; }
      acc += dur;
    }
    const lineProg = Math.min(1, (time - lineStart) / 0.15);
    return React.createElement('div', {
      style: { position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 },
    }, React.createElement('div', {
      key: lineStart,
      style: {
        fontFamily: '"PingFang SC", "Noto Sans SC", -apple-system, sans-serif',
        fontSize, fontWeight: 600, color,
        letterSpacing: '0.04em', lineHeight: 1.2, textAlign: 'center',
        textShadow: `0 0 6px ${haloColor}, 0 0 12px ${haloColor}, 0 1px 2px rgba(255,255,255,0.5)`,
        opacity: lineProg, transform: `translateY(${(1 - lineProg) * 4}px)`,
      },
    }, activeLine));
  }

  /**
   * useSceneFade · scene 内辅助元素的软淡入淡出 helper
   *
   * 铁律第二条要求 scene 之间禁止硬切——但 scene 内辅助元素（数据卡、引用块）
   * 一旦 cue 触发后默认会一直亮到 scene 结束。如果不淡出，离开本段进入下段时
   * 这些元素会突兀地存在或瞬间消失。本 hook 提供 [入场淡入 → hold → 出场淡出] 的统一软切换。
   *
   * 用法（把 op 乘进辅助元素的 opacity）：
   *   const op = useSceneFade('md-side', 0.6, 0.8);  // 进 0.6s, 出 0.8s
   *   <Cue id="agents-md">{(t, p) => (
   *     <div style={{ opacity: op * p }}>...</div>
   *   )}</Cue>
   *
   * 这样数据卡片在 md-side 段开始 0.6s 内淡入，在段结束前 0.8s 开始淡出，
   * 与下一段的辅助元素淡入形成 overlap，画面不出现硬切。
   *
   * @param sceneId  scene id
   * @param fadeIn   入场淡入秒数（默认 0.5）
   * @param fadeOut  出场淡出秒数（默认 0.5）
   * @returns 0-1 之间的不透明度倍率
   */
  function useSceneFade(sceneId, fadeIn = 0.5, fadeOut = 0.5) {
    const { time, timeline } = React.useContext(NarrationContext);
    if (!timeline) return 0;
    const s = timeline.scenes.find(x => x.id === sceneId);
    if (!s) return 0;
    const inT = (time - s.start) / fadeIn;
    const outT = (s.end - time) / fadeOut;
    const v = Math.min(1, Math.min(inT, outT));
    return Math.max(0, v);
  }

  return { NarrationStage, Scene, Cue, useNarration, useSceneFade, Subtitles, splitChunkToLines };
})();

if (typeof window !== 'undefined') {
  Object.assign(window, { NarrationStageLib });
}
