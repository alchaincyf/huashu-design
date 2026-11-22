"""截本地 HTML 之前等它真的渲染出来。

内联 React（Babel 现场编译）、大张 base64 内嵌图、网络字体的页面，load 之后几百毫秒常常还是空白；
固定等待截到的空白页不会报错，还会骗过后面的看图和比对。这里等到：文档加载完、字体就绪、
图片都到了、页面上真有字或图形。等不到就返回 False，由调用方报出来。
"""

import _pyenv  # noqa: F401  WorkBuddy 里换到带 playwright 的 Python、找到它的浏览器

READY_JS = """() => {
  const b = document.body;
  if (!b || document.readyState !== 'complete') return false;
  if (document.fonts && document.fonts.status !== 'loaded') return false;
  if ([...document.images].some(i => !i.complete)) return false;
  return b.innerText.replace(/\\s+/g, '').length > 20 || b.querySelectorAll('img, svg, canvas, video').length > 0;
}"""

NOT_READY = '页面 {s} 秒内还没渲染出内容（脚本没跑完、CDN 或字体没加载到、图片还在下），截图可能是空白，打开看一眼'


def wait_ready(page, timeout=15000):
    """Playwright 同步 page。渲染出来了返回 True。"""
    try:
        page.wait_for_function(READY_JS, timeout=timeout)
        return True
    except Exception:
        return False


_VENDOR = __import__('pathlib').Path(__file__).resolve().parent.parent / 'assets' / 'vendor'
_PINNED = {   # react-setup.md 里钉死的三个版本：和本地副本是同一个文件，integrity 也对得上
    'react@18.3.1/umd/react.development.js': 'react.development.js',
    'react-dom@18.3.1/umd/react-dom.development.js': 'react-dom.development.js',
    'react@18.3.1/umd/react.production.min.js': 'react.production.min.js',
    'react-dom@18.3.1/umd/react-dom.production.min.js': 'react-dom.production.min.js',
    '@babel/standalone@7.29.0/babel.min.js': 'babel.min.js',
}


def use_vendor(page):
    """截图、体检前调用：页面从 CDN 拉的 React／Babel（钉死的版本）改用 skill 自带副本，断网也不白屏。"""
    def handle(route):
        url = route.request.url
        for tail, name in _PINNED.items():
            if url.split('?')[0].endswith(tail) and (_VENDOR / name).exists():
                route.fulfill(body=(_VENDOR / name).read_bytes(), content_type='application/javascript',
                              headers={'Access-Control-Allow-Origin': '*'})
                return
        route.fallback()
    import re
    page.route(re.compile(r'/(react|react-dom)@18\.3\.1/umd/|/@babel/standalone@7\.29\.0/'), handle)
