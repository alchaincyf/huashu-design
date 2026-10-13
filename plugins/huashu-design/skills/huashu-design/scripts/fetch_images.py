#!/usr/bin/env python3
"""
从 Wikimedia Commons 抓真实图片（公共领域 / CC），供 huashu-design「内容型设计取真图」用（Phase 3.5）。

为什么有这个脚本：内容型设计（鹦鹉/咖啡/马来西亚…）必须用真图，不能 CSS 色块糊弄。
每次让模型现写抓图逻辑既慢又容易漏坑（忘清代理→TLS 炸 / 忘合规 UA→429）。这里固化好，下次只改关键词。

用法：
  python3 scripts/fetch_images.py --query "Petronas Towers" "Langkawi beach" "George Town street" \
      --out 项目/assets/img --count 2 --width 1600

每个 query 取前 count 张、缩放到 width、下载到 out，并打印清单（路径 | 许可 | 作者 | 来源页）便于诚实性核对。
全部抓不到 → 退出码 1，提示走 Phase 3.5 取图三级兜底（Unsplash/Pexels → 生图 → 诚实 placeholder）。
"""
import argparse, json, os, re, sys, urllib.parse, urllib.request

# ① 清代理：本机 curl/urllib 走代理会 TLS 炸（见 memory feedback_gemini_proxy）
for _k in ("ALL_PROXY", "all_proxy", "HTTP_PROXY", "http_proxy", "HTTPS_PROXY", "https_proxy"):
    os.environ.pop(_k, None)

API = "https://commons.wikimedia.org/w/api.php"
# ② 合规 User-Agent 是硬性要求，否则 Wikimedia 返 429
UA = "huashu-design-image-fetcher/1.0 (https://huasheng.ai; skill contact)"


def _api_get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def _safe(name):
    return re.sub(r"[^\w\-.]", "_", name)[:60]


def fetch(query, out, count, width):
    params = {
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": query, "gsrnamespace": 6, "gsrlimit": count,
        "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": width,
    }
    try:
        data = _api_get(params)
    except Exception as e:
        print(f"[FAIL search] {query}: {e}", file=sys.stderr)
        return []
    pages = (data.get("query", {}) or {}).get("pages", {})
    got = []
    for p in list(pages.values())[:count]:
        ii = (p.get("imageinfo") or [{}])[0]
        thumb = ii.get("thumburl") or ii.get("url")
        if not thumb:
            continue
        meta = ii.get("extmetadata", {}) or {}
        lic = (meta.get("LicenseShortName", {}) or {}).get("value", "?")
        artist = re.sub("<[^>]+>", "", (meta.get("Artist", {}) or {}).get("value", "?")).strip()
        ext = os.path.splitext(thumb)[1].split("?")[0] or ".jpg"
        fn = _safe(query) + "_" + _safe(p.get("title", "img").replace("File:", ""))
        fn = os.path.splitext(fn)[0][:55] + ext
        path = os.path.join(out, fn)
        try:
            req = urllib.request.Request(thumb, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
                f.write(r.read())
            got.append(path)
            print(f"[OK] {path}  | {lic} | {artist} | {ii.get('descriptionurl','')}")
        except Exception as e:
            print(f"[FAIL dl] {thumb}: {e}", file=sys.stderr)
    if not got:
        print(f"[EMPTY] 「{query}」没抓到——换关键词，或走 Phase 3.5 兜底", file=sys.stderr)
    return got


def main():
    ap = argparse.ArgumentParser(description="Wikimedia Commons 真图抓取（huashu-design Phase 3.5）")
    ap.add_argument("--query", nargs="+", required=True, help="一个或多个英文关键词（英文命中率高）")
    ap.add_argument("--out", required=True, help="输出目录（建议 项目/assets/img）")
    ap.add_argument("--count", type=int, default=2, help="每个关键词抓几张（默认 2）")
    ap.add_argument("--width", type=int, default=1600, help="缩放宽度 px（默认 1600）")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    allgot = []
    for q in a.query:
        allgot += fetch(q, a.out, a.count, a.width)
    print(f"\n=== 共下载 {len(allgot)} 张到 {a.out} ===")
    print("⚠️ 诚实性核对：去掉每张图信息是否有损？许可是否允许用途？不合适的删掉。")
    if not allgot:
        print("❌ 全部失败 → 走 Phase 3.5 取图三级兜底（Unsplash/Pexels → 生图 → 诚实 placeholder，不卡流程）", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
