#!/usr/bin/env python3
"""
capabilities.py — 看用户手里实际有什么，决定素材走哪一档（见 references/materials.md）。

只读：查 skill 目录、环境变量里有没有 key（只看有无，不打印值）、几个命令在不在。
探测不到不代表没有（例如 Codex 自带 image_gen），用户说有就以用户为准。

用法：python3 scripts/capabilities.py [--json]
"""

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

SKILL_DIRS = ['~/.claude/skills', '~/.agents/skills', '~/.codex/skills', '~/.cursor/skills',
              '.claude/skills', '.agents/skills']
IMAGE_SKILLS = ['huashu-gpt-image', 'nano-banana-pro', 'lovart-api']
SIBLINGS = {
    'huashu-gpt-image': 'npx skills add alchaincyf/huashu-gpt-image',
    'huashu-art-motion': 'npx skills add alchaincyf/huashu-art-motion',
    'huashu-md-html': 'npx skills add alchaincyf/huashu-md-html',
    'huashu-3djs': None,
    'huashu-flow-diagram': None,
    'huashu-motion': None,
}
IMAGE_KEYS = ['OPENAI_API_KEY', 'GEMINI_API_KEY']   # 只报告有无；本 skill 没有直接调生图 API 的脚本，有 key 不等于能生图


def installed_skills():
    found = {}
    for d in SKILL_DIRS:
        p = Path(d).expanduser()
        if p.is_dir():
            for s in p.iterdir():
                if (s / 'SKILL.md').exists():
                    found.setdefault(s.name, str(s))
    return found


RUNTIMES = {   # 名字, 是否自带生图工具
    'codex': ('Codex', True),
    'buddy': ('WorkBuddy / CodeBuddy', True),
    'doubao': ('豆包', True),
    'dsh': ('DeepSeek harness', False),
    'claude': ('Claude Code', False),
}


def classify(comm, args=''):
    """一个进程是不是某个 agent 的主程序。只看可执行文件名（node 跑的看脚本名），不看整条命令行：
    命令行里路过的路径（~/.claude/…、~/.codex/…）不算数。"""
    name = Path(comm.strip()).name.lower()
    if name in ('node', 'bun', 'deno'):
        script = next((t for t in args.split()[1:] if not t.startswith('-')), '')
        name = Path(script).name.lower()
    low = comm.lower()
    # 豆包、DeepSeek harness 不给命令设专门的环境变量（2026-11 查过它们的安装包），只能从进程认
    if '/doubaowork.app/' in low or '/doubao.app/' in low:
        return 'doubao'
    if name == 'dsh' or '@deepseek-ai/dsh' in args.lower():
        return 'dsh'
    if 'codebuddy' in name or 'workbuddy' in name or '/workbuddy.app/' in low or '/codebuddy' in low:
        return 'buddy'
    if name.startswith('codex'):
        return 'codex'
    if name.startswith('claude'):
        return 'claude'
    return None


def from_ancestors(ps=None):
    """沿父进程往上找，离得最近的那个 agent 就是你所在的环境。
    一个 agent 里启动另一个时（比如在 Claude Code 里借 Codex），里面那个会继承外面的环境变量，
    只看环境变量会认错人；父进程链不会。"""
    def default_ps(pid):
        out = []
        for col in ('ppid=', 'comm=', 'args='):
            r = subprocess.run(['ps', '-o', col, '-p', str(pid)], capture_output=True, text=True, timeout=5)
            out.append(r.stdout.strip())
        return out
    ps = ps or default_ps
    pid = os.getppid()
    try:
        for _ in range(16):
            if pid <= 1:
                break
            ppid, comm, args = ps(pid)
            if not comm:
                break
            kind = classify(comm, args)
            if kind:
                return kind
            pid = int(ppid)
    except (OSError, ValueError, subprocess.SubprocessError):
        pass
    return None


def from_env(env=None):
    """父进程链查不了时（比如 Windows）的兜底。几家的标记同时在 = 一个是从另一个里启动的，分不出谁在里面。
    各家实际设的变量（2026-11 核对）：Codex 给它跑的命令设 CODEX_THREAD_ID、CODEX_SANDBOX 等；
    WorkBuddy / CodeBuddy 设 CODEBUDDY=1；Claude Code 设 CLAUDECODE=1。"""
    env = os.environ if env is None else env
    if env.get('CODEX_SANDBOX'):   # 这条命令正被 Codex 的沙箱包着（沙箱里连 ps 都跑不了）：最里面那层就是 Codex
        return ['codex']
    found = []
    if any(k in env for k in ('CODEX_THREAD_ID', 'CODEX_SESSION_ID', 'CODEX_SANDBOX', 'CODEX_TOOL_CALL_ID')):
        found.append('codex')
    if any(k.startswith(('CODEBUDDY', 'WORKBUDDY')) for k in env):
        found.append('buddy')
    if env.get('CLAUDECODE') or env.get('CLAUDE_CODE_ENTRYPOINT'):
        found.append('claude')
    return found


def runtime_hint(ps=None, env=None):
    """你在哪个 agent 环境里。返回（名字, 是否自带生图, 依据）。只是线索：你自己的工具清单里有没有生图工具，以那个为准。"""
    kind = from_ancestors(ps)
    if kind:
        return RUNTIMES[kind] + ('父进程',)
    found = from_env(env)
    if len(found) == 1:
        return RUNTIMES[found[0]] + ('环境变量',)
    if len(found) > 1:
        names = '、'.join(RUNTIMES[k][0] for k in found)
        return f'分不出（环境变量里同时有 {names} 的标记）', None, '环境变量'
    return None, None, None


def codex_cli():
    """本机有没有能借来生图的 Codex CLI：命令在，并且登录过。"""
    return bool(shutil.which('codex')) and (Path(os.environ.get('CODEX_HOME', '~/.codex')).expanduser() / 'auth.json').exists()


def image_route(native, borrow, image_skills, api=None):
    """界面里要用图时按这个顺序找来源。"""
    route = []
    if native:
        route.append('你所在环境自带的生图工具（直接生成，出几张挑最合适的）')
    if borrow:
        route.append('借本机 Codex 生成：python3 "$HD/scripts/gen_image.py" --prompt … --out …')
    route += [f'生图 skill：{s}' for s in image_skills]
    if api:
        route.append(f'环境变量里的生图 API（{api}，按张计费）：python3 "$HD/scripts/gen_image.py" --via api --prompt … --out …')
    elif not (native or borrow or image_skills):
        route.append('请用户提供生图 API 的 key（放进环境变量 OPENAI_API_KEY 或 ARK_API_KEY，不要贴进对话）：'
                     'OpenAI GPT-Image 2.6 或字节 Seedream 5.5 效果最好；有了就用 gen_image.py --via api')
    route.append('开放许可的真图：python3 "$HD/scripts/fetch_images.py" --query …')
    return route


def detect():
    skills = installed_skills()
    keys = [k for k in IMAGE_KEYS if os.environ.get(k)]
    image = [s for s in IMAGE_SKILLS if s in skills]
    tools = {t: bool(shutil.which(t)) for t in ('node', 'ffmpeg', 'npx')}
    tools['playwright(py)'] = False
    try:   # 包装了不够，chromium 也要在
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            tools['playwright(py)'] = Path(p.chromium.executable_path).exists()
    except Exception:
        pass
    siblings = {s: skills.get(s) for s in SIBLINGS}
    runtime, native, basis = runtime_hint()
    borrow = codex_cli() and runtime != 'Codex'
    api = {'openai': 'OpenAI GPT-Image', 'ark': '火山方舟 Seedream'}.get(
        'openai' if os.environ.get('OPENAI_API_KEY') else 'ark' if (os.environ.get('ARK_API_KEY') or os.environ.get('VOLCENGINE_API_KEY')) else None)
    # 档位不是阶梯：T0 永远有；能生图（环境自带、能借 Codex、或装了生图 skill）加 T1；装了兄弟 skill 加 T2
    tier = ['T0'] + (['T1'] if (image or native or borrow or api) else []) + (['T2'] if any(siblings.values()) else [])
    return {'tier': '＋'.join(tier), 'runtime': runtime, 'runtime_basis': basis, 'native_image': native, 'codex_cli': borrow,
            'image_api': api, 'image_route': image_route(native, borrow, image, api),
            'image_skills': image, 'image_keys': keys, 'siblings': siblings, 'tools': tools}


def main():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass
    r = detect()
    if '--json' in sys.argv:
        print(json.dumps(r, ensure_ascii=False, indent=2))
        return 0
    print(f'素材档位：{r["tier"]}（T0 人人都有；T1 能生图；T2 装了兄弟 skill。见 references/materials.md）')
    print('所在环境：' + (f'{r["runtime"]}（依据：{r["runtime_basis"]}）' if r['runtime'] else '没认出来')
          + '。有没有自带的生图工具，以你自己的工具清单为准；用户说有也算')
    print('界面里要用图时，按这个顺序找来源（前一个不行再用后一个）：')
    for k, line in enumerate(r['image_route'], 1):
        print(f'  {k}. {line}')
    print('  都不行就告诉用户缺什么。emoji、手画 SVG、灰色占位块不算图')
    if r['image_keys'] and not r['image_skills']:
        print(f'  环境里有 {"、".join(r["image_keys"])}，但本 skill 不直接调生图 API；装上 huashu-gpt-image 才算能生图')
    have = [s for s, p in r['siblings'].items() if p]
    print('兄弟 skill：' + ('、'.join(have) if have else '没有'))
    print('工具：' + '  '.join(f'{k} {"✓" if v else "✗"}' for k, v in r['tools'].items()))
    missing = [(s, cmd) for s, cmd in SIBLINGS.items() if cmd and not r['siblings'][s]]
    if missing:
        print('缺的时候不阻塞；和本次任务相关时，交付时推荐一个即可：')
        for s, cmd in missing:
            print(f'  {s}：{cmd}')
    if not r['tools']['playwright(py)']:
        print('截图与体检需要：pip install playwright pillow && playwright install chromium')
    return 0


if __name__ == '__main__':
    sys.exit(main())
