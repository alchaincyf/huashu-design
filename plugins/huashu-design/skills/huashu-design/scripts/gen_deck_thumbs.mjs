#!/usr/bin/env node
/**
 * gen_deck_thumbs.mjs — 为多文件 deck 每页生成缩略图（给 deck_index.html 的「无限画廊」概览用）。
 *
 * 背景：deck_index.html 有两种概览——
 *   · 网格 grid（默认 60%）：用 iframe 渲染真实子页面，清晰、所见即所得，无需缩略图。
 *   · 无限画廊 gallery（40%）：把所有页无缝无限平铺 + 缓慢漂移，几十~上百个瓦片若都用 iframe 会很卡，
 *     所以画廊改用 <img> 缩略图——同一张图复用多次浏览器只解码一次，流畅。
 *   本脚本就是给画廊准备这批缩略图。grid 模式不需要它。
 *
 * 用法（复制到 deck 项目根目录，装依赖后运行）：
 *   npm install playwright sharp
 *   node gen_deck_thumbs.mjs --slides slides --out thumbs [--width 1600] [--quality 86]
 *
 * 然后在 index.html 的 MANIFEST 给每项加 thumb（与 file 同名 .jpg）：
 *   { file: "slides/01-cover.html", thumb: "thumbs/01-cover.jpg", label: "封面" }
 * deck_index.html 仅在画廊模式用 thumb；网格模式始终用 file(iframe)。没有 thumb 时画廊回退 iframe。
 *
 * 提示：缩略图分辨率别太低（默认 1600px），否则画廊里卡片 hover 放大后会发虚。
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const slidesDir = arg('slides', 'slides');
const outDir = arg('out', 'thumbs');
const width = parseInt(arg('width', '1600'), 10);
const quality = parseInt(arg('quality', '86'), 10);
const W = parseInt(arg('canvas-w', '1920'), 10);
const H = parseInt(arg('canvas-h', '1080'), 10);

if (!fs.existsSync(slidesDir)) { console.error('找不到 slides 目录: ' + slidesDir); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.html')).sort();
if (!files.length) { console.error('slides 目录里没有 .html'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
let ok = 0;
for (const f of files) {
  const base = f.replace(/\.html$/, '');
  const out = path.join(outDir, base + '.jpg');
  try {
    await page.goto('file://' + path.resolve(slidesDir, f), { waitUntil: 'load' });
    await page.waitForTimeout(2800);                 // 等 webfont / 图片 paint
    const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
    await sharp(buf).resize(width).jpeg({ quality }).toFile(out);
    ok++; console.log('[ok] ' + out);
  } catch (e) { console.error('[FAIL] ' + f + ': ' + e.message); }
}
await browser.close();
console.log(`\n=== ${ok}/${files.length} 张缩略图 → ${outDir}/ ===`);
console.log('在 index.html 的 MANIFEST 每项加 thumb: "' + outDir + '/<同名>.jpg"（仅画廊模式用到）');
