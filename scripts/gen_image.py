#!/usr/bin/env python3
"""生成一张图放进设计里当素材：借本机的 Codex CLI，或者用用户给的生图 API。

什么时候用：界面或页面里有一处需要图（食物、房间、人物、产品场景、插画、材质），而你所在的环境
自己不能生图（比如 Claude Code）。你所在的环境自带生图工具时（Codex 的 image_gen、WorkBuddy 等），
直接用它，不用绕这个脚本。两条路都没有，才去找开放许可的真图（scripts/fetch_images.py）。
不管哪条路，都不拿 emoji、手画 SVG、灰色占位块顶替一张该有的图。

用法：
  python3 scripts/gen_image.py --prompt "一碗刚出锅的红烧肉，俯拍，深色粗陶碗，自然窗光，背景是旧木桌" \\
      --out 项目/assets/img/braised-pork.png [--size 1200x900] [--ref 参考图.png …] [--timeout 420]

  一次一张，串行跑：Codex 把图先存在它自己的目录里，两个任务同时跑会互相拿错图。
  要几张候选就跑几次、换 --out，然后打开看，挑最合适的一张用。

它怎么确认图是真生成的（只认正面证据）：
  Codex 生成的图会先落在 ~/.codex/generated_images/<本次会话>/。脚本只从那里取本次会话新出现的图，
  再裁到 --size。那里没有新图 = 这次没有生成成功，脚本报 ✗、不留文件。
  这样做是因为拿不到生图能力的 agent 会自己用代码「拼」一张图交差，文件在不在说明不了问题。

两条通道（--via，默认 auto：有 Codex 用 Codex，没有就用 API）：
  codex  装了 codex 并登录过（codex login）。走 Codex 订阅自己的额度；报额度用尽就等一会儿，或换通道。
  api    环境变量里有生图 API 的 key。两家效果最好，优先推荐给用户：
           OPENAI_API_KEY                      → OpenAI GPT-Image 2.6（默认模型名 gpt-image-2.6-sunburst）
           ARK_API_KEY 或 VOLCENGINE_API_KEY   → 火山方舟 Seedream 5.5（默认 doubao-seedream-5-5-261028）
         模型名会随版本变：报「模型不存在」时用 --model 或 HD_IMAGE_MODEL 换成控制台里的名字；
         走兼容网关时设 HD_IMAGE_BASE_URL。按张计费，花的是用户的钱：一处先出一张，不合适再出第二张。
  两条都没有（比如 DeepSeek harness 这类不带生图的环境，本机也没有 Codex）：请用户提供上面任一个 key，
  或者改取开放许可的真图。key 只从环境变量读，不要让用户把 key 贴进对话或写进项目文件。

退出码：0 成功，1 没生成出来，2 环境不具备。
"""

import argparse
import io
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

GEN_DIR = Path.home() / '.codex' / 'generated_images'
IMG_EXT = ('.png', '.jpg', '.jpeg', '.webp')


def build_prompt(prompt, size=None):
    lines = ['用你内置的图片生成能力生成一张图。',
             f'图片内容：{prompt}']
    if size:
        w, h = size
        lines.append(f'画幅比例约 {w}:{h}（{"横" if w > h else "竖" if h > w else "方"}构图）。')
    lines += ['画面里不要出现任何文字、水印、logo、界面元素。',
              '只生成这一张，生成完直接结束，不要追问，不要写任何文件。',
              '如果你没有图片生成能力，只回复 CANNOT_GENERATE，不要用代码、SVG 或任何绘图库画图代替。']
    return '\n'.join(lines)


API = {   # 名字, 接口, 默认模型（2026-11 核对：Seedream 的 ID 来自方舟模型列表接口；GPT-Image 2.6 的 ID 未能用真实 key 核对）
    'openai': ('OpenAI GPT-Image', 'https://api.openai.com/v1', 'gpt-image-2.6-sunburst'),
    'ark': ('火山方舟 Seedream', 'https://ark.cn-beijing.volces.com/api/v3', 'doubao-seedream-5-5-261028'),
}


def api_provider(env=None):
    """环境变量里有哪家的 key。返回 (provider, key) 或 (None, None)。"""
    env = os.environ if env is None else env
    if env.get('OPENAI_API_KEY'):
        return 'openai', env['OPENAI_API_KEY']
    key = env.get('ARK_API_KEY') or env.get('VOLCENGINE_API_KEY')
    return ('ark', key) if key else (None, None)


def api_body(provider, model, prompt, size):
    """两家的请求体。尺寸只给大致画幅，成图再由 fit() 裁到准确像素。"""
    w, h = size or (1, 1)
    if provider == 'openai':
        shape = '1536x1024' if w > h * 1.15 else '1024x1536' if h > w * 1.15 else '1024x1024'
        return {'model': model, 'prompt': prompt, 'size': shape, 'n': 1}
    return {'model': model, 'prompt': prompt, 'size': '2K', 'response_format': 'url', 'watermark': False}


def api_generate(provider, key, prompt, size, model=None, base=None, timeout=240, opener=None):
    """调一次生图接口，返回图片字节。出错抛 RuntimeError（带服务端原话，不带 key）。"""
    import base64
    import json
    import urllib.error
    import urllib.request
    name, default_base, default_model = API[provider]
    base = (base or os.environ.get('HD_IMAGE_BASE_URL') or default_base).rstrip('/')
    model = model or os.environ.get('HD_IMAGE_MODEL') or default_model
    req = urllib.request.Request(base + '/images/generations', data=json.dumps(api_body(provider, model, prompt, size)).encode(),
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    opener = opener or urllib.request.urlopen
    try:
        with opener(req, timeout=timeout) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{name} 返回 {e.code}（模型 {model}）：{e.read().decode("utf-8", "replace")[:240]}')
    except (urllib.error.URLError, OSError) as e:
        raise RuntimeError(f'{name} 连不上：{e}')
    item = (data.get('data') or [{}])[0]
    if item.get('b64_json'):
        return base64.b64decode(item['b64_json'])
    if item.get('url'):
        with opener(urllib.request.Request(item['url']), timeout=timeout) as r:
            return r.read()
    raise RuntimeError(f'{name} 没有返回图片：{json.dumps(data, ensure_ascii=False)[:240]}')


def snapshot(root=None):
    root = root or GEN_DIR
    return {p for p in root.rglob('*') if p.suffix.lower() in IMG_EXT} if root.exists() else set()


def pick_new(before, after, log=''):
    """本次会话新出现的图里最新的一张；没有就是 None。日志里有会话 id 时只认那个会话目录。"""
    new = after - before
    sid = re.search(r'session id:\s*([0-9a-f-]{36})', log or '')
    if sid:
        new = {p for p in new if sid.group(1) in p.parts}
    return max(new, key=lambda p: p.stat().st_mtime) if new else None


def fit(im, size):
    """等比放大到盖住目标尺寸，再居中裁切：不拉伸变形。"""
    w, h = size
    k = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * k)), max(h, round(im.height * k))))
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description='借本机 Codex CLI 生成一张素材图')
    ap.add_argument('--prompt', required=True, help='画面内容：主体、角度、光线、材质、背景，写具体')
    ap.add_argument('--out', required=True)
    ap.add_argument('--size', help='成图像素尺寸，如 1200x900；不给就保留原图')
    ap.add_argument('--ref', action='append', default=[], help='参考图，可多次给')
    ap.add_argument('--timeout', type=int, default=420)
    ap.add_argument('--via', choices=('auto', 'codex', 'api'), default='auto', help='通道：借 Codex，或用环境变量里的生图 API key')
    ap.add_argument('--model', help='API 通道的模型名，默认见文件头')
    a = ap.parse_args(argv)
    provider, key = api_provider()
    has_codex = bool(shutil.which('codex'))
    via = a.via if a.via != 'auto' else ('codex' if has_codex else 'api')
    if (via == 'codex' and not has_codex) or (via == 'api' and not provider):
        print('✗ 这台机器' + ('没有 codex 命令' if via == 'codex' else '的环境变量里没有生图 API 的 key') + '。可以走的路：')
        print('  · 你所在环境自带的生图工具、已装的生图 skill')
        print('  · 请用户提供生图 API 的 key（放进环境变量，不要贴进对话）：OPENAI_API_KEY（GPT-Image 2.6）或 ARK_API_KEY（Seedream 5.5），这两家效果最好')
        print('  · scripts/fetch_images.py 取开放许可的真图')
        return 2
    size = None
    if a.size:
        try:
            size = tuple(int(v) for v in a.size.lower().split('x'))
            assert len(size) == 2 and min(size) > 0
        except (ValueError, AssertionError):
            print(f'✗ --size 写成 宽x高，如 1200x900（收到 {a.size}）')
            return 2
    for r in a.ref:
        if not Path(r).exists():
            print(f'✗ 参考图不存在：{r}')
            return 2
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if via == 'api':
        if a.ref:
            print('  （API 通道暂不传参考图，--ref 已忽略；要参考图就走 --via codex）')
        t0 = time.time()
        try:
            raw = api_generate(provider, key, build_prompt(a.prompt, size).split('\n', 1)[1].replace('只生成这一张，生成完直接结束，不要追问，不要写任何文件。\n', '').split('如果你没有')[0].strip(), size, a.model, timeout=min(a.timeout, 300))
        except RuntimeError as e:
            print(f'✗ {e}')
            print('  模型名不对就用 --model 换成控制台里的名字；额度或余额问题请用户处理。不要用 emoji、手画 SVG 或占位块顶替')
            return 1
        try:
            from PIL import Image
            im = Image.open(io.BytesIO(raw)).convert('RGB')
            if size:
                im = fit(im, size)
            im.save(out)
            dims = f'{im.width}×{im.height}'
        except ImportError:
            out.write_bytes(raw)
            dims = '未裁切（没装 Pillow）'
        print(f'✓ {out}  {dims}  {time.time() - t0:.0f} 秒  （{API[provider][0]}，按张计费）')
        print('  打开看：主体对不对、有没有多出来的手指或文字、和页面的颜色合不合。不合适再改提示词出一张')
        return 0
    cmd = ['codex', 'exec', '--skip-git-repo-check', '-s', 'read-only']
    for r in a.ref:
        cmd += ['-i', str(Path(r).resolve())]
    cmd += ['-']   # 提示词从标准输入读：-i 是变长参数，会把跟在后面的提示词吞掉
    before, t0 = snapshot(), time.time()
    try:
        r = subprocess.run(cmd, input=build_prompt(a.prompt, size), capture_output=True, text=True, timeout=a.timeout)
    except subprocess.TimeoutExpired:
        print(f'✗ {a.timeout} 秒没出图。稍后重试，或换来源')
        return 1
    log = (r.stderr or '') + (r.stdout or '')
    src = pick_new(before, snapshot(), log)
    if src is None:
        why = '它回复没有生图能力' if 'CANNOT_GENERATE' in log else ('额度用尽或被限流' if re.search(r'429|quota|rate.?limit', log, re.I) else '没有生成出图')
        print(f'✗ {why}（{time.time() - t0:.0f} 秒）。Codex 末尾输出：{log.strip()[-240:]}')
        print('  换来源：已装的生图 skill，或 scripts/fetch_images.py 取开放许可的真图。不要用 emoji、手画 SVG 或占位块顶替')
        return 1
    try:
        from PIL import Image
        with Image.open(src) as im:
            im = im.convert('RGB')
            if size:
                im = fit(im, size)
            im.save(out)
            dims = f'{im.width}×{im.height}'
    except ImportError:
        shutil.copyfile(src, out)
        dims = '未裁切（没装 Pillow）'
    print(f'✓ {out}  {dims}  {time.time() - t0:.0f} 秒')
    print('  打开看：主体对不对、有没有多出来的手指或文字、和页面的颜色合不合。不合适就改提示词再生成一张，挑最好的用')
    return 0


if __name__ == '__main__':
    sys.exit(main())
