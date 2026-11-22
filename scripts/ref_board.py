#!/usr/bin/env python3
"""把参考作品截成一张参考板，让 agent 在动手前真的「看过」它。

写「参考 Stripe Press」几个字，模型做出来的是它对 Stripe Press 的平均印象；
截一张图放在眼前，它才会去量网格、比字号、取颜色。

用法：
  python3 scripts/ref_board.py <网址或图片> [<网址或图片> …] --out refs/board.jpg [--full]

  网址：用无头浏览器打开，截首屏（--full 截整页，最多 4000px 高）
  图片：本地路径或图片网址（.jpg/.png/.webp/.gif），直接放进板子
  每个来源单独存一张（board-1.jpg …，跟总板同名加编号，不会覆盖你自己放进 refs/ 的截图），再拼一张总板。
  打不开的、截出来几乎是一片纯色的（WebGL 站点常见），都会列出来，不会中断。

拿到图后用你的看图能力打开总板，把「借的是什么」写成具体规则（网格几栏、标题和正文字号比、
主色占比、图文关系），而不是「参考了它的风格」。
"""

import os, sys  # noqa: E401
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _pyenv  # noqa: F401,E402  WorkBuddy 里换到带 playwright 的 Python
import argparse
import html
import sys
from pathlib import Path

IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp', '.gif')


def shoot(page, src, out, full):
    if Path(src).exists():
        src = Path(src).resolve().as_uri()
    if src.lower().split('?')[0].endswith(IMG_EXT):
        page.set_viewport_size({'width': 1440, 'height': 900})
        r = page.goto(src, wait_until='load', timeout=30000)   # 浏览器直接打开图片，自己包一层 <img>
        if (r and not r.ok) or not page.evaluate('document.images[0] && document.images[0].naturalWidth'):
            raise RuntimeError(f'图片加载失败（HTTP {r.status if r else "?"}）')
        page.locator('img').first.screenshot(path=str(out), type='jpeg', quality=82)
        return
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(src, wait_until='domcontentloaded', timeout=30000)
    try:
        page.wait_for_load_state('networkidle', timeout=8000)
    except Exception:
        pass  # 有长连接的站点等不到 networkidle，首屏通常已经够了
    page.wait_for_timeout(800)
    if full:
        h = min(page.evaluate('document.documentElement.scrollHeight'), 4000)
        page.set_viewport_size({'width': 1440, 'height': h})
        page.wait_for_timeout(400)
    page.screenshot(path=str(out), type='jpeg', quality=82)


def mostly_blank(path):
    """截图几乎是一种颜色：WebGL 站点在无头浏览器里常常是黑的，懒加载的页面是白的。

    判据：和最多的那个颜色明显不同（亮度差 >24）的像素不到 0.8%。实测 WebGL 黑屏约 0.4%，
    最空的极简设计（一个数字加一排细线）约 1.5%。没装 Pillow 时返回 None，表示判断不了。
    """
    try:
        from PIL import Image
    except ImportError:
        return None
    from collections import Counter
    px = Image.open(path).convert('L').resize((360, 225)).tobytes()
    mode = Counter(px).most_common(1)[0][0]
    return sum(1 for v in px if abs(v - mode) > 24) / len(px) < 0.008


def board(page, shots, out):
    cells = ''.join(
        f'<figure><img src="{p.resolve().as_uri()}"><figcaption>{html.escape(s)}</figcaption></figure>'
        for p, s in shots)
    page.set_viewport_size({'width': 1500, 'height': 600})
    tmp = out.parent / '.board.html'
    tmp.write_text(f'''<!doctype html><meta charset="utf-8"><style>
body{{margin:0;padding:20px;background:#ddd;font:13px/1.3 -apple-system,"PingFang SC","Noto Sans SC",sans-serif}}
.g{{display:grid;grid-template-columns:repeat(2,720px);gap:16px;align-items:start}}
figure{{margin:0}} img{{width:720px;display:block;max-height:1100px;object-fit:cover;object-position:top}}
figcaption{{margin-top:4px;word-break:break-all;color:#333}}</style><div class="g">{cells}</div>''', encoding='utf-8')
    page.goto(tmp.resolve().as_uri(), wait_until='load', timeout=30000)   # 本地图只能从 file:// 页面里引用
    page.screenshot(path=str(out), full_page=True, type='jpeg', quality=80)
    tmp.unlink()


def main(argv):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description='把参考作品截成参考板')
    ap.add_argument('sources', nargs='+')
    ap.add_argument('--out', default='refs/board.jpg')
    ap.add_argument('--full', action='store_true', help='网页截整页（最多 4000px）')
    a = ap.parse_args(argv)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('需要 Playwright：pip install playwright && python3 -m playwright install chromium')
        print('没有的话：用 WebSearch 的图片结果或请用户发截图，存进 refs/ 后直接用看图能力打开。')
        return 2
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    shots, failed, unchecked = [], [], False
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            print('Chromium 启动失败：', str(e).splitlines()[0])
            print('装一下：python3 -m playwright install chromium')
            return 2
        page = browser.new_page()
        for i, src in enumerate(a.sources, 1):
            one = out.with_name(f'{out.stem}-{i}.jpg')
            if Path(src).exists() and Path(src).resolve() == one.resolve():
                one = out.with_name(f'{out.stem}-{i}-shot.jpg')
            try:
                shoot(page, src, one, a.full)
                blank = mostly_blank(one)
                unchecked = unchecked or blank is None
                if blank:
                    failed.append(src)
                    print('✗', src, '：截图几乎是一片纯色（WebGL/3D 站点或懒加载），等于没看到')
                    continue
                shots.append((one, src))
                print('✓', one, '←', src)
            except Exception as e:
                failed.append(src)
                print('✗', src, '：', str(e).splitlines()[0])
        if shots:
            board(page, shots, out)
            print('参考板 →', out)
        elif out.exists():
            out.unlink()   # 上一次的旧板，留着会被当成这次的
        browser.close()
    if unchecked:
        print('\n没装 Pillow（pip install pillow），没法自动判断截图是不是一片纯色：逐张打开看一眼再用。')
    if failed:
        print('\n打不开的来源（常见原因：反爬、要登录、地区限制）。换一个同作品的报道页或图片地址，'
              '或请用户发截图。不要凭印象假装看过。')
    return 0 if shots else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
