"""Regression: rendered PPTX screenshot indices track actual tag positions."""
import asyncio
import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "pptx_from_rendered.py"
spec = importlib.util.spec_from_file_location("pptx_from_rendered_svg_test", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RenderScreenshotIndexTest(unittest.TestCase):
    def render(self, html):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "slide.html"
            source.write_text(html, encoding="utf-8")
            pages = asyncio.run(module.render(str(source), ".slide", str(root / "assets"), 1))
            elements = [item for item in pages[0]["els"] if item["kind"] == "svg"]
            return [(item["tagName"], item["seq"], Path(item["file"]).is_file()) for item in elements]

    def test_hidden_svg_before_visible_svg_uses_actual_index(self):
        result = self.render('<section class="slide"><svg style="display:none" width="20" height="20"></svg>'
                             '<svg width="20" height="20"><rect width="20" height="20"/></svg></section>')
        self.assertEqual(result, [("svg", 1, True)])

    def test_svg_and_canvas_have_independent_indices(self):
        result = self.render('<section class="slide"><svg width="20" height="20">'
                             '<rect width="20" height="20"/></svg><canvas width="20" height="20"></canvas></section>')
        self.assertEqual(result, [("svg", 0, True), ("canvas", 0, True)])


if __name__ == "__main__":
    unittest.main()
