"""offline.py：CDN 的 React＋Babel 页面要能转成断网可开的单文件（测试本身不联网：库走 skill 自带副本）。"""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / 'offline.py'


class Offline(unittest.TestCase):
    def test_babel_page_goes_offline(self):
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / 'o.html'
            r = subprocess.run([sys.executable, str(SCRIPT), str(HERE / 'fixtures' / 'offline_jsx.html'), '-o', str(out)],
                               capture_output=True, text=True, timeout=180)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
            html = out.read_text(encoding='utf-8')
            self.assertNotIn('text/babel', html)
            self.assertNotIn('unpkg.com', html)
            self.assertNotIn('Babel.transform', html)      # Babel 本体没被带进来
            self.assertLess(out.stat().st_size, 400 * 1024)
            self.assertIn('像素差', r.stdout)
            from playwright.sync_api import sync_playwright
            with sync_playwright() as pw:
                b = pw.chromium.launch()
                pg = b.new_page()
                pg.route('**/*', lambda x: x.abort() if x.request.url.startswith('http') else x.continue_())
                pg.goto(out.as_uri())
                pg.wait_for_selector('text=今天还剩 12 杯')
                pg.click('text=今天还剩 12 杯')
                pg.wait_for_selector('text=今天还剩 11 杯')
                b.close()


if __name__ == '__main__':
    unittest.main()
