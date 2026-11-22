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

    def test_scaled_board_exports_true_size_in_app_order(self):
        # 3.5 实测：展示板上把手机缩到 0.72 倍摆放，详情屏排在首页前面——截图要 750 宽，顺序按 tabBar
        rc, log, out = self.run_on('mp_scaled.html')
        self.assertEqual(rc, 0, log)
        shots = sorted(p.name for p in (out / 'screens').iterdir())
        self.assertEqual(shots[0], '01-menu.png')
        for p in (out / 'screens').iterdir():
            self.assertEqual(Image.open(p).size[0], 750, p.name)

    def test_grid_board_screens_are_isolated(self):
        # 3.5 WorkBuddy 实测：网格展示板上每台手机各自缩小，还原尺寸截图时隔壁手机和标签压了进来
        rc, log, out = self.run_on('mp_grid.html')
        self.assertEqual(rc, 0, log)
        im = Image.open(out / 'screens' / '01-a.png').convert('RGB')
        self.assertEqual(im.size[0], 750)
        for x, y in [(740, 400), (700, 1200), (10, 10), (745, 1620)]:
            r, g, b = im.getpixel((x, y))
            self.assertTrue(r > 230 and g > 230 and b > 220, f'({x},{y}) 是 {(r, g, b)}，混进了别的东西')

    def test_tabbar_on_secondary_page(self):
        # 3.5 WorkBuddy 实测：预约凭证、门店这类二级页也画了 tabBar，真小程序里没有
        cfg = {'list': ['价目', '预约', '我的'], 'color': '#999999', 'selectedColor': '#C8402C', 'backgroundColor': '#ffffff'}
        base = {'title': '', 'nav': 'default', 'customTab': False, 'w': 375, 'h': 812, 'extra': 0,
                'styles': [], 'images': [], 'texts': [], 'issues': []}
        scr = [dict(base, page='pages/price/price', tab='价目', tabbar=cfg),
               dict(base, page='pages/ticket/ticket', tab='', tabbar=cfg)]
        found, _ = mp_handoff.analyze({'screens': scr, 'shares': []})
        hits = [w for _, w, c in found if '不是 tab 页' in c]
        self.assertEqual(hits, ['pages/ticket/ticket'])

    def test_statusbar_overlap(self):
        # 3.5 WorkBuddy 实测：自定义导航栏的页面把昵称、头像放进了顶部 44px，系统时间会压在上面
        scr = {'page': 'pages/confirm/confirm', 'title': '', 'nav': 'custom', 'tab': '', 'tabbar': None, 'customTab': False,
               'w': 375, 'h': 812, 'extra': 0, 'styles': [], 'images': [],
               'texts': [{'t': '豆豆', 'size': 15, 'over': False, 'bar': True}, {'t': '15:00', 'size': 30, 'over': False, 'bar': False}],
               'issues': [{'kind': 'img-statusbar', 't': '豆豆'}]}
        found, _ = mp_handoff.analyze({'screens': [scr], 'shares': []})
        text = '\n'.join(f'{a} {c}' for a, _, c in found)
        self.assertIn('✗ 字压在状态栏上', text)
        self.assertIn('小图伸进了状态栏', text)

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
