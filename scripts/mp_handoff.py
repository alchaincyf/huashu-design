#!/usr/bin/env python3
"""把选定的小程序设计稿导出成交付包，交给 WorkBuddy（或任何写原生小程序的人）照着实现。

设计稿约定：每一屏包在 assets/wechat_frame.jsx 的 <WechatFrame page="pages/x/x" title="…"> 里，
外壳会在屏幕节点上写 data-mp-*；转发卡片用 <WechatShareCard>（或任何 5:4、带 data-mp-share 的节点）。

出这些（默认写到 _design/）：
  screens/NN-<页面>.png        每屏首屏，750 宽——1 个像素就是 1rpx，开发直接量
  screens/NN-<页面>-长图.png    这一屏能往下滚时的整页
  share-N.png                   转发卡片的 5:4 图
  images/                       设计稿里用到的图（data URL 解出来、本地文件拷过来），带尺寸和体积
  tokens.json                   颜色、字号（px 与 rpx）、圆角、字体，按出现次数排
  README.md                     页面清单、app.json 骨架、设计参数、图片清单、体检结果、实现约定
  给WorkBuddy的话.md             一段可以直接贴进 WorkBuddy「小程序」任务的需求
  设计稿.html                   原稿副本

查这几样（只报事实，改不改你定）：
  ✗ 字或可点的东西压在胶囊上：胶囊是微信放的，挡住就点不到
  ✗ tabBar 少于 2 个或多于 5 个
  ✗ 转发卡片不是 5:4
  ! 字小于 12px（24rpx）
  ! 用 background-image 引用了图片：原生小程序的本地图要换成 <image>
  ! 用了 backdrop-filter：部分安卓机不稳，别让设计只靠它
  ! 非系统字体：每一款都要 wx.loadFontFace 加载，最好裁成子集；超过两款报
  ! 设计稿里的图加起来超过 1.5MB：主包上限 2MB，大图要压缩或放云存储
  ! 没画转发卡片：群聊里那张卡是小程序最常被看见的地方
  ! tabBar 里有一项没画对应的屏
没有 ✗ 不等于能交付，逐张打开 screens/ 看。

用法：
  python3 scripts/mp_handoff.py 设计稿.html [--out _design] [--name 小程序名]
退出码：有 ✗ 时为 1。
"""

import argparse
import base64
import hashlib
import json
import re
import shutil
import sys
from _ready import wait_ready, NOT_READY, use_vendor
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlparse

PROBE = r'''() => {
  const hit = (a, b, pad) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;
  const screens = [];
  document.querySelectorAll('[data-mp-page]').forEach(el => {
    const sr = el.getBoundingClientRect();
    const rel = r => ({x0: r.left - sr.left, x1: r.right - sr.left, y0: r.top - sr.top, y1: r.bottom - sr.top});
    const capEl = el.querySelector('[data-mp-capsule]');
    const cap = capEl ? rel(capEl.getBoundingClientRect()) : {x0: sr.width - 94, x1: sr.width - 7, y0: 48, y1: 80};
    const inChrome = n => n.closest('[data-mp-capsule], [data-mp-chrome], [data-mp-tabbar="native"]');   // 原生 tabBar 由微信画，字号颜色走 app.json
    const texts = [], styles = [], images = [], issues = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      const p = node.parentElement;
      if (!t || !p || inChrome(p)) continue;
      const cs = getComputedStyle(p);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        const b = rel(r);
        if (b.y1 < 0 || b.y0 > sr.height || b.x1 < 0 || b.x0 > sr.width) continue;
        texts.push({t: t.slice(0, 16), size: parseFloat(cs.fontSize), font: cs.fontFamily, over: hit(b, cap, 2), bar: b.y0 < 42 && b.y1 > 6});
      }
    }
    [el, ...el.querySelectorAll('*')].forEach(n => {
      if (inChrome(n)) return;
      const cs = getComputedStyle(n);
      if (cs.display === 'none') return;
      const r = n.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      const b = rel(r);
      styles.push({color: cs.color, bg: cs.backgroundColor,
                   border: parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : '',
                   radius: cs.borderTopLeftRadius, font: cs.fontFamily, size: cs.fontSize,
                   bgimg: /url\(/.test(cs.backgroundImage) ? cs.backgroundImage.slice(0, 80) : '',
                   backdrop: cs.backdropFilter && cs.backdropFilter !== 'none',
                   tag: n.tagName.toLowerCase()});
      if (cs.cursor === 'pointer' && !n.closest('[data-mp-tabbar]') && b.y0 < 120 && hit(b, cap, 4) && b.x1 - b.x0 < sr.width * 0.9)
        issues.push({kind: 'tap-capsule', t: (n.textContent || n.tagName).trim().slice(0, 16)});
      // 状态栏（顶部 44px）里的小图：时间和信号会压在头像、缩略图上；满宽的照片铺到状态栏下面是允许的
      if (n.tagName === 'IMG' && b.y0 < 40 && b.y1 > 8 && b.x1 - b.x0 < sr.width * 0.9 && !n.closest('[data-mp-share]'))
        issues.push({kind: 'img-statusbar', t: n.alt || 'img'});
      if (n.tagName === 'IMG' && n.currentSrc) images.push({src: n.currentSrc, w: n.naturalWidth, h: n.naturalHeight});
      const m = cs.backgroundImage.match(/url\("?([^")]+)"?\)/);
      if (m) images.push({src: m[1], w: 0, h: 0, bg: true});
    });
    const sc = el.querySelector('[data-mp-scroll]');
    let cfg = null;
    try { cfg = el.dataset.mpTabbarConfig ? JSON.parse(el.dataset.mpTabbarConfig) : null; } catch (e) {}
    screens.push({page: el.dataset.mpPage, title: el.dataset.mpTitle || '', home: !!el.dataset.mpHome, nav: el.dataset.mpNav || 'default',
                  navColor: el.dataset.mpNavColor || '', navText: el.dataset.mpNavText || '',
                  tab: el.dataset.mpTab || '', tabbar: cfg, customTab: !!el.querySelector('[data-mp-tabbar="custom"]'),
                  w: el.offsetWidth, h: el.offsetHeight, extra: sc ? Math.max(0, sc.scrollHeight - sc.clientHeight) : 0,
                  texts, styles, images, issues});
  });
  const shares = [...document.querySelectorAll('[data-mp-share]')].map(n => {
    const r = n.getBoundingClientRect(); return {w: r.width, h: r.height};
  });
  return {screens, shares};
}'''

SYSTEM_FONTS = ('pingfang', '-apple-system', 'blinkmacsystemfont', 'system-ui', 'sf pro', 'helvetica', 'arial',
                'sans-serif', 'serif', 'monospace', 'songti', 'stsong', 'heiti', 'hiragino', 'microsoft yahei',
                'apple color emoji', 'segoe ui', 'roboto', 'menlo', 'courier', 'kaiti', 'stkaiti', 'times')


def hexcolor(c):
    m = re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)', c or '')
    if not m:
        return None
    r, g, b = (int(float(v)) for v in m.groups()[:3])
    a = float(m.group(4)) if m.group(4) is not None else 1
    if a < 0.05:
        return None
    h = f'#{r:02X}{g:02X}{b:02X}'
    return h if a > 0.98 else f'{h} {round(a * 100)}%'


def first_font(stack):
    return (stack or '').split(',')[0].strip().strip('"\'')


def is_system(font):
    f = font.lower()
    return any(s in f for s in SYSTEM_FONTS)


def slug(page):
    parts = [p for p in (page or '').split('/') if p and p != 'pages']
    return parts[0] if parts else 'page'


def analyze(report):
    """纯函数：把 PROBE 的结果变成 (findings, tokens)。findings = [(级别, 哪一屏或 None, 说明)]。"""
    found, colors, sizes, radii, fonts, samples = [], Counter(), Counter(), Counter(), Counter(), {}
    tab_lists = []
    for s in report['screens']:
        name = s['page']
        over = sorted({t['t'] for t in s['texts'] if t['over']})
        if over:
            found.append(('✗', name, '字压在胶囊上：' + '、'.join(f'「{t}」' for t in over[:4])))
        taps = sorted({i['t'] for i in s['issues'] if i['kind'] == 'tap-capsule'})
        if taps:
            found.append(('✗', name, '可点的东西压在胶囊上：' + '、'.join(f'「{t}」' for t in taps[:4])))
        bar = sorted({t['t'] for t in s['texts'] if t.get('bar')})
        if bar:
            found.append(('✗', name, '字压在状态栏上（顶部 44px 是系统的时间和信号）：' + '、'.join(f'「{t}」' for t in bar[:4])))
        bimg = [i for i in s['issues'] if i['kind'] == 'img-statusbar']
        if bimg:
            found.append(('!', name, f'{len(bimg)} 张小图伸进了状态栏（顶部 44px），时间和信号会压在上面：往下挪，或做成满宽的背景图'))
        small = sorted({(t['size'], t['t']) for t in s['texts'] if t['size'] < 12})
        if small:
            found.append(('!', name, f'字小于 12px（24rpx）：最小 {small[0][0]:.3g}px「{small[0][1]}」等 {len(small)} 处'))
        bgimg = [st for st in s['styles'] if st['bgimg']]
        if bgimg:
            found.append(('!', name, f'{len(bgimg)} 处用 background-image 引用图片：原生小程序本地图要换成 <image>（或改用网络图）'))
        if any(st['backdrop'] for st in s['styles']):
            found.append(('!', name, '用了 backdrop-filter：部分安卓机不稳，去掉它设计也要成立'))
        if s['tabbar']:
            tab_lists.append(tuple(s['tabbar']['list']))
            if not s['tab'] and not s['customTab']:
                found.append(('!', name, '这一屏画了原生 tabBar，但它不是 tab 页：二级页（详情、凭证、门店）在真小程序里没有 tabBar，设计稿去掉它，下面的留白一起想'))
        for st in s['styles']:
            for c in (st['color'], st['bg'], st['border']):
                h = hexcolor(c)
                if h:
                    colors[h] += 1
            if st['tag'] not in ('svg', 'path', 'circle', 'rect', 'g', 'line'):
                sizes[st['size']] += 1
            if st['radius'] not in ('0px', ''):
                radii[st['radius']] += 1
            fonts[first_font(st['font'])] += 1
        for t in s['texts']:
            f = first_font(t.get('font', ''))
            if f and not is_system(f) and t['t'] not in samples.setdefault(f, []) and len(samples[f]) < 60:
                samples[f].append(t['t'])
    drawn = {s['tab'] for s in report['screens'] if s['tab']}
    for lst in set(tab_lists):
        missing = [t for t in lst if t not in drawn]
        if missing:
            found.append(('!', None, f'tab「{"、".join(missing)}」没画：tabBar 的每一项都要有一屏'))
        if not 2 <= len(lst) <= 5:
            found.append(('✗', None, f'tabBar 有 {len(lst)} 个（{"、".join(lst)}）：微信要求 2 到 5 个'))
    custom = [f for f in fonts if f and not is_system(f)]
    if len(custom) > 2:
        found.append(('!', None, f'非系统字体 {len(custom)} 款（{"、".join(custom)}）：每款都要 wx.loadFontFace 加载并裁子集，留一两款就够'))
    if not report['shares']:
        found.append(('!', None, '没画转发卡片（5:4）：群聊里那张卡是小程序最常被看见的地方'))
    for k, sh in enumerate(report['shares'], 1):
        if sh['h'] and abs(sh['w'] / sh['h'] - 1.25) > 0.03:
            found.append(('✗', None, f'转发卡片 {k} 是 {sh["w"]:.0f}×{sh["h"]:.0f}，不是 5:4'))

    def px(v):
        try:
            return float(v.replace('px', ''))
        except ValueError:
            return None
    tokens = {
        'colors': [{'hex': h, 'count': n} for h, n in colors.most_common(14)],
        'fontSizes': [{'px': px(v), 'rpx': round(px(v) * 2), 'count': n} for v, n in sizes.most_common(10) if px(v)],
        'radii': [{'px': px(v), 'rpx': round(px(v) * 2), 'count': n} for v, n in radii.most_common(6) if px(v) is not None],
        'fonts': [{'family': f, 'system': is_system(f), 'count': n, 'used': sorted(samples.get(f, []), key=len, reverse=True)[:6]} for f, n in fonts.most_common(6) if f],
    }
    return found, tokens


def export_image(src, base, out_dir, seen):
    """把一张图落进 images/。返回 dict（file/url、尺寸、KB），外链只记 URL。"""
    if src.startswith('data:'):
        m = re.match(r'data:image/([\w+.-]+);base64,(.*)', src, re.S)
        if not m:
            return None
        raw = base64.b64decode(m.group(2))
        ext = {'jpeg': 'jpg', 'svg+xml': 'svg'}.get(m.group(1), m.group(1))
    elif src.startswith(('http://', 'https://')):
        return {'url': src, 'kb': None}
    else:
        p = Path(unquote(urlparse(src).path)) if src.startswith('file:') else (base / src)
        if not p.exists():
            return {'missing': src}
        raw, ext = p.read_bytes(), p.suffix.lstrip('.') or 'png'
    h = hashlib.sha1(raw).hexdigest()[:10]
    if h in seen:
        return seen[h]
    f = out_dir / f'{len(seen) + 1:02d}-{h}.{ext}'
    f.write_bytes(raw)
    seen[h] = {'file': f'images/{f.name}', 'kb': round(len(raw) / 1024)}
    return seen[h]


def order(screens):
    """交付包里的屏按小程序的顺序排，不按展示板上的摆法：标了 home 的第一，其次按 tabBar 顺序，其余照原样。"""
    tabs = next((s['tabbar']['list'] for s in screens if s.get('tabbar')), [])
    def key(i):
        s = screens[i]
        if s.get('home'):
            return (0, 0, i)
        if s['tab'] and s['tab'] in tabs:
            return (1, tabs.index(s['tab']), i)
        return (2, 0, i)
    return sorted(range(len(screens)), key=key)


UNSCALE = '''n => { const saved = []; let p = n.parentElement;
  const keep = (el, props) => saved.push([el, props.map(k => [k, el.style[k]])]);
  while (p && p !== document.documentElement) { const cs = getComputedStyle(p);
    if (cs.transform !== 'none' || (cs.zoom && cs.zoom !== '1') || (cs.scale && cs.scale !== 'none')) {
      keep(p, ['transform', 'zoom', 'scale']); p.style.transform = 'none'; p.style.zoom = '1'; p.style.scale = 'none'; }
    // 还原尺寸后会压到邻居、被展示板裁掉：外层不裁、圆角去掉，同层的其他东西（别的手机、标签）先藏起来
    if (cs.overflow !== 'visible' || cs.borderRadius !== '0px') { keep(p, ['overflow', 'borderRadius']); p.style.overflow = 'visible'; p.style.borderRadius = '0'; }
    p = p.parentElement; }
  let a = n;
  while (a && a.parentElement && a !== document.body) {
    for (const sib of a.parentElement.children) if (sib !== a && sib.nodeName !== 'SCRIPT' && sib.nodeName !== 'STYLE') { keep(sib, ['visibility']); sib.style.visibility = 'hidden'; }
    a = a.parentElement; }
  keep(n, ['borderRadius']); n.style.borderRadius = '0';
  window.__mpSaved = saved; return saved.length; }'''
RESCALE = '''() => { (window.__mpSaved || []).reverse().forEach(([el, props]) => props.forEach(([k, v]) => { el.style[k] = v; })); window.__mpSaved = []; }'''


def app_json(report):
    pages = []
    for s in report['screens']:
        if s['page'] not in pages:
            pages.append(s['page'])
    tab = next((s['tabbar'] for s in report['screens'] if s['tabbar']), None)
    j = {'pages': pages, 'window': {'navigationBarTitleText': report['screens'][0]['title'] if report['screens'] else ''},
         'lazyCodeLoading': 'requiredComponents'}
    first = report['screens'][0] if report['screens'] else None
    if first and first['nav'] == 'default':
        j['window'].update({'navigationBarBackgroundColor': (hexcolor(first['navColor']) or first['navColor'] or '#ffffff').split(' ')[0],
                            'navigationBarTextStyle': first['navText'] or 'black'})
    if all(s['nav'] == 'custom' for s in report['screens']) and report['screens']:
        j['window']['navigationStyle'] = 'custom'
    if tab:
        by_tab = {s['tab']: s['page'] for s in report['screens'] if s['tab']}
        j['tabBar'] = {'color': tab['color'], 'selectedColor': tab['selectedColor'], 'backgroundColor': tab['backgroundColor'],
                       'list': [{'pagePath': by_tab.get(t, '（这个 tab 没画，补一屏）'), 'text': t} for t in tab['list']]}
    elif any(s['customTab'] for s in report['screens']):
        j['tabBar'] = {'custom': True, 'list': '（自定义 tabBar：pagePath 照下面的页面清单填）'}
    return j


def write_readme(out, name, report, shots, shares, imgs, found, tokens, aj):
    L = [f'# {name} · 设计交付包', '',
         '给 WorkBuddy（或写原生微信小程序的人）照着实现用。设计稿按 375 宽画：**1px = 2rpx**，`screens/` 里的图是 750 宽，1 个像素就是 1rpx。',
         '设计稿只管长相和交互；数据、登录、云服务按需求另说。', '',
         '## 页面', '', '| # | 页面路径 | 标题 | 导航栏 | tab | 截图 |', '|---|---|---|---|---|---|']
    for k, (s, sh) in enumerate(zip(report['screens'], shots), 1):
        L.append(f'| {k} | `{s["page"]}` | {s["title"]} | {"自定义（navigationStyle: custom）" if s["nav"] == "custom" else "默认"} | {s["tab"] or "—"} | {" · ".join(f"`{p}`" for p in sh)} |')
    L += ['', '## app.json 骨架（照这个起，按实际补全）', '', '```json', json.dumps(aj, ensure_ascii=False, indent=2), '```', '']
    custom = sorted({s['page'] for s in report['screens'] if s['nav'] == 'custom'})
    if custom and aj['window'].get('navigationStyle') != 'custom':
        L += ['这几页用自定义导航栏，在各自的页面配置（`<页面>.json`）里写 `{"navigationStyle": "custom"}`：' + '、'.join(f'`{c}`' for c in custom), '']
    L += ['## 设计参数', '', '颜色（按出现次数）：' + '、'.join(f'`{c["hex"]}`' for c in tokens['colors']), '',
          '字号：' + '、'.join(f'{f["px"]:g}px＝{f["rpx"]}rpx' for f in tokens['fontSizes']), '',
          '圆角：' + ('、'.join(f'{r["px"]:g}px＝{r["rpx"]}rpx' for r in tokens['radii']) or '无'), '',
          '字体：' + '、'.join(f'{f["family"]}{"" if f["system"] else "（非系统字体，要 wx.loadFontFace＋裁子集）"}' for f in tokens['fonts']), '',
          *[f'{f["family"]} 用在：' + '、'.join(f'「{u}」' for u in f['used']) + ' 等。它通常比系统字体窄，加载失败回退时这些地方会变宽：给它们 white-space: nowrap，宽度按回退字体留够，别折行。'
            for f in tokens['fonts'] if not f['system'] and f.get('used')], '',
          '完整数据在 `tokens.json`。', '']
    L += ['## 图片', '']
    if imgs:
        total = sum(i.get('kb') or 0 for i in imgs)
        for i in imgs:
            if 'file' in i:
                L.append(f'- `{i["file"]}` {i["kb"]}KB')
            elif 'url' in i:
                L.append(f'- 外链 {i["url"][:90]}（下载进工程或放云存储）')
            else:
                L.append(f'- 找不到：{i["missing"]}')
        L += ['', f'合计约 {total}KB。主包上限 2MB：单张超过 200KB 的先压成 JPG；放不下的放云存储，用网络地址。']
    else:
        L.append('设计稿里没有用到图片。')
    if shares:
        L += ['', '转发卡片（onShareAppMessage 的 imageUrl，5:4）：' + '、'.join(f'`{s}`' for s in shares)]
    L += ['', '## 体检', '']
    L += [f'- {lv} {(s + "：") if s else ""}{msg}' for lv, s, msg in found] or ['- 没有发现问题']
    L += ['', '## 实现约定', '',
          '- 原生小程序（WXML / WXSS / JS），不引 React、不写 HTML 标签；尺寸按 px×2 写成 rpx（或按 375 基准换成 vw）。',
          '- 右上角胶囊是微信的：自定义导航栏时，标题和按钮避开它（用 wx.getMenuButtonBoundingClientRect 取真实位置），别写死。',
          '- 本地图片用 `<image>`，不要写进 WXSS 的 background-image。',
          '- 非系统字体只保留设计里真正用到的字，裁成子集再 wx.loadFontFace；加载失败要能回退到系统字体。',
          '- loading、空状态、出错三种状态照设计稿做；设计稿没画的按同一套颜色和字号补。',
          '- 先用后登录：浏览不要求登录，到了要存数据、下单那一步再登录。弹窗和浮层都要能关。',
          '- 和设计稿做不一样的地方，逐条写下来并说明原因。', '']
    (out / 'README.md').write_text('\n'.join(L), encoding='utf-8')


def write_prompt(out, name, report):
    cnt, names = Counter(s['page'] for s in report['screens']), {}
    for s in report['screens']:
        names.setdefault(s['page'], s['title'] or slug(s['page']))
    pages = '、'.join(n + (f'（{cnt[pg]} 个状态）' if cnt[pg] > 1 else '') for pg, n in names.items())
    txt = f'''做一个微信小程序「{name}」，长相和交互照这个文件夹里的设计稿实现：先读 _design/README.md，再逐张看 _design/screens/ 里的截图（750 宽，1 个像素就是 1rpx），_design/设计稿.html 是可以点的原稿。

页面：{pages}。数据存放方式：（这里写一句：本地存储就行 / 要登录、云端保存 / 要用 AI 做什么）。

要求：
1. 颜色、字号、圆角、间距照 README 里的设计参数，不要换成默认组件库的样子；设计稿里的图从 _design/images/ 拿，转发卡片用 share 那张。
2. 做完逐屏和设计稿对一遍，和设计稿不一样的地方列出来并说明原因。
3. _design 文件夹不要打进小程序包（加到 project.config.json 的 packOptions.ignore）。
4. 文件多的话分几次写。
'''
    (out / '给WorkBuddy的话.md').write_text(txt, encoding='utf-8')


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--out', default=None, help='交付包目录，默认和设计稿同级的 _design/')
    ap.add_argument('--name', default=None, help='小程序名，默认取设计稿 <title>')
    a = ap.parse_args(argv)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('需要 Playwright：pip install playwright && python3 -m playwright install chromium')
        return 2
    src = Path(a.file).resolve()
    out = Path(a.out).resolve() if a.out else src.parent / '_design'
    (out / 'screens').mkdir(parents=True, exist_ok=True)
    (out / 'images').mkdir(exist_ok=True)
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            print(f'Chromium 启动失败：{str(e).splitlines()[0]}\n装一下：python3 -m playwright install chromium')
            return 2
        page = browser.new_page(device_scale_factor=2, viewport={'width': 1600, 'height': 1000})
        use_vendor(page)
        try:
            page.goto(src.as_uri(), wait_until='networkidle', timeout=30000)
        except Exception:
            print('  ! 30 秒内网络资源没加载完（多半是字体或 CDN），按已加载的内容继续')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(600)
        if not wait_ready(page):
            print('  ! ' + NOT_READY.format(s=15))
        report = page.evaluate(PROBE)
        if not report['screens']:   # 慢网下 Babel 还没编译完：再等一会儿
            page.wait_for_timeout(3000)
            report = page.evaluate(PROBE)
        if not report['screens']:
            print(f'✗ {src.name}：没找到 [data-mp-page]。每一屏要包在 assets/wechat_frame.jsx 的 <WechatFrame page="pages/x/x"> 里')
            browser.close()
            return 1
        title = a.name or page.title() or src.stem
        els = page.locator('[data-mp-page]')
        idx = order(report['screens'])
        report['screens'] = [report['screens'][i] for i in idx]
        shots, wrong = [], []
        for k, i in enumerate(idx):
            s, el = report['screens'][k], els.nth(i)
            base = f'screens/{k + 1:02d}-{slug(s["page"])}'
            el.evaluate(UNSCALE)   # 展示板上缩小摆放的手机：按 375 原尺寸截
            el.scroll_into_view_if_needed()
            el.screenshot(path=str(out / f'{base}.png'))
            try:
                from PIL import Image
                w = Image.open(out / f'{base}.png').size[0]
                if abs(w - 750) > 2:
                    wrong.append(f'{s["page"]} 截出来 {w} 宽（应为 750）')
            except ImportError:
                pass
            mine = [f'{base}.png']
            if s['extra'] > 4:
                el.evaluate('(n, d) => { n.dataset.mpH = n.style.height; n.style.height = (n.getBoundingClientRect().height + d) + "px"; }', s['extra'])
                el.screenshot(path=str(out / f'{base}-长图.png'))
                el.evaluate('n => { n.style.height = n.dataset.mpH; }')
                mine.append(f'{base}-长图.png')
            page.evaluate(RESCALE)
            shots.append(mine)
        shares = []
        sh = page.locator('[data-mp-share]')
        for k in range(sh.count()):
            sh.nth(k).screenshot(path=str(out / f'share-{k + 1}.png'))
            shares.append(f'share-{k + 1}.png')
        browser.close()
    seen, imgs, done = {}, [], set()
    for s in report['screens']:
        for im in s['images']:
            if im['src'] in done:
                continue
            done.add(im['src'])
            r = export_image(im['src'], src.parent, out / 'images', seen)
            if r and r not in imgs:
                imgs.append(r)
    found, tokens = analyze(report)
    for msg in wrong:
        found.insert(0, ('✗', None, msg + '：屏幕宽度要是 375（WechatFrame 默认），截图才是 1px＝1rpx'))
    total = sum(i.get('kb') or 0 for i in imgs)
    if total > 1536:
        found.append(('!', None, f'设计稿里的图合计约 {total}KB：主包上限 2MB，大图压缩或放云存储'))
    big = [i for i in imgs if (i.get('kb') or 0) > 200]
    if big:
        found.append(('!', None, f'{len(big)} 张图超过 200KB：进包前压成 JPG（最长边 1000px 左右就够）'))
    aj = app_json(report)
    (out / 'tokens.json').write_text(json.dumps(tokens, ensure_ascii=False, indent=2), encoding='utf-8')
    shutil.copyfile(src, out / '设计稿.html')
    write_readme(out, title, report, shots, shares, imgs, found, tokens, aj)
    write_prompt(out, title, report)
    print(f'交付包：{out}  （{len(report["screens"])} 屏、{len(shares)} 张转发卡片、{len(imgs)} 张图）')
    for lv, s, msg in found:
        print(f'{lv} {(s + "：") if s else ""}{msg}')
    if not found:
        print('体检没有发现问题。逐张打开 screens/ 看过再交出去')
    print(f'下一步：在 WorkBuddy 里新建「小程序」任务，工作空间选 {out.parent}，把 {out.name}/给WorkBuddy的话.md 的内容贴进去（补上数据那一句）')
    return 1 if any(lv == '✗' for lv, _, _ in found) else 0


if __name__ == '__main__':
    sys.exit(main())
