/**
 * narration_stage.jsx · narration-driven Stage
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛑 Required reading before using this: references/voiceover-pipeline.md
 * ║
 * ║  Ironclad rule #1: the whole piece is one continuous motion narrative,
 * ║                    not a set of independent scenes.
 * ║                    You are not making 7 slides. You are directing 1 movie.
 * ║
 * ║  Ironclad rule #2: pick a hero element that persists across scenes —
 * ║                    do not introduce a new layout per segment.
 * ║
 * ║  Ironclad rule #3: no hard cuts between scenes (opacity 1→0 / 0→1).
 * ║                    Morph, don't cut.
 * ║
 * ║  Failure mode #1 (real pitfall hit during v1 of this skill):
 * ║                    each Scene with its own layout + cues using fade-up +
 * ║                    full-page opacity switches between scenes =
 * ║                    PowerPoint with voiceover = quality reduced to zero.
 * ║
 * ║  Correct approach: place the hero directly as a child of <NarrationStage>
 * ║                    (NOT inside Scene). Use useNarration() inside the hero
 * ║                    to read time / scene / cue state, and let the hero
 * ║                    derive its form from the current time → continuous
 * ║                    motion across scenes.
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage (inline inside HTML's <script type="text/babel">):
 *   const { NarrationStage, Scene, Cue, useNarration } = NarrationStageLib;
 *
 *   const App = () => (
 *     <NarrationStage timeline={TIMELINE} audioSrc="voiceover.mp3"
 *                     width={1920} height={1080}>
 *       <Scene id="intro">
 *         <h1>What is a token</h1>
 *         <Cue id="question">
 *           {(triggered) => triggered && <p>↑ this is the question</p>}
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
 * Time source (auto-selected from two):
 *   - Recording mode (window.__recording === true): uses window.__time (external driver pushes frames)
 *   - Playback mode: uses the <audio> element's currentTime (strict sync with audio when the user hits play)
 *
 * Compatibility with render-video.js:
 *   - On the first tick, sets window.__ready = true
 *   - In recording mode, detecting window.__recording forces audio not to play and uses window.__time
 *   - Exposes window.__totalDuration so the driver can compute the total frame count
 *
 * Dependencies: React 18 + ReactDOM 18 + Babel standalone (same as animations.jsx)
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
   * Main component: consumes timeline + audio, provides context
   *
   * Props:
   *   timeline       the timeline.json object (required)
   *   audioSrc       path to voiceover.mp3 (required)
   *   width/height   Stage dimensions, default 1920x1080
   *   background     default '#0e0e0e'
   *   controls       whether to show the playback bar at the bottom, default true
   *   children       animation content (organized with <Scene> / <Cue>)
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

    // Expose for render-video.js
    React.useEffect(() => {
      if (typeof window === 'undefined') return;
      window.__totalDuration = timeline.totalDuration;
      window.__ready = true;
    }, [timeline.totalDuration]);

    // Time tick
    React.useEffect(() => {
      let raf;
      if (recording) {
        // Recording mode: rAF wall-clock self-driven from 0
        // Compatible with render-video.js (which relies on natural animation progress + window.__seek to reset)
        let startedAt = null;
        const tick = (now) => {
          if (startedAt === null) startedAt = now;
          setTime(Math.min((now - startedAt) / 1000, timeline.totalDuration));
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        // Expose __seek so render-video.js can call __seek(0) to reset once ready
        if (typeof window !== 'undefined') {
          window.__seek = (t) => {
            startedAt = performance.now() - t * 1000;
            setTime(t);
          };
        }
      } else {
        // Playback mode: follow audio.currentTime
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

    // Current scene
    const currentScene = React.useMemo(() => {
      if (!timeline.scenes) return null;
      // Find the segment where start <= time < end. The last segment runs to its end.
      for (let i = 0; i < timeline.scenes.length; i++) {
        const s = timeline.scenes[i];
        const next = timeline.scenes[i + 1];
        if (time >= s.start && (!next || time < next.start)) return s;
      }
      return timeline.scenes[0];
    }, [time, timeline.scenes]);

    const sceneTime = currentScene ? Math.max(0, time - currentScene.start) : 0;

    // Cue lookup (compared by absoluteTime — works across scenes)
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

    /** Number of seconds after trigger to ramp 0→1, then stays at 1. Use this to fade in after a cue fires. */
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

    // play / pause / seek controls
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
   * Scene wrapper: only renders children while the specified scene id is active
   *
   * Props:
   *   id          scene id (matches timeline.scenes[].id)
   *   children    render content; can be a ReactNode or (sceneTime, sceneInfo) => ReactNode
   *   keepMounted default false. Set true to keep mounted and toggle visibility only
   *               (useful when animation continuity requires it).
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
   * Cue wrapper: subscribes to cue trigger state
   *
   * Props:
   *   id        cue id (matches timeline.scenes[].cues[].id)
   *   ramp     ramp duration in seconds for progress 0→1 after the cue fires (default 0.5)
   *   children must be a function: (triggered: bool, progress: 0-1) => ReactNode
   */
  function Cue({ id, ramp = 0.5, children }) {
    const { isCueTriggered, cueProgress } = React.useContext(NarrationContext);
    const triggered = isCueTriggered(id);
    const progress = cueProgress(id, ramp);
    return children(triggered, progress);
  }

  /** Hook: grab narration state directly inside a custom component */
  function useNarration() {
    return React.useContext(NarrationContext);
  }

  /**
   * splitChunkToLines · split a passage by punctuation into short lines of ≤ maxLen characters
   *
   * Used for subtitles — the Bilibili standard is ≤ 12 characters per line for readability. This function:
   * 1. First splits by strong punctuation (。！？\n) into sentences — never breaks across a period.
   * 2. If a sentence is ≤ maxLen, use it directly; otherwise split by weak punctuation (，、；：) and merge.
   * 3. Mixed Chinese/English: Latin letters/digits count as 0.5 visual width.
   * 4. Hard-cut fallback (rare: a single punctuation-bounded segment exceeds maxLen).
   *
   * @param text   the source text
   * @param maxLen max visual width per line, default 13 (≈ 12 characters + one punctuation mark)
   * @returns array of subtitle lines
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
   * Subtitles · Bilibili-style subtitle component (deep-ink type with white halo, no background, timed to chunks)
   *
   * Automatically takes the active chunk from the current scene.chunks, splits it via splitChunkToLines,
   * and divides the chunk's time window proportionally across the lines by character count.
   *
   * Required: timeline.scenes[].chunks[] (narrate-pipeline.mjs already outputs this by default)
   *
   * Props (override default styling):
   *   bottom    pixels from the bottom edge, default 90 (off the edge)
   *   fontSize  font size, default 32
   *   color     text color, default deep ink #1a1a1a (suits light paper-white backgrounds)
   *   haloColor halo color, default rgba(245,241,232,0.9) (suits a #f5f1e8 background)
   *   maxLen    max visual width per line, default 13
   *
   * For dark backgrounds: change color to '#fff' and haloColor to 'rgba(0,0,0,0.85)'.
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
   * useSceneFade · soft fade-in/out helper for supporting elements inside a scene
   *
   * Ironclad rule #2 forbids hard cuts between scenes — but supporting elements inside a scene
   * (data cards, pull quotes) stay lit by default from the moment their cue fires until the scene ends.
   * Without a fade-out, those elements would jump abruptly when leaving this segment for the next.
   * This hook provides a uniform [fade-in → hold → fade-out] soft transition.
   *
   * Usage (multiply `op` into the supporting element's opacity):
   *   const op = useSceneFade('md-side', 0.6, 0.8);  // 0.6s in, 0.8s out
   *   <Cue id="agents-md">{(t, p) => (
   *     <div style={{ opacity: op * p }}>...</div>
   *   )}</Cue>
   *
   * The data card fades in over 0.6s at the start of the md-side segment and begins fading
   * out 0.8s before the segment ends — overlapping with the next segment's fade-in for a soft cut.
   *
   * @param sceneId  scene id
   * @param fadeIn   fade-in duration in seconds (default 0.5)
   * @param fadeOut  fade-out duration in seconds (default 0.5)
   * @returns an opacity multiplier between 0 and 1
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
