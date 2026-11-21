import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import ref_card  # noqa: E402

try:
    from PIL import Image, ImageDraw
except ImportError:  # pragma: no cover
    Image = None


def poster(bg, accent, top_heavy=True):
    im = Image.new('RGB', (300, 600), bg)
    d = ImageDraw.Draw(im)
    y0 = 20 if top_heavy else 420
    for k in range(6):
        d.rectangle([20, y0 + k * 26, 280, y0 + k * 26 + 12], fill=accent)
    return im


@unittest.skipIf(Image is None, '需要 Pillow')
class RefCard(unittest.TestCase):
    def test_measure_reports_dominant_colour_and_where_content_sits(self):
        m = ref_card.measure(poster('#0E3B43', '#F2C14E'))
        self.assertGreater(m['largest_colour_share'], 0.6)
        self.assertGreater(sum(m['bands'][:4]), sum(m['bands'][6:]))
        self.assertAlmostEqual(sum(m['bands']), 1, places=1)

    def test_near_identical_colours_are_merged(self):
        pal = [{'hex': '#2E3BF2', 'rgb': [46, 59, 242], 'share': 0.47},
               {'hex': '#2E3BF0', 'rgb': [46, 59, 240], 'share': 0.17},
               {'hex': '#FFFFFF', 'rgb': [255, 255, 255], 'share': 0.36}]
        out = ref_card.merged(pal)
        self.assertEqual(len(out), 2)
        self.assertAlmostEqual(out[0]['share'], 0.64)

    def test_same_image_has_no_gap(self):
        a = ref_card.measure(poster('#0E3B43', '#F2C14E'))
        d = ref_card.diff(a, a)
        self.assertEqual(d['palette_distance'], 0)
        self.assertGreater(d['layout_correlation'], 0.95)

    def test_different_skin_and_skeleton_show_up_as_gaps(self):
        a = ref_card.measure(poster('#0E3B43', '#F2C14E', top_heavy=True))
        b = ref_card.measure(poster('#F4F1E8', '#B8321F', top_heavy=False))
        d = ref_card.diff(a, b)
        self.assertGreater(d['palette_distance'], 0.2)
        self.assertLess(d['layout_correlation'], 0.5)

    def test_card_puts_both_images_side_by_side(self):
        a, b = poster('#0E3B43', '#F2C14E'), poster('#F4F1E8', '#B8321F')
        c = ref_card.card(a, b, ref_card.measure(a), ref_card.measure(b), height=300)
        self.assertGreater(c.width, 300)
        self.assertGreater(c.height, 300)

    def test_missing_file_is_reported_not_crashed(self):
        self.assertEqual(ref_card.main(['measure', 'no-such-file.png']), 1)


if __name__ == '__main__':
    unittest.main()
