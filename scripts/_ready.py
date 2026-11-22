"""截本地 HTML 之前等它真的渲染出来。

内联 React（Babel 现场编译）、大张 base64 内嵌图、网络字体的页面，load 之后几百毫秒常常还是空白；
固定等待截到的空白页不会报错，还会骗过后面的看图和比对。这里等到：文档加载完、字体就绪、
图片都到了、页面上真有字或图形。等不到就返回 False，由调用方报出来。
"""

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
