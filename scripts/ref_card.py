#!/usr/bin/env python3
"""参考卡：让参考以「原图＋量出来的数」进来，做完再以「并排＋差值」对回去。

为什么要有它：把一张好设计概括成一句话（「大留白、克制的强调色」），信息丢了大半；
再让模型把这句话变回页面，补上去的是它自己的平均印象。两头都在失真。
所以参考不走文字这一道：看的是原图，记的是能量的数，做完把自己的图摆回原图旁边看差在哪。

两个命令：

  measure  量一张或几张图（参考原图、自己的截图都行）
    python3 scripts/ref_card.py measure refs/appstore/Tiimo.jpg [更多图…] [--json]
    出：色板（色值＋面积占比）、底色类别、最大单色面积（留白或满铺的程度）、彩色面积、
        画面从上到下十段各有多少内容（哪里密、哪里空）

  compare  参考和自己的并排成一张卡，给差值
    python3 scripts/ref_card.py compare --ref refs/board-1.jpg --mine shots/01.png --out refs/card-1.jpg
    出：一张并排图（上面两张原图，下面各自的色板条和十段密度条）＋一组差值

怎么用这些数：
  - 动手前：把 measure 的输出抄进方向卡的「借的」一栏，替掉形容词。「主色占 62%，强调色只有 4%」
    比「克制」有用；「上方 24% 是标题，往下全是界面」比「标题醒目」有用。
  - 做完后：compare。数字只回答「像不像」，不回答「好不好」；想借的那一项差得远，回去改；
    没打算借的那几项像了，说明抄过头了（借形态，不借皮肤）。
  - 量不出来的东西（字体气质、插画笔触、动效）还是要靠看：并排图就是给你看的。

参考原图版权属于原作者：参考卡留在项目的 refs/ 里，不进交付物，不提交进公开仓库。
"""

import argparse
import io
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from design_lint import bg_class, corr, dist, layout_vector, lch, palette, palette_distance  # noqa: E402

BANDS = 10


def _png(im):
    buf = io.BytesIO()
    im.convert('RGB').save(buf, 'PNG')
    return buf.getvalue()


def bands(im, n=BANDS):
    """从上到下 n 段，每段的边缘密度占全图的比例：哪一段内容多、哪一段是空的。"""
    from PIL import ImageFilter
    g = im.convert('L').resize((120, 12 * n)).filter(ImageFilter.FIND_EDGES)
    px = list(g.tobytes())
    rows = [sum(px[r * 120:(r + 1) * 120]) for r in range(12 * n)]
    seg = [sum(rows[k * 12:(k + 1) * 12]) for k in range(n)]
    total = sum(seg) or 1
    return [round(s / total, 3) for s in seg]


def merged(pal, near=0.025):
    """量化会把同一个颜色切成几份（渐变、抗锯齿）：肉眼分不出的并成一份，面积相加。"""
    out = []
    for c in pal:
        for o in out:
            if dist(c['rgb'], o['rgb']) < near:
                o['share'] = round(o['share'] + c['share'], 3)
                break
        else:
            out.append(dict(c))
    return sorted(out, key=lambda c: -c['share'])


def measure(im):
    """im 是 PIL 图。返回一组只讲事实的数。"""
    pal = merged(palette(_png(im), n=8))
    colourful = round(sum(c['share'] for c in pal if lch(c['rgb'])[1] > 0.02), 3)
    return {
        'size': list(im.size),
        'palette': [{'hex': c['hex'], 'share': c['share']} for c in pal],
        'background': bg_class(pal[0]['rgb']),
        'largest_colour_share': pal[0]['share'],
        'colourful_share': colourful,
        'bands': bands(im),
        '_pal': pal,
        '_layout': layout_vector(_png(im)),
    }


def diff(ref, mine):
    """两组量数的差值。越小越像；像不像不等于好不好。"""
    band_gap = [round(m - r, 3) for r, m in zip(ref['bands'], mine['bands'])]
    worst = max(range(len(band_gap)), key=lambda k: abs(band_gap[k]))
    return {
        'palette_distance': palette_distance(ref['_pal'], mine['_pal']),
        'largest_colour_share_gap': round(mine['largest_colour_share'] - ref['largest_colour_share'], 3),
        'colourful_share_gap': round(mine['colourful_share'] - ref['colourful_share'], 3),
        'layout_correlation': round(corr(ref['_layout'], mine['_layout']), 2),
        'band_gap': band_gap,
        'widest_band': worst + 1,
    }


def describe(name, m):
    pal = '  '.join(f'{c["hex"]} {c["share"] * 100:.0f}%' for c in m['palette'])
    dens = ' '.join(f'{b * 100:.0f}' for b in m['bands'])
    return (f'{name}（{m["size"][0]}×{m["size"][1]}）\n'
            f'  色板：{pal}\n'
            f'  底色：{m["background"]}；最大单色占 {m["largest_colour_share"] * 100:.0f}%；彩色面积 {m["colourful_share"] * 100:.0f}%\n'
            f'  从上到下十段的内容占比（%）：{dens}')


def card(ref_im, mine_im, ref, mine, height=900):
    """并排图：上面两张原图等高，下面各一条色板（按面积分宽度）和一条十段密度。"""
    from PIL import Image, ImageDraw
    a = ref_im.convert('RGB').resize((max(1, round(ref_im.width * height / ref_im.height)), height))
    b = mine_im.convert('RGB').resize((max(1, round(mine_im.width * height / mine_im.height)), height))
    gap, strip = 24, 36
    out = Image.new('RGB', (a.width + b.width + gap * 3, height + strip * 2 + gap * 4), '#ECECEA')
    d = ImageDraw.Draw(out)
    for im, m, x in ((a, ref, gap), (b, mine, a.width + gap * 2)):
        out.paste(im, (x, gap))
        cx, y = x, height + gap * 2
        for c in m['palette']:
            w = round(im.width * c['share'])
            d.rectangle([cx, y, cx + w, y + strip], fill=c['hex'])
            cx += w
        y += strip + gap
        top = max(m['bands']) or 1
        bw = im.width / BANDS
        for k, v in enumerate(m['bands']):
            h = round(strip * v / top)
            d.rectangle([x + k * bw + 2, y + strip - h, x + (k + 1) * bw - 2, y + strip], fill='#222222')
    return out


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description='参考卡：量参考原图，做完并排对回去')
    sub = ap.add_subparsers(dest='cmd', required=True)
    m = sub.add_parser('measure', help='量一张或几张图')
    m.add_argument('images', nargs='+')
    m.add_argument('--json', action='store_true')
    c = sub.add_parser('compare', help='参考和自己的并排成一张卡')
    c.add_argument('--ref', required=True, help='参考原图')
    c.add_argument('--mine', required=True, help='自己做出来的截图')
    c.add_argument('--out', default='refs/card.jpg')
    c.add_argument('--json', action='store_true')
    a = ap.parse_args(argv)
    try:
        from PIL import Image
    except ImportError:
        print('需要 Pillow：pip install pillow')
        return 2

    def load(p):
        if not Path(p).exists():
            print(f'✗ 找不到 {p}')
            return None
        with Image.open(p) as im:
            return im.convert('RGB')

    def public(x):
        return {k: v for k, v in x.items() if not k.startswith('_')}

    if a.cmd == 'measure':
        out, bad = {}, 0
        for p in a.images:
            im = load(p)
            if im is None:
                bad += 1
                continue
            out[p] = measure(im)
            if not a.json:
                print(describe(p, out[p]))
        if a.json:
            print(json.dumps({k: public(v) for k, v in out.items()}, ensure_ascii=False, indent=2))
        else:
            print('\n把用得上的数抄进方向卡的「借的」一栏；量不出来的（字体气质、笔触、动效）打开原图看。')
        return 1 if bad else 0

    ri, mi = load(a.ref), load(a.mine)
    if ri is None or mi is None:
        return 1
    r, mm = measure(ri), measure(mi)
    dd = diff(r, mm)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    card(ri, mi, r, mm).save(out, quality=88)
    if a.json:
        print(json.dumps({'ref': public(r), 'mine': public(mm), 'diff': dd, 'card': str(out)}, ensure_ascii=False, indent=2))
        return 0
    print(describe('参考', r))
    print(describe('自己的', mm))
    print('差值（越小越像；像不像不等于好不好）：')
    print(f'  色板距离 {dd["palette_distance"]}（小于 0.06 基本是同一套色）')
    print(f'  最大单色面积差 {dd["largest_colour_share_gap"] * 100:+.0f} 个百分点；彩色面积差 {dd["colourful_share_gap"] * 100:+.0f} 个百分点')
    print(f'  版面骨架相关 {dd["layout_correlation"]}（接近 1 是同一副骨架）')
    print(f'  十段里差得最多的是第 {dd["widest_band"]} 段（从上往下数）：{dd["band_gap"][dd["widest_band"] - 1] * 100:+.0f} 个百分点')
    print(f'→ {out}：左参考、右自己的，下面是各自的色板条和十段密度。打开看。')
    print('想借的那一项差得远，回去改；没打算借的也像了，是抄过头了。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
