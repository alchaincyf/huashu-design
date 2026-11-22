#!/usr/bin/env python3
"""把一个设计 HTML 变成断网也能双击打开的单文件。

    python3 scripts/offline.py 设计稿.html              # 写到 设计稿.offline.html
    python3 scripts/offline.py 设计稿.html -o 交付.html
    python3 scripts/offline.py 设计稿.html --inline-local   # 连本地图片也嵌进去，只交一个文件

做四件事：
- React／ReactDOM 换成本 skill 自带的生产版（assets/vendor/），内联进页面；
- <script type="text/babel"> 在浏览器里用 Babel 预编译成普通 JS，去掉 3MB 的 Babel，打开不再现场编译；
- Google Fonts 只嵌这一页用得到的字形切片（页面上的字和源码里写到的字），不整套嵌；
- 其他外链脚本、样式、图片，加载得到就嵌进去。
最后断网重开一次，和原页比一遍截图，差得多就报出来。

CDN 断连时 React 和 Babel 用本地副本，照样能转；字体连不上就保留外链并提示（会回落系统字）。
"""
import argparse
import base64
import io
import re
from urllib.parse import quote
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from _ready import wait_ready, NOT_READY  # noqa: E402

VENDOR = HERE.parent / 'assets' / 'vendor'
LIBS = {   # URL 里出现这个名字 → 用本地哪份
    'react-dom': 'react-dom.production.min.js',
    'react': 'react.production.min.js',
    'babel': 'babel.min.js',
}
SCRIPT_SRC = re.compile(r'<script\b([^>]*)\bsrc=["\']([^"\']+)["\']([^>]*)>\s*</script>', re.I)
BABEL_TAG = re.compile(r'<script\b([^>]*)type=["\']text/babel["\']([^>]*)>(.*?)</script>', re.I | re.S)
LINK_CSS = re.compile(r'<link\b[^>]*\bhref=["\']([^"\']+)["\'][^>]*>', re.I)


def lib_of(url):
    u = url.lower()
    if not u.startswith('http'):
        return None
    for k in LIBS:   # react-dom 要排在 react 前面判断
        if re.search(rf'[/@]{re.escape(k)}(?:[@/.-]|$)', u) or (k == 'babel' and 'babel' in u):
            return k
    return None


def js_safe(code):
    return code.replace('</script', '<\\/script')


def data_uri(body, ctype):
    return f'data:{ctype};base64,' + base64.b64encode(body).decode()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('html')
    ap.add_argument('-o', '--out')
    ap.add_argument('--inline-local', action='store_true', help='本地图片也转成 data URI 嵌进去')
    a = ap.parse_args()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit('需要 Python 版 playwright：pip install playwright && playwright install chromium')

    src = Path(a.html).resolve()
    out = Path(a.out).resolve() if a.out else src.with_name(src.stem + '.offline.html')
    html = src.read_text(encoding='utf-8')
    got = {}       # url → (bytes, content-type)
    warns = []

    def route(r):
        url = r.request.url
        k = lib_of(url) if r.request.resource_type == 'script' else None
        if k:
            r.fulfill(body=(VENDOR / LIBS[k]).read_bytes(), content_type='application/javascript')
            return
        r.continue_()

    def keep(resp):
        url = resp.url
        if url.startswith('http') and resp.ok:
            try:
                got[url] = (resp.body(), (resp.headers.get('content-type') or '').split(';')[0])
            except Exception:
                pass

    with sync_playwright() as pw:
        br = pw.chromium.launch()
        pg = br.new_page(viewport={'width': 1440, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.route('**/*', route)
        pg.on('response', keep)
        # 库的 script 标签常带开发版的 integrity 哈希，换成本地生产版会被拒绝执行：加载时去掉它，
        # 用 <base> 让相对路径照常指到原目录
        load_html = SCRIPT_SRC.sub(lambda m: re.sub(r'\s(integrity|crossorigin)(=["\'][^"\']*["\'])?', '', m.group(0))
                                   if lib_of(m.group(2)) else m.group(0), html)
        load_html = re.sub(r'(<head[^>]*>)', lambda m: m.group(1) + f'<base href="{src.parent.as_uri()}/">', load_html, count=1, flags=re.I)
        try:
            pg.goto(src.as_uri(), wait_until='commit', timeout=30000)
            pg.set_content(load_html, wait_until='load', timeout=30000)
        except Exception:
            warns.append('页面 30 秒没加载完，按已加载的内容打包')
        if not wait_ready(pg, 20000):
            warns.append(NOT_READY.format(s=20))

        # 1. 预编译 text/babel
        blocks = list(BABEL_TAG.finditer(html))
        compiled = []
        if blocks:
            has_babel = pg.evaluate('typeof Babel !== "undefined"')
            if not has_babel:
                pg.add_script_tag(content=(VENDOR / 'babel.min.js').read_text(encoding='utf-8'))
            for m in blocks:
                attrs = m.group(1) + m.group(2)
                code = m.group(3)
                s = re.search(r'\bsrc=["\']([^"\']+)["\']', attrs)
                if s:
                    p = (src.parent / s.group(1)).resolve()
                    code = p.read_text(encoding='utf-8') if p.exists() else ''
                presets = re.search(r'data-presets=["\']([^"\']+)["\']', attrs)
                presets = [x.strip() for x in presets.group(1).split(',')] if presets else ['react']
                res = pg.evaluate('''([code, presets]) => { try {
                    return {ok: true, code: Babel.transform(code, {presets, filename: 'page.jsx',
                      generatorOpts: {jsescOption: {minimal: true}}}).code};
                  } catch (e) { return {ok: false, err: String(e).slice(0, 300)}; } }''', [code, presets])
                if not res['ok']:
                    sys.exit(f'JSX 编译失败：{res["err"]}')
                compiled.append(res['code'])

        # 2. 字体：把页面上的字和源码里写到的字都加载一遍，再看哪些切片真被用到
        all_text = html + ''.join(compiled)
        faces = pg.evaluate('''async (text) => {
            const fs = [...document.fonts];
            const seen = new Set();
            // 只补首屏真用到的「字族＋字重＋字形」：没出现过的字重不整套拉进来
            const used = new Set(fs.filter(f => f.status === 'loaded').map(f => `${f.style} ${f.weight} ${f.family}`));
            for (const f of fs) {
              if (!used.has(`${f.style} ${f.weight} ${f.family}`)) continue;
              const k = `${f.style} ${f.weight} 16px "${f.family.replace(/"/g, '')}"`;
              if (seen.has(k)) continue; seen.add(k);
              try { await document.fonts.load(k, text); } catch (e) {}
            }
            await document.fonts.ready;
            return fs.filter(f => f.status === 'loaded').map(f => [f.family.replace(/"/g, ''), String(f.weight), f.style, f.unicodeRange]);
          }''', ''.join(sorted(set(all_text)))[:200000])
        pg.wait_for_timeout(500)
        shot_a = pg.screenshot()

        # Google Fonts 的中文字体一款切成上百片，整片嵌进去动辄几 MB；能拿到 text= 子集就只嵌用得到的字
        subset_css = []
        gfams = {f for u in got if 'fonts.googleapis.com' in u for f in
                 re.findall(r'font-family:\s*["\']?([^;"\']+)', got[u][0].decode('utf-8', 'replace'))}
        chars = sorted({c for c in pg.evaluate('document.body.innerText') + ''.join(compiled)
                        + re.sub(r'<!--.*?-->|data:[^"\')]+', '', html, flags=re.S) if ord(c) > 32})
        combos = sorted({(f, w, st) for f, w, st, _ in faces if f in gfams})
        for fam, wt, st in combos:
            for i in range(0, len(chars), 400):
                chunk = chars[i:i + 400]
                axis = f'ital,wght@{1 if st == "italic" else 0},{wt}'
                url = f'https://fonts.googleapis.com/css2?family={quote(fam).replace("%20", "+")}:{axis}&text={quote("".join(chunk), safe="")}'
                try:
                    css = pg.request.get(url, timeout=20000).text()
                    furl = re.search(r'url\(([^)]+)\)', css).group(1)
                    body = pg.request.get(furl, timeout=20000).body()
                except Exception:
                    subset_css = None
                    break
                rng = ','.join(f'U+{ord(c):X}' for c in chunk)
                subset_css.append(f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{wt};font-display:swap;"
                                  f"src:url({data_uri(body, 'font/woff2')}) format('woff2');unicode-range:{rng};}}")
            if subset_css is None:
                warns.append('字体子集没拿到，改嵌整片（文件会大一些）')
                break
        br.close()

    used = {(f, w, s, re.sub(r'\s+', '', u).upper()) for f, w, s, u in faces}

    def norm_w(w):
        return {'normal': '400', 'bold': '700'}.get(w, w)

    def font_css(css_text):
        keep_blocks, dropped, missing = [], 0, 0
        for blk in re.findall(r'@font-face\s*{[^}]*}', css_text):
            fam = re.search(r'font-family:\s*["\']?([^;"\']+)', blk)
            wt = re.search(r'font-weight:\s*([^;]+);', blk)
            st = re.search(r'font-style:\s*([^;]+);', blk)
            ur = re.search(r'unicode-range:\s*([^;]+);', blk)
            key = (fam.group(1).strip() if fam else '', norm_w(wt.group(1).strip()) if wt else '400',
                   st.group(1).strip() if st else 'normal',
                   re.sub(r'\s+', '', ur.group(1)).upper() if ur else 'U+0-10FFFF')
            if not any(key[0] == u[0] and key[2] == u[2] and key[3] == u[3] and (key[1] == norm_w(u[1]) or ' ' in key[1] or ' ' in u[1]) for u in used):
                dropped += 1
                continue

            def swap(m):
                nonlocal missing
                u = m.group(1).strip('\'"')
                if u in got:
                    return f'url({data_uri(got[u][0], got[u][1] or "font/woff2")})'
                missing += 1
                return m.group(0)
            keep_blocks.append(re.sub(r'url\(([^)]+)\)', swap, blk))
        return '\n'.join(keep_blocks), dropped, missing

    # 3. 改写 HTML
    lib_used = set()

    def script_sub(m):
        url = m.group(2)
        k = lib_of(url)
        if k == 'babel' and blocks:
            return ''
        if k:
            lib_used.add(k)
            return f'<script>{js_safe((VENDOR / LIBS[k]).read_text(encoding="utf-8"))}</script>'
        if url.startswith('http'):
            if url in got:
                return f'<script>{js_safe(got[url][0].decode("utf-8", "replace"))}</script>'
            warns.append(f'外链脚本没取到，保留原链接：{url[:90]}')
        return m.group(0)

    html2 = SCRIPT_SRC.sub(script_sub, html)
    it = iter(compiled)
    html2 = BABEL_TAG.sub(lambda m: f'<script>{js_safe(next(it))}</script>', html2)

    def link_sub(m):
        tag, url = m.group(0), m.group(1)
        if re.search(r'rel=["\']?(preconnect|dns-prefetch)', tag, re.I):
            return ''
        if not url.startswith('http') or not re.search(r'rel=["\']?stylesheet', tag, re.I):
            return tag
        if url not in got:
            warns.append(f'样式没取到，保留外链（断网时回落系统字）：{url[:90]}')
            return tag
        css = got[url][0].decode('utf-8', 'replace')
        if 'fonts.googleapis.com' in url and subset_css:
            done = getattr(link_sub, 'gf', False)
            link_sub.gf = True
            return '' if done else f'<style>{chr(10).join(subset_css)}</style>'
        if 'fonts.googleapis.com' in url:
            css, dropped, missing = font_css(css)
            if missing:
                warns.append(f'{missing} 个字形切片没下载到，这些字会回落系统字')
        else:
            css = re.sub(r'url\(([^)]+)\)', lambda u: f'url({data_uri(*got[u.group(1).strip(chr(39) + chr(34))])})'
                         if u.group(1).strip('\'"') in got else u.group(0), css)
        return f'<style>{css}</style>'

    html2 = LINK_CSS.sub(link_sub, html2)

    def img_sub(m):
        u = m.group(2)
        if u.startswith('http') and u in got:
            return f'{m.group(1)}{data_uri(*got[u])}{m.group(3)}'
        if a.inline_local and not u.startswith(('http', 'data:')):
            p = (src.parent / u).resolve()
            if p.exists():
                ext = p.suffix.lower().lstrip('.')
                ctype = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml'}.get(ext, f'image/{ext}')
                return f'{m.group(1)}{data_uri(p.read_bytes(), ctype)}{m.group(3)}'
        return m.group(0)

    html2 = re.sub(r'(<img\b[^>]*\bsrc=["\'])([^"\']+)(["\'])', img_sub, html2, flags=re.I)
    out.write_text(html2, encoding='utf-8')

    # 4. 断网重开，比一遍
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        pg = br.new_page(viewport={'width': 1440, 'height': 900})
        errs2 = []
        pg.on('pageerror', lambda e: errs2.append(str(e)[:200]))
        pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        pg.goto(out.as_uri(), wait_until='load', timeout=30000)
        ok = wait_ready(pg, 15000)
        pg.wait_for_timeout(500)
        shot_b = pg.screenshot()
        br.close()

    diff = None
    try:
        from PIL import Image, ImageChops, ImageStat
        ia, ib = (Image.open(io.BytesIO(x)).convert('RGB') for x in (shot_a, shot_b))
        diff = sum(ImageStat.Stat(ImageChops.difference(ia, ib)).mean) / 3 / 255
    except ImportError:
        pass

    kb = out.stat().st_size / 1024
    print(f'离线版 → {out}  （{kb:,.0f} KB，原文件 {src.stat().st_size / 1024:,.0f} KB）')
    if blocks:
        print(f'  JSX 预编译 {len(blocks)} 段，去掉了 Babel')
    if lib_used:
        print(f'  内联：{"、".join(sorted(lib_used))}（本 skill 自带的 18.3.1 生产版）')
    for w in dict.fromkeys(warns):
        print('  ! ' + w)
    for e in errs2[:3]:
        print('  ✗ 断网打开报错：' + e)
    if not ok:
        print('  ✗ 断网打开后没渲染出内容')
    if diff is not None:
        flag = '✓' if diff < 0.01 else ('!' if diff < 0.04 else '✗')
        print(f'  {flag} 断网首屏和原页的像素差 {diff:.1%}' + ('' if diff < 0.01 else '，打开两份对比看哪里不一样'))
    if errs:
        print(f'  （原页加载时就有 {len(errs)} 条报错，例：{errs[0]}）')
    return 1 if (errs2 or not ok or (diff is not None and diff >= 0.04)) else 0


if __name__ == '__main__':
    sys.exit(main())
