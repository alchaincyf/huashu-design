#!/usr/bin/env python3
"""把小红书图文 HTML 切成 3:4 成图，顺手查手机上会出事的地方。

HTML 约定（照 assets/style-specimens/xhs/ 里的模板写）：
  <section class="xhs-page">         一页，1242×1660
  <section class="xhs-strip" style="--n:3">   连续长卷，1242×N 宽，切成 N 张
页面按文档顺序编号输出：01.png 02.png …，再拼一张 sheet.jpg 一眼看完。

查四样（只报事实，改不改你定）：
  ✗ 字号低于底线：任何字 < --min-label；折成两行以上的段落 < --min-body
  ✗ 字出了页面：被裁掉的字
  ✗ 字跨缝：长卷里一行字跨过两张图的接缝，滑动时会被切断
  ✗ 字压字：两段文字的框重叠
  ! 字被盖住：字的左、中、右三点上面压着别的元素（贴纸、色块）
  ! 字和图形挤在一起：字框碰到不含字的小色块（网格单元、圆点），不管谁在上层
  有意叠放的给元素加 data-overlap-ok。没有 ✗ 不等于能交付，还要逐张看 sheet.jpg。

用法（在 skill 根目录或任意处）：
  python3 scripts/xhs_render.py 笔记.html [更多.html] --out 配图/ [--jpg] [--min-body 42 --min-label 32]
退出码：有 ✗ 时为 1。
"""

import argparse
import os
import sys
from _ready import wait_ready, NOT_READY, use_vendor
import tempfile
from pathlib import Path

W, H = 1242, 1660

PROBE = r'''([minBody, minLabel]) => {
  const secs = [...document.querySelectorAll('.xhs-page, .xhs-strip')];
  const out = [];
  secs.forEach((sec, si) => {
    window.scrollTo(0, 0);   // sr 在不滚动时取，就是页面坐标
    const sr = sec.getBoundingClientRect();
    const n = sec.classList.contains('xhs-strip') ? Math.round(sr.width / 1242) : 1;
    const items = [];
    const walk = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const el = node.parentElement, cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 1);
      if (!rects.length) continue;
      // 字号按实际显示算：祖先上的 scale 也算进去
      let k = 1, p = el; while (p && p !== sec) { const tf = getComputedStyle(p).transform; if (tf && tf !== 'none') { const d = new DOMMatrix(tf); k *= Math.hypot(d.a, d.b); } p = p.parentElement; }
      const px = parseFloat(cs.fontSize) * k;
      const lines = new Set(rects.map(r => Math.round(r.top / (px * 0.6)))).size;
      items.push({ el, t: t.slice(0, 24), len: t.length, lines, px: Math.round(px * 10) / 10, ok: !!el.closest('[data-overlap-ok]'),
                   rects: rects.map(r => [r.left - sr.left, r.top - sr.top, r.right - sr.left, r.bottom - sr.top]) });
    }
    const issues = [];
    for (const it of items) {
      if (it.px < minLabel) issues.push(['✗', `字号 ${it.px}px < 标签底线 ${minLabel}px`, it.t]);
      else if (it.lines >= 2 && it.len >= 16 && it.px < minBody) issues.push(['✗', `段落字号 ${it.px}px < 正文底线 ${minBody}px`, it.t]);
      for (const [l, t, r, b] of it.rects) {
        if (l < -2 || t < -2 || r > sr.width + 2 || b > sr.height + 2) { issues.push(['✗', '字出了页面', it.t]); break; }
      }
      if (n > 1) for (const [l, t, r, b] of it.rects) {
        const seam = [...Array(n - 1)].map((_, j) => (j + 1) * 1242).find(x => l < x - 4 && r > x + 4);
        if (seam) { issues.push(['✗', `字跨第 ${seam / 1242} 道缝`, it.t]); break; }
      }
    }
    // 字框比字面高（含行距上下的留白），上下各收 20% 再比，免得同一段相邻两行也算压字
    const core = ([l, t, r, b]) => { const d = (b - t) * 0.2; return [l + 2, t + d, r - 2, b - d]; };
    const hit = (a, b) => { a = core(a); b = core(b); return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]; };
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.ok || b.ok || a.el.contains(b.el) || b.el.contains(a.el)) continue;  // 同一段里的行内片段不算
      if (a.rects.some(x => b.rects.some(y => hit(x, y)))) issues.push(['✗', '字压字', `${a.t} ／ ${b.t}`]);
    }
    // 字被盖住：滚到每行字的左、中、右三个点，看最上层是不是这段字自己
    for (const it of items) {
      if (it.ok) continue;
      let found = null;
      for (const [l, t, r, b] of it.rects) {
        const w = r - l, h = b - t, vert = h > w * 1.5;   // 竖排文字沿长边取点
        const pts = vert ? [t + w * 0.3, (t + b) / 2, b - w * 0.3].map(y => [sr.left + (l + r) / 2, sr.top + y])
                         : [l + h * 0.3, (l + r) / 2, r - h * 0.3].map(x => [sr.left + x, sr.top + (t + b) / 2]);
        for (const [cx, cy] of pts) {
          window.scrollTo(cx - innerWidth / 2, cy - innerHeight / 2);
          const px = cx - window.scrollX, py = cy - window.scrollY, hitEl = document.elementFromPoint(px, py);
          if (!hitEl || hitEl === it.el || it.el.contains(hitEl) || hitEl.contains(it.el) || hitEl.closest('[data-overlap-ok]')) continue;
          // 大字号在 line-height:1 时字形会伸出盒子，命中测试也算它；点不在对方盒子里就不算（字压字另有检查）
          const hb = hitEl.getBoundingClientRect();
          if (px < hb.left || px > hb.right || py < hb.top || py > hb.bottom) continue;
          found = hitEl; break;
        }
        if (found) break;
      }
      if (found) issues.push(['!', found.tagName === 'IMG' ? '字压在图片框里（透明边也算，看一眼）' : '字被别的元素盖住', it.t]);
    }
    // 字和图形挤在一起：不管谁在上层，字框碰到不含字的小色块（网格单元、圆点、标记；长边 < 120px）。
    // 网格塌成一列、图表溢出时最常见。大底板常和字做兄弟元素，不算。
    const shapes = [...sec.querySelectorAll('*')].filter(e => {
      if (e.closest('[data-overlap-ok]') || e.textContent.trim() || e.children.length || e.closest('svg')) return false;
      const q = e.getBoundingClientRect();
      if (Math.max(q.width, q.height) >= 120) return false;
      const bg = getComputedStyle(e).backgroundColor;
      return bg && !/rgba\(.*,\s*0\)$/.test(bg) && bg !== 'transparent';
    });
    window.scrollTo(0, 0);
    for (const it of items) {
      if (it.ok) continue;
      const hitShape = shapes.find(e => {
        const q = e.getBoundingClientRect(), g = [q.left - sr.left, q.top - sr.top, q.right - sr.left, q.bottom - sr.top];
        return q.width > 0 && q.height > 0 && it.rects.some(x => hit(x, g));
      });
      if (hitShape) issues.push(['!', '字和图形挤在一起', it.t]);
    }
    out.push({ index: si, n, w: Math.round(sr.width), h: Math.round(sr.height), issues });
  });
  return out;
}'''


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='+')
    ap.add_argument('--out', default='xhs-out', help='输出目录')
    ap.add_argument('--jpg', action='store_true', help='另存一份 jpg（质量 92，上传更快）')
    ap.add_argument('--min-body', type=float, default=42, help='正文底线，1242 宽画布（= 1080 宽的 36）')
    ap.add_argument('--min-label', type=float, default=32, help='标签底线，1242 宽画布（= 1080 宽的 28）')
    ap.add_argument('--no-check', action='store_true')
    a = ap.parse_args()
    try:
        from playwright.sync_api import sync_playwright
        from PIL import Image
    except ImportError:
        sys.exit('需要 Playwright 和 Pillow：pip install playwright pillow && python3 -m playwright install chromium')

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    made, bad = [], 0
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            sys.exit(f'Chromium 启动失败：{str(e).splitlines()[0]}\n装一下：python3 -m playwright install chromium')
        page = browser.new_page(viewport={'width': W, 'height': H})
        use_vendor(page)
        for f in a.files:
            src = Path(f).resolve()
            try:
                page.goto(src.as_uri(), wait_until='networkidle', timeout=30000)
            except Exception:   # 多半是字体外链在慢网或断网下没回来；按已加载的样子继续
                print(f'  ! {src.name}：30 秒内网络资源没加载完（多半是字体外链），按系统字体兜底继续出图')
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(400)
            if not wait_ready(page):
                print(f'  ! {src.name}：' + NOT_READY.format(s=15))
            secs = page.locator('.xhs-page, .xhs-strip')
            if secs.count() == 0:
                print(f'✗ {src.name}：没有 .xhs-page / .xhs-strip'); bad += 1; continue
            report = [] if a.no_check else page.evaluate(PROBE, [a.min_body, a.min_label])
            for i in range(secs.count()):
                fd, tmp = tempfile.mkstemp(suffix='.png', prefix='xhs-strip-')   # 中间图放系统临时目录，每个进程各用各的
                os.close(fd); tmp = Path(tmp)
                secs.nth(i).screenshot(path=str(tmp))
                im = Image.open(tmp).convert('RGB')
                n = max(1, round(im.width / W))
                first = len(made) + 1
                for k in range(n):
                    piece = im.crop((k * W, 0, (k + 1) * W, H))
                    name = out / f'{len(made) + 1:02d}.png'
                    piece.save(name)
                    if a.jpg:
                        piece.save(name.with_suffix('.jpg'), quality=92)
                    made.append(name)
                tmp.unlink()
                label = f'{first:02d}' if n == 1 else f'{first:02d}–{len(made):02d}'
                for lvl, what, txt in (report[i]['issues'] if report else []):
                    print(f'  {lvl} 第{label}张  {what}：{txt}')
                    bad += lvl == '✗'
        browser.close()

    if made:
        cols, tw = 6, 300
        th = tw * H // W
        rows = (len(made) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * (tw + 12) + 12, rows * (th + 12) + 12), (217, 217, 214))
        for k, f in enumerate(made):
            sheet.paste(Image.open(f).convert('RGB').resize((tw, th)), (12 + (k % cols) * (tw + 12), 12 + (k // cols) * (th + 12)))
        sheet.save(out / 'sheet.jpg', quality=85)
    print(f'{"✓" if not bad else "✗"} {len(made)} 张 → {out}/（总览 sheet.jpg）' + (f'，{bad} 处要改' if bad else ''))
    if len(made) > 18:
        print('  ! 小红书一篇最多 18 张')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
