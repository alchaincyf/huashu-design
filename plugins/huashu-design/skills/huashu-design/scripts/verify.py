#!/usr/bin/env python3
"""
verify.py — Playwright封装，用于验证claude-design产出的HTML

Usage:
    python verify.py path/to/design.html                    # 基础：打开+截图+抓控制台错误
    python verify.py design.html --viewports 1920x1080,375x667  # 多viewport
    python verify.py deck.html --slides 10                  # 幻灯片逐页截（前10张）
    python verify.py design.html --output ./screenshots/   # 输出目录
    python verify.py design.html --show                    # 非headless，打开真实浏览器

依赖：
    pip install playwright
    playwright install chromium
"""

import argparse
import sys
import os
import time
from pathlib import Path


def parse_viewport(s):
    w, h = s.split('x')
    return {'width': int(w), 'height': int(h)}


def verify_html(html_path, viewports=None, slides=0, output_dir=None, show=False, wait=2000):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright未安装。")
        print("运行: pip install playwright && playwright install chromium")
        sys.exit(1)

    html_path = Path(html_path).resolve()
    if not html_path.exists():
        print(f"ERROR: 文件不存在: {html_path}")
        sys.exit(1)

    if output_dir is None:
        output_dir = html_path.parent / 'screenshots'
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    file_url = html_path.as_uri()
    stem = html_path.stem

    if viewports is None:
        viewports = [{'width': 1440, 'height': 900}]

    console_errors = []
    page_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not show)

        for viewport in viewports:
            context = browser.new_context(viewport=viewport, device_scale_factor=2)
            page = context.new_page()

            page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            print(f"\n→ 打开 {file_url} @ {viewport['width']}x{viewport['height']}")
            page.goto(file_url, wait_until='networkidle')
            page.wait_for_timeout(wait)

            if slides > 0:
                for i in range(slides):
                    screenshot_path = output_dir / f"{stem}-slide-{str(i + 1).zfill(2)}.png"
                    page.screenshot(path=str(screenshot_path), full_page=False)
                    print(f"  ✓ slide {i+1} → {screenshot_path.name}")

                    if i < slides - 1:
                        page.keyboard.press('ArrowRight')
                        page.wait_for_timeout(500)
            else:
                suffix = f"-{viewport['width']}x{viewport['height']}" if len(viewports) > 1 else ""
                screenshot_path = output_dir / f"{stem}{suffix}.png"
                page.screenshot(path=str(screenshot_path), full_page=False)
                print(f"  ✓ 截图 → {screenshot_path.name}")

                full_path = output_dir / f"{stem}{suffix}-full.png"
                page.screenshot(path=str(full_path), full_page=True)
                print(f"  ✓ 完整页 → {full_path.name}")

            if show:
                print("  (浏览器窗口保持打开，按Enter关闭...)")
                input()

            context.close()

        browser.close()

    print("\n" + "=" * 50)
    print("验证报告")
    print("=" * 50)

    if page_errors:
        print(f"\n❌ Page Errors ({len(page_errors)}):")
        for e in page_errors:
            print(f"  - {e}")
    else:
        print("\n✅ 无JavaScript错误")

    if console_errors:
        print(f"\n⚠️  Console Errors/Warnings ({len(console_errors)}):")
        for e in console_errors[:20]:
            print(f"  - {e}")
        if len(console_errors) > 20:
            print(f"  ... 还有{len(console_errors) - 20}条")
    else:
        print("✅ Console干净")

    print(f"\n📸 截图保存至: {output_dir}")

    return 0 if not page_errors else 1


def main():
    parser = argparse.ArgumentParser(
        description="Verify HTML design outputs with Playwright",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("html_path", help="HTML file path")
    parser.add_argument("--viewports", default="1440x900",
                        help="逗号分隔的viewport列表，格式 WxH（默认 1440x900）")
    parser.add_argument("--slides", type=int, default=0,
                        help="幻灯片模式：截取前N张（需要HTML支持ArrowRight翻页）")
    parser.add_argument("--output", default=None,
                        help="输出目录（默认HTML所在目录的screenshots/）")
    parser.add_argument("--show", action="store_true",
                        help="非headless，打开真实浏览器窗口")
    parser.add_argument("--wait", type=int, default=2000,
                        help="打开页面后等待的毫秒数（默认2000）")

    args = parser.parse_args()

    viewports = [parse_viewport(v) for v in args.viewports.split(",")]

    return verify_html(
        html_path=args.html_path,
        viewports=viewports,
        slides=args.slides,
        output_dir=args.output,
        show=args.show,
        wait=args.wait,
    )


if __name__ == "__main__":
    sys.exit(main())
