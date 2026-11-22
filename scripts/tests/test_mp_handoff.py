"""mp_handoff.py：胶囊遮挡、tabBar 数量、转发卡片比例、小字、背景图这些小程序特有的坑要被报出来；
干净的设计稿不报 ✗，并且截图是 750 宽（1px = 1rpx）。

出图那组需要 Python 版 playwright 和 pillow；没装时跳过。
python3 -m unittest discover -s scripts/tests -p test_mp_handoff.py -v
"""
import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import mp_handoff  # noqa: E402

FIX = Path(__file__).resolve().parent / 'fixtures'
try:
    import playwright  # noqa: F401
    from PIL import Image
    HAVE = True
except ImportError:
    HAVE = False


def screen(**kw):
    s = {'page': 'pages/a/a', 'title': 'A', 'nav': 'default', 'navColor': '', 'navText': 'black', 'tab': '',
         'tabbar': None, 'customTab': False, 'w': 375, 'h': 812, 'extra': 0, 'texts': [], 'styles': [], 'images': [], 'issues': []}
    s.update(kw)
    return s


class Analyze(unittest.TestCase):
    def levels(self, report):
        return [(lv, msg.split('：')[0]) for lv, _, msg in mp_handoff.analyze(report)[0]]

    def test_capsule_overlap_is_error(self):
        r = {'screens': [screen(texts=[{'t': '搜索', 'size': 14, 'over': True}])], 'shares': [{'w': 200, 'h': 160}]}
        self.assertIn(('✗', '字压在胶囊上'), self.levels(r))

    def test_tab_count_and_missing_tab(self):
        cfg = {'list': ['一', '二', '三', '四', '五', '六'], 'color': '#999999', 'selectedColor': '#000000', 'backgroundColor': '#ffffff'}
        r = {'screens': [screen(tab='一', tabbar=cfg)], 'shares': [{'w': 200, 'h': 160}]}
        lv = self.levels(r)
        self.assertTrue(any(l == '✗' and m.startswith('tabBar 有 6 个') for l, m in lv))
        self.assertTrue(any(l == '!' and '没画' in m for l, m in lv))

    def test_share_ratio_and_absence(self):
        self.assertTrue(any(l == '✗' for l, _ in self.levels({'screens': [screen()], 'shares': [{'w': 200, 'h': 200}]})))
        self.assertTrue(any('没画转发卡片' in m for _, m in self.levels({'screens': [screen()], 'shares': []})))
        self.assertEqual(self.levels({'screens': [screen()], 'shares': [{'w': 220, 'h': 176}]}), [])

    def test_tokens_convert_to_rpx(self):
        st = {'color': 'rgb(43, 74, 58)', 'bg': 'rgba(0, 0, 0, 0)', 'border': '', 'radius': '12px', 'font': '"LXGW WenKai", serif',
              'size': '15px', 'bgimg': '', 'backdrop': False, 'tag': 'div'}
        _, tok = mp_handoff.analyze({'screens': [screen(styles=[st])], 'shares': [{'w': 220, 'h': 176}]})
        self.assertEqual(tok['colors'][0]['hex'], '#2B4A3A')
        self.assertEqual(tok['fontSizes'][0]['rpx'], 30)
        self.assertEqual(tok['radii'][0]['rpx'], 24)
        self.assertFalse(tok['fonts'][0]['system'])

    def test_app_json_uses_tab_pages(self):
        cfg = {'list': ['点单', '我的'], 'color': '#999999', 'selectedColor': '#000000', 'backgroundColor': '#ffffff'}
        r = {'screens': [screen(page='pages/menu/menu', tab='点单', tabbar=cfg), screen(page='pages/me/me', tab='我的', tabbar=cfg)], 'shares': []}
        aj = mp_handoff.app_json(r)
        self.assertEqual(aj['pages'], ['pages/menu/menu', 'pages/me/me'])
        self.assertEqual([t['pagePath'] for t in aj['tabBar']['list']], ['pages/menu/menu', 'pages/me/me'])
        self.assertEqual(aj['lazyCodeLoading'], 'requiredComponents')


@unittest.skipUnless(HAVE, '没装 playwright / pillow')
class Render(unittest.TestCase):
    def run_on(self, name):
        out = Path(tempfile.mkdtemp()) / '_design'
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc = mp_handoff.main([str(FIX / name), '--out', str(out)])
        return rc, buf.getvalue(), out

    def test_bad_fixture(self):
        rc, log, out = self.run_on('mp_bad.html')
        self.assertEqual(rc, 1)
        for want in ('字压在胶囊上', 'tabBar 有 6 个', '不是 5:4', '字小于 12px', 'background-image'):
            self.assertIn(want, log)
        self.assertTrue((out / 'screens' / '01-home-长图.png').exists())

    def test_ok_fixture(self):
        rc, log, out = self.run_on('mp_ok.html')
        self.assertEqual(rc, 0, log)
        self.assertEqual(Image.open(out / 'screens' / '01-menu.png').size[0], 750)
        self.assertTrue((out / '给WorkBuddy的话.md').exists())
        tok = json.loads((out / 'tokens.json').read_text())
        self.assertIn('#FAFAF7', [c['hex'] for c in tok['colors']])
        self.assertEqual(len(list((out / 'images').iterdir())), 1)


if __name__ == '__main__':
    unittest.main()
