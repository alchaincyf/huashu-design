import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gen_image  # noqa: E402

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None

SID = '0199aaaa-bbbb-7ccc-8ddd-eeeeffff0001'


def setUpModule():
    # 整个文件都不许碰真实的生图接口：把 urlopen 堵死，漏网的调用直接报错而不是花钱
    import urllib.request
    p = mock.patch.object(urllib.request, 'urlopen', side_effect=AssertionError('测试里不许发真实网络请求'))
    p.start()
    unittest.addModuleCleanup(p.stop)


class GenImage(unittest.TestCase):
    def test_prompt_forbids_drawing_a_substitute(self):
        p = gen_image.build_prompt('一碗红烧肉', (1200, 900))
        self.assertIn('一碗红烧肉', p)
        self.assertIn('CANNOT_GENERATE', p)
        self.assertIn('横', p)

    def test_only_this_sessions_new_image_counts(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / 'old').mkdir()
            (root / SID).mkdir()
            (root / 'other-session').mkdir()
            old = root / 'old' / 'a.png'
            old.write_bytes(b'x')
            before = gen_image.snapshot(root)
            mine = root / SID / 'b.png'
            mine.write_bytes(b'y')
            other = root / 'other-session' / 'c.png'
            other.write_bytes(b'z')
            os.utime(other, (time.time() + 5, time.time() + 5))   # 别的任务的图更新，也不能拿
            after = gen_image.snapshot(root)
            self.assertEqual(gen_image.pick_new(before, after, f'session id: {SID}'), mine)
            self.assertIsNone(gen_image.pick_new(after, after, f'session id: {SID}'))

    @unittest.skipIf(Image is None, '需要 Pillow')
    def test_fit_covers_then_crops_without_stretching(self):
        out = gen_image.fit(Image.new('RGB', (1024, 1024), 'red'), (1200, 600))
        self.assertEqual(out.size, (1200, 600))

    def test_no_new_image_means_failure_and_no_file(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / 'x.png'
            done = mock.Mock(stdout='CANNOT_GENERATE', stderr='')
            with mock.patch('gen_image.shutil.which', return_value='/bin/codex'), \
                 mock.patch('gen_image.subprocess.run', return_value=done), \
                 mock.patch('gen_image.snapshot', return_value=set()):
                self.assertEqual(gen_image.main(['--prompt', 'p', '--out', str(out)]), 1)
            self.assertFalse(out.exists())

    def test_without_codex_it_says_where_else_to_get_images(self):
        # 清掉环境里的生图 key：测试绝不能真的去调按张计费的接口
        with mock.patch('gen_image.shutil.which', return_value=None), mock.patch.dict(os.environ, {}, clear=True):
            self.assertEqual(gen_image.main(['--prompt', 'p', '--out', 'x.png']), 2)



class ApiChannel(unittest.TestCase):
    def test_provider_from_env(self):
        self.assertEqual(gen_image.api_provider({'OPENAI_API_KEY': 'k'}), ('openai', 'k'))
        self.assertEqual(gen_image.api_provider({'VOLCENGINE_API_KEY': 'v'}), ('ark', 'v'))
        self.assertEqual(gen_image.api_provider({}), (None, None))

    def test_body_shapes(self):
        self.assertEqual(gen_image.api_body('openai', 'm', 'p', (1200, 800))['size'], '1536x1024')
        self.assertEqual(gen_image.api_body('openai', 'm', 'p', (680, 1100))['size'], '1024x1536')
        self.assertEqual(gen_image.api_body('ark', 'm', 'p', (900, 900))['model'], 'm')

    def test_generate_reads_b64_and_never_leaks_key(self):
        import base64, contextlib, io, json, urllib.error
        seen = {}

        @contextlib.contextmanager
        def ok(req, timeout=0):
            seen['auth'] = req.get_header('Authorization')
            yield io.BytesIO(json.dumps({'data': [{'b64_json': base64.b64encode(b'IMG').decode()}]}).encode())
        self.assertEqual(gen_image.api_generate('openai', 'SECRET', 'p', (1, 1), opener=ok), b'IMG')
        self.assertEqual(seen['auth'], 'Bearer SECRET')

        def bad(req, timeout=0):
            raise urllib.error.HTTPError(req.full_url, 404, 'nf', {}, io.BytesIO(b'{"error":"ModelNotOpen"}'))
        with self.assertRaises(RuntimeError) as cm:
            gen_image.api_generate('ark', 'SECRET', 'p', (1, 1), opener=bad)
        self.assertIn('ModelNotOpen', str(cm.exception))
        self.assertNotIn('SECRET', str(cm.exception))


if __name__ == '__main__':
    unittest.main()
