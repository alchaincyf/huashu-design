#!/usr/bin/env python3
"""
polish.py — 看图打磨用的眼睛：把页面切成一屏一屏的原尺寸截图，顺手量几件能核对的事。

整页长截图缩到一张图里，字和间距都看不清，问题也就看不出来。这个脚本按视口高度逐屏截，
让你像用户滚动时那样一屏一屏看；同时数每一屏有多少图形、多少字、多少空白，
并在项目里记一笔打磨记录。它只量事实，不判断好不好看。

用法：
  python3 scripts/polish.py shot page.html [--viewport 1440x900] [--mobile] [--max 12]
      逐屏截图，存到 <page 同目录>/polish/<文件名>/round-N/，N 自动递增；
      --mobile 加截 390x844；打印每一屏的事实，并在 polish-log.md 里追加这一轮的空白记录
  python3 scripts/polish.py thumbs design-demos/thumbs.html
      检查缩略图页里每一格（带 data-thumb 属性的容器）是不是真的画了东西，而不是占位色块
  python3 scripts/polish.py log <目录>
      查这个目录的 polish-log.md：每个页面打磨了几轮、有没有截了图却没写下看到什么的轮次

依赖：pip install playwright pillow && playwright install chromium（缺了会说明并退出，不算失败）
"""

import argparse
import io
import re
import sys
from datetime import date
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# 一屏里底色占到这个比例以上，而且没有图形，才提示「接近空屏」：安静留白的设计常有 80% 以上的底色，不该被误报
BLANK_RATIO = 0.93
# 缩略图一格的最低内容：少于这些，多半是占位色块而不是这个候选的关键一屏
THUMB_MIN_CHARS = 6
THUMB_MIN_NODES = 6
THUMB_BLANK = 0.90

TILE_JS = r"""
([top, h]) => {
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    const y0 = r.top + window.scrollY, y1 = y0 + r.height;
    if (y1 <= top || y0 >= top + h) return null;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null;
    return r;
  };
  let graphics = 0, chars = 0, big = 0;
  for (const e of document.querySelectorAll('img,svg,canvas,video,picture')) {
    const r = vis(e); if (!r) continue;
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (r.width * r.height >= 48 * 48) graphics++;          // 小于 48px 见方的算图标，不算图形
  }
  for (const e of document.querySelectorAll('body *')) {
    const r = vis(e); if (!r) continue;
    const cs = getComputedStyle(e);
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && r.width * r.height >= 200 * 120) graphics++;
    for (const n of e.childNodes) if (n.nodeType === 3) {
      const t = n.textContent.trim(); if (!t) continue;
      chars += t.length;
      if (parseFloat(cs.fontSize) >= 64) big = Math.max(big, parseFloat(cs.fontSize));
    }
  }
  return { graphics, chars, big };
}
"""

THUMB_JS = r"""
() => [...document.querySelectorAll('[data-thumb]')].map((e) => {
  const r = e.getBoundingClientRect();
  return { id: e.getAttribute('data-thumb') || '', x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height,
           chars: (e.innerText || '').replace(/\s+/g, '').length, nodes: e.querySelectorAll('*').length };
})
"""


def need_playwright():
    try:
        from playwright.sync_api import sync_playwright  # noqa: F401
        from PIL import Image  # noqa: F401
        return True
    except ImportError:
        print("没装 Python 版 playwright 或 pillow，这一步跳过。安装：pip install playwright pillow && playwright install chromium")
        print("跳过时改用手头的截图办法逐屏截（每屏一张，不要整页缩成一张），照 references/polish-loop.md 的问题自己看。")
        return False


def blank_ratio(img):
    """最多的那个颜色占画面的比例（先缩小并量化，抹掉抗锯齿的噪声）。"""
    small = img.convert("RGB").resize((96, 60))
    q = small.quantize(colors=24)
    counts = sorted(q.getcolors(), reverse=True)
    return counts[0][0] / (96 * 60)


def next_round(base):
    n = 1
    while (base / f"round-{n}").exists():
        n += 1
    return n


def unfilled_rounds(log, page_name):
    """打磨记录里，这个页面哪几轮的「最伤的三处」一条都没填。"""
    if not log.exists():
        return []
    out = []
    for block in re.split(r"^## ", log.read_text(encoding="utf-8"), flags=re.MULTILINE)[1:]:
        m = re.match(re.escape(page_name) + r" · 第 (\d+) 轮", block)
        if not m:
            continue
        seg = block.split("最伤的三处", 1)[-1].split("这一轮改了什么", 1)[0]
        if not any(re.sub(r"^\d+\.\s*", "", ln).strip() for ln in seg.split("\n") if re.match(r"^\d+\.", ln)):
            out.append(int(m.group(1)))
    return out


def cmd_log(a):
    """收工前查一遍：目录里每个页面的每一轮都写了看到什么吗。"""
    log = Path(a.dir).resolve() / "polish-log.md"
    if not log.exists():
        print(f"✗ {log} 不存在：还没有跑过打磨环（polish.py shot <页面.html>）。")
        return 1
    text = log.read_text(encoding="utf-8")
    pages = sorted(set(re.findall(r"^## (.+?) · 第 \d+ 轮", text, re.MULTILINE)))
    bad = 0
    for pg in pages:
        rounds = len(re.findall(r"^## " + re.escape(pg) + r" · 第 \d+ 轮", text, re.MULTILINE))
        empty = unfilled_rounds(log, pg)
        bad += bool(empty)
        print(f"  {'✗' if empty else '✓'} {pg}：{rounds} 轮" + (f"，第 {'、'.join(map(str, empty))} 轮没写「最伤的三处」" if empty else ""))
    if bad:
        print("\n有空着的轮次：打开那一轮的截图逐张看，把最伤的三处和改了什么补上。")
    return 1 if bad else 0


def cmd_shot(a):
    if not need_playwright():
        return 0
    from playwright.sync_api import sync_playwright
    from PIL import Image

    page_path = Path(a.file).resolve()
    if not page_path.exists():
        print(f"找不到文件：{page_path}")
        return 2
    base = page_path.parent / "polish" / page_path.stem
    rnd = next_round(base)
    out = base / f"round-{rnd}"
    out.mkdir(parents=True, exist_ok=True)

    views = [("桌面", a.viewport)]
    if a.mobile:
        views.append(("手机", (390, 844)))

    lines, errors = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for label, (w, h) in views:
            pg = browser.new_page(viewport={"width": w, "height": h})
            pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errors.append(str(e)))
            pg.goto(page_path.as_uri(), wait_until="domcontentloaded")
            try:
                pg.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            pg.wait_for_timeout(a.wait)
            total = pg.evaluate("Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)")
            n = max(1, min(a.max, -(-total // h)))
            full = Image.open(io.BytesIO(pg.screenshot(full_page=True)))
            scale = full.width / w
            thin_run = 0
            lines.append(f"{label} {w}x{h}：全页 {total}px，共 {-(-total // h)} 屏" + (f"（只截前 {n} 屏）" if n < -(-total // h) else ""))
            for i in range(n):
                top = i * h
                box = (0, int(top * scale), full.width, int(min(total, top + h) * scale))
                tile = full.crop(box)
                name = f"{label}-{i + 1:02d}.png"
                tile.save(out / name)
                facts = pg.evaluate(TILE_JS, [top, h])
                br = blank_ratio(tile)
                notes = []
                if br >= BLANK_RATIO and facts["graphics"] == 0:
                    notes.append("接近空屏")
                if facts["graphics"] == 0 and not facts["big"]:
                    thin_run += 1
                    if thin_run >= 2:
                        notes.append(f"连续 {thin_run} 屏只有文字和框，没有图形也没有大字")
                else:
                    thin_run = 0
                lines.append(f"  {name}  图形 {facts['graphics']}  文字 {facts['chars']} 字  底色占 {br:.0%}"
                             + (f"  最大字号 {facts['big']:.0f}px" if facts["big"] else "")
                             + ("  ← " + "；".join(notes) if notes else ""))
            pg.close()
        browser.close()

    print(f"第 {rnd} 轮截图：{out}")
    print("\n".join(lines))
    if errors:
        print(f"控制台报错 {len(errors)} 条，先修：")
        for e in errors[:5]:
            print("  " + e[:160])
    if any("连续" in x for x in lines):
        print("\n有连续几屏只有文字和框：这几屏还没被设计。照 references/steady-track.md 第 3 节写逐屏稿，"
              "给每一屏换一种形式（产品界面＋标注、数据即图像、前后对比、可以玩的演示……），再重做这几屏。")
    print("\n现在逐张打开上面的截图看原图（不要只看这份数字），照 references/polish-loop.md 的问题写下最伤的三处，改完再跑一轮。")

    log = page_path.parent / "polish-log.md"
    unfilled = unfilled_rounds(log, page_path.name)
    if unfilled:
        print(f"\n⚠ {page_path.name} 第 {'、'.join(map(str, unfilled))} 轮的「最伤的三处」还是空的。截了图没写下看到什么，等于没看："
              "先回去打开那一轮的截图，把三处和改动补上。")
    head = "" if log.exists() else "# 打磨记录\n\n每一轮：逐屏看原尺寸截图，写下最伤的三处，改，再截。\n"
    with log.open("a", encoding="utf-8") as f:
        f.write(f"{head}\n## {page_path.name} · 第 {rnd} 轮 · {date.today().isoformat()}\n\n"
                f"截图：`polish/{page_path.stem}/round-{rnd}/`\n\n" + "\n".join("    " + x for x in lines) + "\n\n"
                "最伤的三处（写到哪一屏、哪个元素）：\n1. \n2. \n3. \n\n这一轮改了什么：\n\n")
    print(f"已在 {log} 追加这一轮的记录，把「最伤的三处」和「改了什么」填上。")
    return 0


def cmd_thumbs(a):
    if not need_playwright():
        return 0
    from playwright.sync_api import sync_playwright
    from PIL import Image

    page_path = Path(a.file).resolve()
    if not page_path.exists():
        print(f"找不到文件：{page_path}")
        return 2
    with sync_playwright() as p:
        browser = p.chromium.launch()
        pg = browser.new_page(viewport={"width": 1600, "height": 1000})
        pg.goto(page_path.as_uri(), wait_until="domcontentloaded")
        try:
            pg.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        pg.wait_for_timeout(800)
        cells = pg.evaluate(THUMB_JS)
        full = Image.open(io.BytesIO(pg.screenshot(full_page=True)))
        browser.close()

    if not cells:
        print("没找到带 data-thumb 属性的格子。给每一格的容器加上 data-thumb=\"1\"…\"6\"，再跑一遍。")
        return 1
    bad = 0
    for c in cells:
        crop = full.crop((int(c["x"]), int(c["y"]), int(c["x"] + c["w"]), int(c["y"] + c["h"])))
        br = blank_ratio(crop) if crop.width > 4 and crop.height > 4 else 1.0
        why = []
        if c["chars"] < THUMB_MIN_CHARS:
            why.append(f"只有 {c['chars']} 个字")
        if c["nodes"] < THUMB_MIN_NODES:
            why.append(f"只有 {c['nodes']} 个元素")
        if br >= THUMB_BLANK:
            why.append(f"{br:.0%} 是同一个颜色")
        empty = len(why) >= 2
        bad += empty
        print(f"  {'✗' if empty else '✓'} 第 {c['id'] or '?'} 格  {c['w']:.0f}x{c['h']:.0f}  {c['chars']} 字 / {c['nodes']} 个元素 / 底色 {br:.0%}"
              + ("  ← 还是占位：" + "、".join(why) if empty else ""))
    if len(cells) < 6:
        print(f"只有 {len(cells)} 格。三套逻辑各两个候选，应有 6 格。")
    if bad:
        print(f"\n{bad} 格还是占位，不算候选。每一格要画出这个候选最关键的一屏：真标题、真配色、真骨架，主角素材要看得见。"
              "\n画不出来时，从 assets/style-specimens/ 里对应风格的样张 .html 源码改起（换题材、换色、换字），见 references/steady-track.md。")
        return 1
    print("\n六格都画了东西。接下来自己打开截图看：哪三张单看最强、彼此最不一样。")
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("shot")
    s.add_argument("file")
    s.add_argument("--viewport", default="1440x900", type=lambda v: tuple(int(x) for x in v.lower().split("x")))
    s.add_argument("--mobile", action="store_true", help="加截 390x844")
    s.add_argument("--max", type=int, default=12, help="每个视口最多截几屏")
    s.add_argument("--wait", type=int, default=1200, help="载入后等多少毫秒再截（等字体和入场动画）")
    t = sub.add_parser("thumbs")
    t.add_argument("file")
    g = sub.add_parser("log")
    g.add_argument("dir", help="polish-log.md 所在的目录")
    a = ap.parse_args(argv)
    return {"shot": cmd_shot, "thumbs": cmd_thumbs, "log": cmd_log}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
