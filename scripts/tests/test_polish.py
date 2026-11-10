"""polish.py：占位缩略图要被挑出来，画了东西的不能被误判；逐屏截图要落盘并起头打磨记录。

需要 Python 版 playwright 和 pillow；没装时整组跳过。
python3 -m unittest discover -s scripts/tests -p test_polish.py -v
"""
import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import polish  # noqa: E402

try:
    import playwright  # noqa: F401
    import PIL  # noqa: F401
    HAVE = True
except ImportError:
    HAVE = False

THUMBS = """<!doctype html><meta charset="utf-8"><style>
body{margin:20px;font-family:sans-serif}.g{display:grid;grid-template-columns:repeat(3,480px);gap:16px}
.c{width:480px;height:300px;position:relative;overflow:hidden;background:#f1efe8}
</style><div class="g">%s</div>"""
EMPTY = '<div class="c" data-thumb="%d"><b>标题</b></div>'
DRAWN = ('<div class="c" data-thumb="%d" style="background:#10231c;color:#e9f0e4"><h1 style="font-size:54px;margin:18px">山里的天气</h1>'
         '<p style="margin:18px">按山头给你，不按城市给你</p><svg width="480" height="140" style="position:absolute;bottom:0;left:0">'
         '<path d="M0 140 L120 40 L210 96 L330 12 L480 120 L480 140Z" fill="#7fa37a"/><path d="M0 140 L160 80 L300 110 L480 60 L480 140Z" fill="#c8553d"/></svg>'
         '<span style="position:absolute;right:16px;top:16px">1 km</span><i>登山口</i><i>林线</i><i>山脊</i></div>')


def run(argv):
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        code = polish.main(argv)
    return code, out.getvalue()


@unittest.skipUnless(HAVE, "需要 playwright 和 pillow")
class Polish(unittest.TestCase):
    def test_placeholder_thumbs_are_flagged(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "thumbs.html"
            f.write_text(THUMBS % "".join([DRAWN % 1, EMPTY % 2, DRAWN % 3, DRAWN % 4, EMPTY % 5, DRAWN % 6]), encoding="utf-8")
            code, out = run(["thumbs", str(f)])
        self.assertEqual(code, 1)
        self.assertIn("✗ 第 2 格", out)
        self.assertIn("✗ 第 5 格", out)
        self.assertIn("✓ 第 1 格", out)

    def test_drawn_thumbs_pass(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "thumbs.html"
            f.write_text(THUMBS % "".join(DRAWN % i for i in range(1, 7)), encoding="utf-8")
            code, out = run(["thumbs", str(f)])
        self.assertEqual(code, 0, out)

    def test_missing_marker_is_not_a_pass(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "thumbs.html"
            f.write_text(THUMBS % '<div class="c">没有标记</div>', encoding="utf-8")
            code, out = run(["thumbs", str(f)])
        self.assertEqual(code, 1)
        self.assertIn("data-thumb", out)

    def test_shot_writes_tiles_and_log_and_counts_rounds(self):
        page = ("<!doctype html><meta charset='utf-8'><body style='margin:0'>"
                "<section style='height:900px'><h1 style='font-size:96px'>首屏</h1><svg width='300' height='200'><rect width='300' height='200' fill='#c33'/></svg></section>"
                "<section style='height:900px'><p>只有字</p></section><section style='height:900px'><p>还是只有字</p></section></body>")
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "page.html"
            f.write_text(page, encoding="utf-8")
            code, out = run(["shot", str(f)])
            self.assertEqual(code, 0, out)
            self.assertTrue((Path(d) / "polish" / "page" / "round-1" / "桌面-01.png").exists())
            self.assertIn("连续 2 屏只有文字和框", out)
            code, out = run(["shot", str(f)])
            self.assertTrue((Path(d) / "polish" / "page" / "round-2" / "桌面-03.png").exists())
            log = (Path(d) / "polish-log.md").read_text(encoding="utf-8")
            self.assertEqual(log.count("最伤的三处"), 3)   # 文件头一句 + 两轮各一处
            self.assertIn("第 2 轮", log)
            # 截了图没写下看到什么：下一轮要提醒，log 检查要不过
            self.assertIn("第 1 轮的「最伤的三处」还是空的", out)
            code, out = run(["log", d])
            self.assertEqual(code, 1)
            self.assertIn("✗ page.html：2 轮", out)
            p = Path(d) / "polish-log.md"
            p.write_text(p.read_text(encoding="utf-8").replace("1. \n", "1. 首屏标题和图形抢主角\n"), encoding="utf-8")
            code, out = run(["log", d])
            self.assertEqual(code, 0, out)


if __name__ == "__main__":
    unittest.main()
