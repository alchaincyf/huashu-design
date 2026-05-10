#!/usr/bin/env node
/**
 * tts-doubao.mjs · 豆包语音 TTS（火山引擎 openspeech）
 *
 * 用法：
 *   node scripts/tts-doubao.mjs --text "你好" --out demo.mp3
 *   node scripts/tts-doubao.mjs --text-file script.txt --out out.mp3 --speed 1.0
 *
 * 输出：
 *   - mp3 文件写到 --out 路径
 *   - stdout 打印一行 JSON: {"path":"...","duration":12.34,"bytes":54321}
 *
 * 依赖：Node 18+（自带 fetch/crypto）、ffprobe（测时长，brew install ffmpeg）
 *
 * env（自动从 skill 根目录 .env 读取，也可走 process.env 覆盖）：
 *   DOUBAO_TTS_API_KEY     必填
 *   DOUBAO_TTS_VOICE_ID    必填（音色 id）
 *   DOUBAO_TTS_CLUSTER     默认 volcano_icl
 *   DOUBAO_TTS_ENDPOINT    默认 https://openspeech.bytedance.com/api/v1/tts
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
tts-doubao.mjs · 豆包语音 TTS

  --text <str>          要合成的文本
  --text-file <path>    从文件读取文本（与 --text 二选一）
  --out <path>          输出 mp3 路径（必填）
  --speed <float>       语速倍率，默认 1.0（0.5-2.0）
  --voice <voice_id>    覆盖 .env 里的音色 id
  --encoding <ext>      mp3 / wav / pcm，默认 mp3
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

  if (!apiKey) throw new Error('缺 DOUBAO_TTS_API_KEY（检查 .env）');
  if (!voiceId) throw new Error('缺 DOUBAO_TTS_VOICE_ID（检查 .env 或用 --voice 传）');

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
  // 豆包标准返回：{ code, message, data: "<base64 audio>", ... }
  // code === 3000 表示成功
  if (json.code !== undefined && json.code !== 3000) {
    throw new Error(`API 返回错误 code=${json.code} msg=${json.message || JSON.stringify(json)}`);
  }
  if (!json.data) {
    throw new Error(`API 响应无 data 字段：${JSON.stringify(json).slice(0, 500)}`);
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
    console.error('错：缺 --text 或 --text-file');
    usage();
  }
  if (!args.out) {
    console.error('错：缺 --out');
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
  console.error(`TTS 失败：${err.message}`);
  process.exit(1);
});
