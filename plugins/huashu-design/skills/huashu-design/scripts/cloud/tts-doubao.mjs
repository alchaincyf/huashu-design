#!/usr/bin/env node
/**
 * tts-doubao.mjs · 豆包语音 TTS（火山引擎 openspeech）
 *
 * ⚠️ 可选云能力：本脚本会把待配音文本发送到字节跳动官方 TTS 接口（openspeech.bytedance.com），
 * 使用你自己的 key，endpoint 强制校验域名白名单。首次调用需 --yes 或 HUASHU_CLOUD_OK=1
 * 显式确认。数据流向声明见仓库根 SECURITY.md。
 *
 * 用法：
 *   node scripts/cloud/tts-doubao.mjs --text "你好" --out demo.mp3 --yes
 *   node scripts/cloud/tts-doubao.mjs --text-file script.txt --out out.mp3 --speed 1.0 --yes
 *   node scripts/cloud/tts-doubao.mjs --text "你好" --out demo.mp3 --timestamps --yes   # 附带字级时间戳
 *
 * 输出：
 *   - mp3 文件写到 --out 路径
 *   - stdout 打印一行 JSON: {"path":"...","duration":12.34,"bytes":54321}
 *   - 带 --timestamps 时额外含 words: [{text,start,end,confidence}]（秒，相对本段音频开头）
 *     注意：时间戳文本是 TN 后文本（如 "2025" 会变成 "二零二五"），标点附在前一个字上；
 *     需要 2.0 资源（seed-tts-2.0 / seed-icl-2.0），仅中英文。
 *
 * 依赖：Node 18+（自带 fetch/crypto）、ffprobe（测时长，brew install ffmpeg）
 *
 * env（自动从 skill 根目录 .env 读取，也可走 process.env 覆盖）：
 *   DOUBAO_TTS_API_KEY     可选（新版 API Key 鉴权）
 *   DOUBAO_APP_ID          可选（控制台 App ID，与 DOUBAO_ACCESS_KEY 配套）
 *   DOUBAO_ACCESS_KEY      可选（控制台 Access Token，与 DOUBAO_APP_ID 配套）
 *   DOUBAO_TTS_VOICE_ID    必填（音色 id）
 *   DOUBAO_TTS_RESOURCE_ID 可选（默认按音色自动推断）
 *   DOUBAO_TTS_ENDPOINT    默认 https://openspeech.bytedance.com/api/v3/tts/unidirectional
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..', '..');

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
    else if (a === '--timestamps') args.timestamps = true;
    else if (a === '--yes') args.yes = true;
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
  --timestamps          请求字级时间戳（enable_subtitle），结果 JSON 多一个 words 数组
  --yes                 确认将文本发送到豆包 TTS 官方接口（或设 HUASHU_CLOUD_OK=1）
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

function inferResourceId(voiceId) {
  // 复刻音色默认走 2.0：本账号只开通了 seed-icl-2.0（1.0 会 403 resource not granted），
  // 且字级时间戳（enable_subtitle）只有 2.0 资源支持。
  if (voiceId.startsWith('S_')) return 'seed-icl-2.0';
  if (voiceId.includes('uranus')) return 'seed-tts-2.0';
  return 'seed-tts-1.0';
}

function speedToSpeechRate(speed) {
  const ratio = parseFloat(speed);
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(-50, Math.min(100, Math.round((ratio - 1) * 100)));
}

function buildAuthHeaders({ requestId, resourceId }) {
  const apiKey = process.env.DOUBAO_TTS_API_KEY;
  const appId = process.env.DOUBAO_APP_ID;
  const accessKey = process.env.DOUBAO_ACCESS_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Resource-Id': resourceId,
    'X-Api-Request-Id': requestId,
  };

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
    return headers;
  }

  if (!appId) throw new Error('缺 DOUBAO_TTS_API_KEY 或 DOUBAO_APP_ID（检查 .env）');
  if (!accessKey) throw new Error('缺 DOUBAO_ACCESS_KEY（检查 .env）');

  headers['X-Api-App-Id'] = appId;
  headers['X-Api-Access-Key'] = accessKey;
  return headers;
}

async function readV3Audio(res) {
  const text = await res.text();
  const chunks = [];
  const words = []; // 字级时间戳（enable_subtitle 开启时服务端按句返回 sentence.words）
  let finalCode = null;
  let finalMessage = '';

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let json;
    try {
      json = JSON.parse(trimmed);
    } catch (e) {
      throw new Error(`API 响应行不是 JSON：${trimmed.slice(0, 200)}`);
    }

    const code = json.code ?? 0;
    if (code === 20000000) {
      finalCode = code;
      finalMessage = json.message || '';
      break;
    }
    if (code !== 0) {
      throw new Error(`API 返回错误 code=${code} msg=${json.message || JSON.stringify(json)}`);
    }
    if (json.data) chunks.push(Buffer.from(json.data, 'base64'));
    if (json.sentence && Array.isArray(json.sentence.words)) {
      for (const w of json.sentence.words) {
        words.push({
          text: w.word,
          start: w.startTime,
          end: w.endTime,
          confidence: w.confidence,
        });
      }
    }
  }

  if (!chunks.length) {
    const detail = finalCode ? `结束码 ${finalCode} ${finalMessage}` : text.slice(0, 500);
    throw new Error(`API 响应无音频数据：${detail}`);
  }
  return { audio: Buffer.concat(chunks), words };
}

// endpoint 域名白名单：key 和文本只允许发往字节官方域名，防 .env 被篡改后重定向
const ALLOWED_ENDPOINT_HOSTS = /(^|\.)(bytedance\.com|volces\.com)$/;

async function tts({ text, voice, speed, encoding, timestamps }) {
  const endpoint = process.env.DOUBAO_TTS_ENDPOINT || 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
  const host = new URL(endpoint).hostname;
  if (!ALLOWED_ENDPOINT_HOSTS.test(host)) {
    throw new Error(`DOUBAO_TTS_ENDPOINT 域名 ${host} 不在白名单（*.bytedance.com / *.volces.com），拒绝发送`);
  }
  const voiceId = voice || process.env.DOUBAO_TTS_VOICE_ID || process.env.DOUBAO_SPEAKER;
  const resourceId = process.env.DOUBAO_TTS_RESOURCE_ID || inferResourceId(voiceId || '');
  const requestId = randomUUID();

  if (!voiceId) throw new Error('缺 DOUBAO_TTS_VOICE_ID（检查 .env 或用 --voice 传）');

  const body = {
    user: { uid: 'huashu-design' },
    req_params: {
      text,
      speaker: voiceId,
      audio_params: {
        format: encoding,
        sample_rate: 24000,
        speech_rate: speedToSpeechRate(speed),
        // 字级时间戳：仅 2.0 资源（seed-tts-2.0 / seed-icl-2.0）支持，中英文 only
        ...(timestamps ? { enable_subtitle: true } : {}),
      },
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: buildAuthHeaders({ requestId, resourceId }),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }

  return readV3Audio(res);
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

  if (!args.yes && process.env.HUASHU_CLOUD_OK !== '1') {
    const host = new URL(process.env.DOUBAO_TTS_ENDPOINT || 'https://openspeech.bytedance.com').hostname;
    console.error(
      `[云能力确认] 本次将把约${text.length}字文本发送到 ${host}（豆包TTS官方接口，使用你自己的key合成语音）。\n` +
      `确认无误请重跑并加 --yes，或设置环境变量 HUASHU_CLOUD_OK=1。数据流向声明见 SECURITY.md。`,
    );
    process.exit(2);
  }

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const { audio, words } = await tts({
    text,
    voice: args.voice,
    speed: args.speed,
    encoding: args.encoding,
    timestamps: args.timestamps,
  });

  fs.writeFileSync(outPath, audio);
  const duration = getDuration(outPath);
  const result = {
    path: outPath,
    bytes: audio.length,
    duration,
    text_chars: text.length,
  };
  if (args.timestamps) result.words = words;
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  console.error(`TTS 失败：${err.message}`);
  process.exit(1);
});
