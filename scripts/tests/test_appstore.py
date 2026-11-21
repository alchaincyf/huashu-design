"""appstore_shots.py：id 走 lookup、名字按平台依次搜、截图组的取舍。
appstore_render.py：成图尺寸要分毫不差、不带透明通道，连幅要切开，跨缝和出画面的字要被报出来。

出图那组需要 Python 版 playwright 和 pillow；没装时跳过。
python3 -m unittest discover -s scripts/tests -p test_appstore.py -v
"""
import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import appstore_render  # noqa: E402
import appstore_shots  # noqa: E402

try:
    import playwright  # noqa: F401
    import PIL  # noqa: F401
    HAVE = True
except ImportError:
    HAVE = False


class Shots(unittest.TestCase):
    def test_id_uses_lookup(self):
        seen = []
        app = appstore_shots.resolve('123', 'us', fetch=lambda u: seen.append(u) or {'results': [{'trackName': 'A'}]})
        self.assertEqual(app['trackName'], 'A')
        self.assertIn('/lookup?id=123&country=us', seen[0])

    def test_name_falls_through_platforms(self):
        seen = []

        def fetch(u):
            seen.append(u)
            return {'results': [{'trackName': 'MacOnly'}] if 'macSoftware' in u else []}
        self.assertEqual(appstore_shots.resolve('some app', 'us', fetch=fetch)['trackName'], 'MacOnly')
        self.assertEqual(len(seen), 3)   # iPhone、iPad 都空，第三次才搜到

    def test_not_found(self):
        self.assertIsNone(appstore_shots.resolve('nope', 'us', fetch=lambda u: {'results': []}))

    def test_pick_prefers_phone_then_pad_then_tv(self):
        app = {'screenshotUrls': ['p'], 'ipadScreenshotUrls': ['i'], 'appletvScreenshotUrls': ['t']}
        self.assertEqual(appstore_shots.pick(app), ['p'])
        self.assertEqual(appstore_shots.pick(app, ipad=True), ['i'])
        self.assertEqual(appstore_shots.pick({'screenshotUrls': [], 'appletvScreenshotUrls': ['t']}), ['t'])
        self.assertEqual(appstore_shots.pick({}), [])

    def test_bigger_and_slug(self):
        self.assertEqual(appstore_shots.bigger('https://x/a.png/392x696bb.jpg'), 'https://x/a.png/1200x1200bb.jpg')
        self.assertEqual(appstore_shots.slug('Tiimo: To-Do List Planner'), 'Tiimo-To-Do-List-Planner')
        self.assertEqual(appstore_shots.slug('小宇宙：播客'), '小宇宙-播客')


PAGE = """<!doctype html><meta charset="utf-8"><style>
body{margin:0}.as-panel{width:440px;height:956px;position:relative;overflow:hidden;background:#123}
.as-strip{width:calc(440px*var(--n));height:956px;position:relative;overflow:hidden;background:#321}
h1{font:700 56px sans-serif;color:#fff;margin:60px 30px}
</style>%s"""
GOOD = '<section class="as-panel"><h1>看见潮水</h1></section>'
STRIP_OK = '<section class="as-strip" style="--n:2"><h1 style="width:380px">一条曲线</h1></section>'
STRIP_SEAM = '<section class="as-strip" style="--n:2"><h1 style="position:absolute;left:330px;white-space:nowrap;margin:60px 0">跨过接缝的一行字</h1></section>'
SMALL = '<section class="as-panel"><p style="font:400 20px sans-serif;color:#fff;margin:40px">字太小</p></section>'
UI_ONLY = '<section class="as-panel"><div data-ui><p style="font:400 14px sans-serif;color:#fff;margin:900px 0 0 400px;white-space:nowrap">界面里被裁掉的字不算</p></div></section>'


@unittest.skipUnless(HAVE, '需要 playwright 和 pillow')
class Render(unittest.TestCase):
    def run_it(self, body, *extra):
        tmp = Path(tempfile.mkdtemp())
        (tmp / 'p.html').write_text(PAGE % body, encoding='utf-8')
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = appstore_render.main([str(tmp / 'p.html'), '--out', str(tmp / 'out'), *extra])
        return code, buf.getvalue(), tmp / 'out'

    def test_exact_size_no_alpha_and_strip_split(self):
        from PIL import Image
        code, log, out = self.run_it(GOOD + STRIP_OK)
        self.assertEqual(code, 0, log)
        files = sorted(out.glob('[0-9][0-9].png'))
        self.assertEqual(len(files), 3)
        for f in files:
            with Image.open(f) as im:
                self.assertEqual(im.size, (1320, 2868))
                self.assertEqual(im.mode, 'RGB')
        self.assertTrue((out / 'sheet.jpg').exists() and (out / 'search-preview.jpg').exists())
        self.assertIn('第 3 张：这一张没有字', log)   # 连幅第二张没字：只提示，不算错

    def test_other_size(self):
        from PIL import Image
        code, log, out = self.run_it(GOOD, '--size', '1290x2796')
        with Image.open(out / '01.png') as im:
            self.assertEqual(im.size, (1290, 2796))

    def test_seam_is_an_error(self):
        code, log, _ = self.run_it(STRIP_SEAM)
        self.assertEqual(code, 1)
        self.assertIn('字跨缝', log)

    def test_small_headline_warns_but_passes(self):
        code, log, _ = self.run_it(SMALL)
        self.assertEqual(code, 0)
        self.assertIn('读不出来', log)

    def test_ui_text_is_exempt(self):
        code, log, _ = self.run_it(UI_ONLY)
        self.assertEqual(code, 0, log)
        self.assertNotIn('字出了画面', log)

    def test_more_than_ten(self):
        code, log, _ = self.run_it(GOOD * 11)
        self.assertEqual(code, 1)
        self.assertIn('最多 10 张', log)


if __name__ == '__main__':
    unittest.main()
