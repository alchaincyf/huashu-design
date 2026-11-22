#!/usr/bin/env python3
"""把 App Store 宣传图的 HTML 切成能直接上传的成图，顺手查上架和缩略图里会出事的地方。

HTML 约定（照 assets/appstore/template.html 写）：
  <section class="as-panel">               一张，CSS 尺寸 440×956（= 1320×2868 的三分之一）
  <section class="as-strip" style="--n:3">  跨张连幅，440×N 宽，切成 N 张
按文档顺序输出 01.png 02.png …（RGB，不带透明通道），再出两张给你看的图：
  sheet.jpg            全部成图横排，一眼看完节奏
  search-preview.jpg   前三张缩到搜索结果里的大小——用户多半只看到这个

查这几样（只报事实，改不改你定）：
  ✗ 超过 10 张：App Store 每个机型最多 10 张
  ✗ 字出了画面：被裁掉的字
  ✗ 字跨缝：连幅里一行字跨过两张图的接缝，分开看时被切断
  ! 这一张最大的字太小：缩到搜索结果里读不出来（默认低于 40px 报）
  ! 这一张没有字：有意为之就不用管（整张作品、整张界面）
  没有 ✗ 不等于能交付，还要逐张看 sheet.jpg 和 search-preview.jpg。

用法：
  python3 scripts/appstore_render.py 宣传图.html --out appstore-out/ [--size 1320x2868] [--min-headline 40]
  --size 是每张成图的像素尺寸；iPad 13 寸用 2064x2752，并把模板里的 --w / --h 改成 1032 / 1376。
退出码：有 ✗ 时为 1。
"""

import argparse
import os
import sys
from _ready import wait_ready, NOT_READY, use_vendor
import tempfile
from pathlib import Path

PROBE = r'''() => {
  const out = [];
  document.querySelectorAll('.as-panel, .as-strip').forEach(sec => {
    window.scrollTo(0, 0);
    const sr = sec.getBoundingClientRect();
    const n = sec.classList.contains('as-strip') ? Math.max(1, Math.round(parseFloat(getComputedStyle(sec).getPropertyValue('--n')) || 1)) : 1;
    const pw = sr.width / n, items = [];
    const walk = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const el = node.parentElement, cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width < 2 || r.height < 2) continue;
        items.push({t: t.slice(0, 18), size: parseFloat(cs.fontSize), ui: !!el.closest('[data-ui]'),
                    x0: r.left - sr.left, x1: r.right - sr.left, y0: r.top - sr.top, y1: r.bottom - sr.top});
      }
    }
    out.push({n, w: sr.width, h: sr.height, pw, items});
  });
  return out;
}'''


def check(sec, min_headline):
    """返回 [(级别, 第几张(从 0), 说明)]。界面里的字（data-ui 内）不算标题，也允许被机身或画面边裁掉。"""
    found = []
    cap = [i for i in sec['items'] if not i['ui']]
    for i in cap:
        if i['x0'] < -1 or i['x1'] > sec['w'] + 1 or i['y0'] < -1 or i['y1'] > sec['h'] + 1:
            found.append(('✗', min(sec['n'] - 1, max(0, int(i['x0'] // sec['pw']))), f'字出了画面：「{i["t"]}」'))
        elif sec['n'] > 1 and int((i['x0'] + 1) // sec['pw']) != int((i['x1'] - 1) // sec['pw']):
            found.append(('✗', int((i['x0'] + 1) // sec['pw']), f'字跨缝：「{i["t"]}」'))
    for k in range(sec['n']):
        mine = [i['size'] for i in cap if k * sec['pw'] <= (i['x0'] + i['x1']) / 2 < (k + 1) * sec['pw']]
        if not mine:
            found.append(('!', k, '这一张没有字'))
        elif max(mine) < min_headline:
            found.append(('!', k, f'这一张最大的字只有 {max(mine):.0f}px，缩到搜索结果里读不出来'))
    return found


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--out', default='appstore-out', help='输出目录')
    ap.add_argument('--size', default='1320x2868', help='每张成图的像素尺寸')
    ap.add_argument('--min-headline', type=float, default=40, help='每张最大的字的底线（CSS px，按 440 宽画布）')
    a = ap.parse_args(argv)
    try:
        from playwright.sync_api import sync_playwright
        from PIL import Image
    except ImportError:
        print('需要 Playwright 和 Pillow：pip install playwright pillow && python3 -m playwright install chromium')
        return 2
    W, H = (int(v) for v in a.size.lower().split('x'))
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    src = Path(a.file).resolve()
    made, bad = [], 0
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            print(f'Chromium 启动失败：{str(e).splitlines()[0]}\n装一下：python3 -m playwright install chromium')
            return 2
        probe = browser.new_page()
        use_vendor(probe)
        probe.goto(src.as_uri(), wait_until='load')
        first = probe.locator('.as-panel, .as-strip').first
        if first.count() == 0:
            print(f'✗ {src.name}：没有 .as-panel / .as-strip')
            return 1
        box = first.bounding_box()
        n0 = probe.evaluate(PROBE)[0]['n']
        scale = W / (box['width'] / n0)
        probe.close()
        page = browser.new_page(device_scale_factor=scale)
        use_vendor(page)
        try:
            page.goto(src.as_uri(), wait_until='networkidle', timeout=30000)
        except Exception:
            print(f'  ! {src.name}：30 秒内网络资源没加载完（多半是字体外链），按系统字体兜底继续出图')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(400)
        if not wait_ready(page):
            print(f'  ! {src.name}：' + NOT_READY.format(s=15))
        report = page.evaluate(PROBE)
        secs = page.locator('.as-panel, .as-strip')
        for si in range(secs.count()):
            fd, tmp = tempfile.mkstemp(suffix='.png', prefix='as-')
            os.close(fd)
            secs.nth(si).screenshot(path=tmp)
            im = Image.open(tmp).convert('RGB')   # 去掉透明通道：App Store 不收带 alpha 的图
            os.unlink(tmp)
            n = report[si]['n']
            base = len(made)
            for k in range(n):
                piece = im.crop((round(k * im.width / n), 0, round((k + 1) * im.width / n), im.height))
                if piece.size != (W, H):
                    piece = piece.resize((W, H), Image.LANCZOS)
                path = out / f'{len(made) + 1:02d}.png'
                piece.save(path)
                made.append(path)
            for level, k, msg in check(report[si], a.min_headline):
                print(f'{level} 第 {base + k + 1} 张：{msg}')
                bad += level == '✗'
        browser.close()
    if len(made) > 10:
        print(f'✗ 一共 {len(made)} 张：App Store 每个机型最多 10 张')
        bad += 1
    th = 560
    tiles = [Image.open(m).resize((round(W * th / H), th)) for m in made]
    sheet = Image.new('RGB', (sum(t.width for t in tiles) + 10 * (len(tiles) - 1), th), '#d9d9d6')
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + 10
    sheet.save(out / 'sheet.jpg', quality=88)
    # 搜索结果：390pt 宽的手机上，一行三张，每张约 112pt 宽
    sw = 112 * 2
    sh = round(sw * H / W)
    prev = Image.new('RGB', (390 * 2, sh + 96), 'white')
    for k, m in enumerate(made[:3]):
        prev.paste(Image.open(m).resize((sw, sh), Image.LANCZOS), (32 + k * (sw + 16), 48))
    prev.save(out / 'search-preview.jpg', quality=90)
    print(f'{"✗ 有问题" if bad else "✓"} {len(made)} 张 {W}×{H} → {out}/；逐张看 sheet.jpg，再看 search-preview.jpg 里前三张读不读得出')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
