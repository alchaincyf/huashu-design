"""让截图类脚本在 WorkBuddy 里也能直接跑（import 本模块即生效）。

WorkBuddy 的 PATH 里排第一的 python3 是它自带的裸 Python，没有 playwright；装了 playwright 的是
~/.workbuddy/binaries/python/envs/default，浏览器按版本放在 ~/.workbuddy/binaries/pw-browsers-<版本>。
- 当前 Python 没有 playwright、而 WorkBuddy 自带环境里有：换那个 Python 重跑本脚本；
- 默认缓存里没有这个 playwright 要的浏览器、而 WorkBuddy 的浏览器目录里有：指过去。
其他环境什么都不做。
"""
import glob
import json
import os
import subprocess
import sys
from pathlib import Path

_WB = Path.home() / '.workbuddy' / 'binaries'


def _switch_python():
    if os.environ.get('HD_PYENV_SWITCHED'):
        return
    for py in sorted(glob.glob(str(_WB / 'python' / 'envs' / '*' / 'bin' / 'python3'))):
        if Path(py).parent.parent == Path(sys.prefix):   # venv 的 python3 是指向基础解释器的软链，不能按 resolve 比
            continue
        if subprocess.run([py, '-c', 'import playwright'], capture_output=True).returncode == 0:
            os.environ['HD_PYENV_SWITCHED'] = '1'
            os.execv(py, [py] + sys.argv)


def _point_browsers(playwright):
    if os.environ.get('PLAYWRIGHT_BROWSERS_PATH'):
        return
    try:
        bj = Path(playwright.__file__).parent / 'driver' / 'package' / 'browsers.json'
        rev = {b['name']: b['revision'] for b in json.loads(bj.read_text())['browsers']}
    except Exception:
        return
    need = [f'chromium_headless_shell-{rev.get("chromium-headless-shell", rev.get("chromium"))}', f'chromium-{rev.get("chromium")}']
    home = Path.home()
    default = {'darwin': home / 'Library' / 'Caches' / 'ms-playwright',
               'win32': Path(os.environ.get('LOCALAPPDATA', home)) / 'ms-playwright'}.get(sys.platform, home / '.cache' / 'ms-playwright')
    if any((default / n).exists() for n in need):
        return
    for d in sorted(glob.glob(str(_WB / 'pw-browsers-*')), reverse=True) + [str(_WB / 'playwright-browsers')]:
        if all((Path(d) / n).exists() for n in need):
            os.environ['PLAYWRIGHT_BROWSERS_PATH'] = d
            return


if _WB.exists():
    try:
        import playwright
    except ImportError:
        _switch_python()
    else:
        _point_browsers(playwright)
