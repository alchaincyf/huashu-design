#!/usr/bin/env node
/**
 * tts-doubao.mjs · Doubao TTS (Volcano Engine openspeech)
 *
 * Usage:
 *   node scripts/tts-doubao.mjs --text "Hello" --out demo.mp3
 *   node scripts/tts-doubao.mjs --text-file script.txt --out out.mp3 --speed 1.0
 *
 * Output:
 *   - mp3 file written to the --out path
 *   - stdout prints one JSON line: {"path":"...","duration":12.34,"bytes":54321}
 *
 * Dependencies: Node 18+ (built-in fetch / crypto), ffprobe (for duration; brew install ffmpeg)
 *
 * env (auto-loaded from the skill root's .env; process.env overrides):
 *   DOUBAO_TTS_API_KEY     required
 *   DOUBAO_TTS_VOICE_ID    required (voice id)
 *   DOUBAO_TTS_CLUSTER     default volcano_icl
 *   DOUBAO_TTS_ENDPOINT    default https://openspeech.bytedance.com/api/v1/tts
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(SKILL_ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

function parseArgs(argv) {
  const args = { speed: '1.0', encoding: 'mp3' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text') args.text = argv[++i];
    else if (a === '--text-file') args.textFile = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--speed') args.speed = argv[++i];
    else if (a === '--voice') args.voice = argv[++i];
    else if (a === '--encoding') args.encoding = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.error(`
tts-doubao.mjs · Doubao TTS

  --text <str>          text to synthesize
  --text-file <path>    read text from file (alternative to --text)
  --out <path>          output mp3 path (required)
  --speed <float>       speed multiplier, default 1.0 (0.5–2.0)
  --voice <voice_id>    override the voice id from .env
  --encoding <ext>      mp3 / wav / pcm, default mp3
`.trim());
  process.exit(1);
}

function getDuration(filePath) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], { encoding: 'utf8' });
    return parseFloat(out.trim());
  } catch (e) {
    return null;
  }
}

async function tts({ text, voice, speed, encoding }) {
  const apiKey = process.env.DOUBAO_TTS_API_KEY;
  const cluster = process.env.DOUBAO_TTS_CLUSTER || 'volcano_icl';
  const endpoint = process.env.DOUBAO_TTS_ENDPOINT || 'https://openspeech.bytedance.com/api/v1/tts';
  const voiceId = voice || process.env.DOUBAO_TTS_VOICE_ID;

  if (!apiKey) throw new Error('Missing DOUBAO_TTS_API_KEY (check .env)');
  if (!voiceId) throw new Error('Missing DOUBAO_TTS_VOICE_ID (check .env or pass --voice)');

  const body = {
    app: { cluster },
    user: { uid: 'huashu-design' },
    audio: {
      voice_type: voiceId,
      encoding,
      speed_ratio: parseFloat(speed),
    },
    request: {
      reqid: randomUUID(),
      text,
      operation: 'query',
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }

  const json = await res.json();
  // Doubao standard response: { code, message, data: "<base64 audio>", ... }
  // code === 3000 indicates success
  if (json.code !== undefined && json.code !== 3000) {
    throw new Error(`API returned error code=${json.code} msg=${json.message || JSON.stringify(json)}`);
  }
  if (!json.data) {
    throw new Error(`API response missing data field: ${JSON.stringify(json).slice(0, 500)}`);
  }
  return Buffer.from(json.data, 'base64');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) usage();

  let text = args.text;
  if (!text && args.textFile) {
    text = fs.readFileSync(args.textFile, 'utf8').trim();
  }
  if (!text) {
    console.error('Error: missing --text or --text-file');
    usage();
  }
  if (!args.out) {
    console.error('Error: missing --out');
    usage();
  }

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const audio = await tts({
    text,
    voice: args.voice,
    speed: args.speed,
    encoding: args.encoding,
  });

  fs.writeFileSync(outPath, audio);
  const duration = getDuration(outPath);
  const result = {
    path: outPath,
    bytes: audio.length,
    duration,
    text_chars: text.length,
  };
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  console.error(`TTS failed: ${err.message}`);
  process.exit(1);
});
