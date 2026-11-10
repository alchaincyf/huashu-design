#!/usr/bin/env python3
"""
design_lint.py — 只量事实的设计体检，外加「外观指纹」：三方向撞没撞、和最近的项目撞没撞。

它不判断好不好看（品味归用户），只回答能核对的问题：
  红灯  图裂了、字小到读不了、对比度不够、控制台报错——交付前必须修
  黄灯  模板装饰：全大写小标签、「A · B · C」、尾巴箭头、只给一个词换色……顺手出现的小动作，改掉几乎没有代价
  提示  外观家族：暖纸衬线、深底单点缀、细线报纸、卡片套件。家族本身不是问题，好设计常常就在里面；
        只有三版落进同一家族、或和外观账本里最近的项目撞了，才需要换
  指纹  底色、主色板、字体、版式骨架——给 compare 和 ledger 用

用法：
  python3 scripts/design_lint.py check a.html [b.html …] [--min-body 14] [--viewport 1440x900] [--json]
  python3 scripts/design_lint.py compare dir-1.html dir-2.html dir-3.html     三方向是不是换皮
  python3 scripts/design_lint.py ledger [--last 8]                           最近交付过的样子
  python3 scripts/design_lint.py ledger add final.html --project 名字 [--note "…"]
  python3 scripts/design_lint.py ledger check dir-1.html dir-2.html …        新方向和最近的项目撞没撞

外观账本存在 ~/.huashu-design/ledger.jsonl（HUASHU_DESIGN_HOME 可改），只在本机，不随 skill 分发。
依赖：pip install playwright pillow && playwright install chromium
"""

import argparse
import glob
import io
import json
import math
import os
import sys
from datetime import date
from pathlib import Path

# 2026 年 AI 生成页面的聚类特征。出处：Anthropic 官方 frontend-design skill（2026）
# https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
CREAM = (0xF4, 0xF1, 0xEA)
CLAY = (0xD9, 0x77, 0x57)

COLLECT_JS = r"""
() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = {};
  // 任何 CSS 颜色（含 oklch/color-mix）→ [r,g,b,a]，靠画一个像素读回来，不自己解析
  const rgba = (s) => {
    if (!s || s === 'transparent') return [0, 0, 0, 0];
    if (cache[s]) return cache[s];
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    // alpha 只在「第四个分量」或「/ 后面」才有：rgb(187,187,187) 的最后一个数不是 alpha
    let a = 1; const inner = (/\(([^)]*)\)/.exec(s) || [])[1] || '';
    const parts = inner.split(/[\s,/]+/).filter(Boolean);
    const raw = inner.includes('/') ? parts[parts.length - 1] : (/^(rgba|hsla)\(/.test(s) && parts.length === 4 ? parts[3] : null);
    if (raw) a = raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw);
    return (cache[s] = [d[0], d[1], d[2], a]);
  };
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const opaqueBg = (e) => {   // 返回 [r,g,b,1]、null（图/渐变/画布，算不了）或 undefined（透明，继续往下找）
    if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName) || e instanceof SVGElement) return null;
    const cs = getComputedStyle(e);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
    const c = rgba(cs.backgroundColor); return c[3] > 0.9 ? c : undefined;
  };
  const bgOf = (el) => {
    const own = opaqueBg(el); if (own !== undefined) return own;   // 按钮、标签自带的底色先算
    const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) {
      for (const e of document.elementsFromPoint(x, y)) {
        if (e === el || el.contains(e)) continue;
        const b = opaqueBg(e); if (b !== undefined) return b;
      }
      return [255, 255, 255, 1];
    }
    for (let e = el.parentElement; e && e.nodeType === 1; e = e.parentElement) { const b = opaqueBg(e); if (b !== undefined) return b; }
    return [255, 255, 255, 1];
  };
  const opacityOf = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  // SVG 里的字按渲染后的大小算（viewBox 会放大缩小）
  const scaleOf = (el) => { if (!(el instanceof SVGElement) || !el.getScreenCTM) return 1; const m = el.getScreenCTM(); return m ? Math.hypot(m.a, m.b) || 1 : 1; };
  const CAPTION = 'figcaption, footer, small, caption, aside, sup, sub, [class*=caption], [class*=credit], [class*=footnote], [class*=meta]';
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05; };
  const ownText = (el) => Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const fam = (s) => (s || '').split(',')[0].replace(/["']/g, '').trim();

  const out = { small: [], lowContrast: [], eyebrows: [], dots: 0, emDashLabels: 0, arrows: 0, numbered: [],
                accentWord: [], cardKit: 0, hairlines: 0, radiusZero: 0, radiusTotal: 0, monoSmall: 0,
                broken: [], fonts: {}, display: null, body: null, headlineSerif: false, textColors: {}, bg: null,
                bodySmall: [], relImgs: [], textTotal: 0 };

  const all = Array.from(document.body ? document.body.querySelectorAll('*') : []);
  const cardSig = {};
  let displayEl = null, maxFs = 0;   // 标题字体 = 页面上字号最大的那段文字用的字体
  for (const el of all) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    const t = ownText(el);
    const fs = parseFloat(cs.fontSize) * scaleOf(el);
    if (t.length > 1) {
      out.textTotal += t.length;
      if (fs > maxFs) { maxFs = fs; displayEl = el; }
      const f = fam(cs.fontFamily); out.fonts[f] = (out.fonts[f] || 0) + t.length;
      const col = rgba(cs.color); const key = col.slice(0, 3).join(',');
      out.textColors[key] = (out.textColors[key] || 0) + t.length * fs;
      if (fs < (window.__MIN_LABEL || 12)) out.small.push({ text: t.slice(0, 30), px: Math.round(fs) });
      // 像正文的字：一段超过 28 字、又不是图注页脚，按正文下限算（不管它是 p、li 还是 div）
      if (t.length >= 28 && !el.closest(CAPTION) && fs < (window.__MIN_BODY || 14)) out.bodySmall.push({ text: t.slice(0, 30), px: Math.round(fs) });
      const bg = bgOf(el);
      if (bg) { const a = col[3] * opacityOf(el);   // 半透明的字先和底色混合再算对比度
        const fg = [0, 1, 2].map((i) => col[i] * a + bg[i] * (1 - a));
        const c = contrast(fg, bg); const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight) >= 700);
        if (c < (large ? 3 : 4.5)) out.lowContrast.push({ text: t.slice(0, 30), ratio: Math.round(c * 100) / 100, px: fs }); }
      const latin = t.replace(/[^A-Za-z]/g, '');
      const caps = cs.textTransform === 'uppercase' || (latin.length >= 3 && latin === latin.toUpperCase());
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / fs;
      if (caps && latin.length >= 2 && ls >= 0.06 && fs <= 15) out.eyebrows.push(t.slice(0, 30));
      if (/\s·\s/.test(t)) out.dots += (t.match(/\s·\s/g) || []).length;
      if (/^[A-Z][A-Z\s]{1,20}\s—\s\S/.test(t)) out.emDashLabels++;
      if (/→\s*$/.test(t) && (el.closest('a,button') || cs.cursor === 'pointer')) out.arrows++;
      if (/^0\d([\s./—-]|$)/.test(t) && t.length <= 6) out.numbered.push(t);
      if (/mono/i.test(cs.fontFamily) && fs <= 14) out.monoSmall++;
    }
    // 卡片套件：同一圆角 + 同一阴影反复出现
    if (cs.boxShadow !== 'none' && parseFloat(cs.borderRadius) > 0) {
      const sig = cs.borderRadius + '|' + cs.boxShadow; cardSig[sig] = (cardSig[sig] || 0) + 1;
    }
    const r = el.getBoundingClientRect();
    if (r.width > 200 && ['Top', 'Bottom', 'Left', 'Right'].some((s) => cs['border' + s + 'Style'] !== 'none' && parseFloat(cs['border' + s + 'Width']) > 0 && parseFloat(cs['border' + s + 'Width']) <= 1)) out.hairlines++;
    if (r.width > 120 && r.height > 60 && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderStyle !== 'none')) {
      out.radiusTotal++; if (parseFloat(cs.borderRadius) === 0) out.radiusZero++;
    }
  }
  out.cardKit = Math.max(0, ...Object.values(cardSig));

  // 标题里只给一个词换色/斜体
  for (const h of document.querySelectorAll('h1, h2')) {
    if (!visible(h)) continue;
    const hs = getComputedStyle(h); const total = h.textContent.trim().length;
    for (const c of h.querySelectorAll('em, i, span, strong, b, mark')) {
      const cs = getComputedStyle(c); const n = c.textContent.trim().length;
      if (n > 0 && n <= total * 0.4 && (cs.color !== hs.color || cs.fontStyle !== hs.fontStyle || cs.fontFamily !== hs.fontFamily)) { out.accentWord.push(h.textContent.trim().slice(0, 40)); break; }
    }
  }
  const h = displayEl;
  if (h) { const cs = getComputedStyle(h); out.display = fam(cs.fontFamily);
    // 只看第一个真正被用上的字体：「Inter, sans-serif」里的 sans-serif 不能被当成 serif
    const first = cs.fontFamily.split(',').map((x) => x.replace(/["']/g, '').trim()).find((x) => document.fonts.check(`16px "${x}"`) || /^(serif|sans-serif|monospace)$/.test(x)) || out.display;
    out.headlineSerif = !/sans/i.test(first) && /(^serif$|garamond|newsreader|serif|caslon|playfair|fraunces|cormorant|tiempos|lora|baskerville|didot|bodoni|georgia|times|songti|宋|明朝|mincho)/i.test(first); }
  const p = Array.from(document.querySelectorAll('p, li')).find((e) => visible(e) && e.textContent.trim().length > 20);
  if (p) { const cs = getComputedStyle(p); out.body = fam(cs.fontFamily); out.bodyPx = parseFloat(cs.fontSize); }
  for (const img of document.images) {
    const src = img.getAttribute('src') || '';
    if (img.complete && img.naturalWidth === 0 && visible(img)) out.broken.push(src.slice(0, 80) || '(无 src)');
    else if (src && !/^(data:|https?:|blob:)/.test(src)) out.relImgs.push(src.slice(0, 60));
  }
  out.bg = rgba(getComputedStyle(document.body).backgroundColor)[3] > 0.5 ? rgba(getComputedStyle(document.body).backgroundColor) : rgba(getComputedStyle(document.documentElement).backgroundColor);
  return out;
}
"""


# ---------- 颜色 ----------

def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def oklab(rgb):
    r, g, b = (_lin(x) for x in rgb[:3])
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def dist(a, b):
    return math.dist(oklab(a), oklab(b))


def lch(rgb):
    L, a, b = oklab(rgb)
    return L, math.hypot(a, b), (math.degrees(math.atan2(b, a)) + 360) % 360


def hexs(rgb):
    return '#%02X%02X%02X' % tuple(int(x) for x in rgb[:3])


def bg_class(rgb):
    L, C, H = lch(rgb)
    if L > 0.9:
        if C < 0.003:
            return '浅·中性白'
        return '浅·暖纸' if 40 <= H <= 110 else '浅·有色'
    if L < 0.28:
        return '深·近黑' if C < 0.03 else '深·有色'
    return '中明度·有色' if C > 0.04 else '中明度·灰'


def palette(png_bytes, n=6):
    from PIL import Image
    im = Image.open(io.BytesIO(png_bytes)).convert('RGB')
    im.thumbnail((240, 240))
    q = im.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    return [{'hex': hexs(pal[i * 3:i * 3 + 3]), 'rgb': pal[i * 3:i * 3 + 3], 'share': round(c / total, 3)} for c, i in counts]


def layout_vector(png_bytes, w=32, h=20):
    """版式骨架：去掉颜色、只留明暗结构，再标准化——换皮不换骨的两版会高度相关。"""
    from PIL import Image, ImageFilter
    im = Image.open(io.BytesIO(png_bytes)).convert('L').filter(ImageFilter.FIND_EDGES).resize((w, h), Image.BILINEAR)
    v = list(im.tobytes())
    mu = sum(v) / len(v)
    sd = math.sqrt(sum((x - mu) ** 2 for x in v) / len(v)) or 1
    return [round((x - mu) / sd, 3) for x in v]


def corr(a, b):
    return sum(x * y for x, y in zip(a, b)) / len(a)


def palette_distance(p, q):
    """两套色板的平均最近距离（按面积加权，对称）。<0.06 基本是同一套色。"""
    def one(x, y):
        return sum(c['share'] * min(dist(c['rgb'], d['rgb']) for d in y) for c in x) / (sum(c['share'] for c in x) or 1)
    return round((one(p, q) + one(q, p)) / 2, 3)


# ---------- 采集 ----------

def expand(paths):
    """自己展开通配符：PowerShell 和加了引号的参数不会替你展开。"""
    out = []
    for p in paths:
        hits = sorted(glob.glob(p)) if any(c in p for c in '*?[') else [p]
        out += hits or [p]
    return out


def collect(paths, viewport=(1440, 900), min_body=14, min_label=12):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('体检跳过：没装 Python 版 playwright。装上后再跑：pip install playwright pillow && playwright install chromium',
              file=sys.stderr)
        sys.exit(0)
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for path in expand(paths):
            page = browser.new_page(viewport={'width': viewport[0], 'height': viewport[1]})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)[:160]))
            page.on('console', lambda m: errors.append(m.text[:160]) if m.type == 'error' else None)
            page.add_init_script(f'window.__MIN_BODY = {min_body}; window.__MIN_LABEL = {min_label};')
            try:
                page.goto(Path(path).resolve().as_uri(), wait_until='domcontentloaded', timeout=20000)
                try:   # 外网字体/CDN 连不上时别卡死整批，最多再等 8 秒
                    page.wait_for_load_state('load', timeout=8000)
                except Exception:
                    errors.append('页面 load 超时（多半是外网字体或 CDN 连不上），按已加载的内容体检')
                try:
                    page.evaluate('document.fonts.ready')
                except Exception:
                    pass
                page.wait_for_timeout(800)
                facts = page.evaluate(COLLECT_JS)
                shot = page.screenshot()
                facts['palette'] = palette(shot)
                facts['layout'] = layout_vector(shot)
            except Exception as e:
                facts = {'fatal': str(e).split('\n')[0][:200]}
            facts['errors'] = errors
            facts['path'] = str(Path(path).resolve())
            results.append(facts)
            page.close()
        browser.close()
    return results


def fingerprint(f):
    """一句人话描述这版的样子，加上能比较的数值。"""
    bg = f['bg'] if f['bg'] and f['bg'][3] > 0.5 else f['palette'][0]['rgb']
    accents = [c for c in f['palette'] if lch(c['rgb'])[1] > 0.06 and c['share'] > 0.004][:2]
    serif = '衬线标题' if f['headlineSerif'] else '无衬线标题'
    desc = f'{bg_class(bg)}底 {hexs(bg)}，{serif}（{f["display"] or "?"}），正文 {f["body"] or "?"}'
    if accents:
        desc += '，主色 ' + '/'.join(c['hex'] for c in accents)
    return {'bg': hexs(bg), 'bg_class': bg_class(bg), 'display': f['display'], 'body': f['body'],
            'serif': f['headlineSerif'], 'palette': f['palette'], 'layout': f['layout'], 'desc': desc}


def judge(f):
    red, yellow = [], []
    if f.get('fatal'):
        return [f'打不开：{f["fatal"]}'], []
    if not f['textTotal']:
        yellow.append('页面上没有可检测的文字（全是图/画布？）——以下结论只基于截图色板')
    if f['broken']:
        red.append(f'图裂了 {len(f["broken"])} 张：{f["broken"][:3]}')
    if f['errors']:
        red.append(f'控制台报错 {len(f["errors"])} 条：{f["errors"][:2]}')
    if f['bodySmall']:
        red.append(f'正文字号低于下限 {len(f["bodySmall"])} 处，如 {f["bodySmall"][:2]}')
    if len(f['small']) >= 3:
        red.append(f'低于标签下限的文字 {len(f["small"])} 处，如 {[(s["text"], s["px"]) for s in f["small"][:3]]}')
    if f['relImgs']:
        yellow.append(f'相对路径图片 {len(f["relImgs"])} 张（{f["relImgs"][:2]}）：要双击打开的单文件交付，挪个目录就全裂，改成 base64 内嵌')
    if f['lowContrast']:
        red.append(f'对比度不够 {len(f["lowContrast"])} 处，如 {f["lowContrast"][:3]}')

    chrome = []
    if len(f['eyebrows']) >= 3:
        chrome.append(f'全大写拉字距小标签 {len(f["eyebrows"])} 个（{f["eyebrows"][:3]}）')
    if f['dots'] >= 2:
        chrome.append(f'「A · B · C」中点连接 {f["dots"]} 处')
    if f['emDashLabels']:
        chrome.append(f'「WORD — 片段」标签 {f["emDashLabels"]} 处')
    if f['arrows'] >= 2:
        chrome.append(f'链接/按钮尾巴加「→」{f["arrows"]} 处')
    if f['monoSmall'] >= 4:
        chrome.append(f'等宽小字标签 {f["monoSmall"]} 处')
    if chrome:
        yellow.append('模板装饰：' + '；'.join(chrome))
    if f['accentWord']:
        yellow.append(f'标题里只给一个词换色/斜体 {len(f["accentWord"])} 处（{f["accentWord"][:2]}）')
    if len(f['numbered']) >= 3:
        yellow.append(f'01/02/03 编号 {len(f["numbered"])} 个——内容真是序列吗？')
    if f['display'] and f['display'].lower() in ('inter', 'roboto', 'arial', 'helvetica', 'system-ui', '-apple-system'):
        yellow.append(f'标题字体是 {f["display"]}（UI 小字体当 display）')
    return red, yellow


def families(f):
    """这一版落在哪个常见外观家族里。只是描述，不是毛病：用来比三版、比账本。"""
    if f.get('fatal') or not f.get('palette'):
        return []
    out = []
    bg = f['bg'] if f['bg'] and f['bg'][3] > 0.5 else f['palette'][0]['rgb']
    cream = bg_class(bg) == '浅·暖纸'   # 必须是暖色相：浅冷灰（如 #DFEBE5）数值上也离奶油色很近，但不是这一类
    clay = any(dist(c['rgb'], CLAY) < 0.07 for c in f['palette']) or \
        any(dist([int(x) for x in k.split(',')], CLAY) < 0.07 for k in f['textColors'])
    if cream and (clay or f['headlineSerif']):
        parts = ['暖奶油底'] + (['赤陶/陶土色点缀'] if clay else []) + (['衬线大标题'] if f['headlineSerif'] else [])
        out.append('暖纸衬线·' + '＋'.join(parts) + '（也是 Claude 自己的配色）')
    L, C, _ = lch(bg)
    vivid = [c for c in f['palette'] if lch(c['rgb'])[1] > 0.15]
    if L < 0.2 and len(vivid) == 1:
        out.append(f'深底单点缀·近黑底＋单一亮色点缀（{vivid[0]["hex"]}）')
    if f['hairlines'] >= 8 and f['radiusTotal'] and f['radiusZero'] / f['radiusTotal'] > 0.9:
        out.append(f'细线报纸·1px 细线 {f["hairlines"]} 处、零圆角')
    if f['cardKit'] >= 4:
        out.append(f'卡片套件·同一圆角＋同一阴影重复 {f["cardKit"]} 次')
    return out


# ---------- 外观账本 ----------

def ledger_file():
    return Path(os.environ.get('HUASHU_DESIGN_HOME') or Path.home() / '.huashu-design') / 'ledger.jsonl'


def ledger_read(last=None):
    f = ledger_file()
    rows = [json.loads(l) for l in f.read_text(encoding='utf-8').splitlines() if l.strip()] if f.exists() else []
    return rows[-last:] if last else rows


def ledger_summary(rows):
    if not rows:
        return f'外观账本是空的（{ledger_file()}）。交付后用 ledger add 记一笔，下次才能主动避开。'
    lines = [f'最近 {len(rows)} 个交付的样子（新项目主动避开反复出现的那几样）：']
    for r in rows:
        lines.append(f'  {r["date"]} {r["project"]}：{r["desc"]}' + (f'　// {r["note"]}' if r.get('note') else ''))
    n = len(rows)
    tally = {}
    for r in rows:
        for k in (r['bg_class'] + '底', '衬线标题' if r['serif'] else '无衬线标题', '字体 ' + (r['display'] or '?')):
            tally[k] = tally.get(k, 0) + 1
    rep = [f'{k} {v}/{n}' for k, v in sorted(tally.items(), key=lambda x: -x[1]) if v >= max(2, n * 0.5)]
    if rep:
        lines.append('反复出现：' + '、'.join(rep) + '——这次至少有一个方向别再落在这里')
    return '\n'.join(lines)


def similar(a, b, brand=False, ignore_layout=False):
    """返回两版撞在哪里（空表示没撞）。brand=颜色字体受品牌约束，只比骨架；ignore_layout=App 多机并排这类骨架天然相同的形态。"""
    hits = []
    pd = palette_distance(a['palette'], b['palette'])
    lc = corr(a['layout'], b['layout'])
    if pd < 0.06 and not brand:
        hits.append(f'色板几乎相同（距离 {pd}）')
    if lc > 0.55 and not ignore_layout:
        hits.append(f'版式骨架高度相似（相关 {lc:.2f}）')
    if not brand and a['bg_class'] == b['bg_class'] and a['serif'] == b['serif'] and (a['display'] or '').lower() == (b['display'] or '').lower():
        hits.append(f'同一底色类＋同一标题字体（{a["bg_class"]}、{a["display"]}）')
    return hits, pd, lc


# ---------- 命令 ----------

def cmd_check(a):
    res = collect(a.files, a.viewport, a.min_body, a.min_label)
    worst = 0
    out = []
    for f in res:
        red, yellow = judge(f)
        fp = fingerprint(f) if not f.get('fatal') else {'desc': '（打不开）'}
        worst = max(worst, 1 if red else 0)
        out.append({'path': f['path'], 'red': red, 'yellow': yellow, 'families': families(f), 'look': fp['desc']})
        if not a.json:
            print(f'\n■ {f["path"]}\n  样子：{fp["desc"]}')
            for r in red:
                print(f'  🔴 {r}')
            for y in yellow:
                print(f'  🟡 {y}')
            for i in families(f):
                print(f'  ℹ️  外观家族 {i}')
            if not red and not yellow:
                print('  ✓ 没有红灯，也没有模板装饰')
    if a.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
    elif any(o['yellow'] for o in out):
        print('\n🟡 模板装饰是顺手的小动作：brief 要这样就照做，否则删掉那个结构（比如整行小标签），换个符号躲过检测不算改。'
              '\nℹ️  外观家族不用改，它只在 compare / ledger check 里有意义。')
    return worst


def cmd_compare(a):
    res = collect(a.files, a.viewport, a.min_body, a.min_label)
    failed = [f for f in res if f.get('fatal')]
    if failed:
        for f in failed:
            print(f'打不开，无法完成比较：{f["path"]}：{f["fatal"]}')
        return 2
    fps = [fingerprint(f) for f in res]
    names = [Path(f['path']).name for f in res]
    print('三方向外观：')
    for n, fp in zip(names, fps):
        print(f'  {n}：{fp["desc"]}')
    bad = 0
    for i in range(len(fps)):
        for j in range(i + 1, len(fps)):
            hits, pd, lc = similar(fps[i], fps[j], a.brand, a.ignore_layout)
            print(f'  {names[i]} ↔ {names[j]}：色板距离 {pd}，骨架相关 {lc:.2f}' + (f' → 撞了：{"；".join(hits)}' if hits else ''))
            bad += bool(hits)
    if len(fps) >= 3 and len({fp['bg_class'] for fp in fps}) == 1 and not a.brand:
        print(f'  🟡 三版底色是同一类（{fps[0]["bg_class"]}）——用户看到的是同一种气质的三个变体')
        bad += 1
    fams = [{x.split('·')[0] for x in families(f)} for f in res]
    shared = set.intersection(*fams) if len(fams) >= 3 else set()
    if shared and not a.brand:
        print(f'  🟡 三版落在同一个外观家族（{"、".join(sorted(shared))}）——留一两版在里面没关系，三版都在就是一种气质的三个变体')
        bad += 1
    print('  ✓ 三版拉开了' if not bad else '  → 撞了的那版回到方向卡重做：换骨架或换来源，不是换颜色')
    return 1 if bad else 0


def cmd_ledger(a):
    if a.action == 'add':
        if not a.files or not a.project:
            print('用法：design_lint.py ledger add final.html --project 名字 [--note "…"]', file=sys.stderr)
            return 2
        f = collect(a.files[:1], a.viewport, a.min_body, a.min_label)[0]
        if f.get('fatal'):
            print(f'打不开，没记账：{f["fatal"]}', file=sys.stderr)
            return 2
        fp = fingerprint(f)
        p = Path(a.files[0]).resolve().parent
        if p.name == 'design-demos':
            p = p.parent
        row = {'date': date.today().isoformat(), 'project': a.project, 'project_dir': str(p), 'file': f['path'],
               'note': a.note or '', **{k: fp[k] for k in ('desc', 'bg', 'bg_class', 'display', 'body', 'serif', 'palette', 'layout')}}
        ledger_file().parent.mkdir(parents=True, exist_ok=True)
        with ledger_file().open('a', encoding='utf-8') as fh:
            fh.write(json.dumps(row, ensure_ascii=False) + '\n')
        print(f'已记账 → {ledger_file()}\n  {a.project}：{fp["desc"]}')
        return 0
    rows = ledger_read(a.last)
    if a.action == 'check':
        if not rows:
            print(ledger_summary(rows))
            return 0
        collected = collect(a.files, a.viewport, a.min_body, a.min_label)
        failed = [f for f in collected if f.get('fatal')]
        if failed:
            for f in failed:
                print(f'打不开，无法完成查账：{f["path"]}：{f["fatal"]}')
            return 2
        res = collected
        if not res:
            print('没有可比较的文件', file=sys.stderr)
            return 2
        bad = 0
        for f in res:
            fp = fingerprint(f)
            clash = [(r, similar(fp, r)[0]) for r in rows]
            clash = [(r, h) for r, h in clash if h]
            print(f'■ {Path(f["path"]).name}：{fp["desc"]}')
            for r, h in clash:
                print(f'  🟡 和 {r["date"]} {r["project"]} 撞了：{"；".join(h)}')
            bad += bool(clash)
        if bad == len(res):
            print('→ 所有方向都和最近的项目撞了：至少让一个方向彻底离开最近反复出现的样子')
        return 1 if bad == len(res) else 0
    print(ledger_summary(rows))
    return 0


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):   # Windows 控制台默认不是 UTF-8，别让一个 emoji 把体检打崩
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass
    p = argparse.ArgumentParser(description='只量事实的设计体检 + 外观指纹')
    sub = p.add_subparsers(dest='cmd', required=True)

    def common(sp):
        sp.add_argument('--viewport', default='1440x900', type=lambda s: tuple(int(x) for x in s.lower().split('x')))
        sp.add_argument('--min-body', type=float, default=14, help='正文最小字号；deck 24；手机上看的 1080 宽长图 36')
        sp.add_argument('--min-label', type=float, default=12, help='标签注释最小字号；deck 16；手机上看的 1080 宽长图 28')
        sp.add_argument('--brand', action='store_true', help='compare：颜色字体受品牌约束，只比骨架')
        sp.add_argument('--ignore-layout', action='store_true', help='compare：App 多机并排等骨架天然相同的形态')
        sp.add_argument('--json', action='store_true')
    c = sub.add_parser('check')
    c.add_argument('files', nargs='+')
    common(c)
    c = sub.add_parser('compare')
    c.add_argument('files', nargs='+')
    common(c)
    c = sub.add_parser('ledger')
    c.add_argument('action', nargs='?', choices=['list', 'add', 'check'], default='list')
    c.add_argument('files', nargs='*')
    c.add_argument('--project')
    c.add_argument('--note')
    c.add_argument('--last', type=int, default=8)
    common(c)
    a = p.parse_args(argv)
    return {'check': cmd_check, 'compare': cmd_compare, 'ledger': cmd_ledger}[a.cmd](a)


if __name__ == '__main__':
    sys.exit(main())
