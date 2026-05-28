#!/usr/bin/env node
/**
 * narrate-pipeline.mjs · long-form narration conductor (L2)
 *
 * Input: markdown narration script (## scene-id segments, [[cue:id]] marks key lines)
 * Output: voiceover.mp3 (full concatenated voice track) + timeline.json (per-segment start/end + absolute cue times)
 *
 * Usage:
 *   node scripts/narrate-pipeline.mjs --script demo.md --out-dir _narration_demo
 *
 * Narration-script format:
 *   ---
 *   title: What is an LLM
 *   voice: S_JSdgdWk22   # optional; falls back to .env if omitted
 *   speed: 1.0           # optional
 *   gap: 0.3             # silence between segments in seconds, default 0.3
 *   ---
 *
 *   ## intro
 *   Hi everyone. Today we'll explain what an LLM is in five minutes.
 *
 *   ## what-is
 *   LLM stands for Large Language Model, [[cue:bigmodel]]a neural network with hundreds of billions of parameters.
 *   At its core, it's a text-completion predictor.
 *
 * Output file structure (under out-dir):
 *   audio/
 *     intro.mp3
 *     what-is.mp3
 *   voiceover.mp3       full concatenated voice track across all scenes
 *   timeline.json       schema in references/voiceover-pipeline.md
 *
 * Dependencies: tts-doubao.mjs, ffmpeg, ffprobe
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const TTS_SCRIPT = path.join(__dirname, 'tts-doubao.mjs');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--script') args.script = argv[++i];
    else if (a === '--out-dir') args.outDir = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.error(`
narrate-pipeline.mjs · long-form narration conductor (L2)

  --script <path>     narration .md file (required)
  --out-dir <path>    output directory (required)

Outputs: <out-dir>/voiceover.mp3 + <out-dir>/timeline.json
`.trim());
  process.exit(1);
}

/**
 * Parse frontmatter + scene blocks from markdown
 * Returns { meta, scenes: [{ id, raw }] }
 */
function parseScript(md) {
  const meta = {};
  let body = md;
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
    body = md.slice(fmMatch[0].length);
  }
  const scenes = [];
  const re = /^##\s+([\w-]+)\s*\n([\s\S]*?)(?=^##\s+[\w-]+\s*\n|$(?![\r\n]))/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    scenes.push({ id: m[1], raw: m[2].trim() });
  }
  return { meta, scenes };
}

/**
 * Split a scene's text by [[cue:id]] markers into chunks.
 * Returns: { chunks: [{ text, cueAfter? }] }
 *   cueAfter is the cue id that follows this chunk (chunk's end = cue position)
 *
 * Example: "A[[cue:x]]B[[cue:y]]C" =>
 *   chunks: [
 *     { text: "A", cueAfter: "x" },
 *     { text: "B", cueAfter: "y" },
 *     { text: "C" }
 *   ]
 */
function splitByCues(text) {
  const chunks = [];
  const re = /\[\[cue:([\w-]+)\]\]/g;
  let lastIdx = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(lastIdx, m.index).trim();
    chunks.push({ text: before, cueAfter: m[1] });
    lastIdx = m.index + m[0].length;
  }
  const tail = text.slice(lastIdx).trim();
  chunks.push({ text: tail });
  // Filter empty text chunks (when a cue sits right at the start or end of a segment)
  return chunks.filter((c) => c.text.length > 0 || c.cueAfter);
}

function getDuration(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { encoding: 'utf8' });
  return parseFloat(out.trim());
}

function callTTS(text, outPath, opts) {
  const args = ['--text', text, '--out', outPath];
  if (opts.voice) args.push('--voice', opts.voice);
  if (opts.speed) args.push('--speed', String(opts.speed));
  const out = execFileSync('node', [TTS_SCRIPT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  return JSON.parse(out.trim());
}

function ffmpegConcat(inputs, output) {
  // Use the concat demuxer to merge mp3s that share the same encoding
  const listFile = output + '.list';
  fs.writeFileSync(
    listFile,
    inputs.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'),
  );
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${output}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  fs.unlinkSync(listFile);
}

function makeSilence(duration, outPath) {
  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${outPath}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.script || !args.outDir) usage();

  const scriptPath = path.resolve(args.script);
  const outDir = path.resolve(args.outDir);
  const audioDir = path.join(outDir, 'audio');
  const tmpDir = path.join(outDir, '.tmp');
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const md = fs.readFileSync(scriptPath, 'utf8');
  const { meta, scenes } = parseScript(md);
  if (scenes.length === 0) {
    console.error('Error: the script has no ## scene segments — at least one is required.');
    process.exit(1);
  }

  const voice = meta.voice || undefined;
  const speed = meta.speed ? parseFloat(meta.speed) : 1.0;
  const gap = meta.gap ? parseFloat(meta.gap) : 0.3;

  console.error(`[narrate] script=${path.basename(scriptPath)} scenes=${scenes.length} voice=${voice || '(env)'} speed=${speed} gap=${gap}s`);

  // Shared silence file used between segments
  const gapFile = path.join(tmpDir, 'gap.mp3');
  if (gap > 0) makeSilence(gap, gapFile);

  const timeline = {
    title: meta.title || path.basename(scriptPath, '.md'),
    voice: voice || null,
    speed,
    gap,
    totalDuration: 0,
    scenes: [],
  };

  let cursor = 0;
  const sceneAudioFiles = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.error(`[narrate] (${i + 1}/${scenes.length}) scene="${scene.id}"`);

    const chunks = splitByCues(scene.raw);
    const chunkFiles = [];
    const cueRecords = [];
    const chunkRecords = []; // Measured start/end of each chunk within the segment — used for subtitles
    let sceneInternalCursor = 0;

    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j];
      if (!chunk.text) {
        // Empty text chunk (cue sits adjacent) — skip TTS but still record the cue position
        if (chunk.cueAfter) {
          cueRecords.push({
            id: chunk.cueAfter,
            offset: sceneInternalCursor,
          });
        }
        continue;
      }
      const chunkPath = path.join(tmpDir, `${scene.id}-${j}.mp3`);
      const result = callTTS(chunk.text, chunkPath, { voice, speed });
      const chunkStart = sceneInternalCursor;
      chunkFiles.push(chunkPath);
      sceneInternalCursor += result.duration;
      chunkRecords.push({
        text: chunk.text,
        start: chunkStart,
        end: sceneInternalCursor,
        duration: result.duration,
      });
      console.error(`  chunk ${j}: ${result.duration.toFixed(2)}s · ${chunk.text.length} chars · ${chunk.text.slice(0, 30)}${chunk.text.length > 30 ? '…' : ''}`);
      if (chunk.cueAfter) {
        cueRecords.push({
          id: chunk.cueAfter,
          offset: sceneInternalCursor,
        });
      }
    }

    // Merge chunks within a segment
    const sceneAudio = path.join(audioDir, `${scene.id}.mp3`);
    if (chunkFiles.length === 1) {
      fs.copyFileSync(chunkFiles[0], sceneAudio);
    } else {
      ffmpegConcat(chunkFiles, sceneAudio);
    }
    const sceneDuration = getDuration(sceneAudio);

    // Append to the master track: add gap first (except for the first segment), then the scene
    if (i > 0 && gap > 0) {
      sceneAudioFiles.push(gapFile);
      cursor += gap;
    }
    sceneAudioFiles.push(sceneAudio);

    timeline.scenes.push({
      id: scene.id,
      start: cursor,
      end: cursor + sceneDuration,
      duration: sceneDuration,
      audio: path.relative(outDir, sceneAudio),
      text: scene.raw.replace(/\[\[cue:[\w-]+\]\]/g, ''),
      // chunks: used to render subtitles line-by-line. start/end are segment-relative; absoluteStart/absoluteEnd are absolute on the full track
      chunks: chunkRecords.map((c) => ({
        text: c.text,
        start: c.start,
        end: c.end,
        absoluteStart: cursor + c.start,
        absoluteEnd: cursor + c.end,
      })),
      cues: cueRecords.map((c) => ({
        id: c.id,
        offset: c.offset,
        absoluteTime: cursor + c.offset,
      })),
    });

    cursor += sceneDuration;
  }

  // Merge into the full track
  const voiceoverPath = path.join(outDir, 'voiceover.mp3');
  ffmpegConcat(sceneAudioFiles, voiceoverPath);
  timeline.totalDuration = getDuration(voiceoverPath);
  timeline.voiceover = 'voiceover.mp3';

  fs.writeFileSync(
    path.join(outDir, 'timeline.json'),
    JSON.stringify(timeline, null, 2),
  );

  // Clean up tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.error(`\n[narrate] Done.`);
  console.error(`  voiceover: ${voiceoverPath}`);
  console.error(`  timeline:  ${path.join(outDir, 'timeline.json')}`);
  console.error(`  Total dur: ${timeline.totalDuration.toFixed(2)}s (${(timeline.totalDuration / 60).toFixed(2)} min)`);
  console.error(`  Scenes:    ${timeline.scenes.length}`);
  const totalCues = timeline.scenes.reduce((sum, s) => sum + s.cues.length, 0);
  console.error(`  Cues:      ${totalCues}`);
}

main().catch((err) => {
  console.error(`narrate-pipeline failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
