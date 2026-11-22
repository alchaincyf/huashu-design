"""design_lint.py 与 learn.py 的测试：检查工具必须能抓住故意做坏的输入，也不能冤枉干净的。

运行：python3 -m unittest scripts/tests/test_design_lint.py -v
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

import design_lint as dl  # noqa: E402
import learn  # noqa: E402
import ref_board  # noqa: E402

FX = HERE / 'fixtures'


class LintFacts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        names = ['lint_slop.html', 'lint_reskin.html', 'lint_clean.html', 'lint_broken.html']
        cls.f = dict(zip(names, dl.collect([str(FX / n) for n in names])))

    def test_slop_hits_the_2026_clusters(self):
        red, yellow = dl.judge(self.f['lint_slop.html'])
        text = '\n'.join(yellow)
        fams = '\n'.join(dl.families(self.f['lint_slop.html']))
        self.assertIn('暖纸衬线', fams)       # 暖奶油＋陶土色＋衬线：只作描述
        self.assertIn('卡片套件', fams)       # 同一圆角同一阴影的卡片：只作描述
        self.assertNotIn('暖纸衬线', text)    # 家族不再亮黄灯
        self.assertIn('模板装饰', text)       # 全大写小标签、中点、箭头
        self.assertIn('只给一个词换色', text)
        self.assertIn('01/02/03', text)

    def test_clean_page_is_not_accused(self):
        red, yellow = dl.judge(self.f['lint_clean.html'])
        self.assertEqual(red, [])
        self.assertEqual(yellow, [])

    def test_broken_page_goes_red(self):
        red, _ = dl.judge(self.f['lint_broken.html'])
        text = '\n'.join(red)
        self.assertIn('图裂了', text)
        self.assertIn('正文字号', text)
        self.assertIn('对比度', text)

    def test_reskin_is_caught_by_layout_not_colour(self):
        a = dl.fingerprint(self.f['lint_slop.html'])
        b = dl.fingerprint(self.f['lint_reskin.html'])
        c = dl.fingerprint(self.f['lint_clean.html'])
        hits, pd, lc = dl.similar(a, b)
        self.assertGreater(pd, 0.06)          # 颜色确实换了
        self.assertTrue(any('骨架' in h for h in hits), hits)   # 但骨架没换
        self.assertFalse(dl.similar(a, c)[0])  # 真不同的两版不报

    def test_warm_cream_is_classified_warm(self):
        self.assertEqual(dl.bg_class((0xF4, 0xF1, 0xEA)), '浅·暖纸')
        self.assertEqual(dl.bg_class((0xFA, 0xF8, 0xF4)), '浅·暖纸')
        self.assertEqual(dl.bg_class((0xFA, 0xFA, 0xFA)), '浅·中性白')
        self.assertNotEqual(dl.bg_class((0xDF, 0xEB, 0xE5)), '浅·暖纸')   # 冷青瓷灰不是暖奶油
        self.assertEqual(dl.bg_class((0x26, 0x38, 0x2F)), '深·有色')       # 墨绿是深色有色底，不是中明度灰

    def test_same_class_needs_close_hue_when_coloured(self):
        # 实测误报：红底和黄底的两套宣传图同属「中明度·有色」、同一标题字体，被判成撞了
        pal = [{'rgb': (226, 67, 42), 'share': 1.0, 'hex': '#E2432A'}]
        pal2 = [{'rgb': (244, 194, 31), 'share': 1.0, 'hex': '#F4C21F'}]
        a = {'palette': pal, 'layout': [1, 0, 0, 1], 'bg': '#E2432A', 'bg_class': '中明度·有色', 'serif': False, 'display': 'Noto Sans SC'}
        b = {'palette': pal2, 'layout': [0, 1, 1, 0], 'bg': '#F4C21F', 'bg_class': '中明度·有色', 'serif': False, 'display': 'Noto Sans SC'}
        self.assertEqual(dl.similar(a, b)[0], [])
        c = dict(b, bg='#E8552F', palette=[{'rgb': (120, 200, 90), 'share': 1.0, 'hex': '#78C85A'}])
        self.assertTrue(any('同一底色类' in h for h in dl.similar(a, c)[0]))


    def test_neutral_board_does_not_hide_different_accents(self):
        # 3.5 实测误报：记账 App 两个方向（浅绿灰账页 vs 米色底上的绿色手机）首屏都被浅色展示板占满，
        # 整体色板距离 0.054 被判「色板几乎相同」；一边有成片彩色、另一边没有，不是同一套色
        P = lambda *cs: [{'rgb': rgb, 'share': sh, 'hex': '#000000'} for rgb, sh in cs]
        ledger = P(((226, 233, 219), 0.32), ((215, 221, 209), 0.26), ((224, 231, 218), 0.18), ((136, 138, 133), 0.12), ((229, 236, 223), 0.12))
        coins = P(((239, 230, 214), 0.25), ((68, 134, 105), 0.21), ((226, 220, 203), 0.17), ((191, 176, 153), 0.14), ((80, 71, 73), 0.14), ((251, 244, 228), 0.09))
        base = {'layout': [1, 0, 0, 1], 'bg': '#E2E9DB', 'bg_class': '浅·中性白', 'serif': True, 'display': 'A'}
        a, b = dict(base, palette=ledger), dict(base, palette=coins, serif=False, display='B')
        self.assertLess(dl.palette_distance(ledger, coins), 0.06)
        self.assertEqual([h for h in dl.similar(a, b)[0] if '色板' in h], [])
        # 两版都只有中性色：照样报
        c = dict(base, palette=P(((227, 234, 220), 0.6), ((214, 220, 208), 0.4)), serif=False, display='B')
        self.assertTrue(any('色板' in h for h in dl.similar(a, c)[0]))

    def test_blank_shot_is_not_compared(self):
        a = {'blank': True, 'palette': [], 'layout': []}
        self.assertIn('空白', dl.similar(a, a)[0][0])


class DeviceRow(unittest.TestCase):
    def test_row_of_equal_phones_is_flagged(self):
        # 3.5 WorkBuddy 实测：Hy4 三个方向都是「标题＋一排四台等大手机」
        row = [{'x': 40 + i * 382, 'y': 377, 'w': 324, 'h': 682} for i in range(4)]
        self.assertEqual(dl.device_row(row), 4)
        hero = [{'x': 56, 'y': 250, 'w': 375, 'h': 790}] + [{'x': 487 + (i % 2) * 336, 'y': 210 + (i % 2) * 140 + (i // 2) * 720, 'w': 300, 'h': 632} for i in range(4)]
        self.assertEqual(dl.device_row(hero), 0)
        self.assertEqual(dl.device_row(row[:3]), 0)


class SvgScale(unittest.TestCase):
    def test_css_scaled_phone_is_not_small_text(self):
        # 3.5 实测误报：展示板上缩到 0.8 倍的手机里，13px 的 SVG 坐标字被量成 10px 报红；
        # HTML 的字不算外层 CSS 缩放，SVG 也不该算。被 viewBox 真缩小的字照样要报
        f = dl.collect([str(FX / 'lint_svg_scaled.html')])[0]
        small = [x['text'] for x in f.get('bodySmall', [])]
        self.assertFalse(any('刚复习' in t for t in small), small)
        self.assertTrue(any('缩小的坐标轴' in t for t in small), small)


class LintEdgeCases(unittest.TestCase):
    """独立审查报出的误报与漏报，逐条钉成回归测试。"""

    def test_no_false_red_on_svg_sibling_plate_and_caption(self):
        f = dl.collect([str(FX / 'lint_tricky_ok.html')])[0]
        red, _ = dl.judge(f)
        self.assertEqual(red, [])   # 放大后的 SVG 字、兄弟层深底上的白字、13px 图注都不该报红

    def test_deck_div_body_and_ghost_text_go_red(self):
        f = dl.collect([str(FX / 'lint_tricky_bad.html')], viewport=(1920, 1080), min_body=24, min_label=16)[0]
        red, yellow = dl.judge(f)
        text = '\n'.join(red)
        self.assertIn('正文字号低于下限', text)   # div 写的 16px 正文
        self.assertIn('对比度不够', text)          # 8% 透明度的白字
        self.assertTrue(any('相对路径图片' in y for y in yellow))

    def test_unreachable_stylesheet_does_not_kill_the_batch(self):
        res = dl.collect([str(FX / 'lint_offline.html'), str(FX / 'lint_clean.html')])
        self.assertEqual(len(res), 2)
        self.assertNotIn('fatal', res[1])
        self.assertEqual(dl.judge(res[1])[0], [])

    def test_glob_is_expanded_by_the_script(self):
        self.assertIn(str(FX / 'lint_clean.html'), dl.expand([str(FX / 'lint_c*.html')]))

    def test_brand_mode_only_compares_skeleton(self):
        f = dl.collect([str(FX / 'lint_slop.html')])[0]
        a = dl.fingerprint(f)
        self.assertTrue(dl.similar(a, a)[0])
        b = dict(a, layout=[-x for x in a['layout']])   # 同色同字体、骨架完全不同
        self.assertFalse(dl.similar(a, b, brand=True)[0])


class Ledger(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        os.environ['HUASHU_DESIGN_HOME'] = self.tmp.name

    def tearDown(self):
        os.environ.pop('HUASHU_DESIGN_HOME', None)
        self.tmp.cleanup()

    def test_add_then_check_flags_the_same_look(self):
        self.assertEqual(dl.main(['ledger', 'add', str(FX / 'lint_slop.html'), '--project', '测试项目']), 0)
        rows = dl.ledger_read()
        self.assertEqual(len(rows), 1)
        self.assertIn('暖纸', rows[0]['desc'])
        # 同一个样子再来一次：必须报撞
        self.assertEqual(dl.main(['ledger', 'check', str(FX / 'lint_slop.html')]), 1)
        # 完全不同的样子：不报
        self.assertEqual(dl.main(['ledger', 'check', str(FX / 'lint_clean.html')]), 0)


class Learn(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        os.environ['HUASHU_DESIGN_HOME'] = self.tmp.name

    def tearDown(self):
        os.environ.pop('HUASHU_DESIGN_HOME', None)
        self.tmp.cleanup()

    def test_refuses_entries_nobody_can_check(self):
        with self.assertRaises(learn.LearnError):
            learn.add_entry('guess', 'deck', '随便', '证据')
        with self.assertRaises(learn.LearnError):
            learn.add_entry('observed', '', '没有主题', '证据')
        with self.assertRaises(learn.LearnError):
            learn.add_entry('observed', 'deck', '没有证据', '')
        with self.assertRaises(learn.LearnError):
            learn.add_entry('preference', 'color', '他喜欢暖色', '对话')  # 偏好必须是原话

    def test_roundtrip(self):
        learn.add_entry('preference', 'color,cover', '「封面用暖纸底」——只用于他自己的封面', '2026-10-17 对话')
        learn.add_entry('observed', 'deck', '三版都用了同一个骨架被他一眼看出', 'B2 基准')
        out = learn.recall(['deck'])
        self.assertIn('封面用暖纸底', out)      # 偏好总是带出来
        self.assertIn('同一个骨架', out)
        self.assertIn('L2', learn.local_file().read_text(encoding='utf-8'))
        self.assertNotIn('同一个骨架', learn.recall(['motion']).split('## 过去项目的经验')[1])

    def test_hand_edited_heading_without_trailing_dot_keeps_its_kind(self):
        learn.local_file().parent.mkdir(parents=True, exist_ok=True)
        learn.local_file().write_text('# x\n\n## 手记 · preference\n\n- 原话：「要大胆」\n', encoding='utf-8')
        self.assertEqual(learn.entries(learn.local_file(), 'local')[0]['kind'], 'preference')

    def test_topic_named_like_a_subcommand_can_be_recalled(self):
        self.assertIn('过去项目的经验', learn.recall(['status']))
        self.assertEqual(learn.main(['--', 'status']), 0)


class RefBoard(unittest.TestCase):
    def test_blank_screenshot_counts_as_not_seen(self):
        from PIL import Image, ImageDraw
        with tempfile.TemporaryDirectory() as d:
            blank, real = Path(d) / 'blank.jpg', Path(d) / 'real.jpg'
            Image.new('RGB', (1440, 900), (32, 26, 28)).save(blank)   # WebGL 站点在无头浏览器里的样子
            im = Image.new('RGB', (1440, 900), 'white')
            ImageDraw.Draw(im).rectangle([100, 100, 900, 600], fill=(20, 60, 200))
            im.save(real)
            self.assertTrue(ref_board.mostly_blank(blank))
            self.assertFalse(ref_board.mostly_blank(real))
            # 极简设计不能被误判成没看到
            sparse = HERE.parent.parent / 'assets' / 'style-specimens' / 'info' / '17-ma-emptiness.jpg'
            self.assertFalse(ref_board.mostly_blank(sparse))

    def test_local_image_goes_on_the_board(self):
        from PIL import Image, ImageDraw
        with tempfile.TemporaryDirectory() as d:
            src = Path(d) / 'src.png'
            im = Image.new('RGB', (800, 500), (240, 236, 228))
            ImageDraw.Draw(im).rectangle([60, 60, 420, 440], fill=(200, 40, 40))
            im.save(src)
            out = Path(d) / 'refs' / 'board.jpg'
            self.assertEqual(ref_board.main([str(src), '--out', str(out)]), 0)
            self.assertTrue(out.exists() and (out.parent / 'board-1.jpg').exists())


if __name__ == '__main__':
    unittest.main()
