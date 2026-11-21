#!/usr/bin/env python3
"""把 App Store 上真实 App 的官方截图拉下来拼成参考板，动手前亲眼看。

做 App 原型的「现实参照」、做 App Store 宣传图的风格准备，都从这里开始：
写「参考 Tiimo」几个字，做出来的是对它的平均印象；把它的六张图摆在眼前，才会去量标题占多高、
手机从哪里出血、哪一张把界面挤出了机身。

用法：
  python3 scripts/appstore_shots.py 1480220328 "Not Boring Camera" --out refs/appstore [--country us] [--ipad] [--max 6]

  参数是 App Store 的数字 id（最稳，references/app-paradigms.md 的表里有）或 App 名字。
  每个 App 存一张接触表 <名字>.jpg（官方截图按上架顺序横排），再打印它匹配到的名字和开发商。

  ⚠ 用名字搜会配错（同名 App、同厂另一款）：对一下打印出来的开发商，不对就换成 id。
  截图的版权属于各自的开发者：只当参考看，留在项目的 refs/ 里，不要放进交付物，也不要提交进公开仓库。

数据来自 Apple 的 iTunes Search / Lookup 公共接口，不需要登录。
"""

import argparse
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

UA = {'User-Agent': 'Mozilla/5.0 (appstore-shots)'}
API = 'https://itunes.apple.com'


def get(url, raw=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        body = r.read()
    return body if raw else json.loads(body)


def resolve(query, country, fetch=get):
    """id → lookup；名字 → 依次在 iPhone / iPad / Mac / Apple TV 的 App 里搜，取第一条。"""
    if query.isdigit():
        hits = fetch(f'{API}/lookup?id={query}&country={country}').get('results', [])
        return hits[0] if hits else None
    for entity in ('software', 'iPadSoftware', 'macSoftware', 'tvSoftware'):
        q = urllib.parse.urlencode({'term': query, 'entity': entity, 'country': country, 'limit': 5})
        hits = fetch(f'{API}/search?{q}').get('results', [])
        if hits:
            return hits[0]
    return None


def pick(app, ipad=False):
    """选哪一组截图：默认手机，--ipad 或没有手机图时用平板，再没有用 Apple TV。"""
    order = ['ipadScreenshotUrls', 'screenshotUrls'] if ipad else ['screenshotUrls', 'ipadScreenshotUrls']
    for key in order + ['appletvScreenshotUrls']:
        if app.get(key):
            return app[key]
    return []


def bigger(url, side=1200):
    return re.sub(r'/\d+x\d+bb\.(jpg|png|webp)$', f'/{side}x{side}bb.jpg', url)


def slug(name):
    return re.sub(r'[^\w]+', '-', name, flags=re.UNICODE).strip('-')[:60] or 'app'


def sheet(images, height=1000, gap=14):
    from PIL import Image
    rs = [im.resize((max(1, round(im.width * height / im.height)), height)) for im in images]
    out = Image.new('RGB', (sum(i.width for i in rs) + gap * (len(rs) - 1), height), 'white')
    x = 0
    for im in rs:
        out.paste(im, (x, 0))
        x += im.width + gap
    return out


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description='把 App Store 官方截图拼成参考板')
    ap.add_argument('apps', nargs='+', help='App Store 数字 id 或 App 名字')
    ap.add_argument('--out', default='refs/appstore')
    ap.add_argument('--country', default='us', help='商店地区，两位代码；某些 App 只在个别地区上架')
    ap.add_argument('--ipad', action='store_true', help='优先取 iPad 截图')
    ap.add_argument('--max', type=int, default=6, help='每个 App 最多取几张（上限 10）')
    a = ap.parse_args(argv)
    try:
        from PIL import Image
    except ImportError:
        print('需要 Pillow：pip install pillow')
        return 2
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    failed = 0
    for q in a.apps:
        try:
            app = resolve(q, a.country)
        except Exception as e:
            print(f'✗ {q}：接口没连上（{str(e).splitlines()[0]}）')
            failed += 1
            continue
        urls = pick(app, a.ipad)[:min(a.max, 10)] if app else []
        if not urls:
            print(f'✗ {q}：' + ('没搜到；换 id，或换 --country' if not app else f'{app.get("trackName")} 没有可取的截图（只上了 Vision Pro 或 Apple Watch 的常见）'))
            failed += 1
            continue
        images = []
        for u in urls:
            try:
                images.append(Image.open(io.BytesIO(get(bigger(u), raw=True))).convert('RGB'))
            except Exception:
                pass
        if not images:
            print(f'✗ {q}：截图下载失败')
            failed += 1
            continue
        path = out / f'{slug(app["trackName"])}.jpg'
        sheet(images).save(path, quality=86)
        print(f'✓ {path}  ←  {app["trackName"]}｜{app.get("sellerName", "?")}｜{len(images)} 张｜{app.get("trackViewUrl", "").split("?")[0]}')
    print('\n逐张打开接触表看。用名字搜的，先对开发商是不是你要的那个。')
    print('看的时候把「借的是什么」写成具体规则：标题占一张的多高、几行几个词、手机从哪条边出血、哪张让界面离开了机身、几张连成一幅。')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
