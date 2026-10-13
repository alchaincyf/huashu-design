#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "requests>=2.28.0",
# ]
# ///
"""
AI看片评审闭环 —— 渲染出的动画MP4喂给视频理解模型（seed-2.0-lite），
按固定checklist逐段送审 + 全片低清扫一遍，汇总成结构化markdown评审报告。

⚠️ 可选云能力：会把压缩后的成片片段发送到火山方舟官方接口（ark.cn-beijing.volces.com）
做视频理解评审，使用你自己的 ARK_API_KEY。首次调用需 --yes 或 HUASHU_CLOUD_OK=1
显式确认。数据流向声明见仓库根 SECURITY.md。本地免费替代：scripts/verify-video.sh 截帧人工看。

Usage:
    uv run ai-review-video.py --video 成片.mp4 --yes
    uv run ai-review-video.py --video 成片.mp4 --context 导演稿.md --yes
    uv run ai-review-video.py --video 成片.mp4 --segment-len 60 --output 报告.md --yes

调用链路：
    1. ffprobe 探测时长/音轨
    2. 有音轨 → ffmpeg silencedetect 提取音效onset时间表（模型听不到视频音轨，
       实测2026-07-17：input_video只送画面。音画对位检查=本地onset+模型画面核对）
    3. 按 --segment-len 切段并压缩（1280宽/15fps/crf28，扁平动画约0.5MB/分钟）
    4. 逐段送审（checklist①-⑧），每段prompt标注原片时间范围
    5. 全片再压一版低清（960宽/10fps）单独送审，专查跨段叙事连贯/hero贯穿
    6. 文本汇总call：按checklist逐项合并，产出最终报告；分段原始发现保留在附录

API key：优先读环境变量 ARK_API_KEY，其次读 skill 根目录 .env（只提取这一个变量），绝不硬编码。
代理：requests session 关闭 trust_env（不继承本机代理配置），免疫 ALL_PROXY 之类残留代理导致的 TLS 报错。
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from base64 import b64encode
from pathlib import Path

import requests

API_URL = "https://ark.cn-beijing.volces.com/api/v3/responses"
DEFAULT_MODEL = "doubao-seed-2-0-lite-260215"
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"  # skill 根目录 .env（已 gitignore）
MAX_SEGMENT_MB = 8  # 单段压缩产物超过这个值就再压一档

CHECKLIST = """\
① 黑帧/空窗/渲染残缺：整帧或大面积黑屏、白屏、元素未渲染出来、明显破图
② 文字问题：字卡/标签被裁切、溢出容器、错字、乱码、字叠字
③ 元素重叠遮挡：不该重叠的元素互相遮挡、层级错误、穿模
④ 叙事连贯性：场景过渡分三类——硬切（前后帧整页突变，无任何衔接）、
   交叉淡入淡出（旧场景透明度渐隐）、morph（元素连续变形/位移到新场景）。
   报告时必须写明你看到的是哪一类，不要把淡入淡出误报成硬切；
   硬切=⚡，淡入淡出在导演稿要求morph时=💡「过渡偷懒」
⑤ hero/主体贯穿性：如果有贯穿全片的主体元素，它是否在场景切换中断裂、消失、突变位置
⑥ 节奏死段：见下方「静止段客观检测表」（ffmpeg逐帧检测，≥3秒完全静止的区间）。
   你的任务不是找死段，而是对表中每个区间判断：是刻意hold（字卡阅读/弹幕停留/收尾定格）
   还是真死段（画面无信息可读还停着）。刻意hold=不报或💡，真死段=⚡
⑦ 音效打点（见下方onset时间表）：核对每个音效时间点画面是否有对应事件
⑧ 构图：明显失衡、大片无意义空白、重要元素贴边或被挤到角落"""

SEVERITY_RULE = """\
严重度分三级：
- ⚠️致命：交付前必须修（黑帧、错字、文字被裁、元素叠死、明显破图）
- ⚡重要：观感明显受损（硬切感、hero断裂、超3秒死段、构图明显失衡）
- 💡建议：锦上添花的改进点"""


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def load_api_key():
    key = os.getenv("ARK_API_KEY")
    if not key and ENV_PATH.exists():
        # 只提取 ARK_API_KEY 一个变量，不把 .env 整文件灌进环境
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("ARK_API_KEY") and "=" in line:
                key = line.split("=", 1)[1].strip().strip("'\"")
                break
    if not key or key.startswith("your_"):
        sys.exit("Error: ARK_API_KEY 未配置（skill 根目录 .env 或环境变量），拒绝继续。不编造评审结果。")
    return key


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"命令失败: {' '.join(cmd)}\n{r.stderr[-2000:]}")
    return r


def probe(video: Path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-show_entries", "stream=codec_type", "-of", "json", str(video)])
    info = json.loads(r.stdout)
    duration = float(info["format"]["duration"])
    has_audio = any(s.get("codec_type") == "audio" for s in info.get("streams", []))
    return duration, has_audio


def detect_audio_onsets(video: Path, noise_db=-45, min_silence=0.3):
    """silencedetect反推音效onset。返回原片秒数列表。"""
    r = subprocess.run(
        ["ffmpeg", "-i", str(video), "-af",
         f"silencedetect=noise={noise_db}dB:d={min_silence}", "-f", "null", "-"],
        capture_output=True, text=True)
    onsets = [round(float(m), 1) for m in
              re.findall(r"silence_end:\s*([\d.]+)", r.stderr)]
    # 片头非静音（开场即有声）时补0
    starts = re.findall(r"silence_start:\s*([\d.-]+)", r.stderr)
    if starts and float(starts[0]) > min_silence:
        onsets.insert(0, 0.0)
    return onsets


def detect_static_segments(video: Path, noise=0.001, min_dur=3.0):
    """freezedetect找≥min_dur秒完全静止的区间。返回[(start,end)]原片秒。"""
    r = subprocess.run(
        ["ffmpeg", "-i", str(video), "-vf",
         f"freezedetect=n={noise}:d={min_dur}", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = re.findall(r"freeze_start:\s*([\d.]+)", r.stderr)
    durs = re.findall(r"freeze_duration:\s*([\d.]+)", r.stderr)
    return [(round(float(s), 1), round(float(s) + float(d), 1))
            for s, d in zip(starts, durs)]


def compress(src: Path, dst: Path, ss=None, t=None, width=1280, fps=15, crf=28):
    cmd = ["ffmpeg", "-y", "-v", "error"]
    if ss is not None:
        cmd += ["-ss", str(ss)]
    if t is not None:
        cmd += ["-t", str(t)]
    cmd += ["-i", str(src), "-vf", f"scale={width}:-2,fps={fps}",
            "-c:v", "libx264", "-crf", str(crf), "-preset", "veryfast",
            "-pix_fmt", "yuv420p", "-an", str(dst)]
    run(cmd)


def fmt_ts(sec: float) -> str:
    return f"{int(sec) // 60}:{int(sec) % 60:02d}"


def ask_model(session, api_key, model, prompt, video_path: Path | None = None, retries=1):
    content = []
    if video_path is not None:
        b64 = b64encode(video_path.read_bytes()).decode()
        content.append({"type": "input_video", "video_url": f"data:video/mp4;base64,{b64}"})
    content.append({"type": "input_text", "text": prompt})
    payload = {"model": model, "input": [{"role": "user", "content": content}]}
    last_err = None
    for attempt in range(retries + 1):
        try:
            resp = session.post(
                API_URL, json=payload, timeout=600,
                headers={"Authorization": f"Bearer {api_key}",
                         "Content-Type": "application/json"})
            if resp.status_code != 200:
                last_err = f"API {resp.status_code}: {resp.text[:500]}"
                continue
            data = resp.json()
            usage = data.get("usage", {})
            text = ""
            out = data.get("output")
            if isinstance(out, list):
                for item in out:
                    if isinstance(item, dict) and item.get("type") == "message":
                        for c in item.get("content", []):
                            if isinstance(c, dict) and c.get("type") == "output_text":
                                text += c.get("text", "")
            elif isinstance(out, str):
                text = out
            if not text:
                choices = data.get("choices", [])
                if choices:
                    text = choices[0].get("message", {}).get("content", "")
            if text:
                return text, usage
            last_err = f"响应无文本: {json.dumps(data, ensure_ascii=False)[:500]}"
        except requests.RequestException as e:
            last_err = f"网络错误: {e}"
        if attempt < retries:
            log(f"  重试（{last_err[:120]}）...")
            time.sleep(3)
    raise RuntimeError(last_err)


def segment_prompt(seg_start, seg_end, duration, context_text, onsets_in_seg,
                   statics_in_seg):
    p = [f"你是动画成片质检员，任务是严格挑毛病，不夸片子。",
         f"这段视频是一部总长{fmt_ts(duration)}的动画成片的一个片段，"
         f"对应原片 {fmt_ts(seg_start)}–{fmt_ts(seg_end)}。"
         f"片段内第t秒 = 原片第{fmt_ts(seg_start)}+t秒，报告里一律用原片时间（分:秒）。"]
    if context_text:
        p.append("以下是全片导演稿（评审上下文，用来判断叙事意图和该出现什么）：\n"
                 "<导演稿>\n" + context_text + "\n</导演稿>")
    p.append("逐项检查以下checklist，只报本片段内的发现：\n" + CHECKLIST)
    if statics_in_seg:
        ts = "、".join(f"{fmt_ts(a)}–{fmt_ts(b)}（{b - a:.1f}s）" for a, b in statics_in_seg)
        p.append(f"⑥的静止段客观检测表（本段内，原片时间）：{ts}。逐个判断刻意hold还是真死段。")
    else:
        p.append("本片段内无≥3秒静止段，⑥直接写「未发现」。")
    if onsets_in_seg:
        ts = "、".join(f"{fmt_ts(t)}({t}s)" for t in onsets_in_seg)
        p.append(f"⑦的onset时间表（本段内音效实际出现的原片时间）：{ts}。"
                 f"你听不到声音，只需核对这些时间点画面上是否有值得配音效的事件"
                 f"（转场/字卡落定/撞击/元素出现），没有对应事件的时间点=音效打空，要报。")
    else:
        p.append("本片段内没有检测到音效onset，⑦跳过；但如果本段有强烈画面事件"
                 "（撞击/字卡/转场）却无音效覆盖，可在⑦下用💡提出。")
    p.append(SEVERITY_RULE)
    p.append("输出格式：markdown。按①-⑧逐项，每项下用列表：\n"
             "- [原片分:秒] 严重度emoji 具体描述\n"
             "该项无问题就写「未发现」。只报你真正看到的，不确定的标「存疑」，不编造。")
    return "\n\n".join(p)


def global_prompt(duration, context_text):
    p = ["你是动画成片质检员。这是一部动画成片的全片低清版（评审用压缩，画质低是正常的，"
         "不要报画质/清晰度问题），总长" + fmt_ts(duration) + "。"]
    if context_text:
        p.append("导演稿：\n<导演稿>\n" + context_text + "\n</导演稿>")
    p.append("只做三件事（细节问题已有分段评审负责，你不用管）：\n"
             "A. 叙事连贯性：从头到尾看，哪些时间点是PowerPoint式硬切（整页突变无过渡）？\n"
             "B. hero/主体贯穿性：贯穿全片的主体元素在哪些切换处断裂、消失或突变？\n"
             "C. 整体节奏：哪些区间拖（长时间无新信息）、哪些区间赶？\n\n"
             + SEVERITY_RULE +
             "\n\n输出markdown，A/B/C三节，发现带[分:秒]时间点。无问题写「未发现」。不编造。")
    return "\n\n".join(p)


def synthesis_prompt(duration, seg_reports, global_report):
    parts = ["你是评审报告主编。下面是同一部" + fmt_ts(duration) +
             "动画成片的分段评审 + 全片评审原始记录，把它们合并成一份最终报告正文。",
             "要求：\n"
             "1. 按checklist①-⑧逐项组织，每项下按时间顺序列发现：- [分:秒] 严重度 描述\n"
             "2. 同一问题被多段重复报的合并成一条；分段与全片评审矛盾时两说并存标「存疑」\n"
             "3. 保留每条发现的时间点和严重度emoji（⚠️/⚡/💡），不新增原始记录里没有的发现\n"
             "4. 开头给一个「问题总数：⚠️x ⚡y 💡z」的统计行和三句话以内的总评\n"
             "5. 只输出报告正文markdown，不要客套话",
             "<全片评审>\n" + global_report + "\n</全片评审>"]
    for (s, e, text) in seg_reports:
        parts.append(f"<分段评审 原片{fmt_ts(s)}–{fmt_ts(e)}>\n{text}\n</分段评审>")
    return "\n\n".join(parts)


def main():
    ap = argparse.ArgumentParser(description="AI看片评审：动画MP4 → checklist结构化评审报告")
    ap.add_argument("--video", required=True, help="成片路径（mp4）")
    ap.add_argument("--context", help="导演稿/分幕说明md路径（可选，作为评审上下文）")
    ap.add_argument("--segment-len", type=int, default=60, help="分段长度秒（默认60）")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"模型（默认{DEFAULT_MODEL}）")
    ap.add_argument("--output", "-o", help="报告路径（默认视频同目录<视频名>-AI评审.md）")
    ap.add_argument("--yes", action="store_true",
                    help="确认将压缩后的视频段发送到火山方舟官方接口（或设 HUASHU_CLOUD_OK=1）")
    args = ap.parse_args()

    video = Path(args.video).resolve()
    if not video.exists():
        sys.exit(f"Error: 视频不存在 {video}")

    if not args.yes and os.getenv("HUASHU_CLOUD_OK") != "1":
        sys.exit(
            f"[云能力确认] 本次将把 {video.name} 压缩后分段发送到 ark.cn-beijing.volces.com"
            "（火山方舟官方接口，使用你自己的 ARK_API_KEY 做视频理解评审）。\n"
            "确认无误请重跑并加 --yes，或设置环境变量 HUASHU_CLOUD_OK=1。"
            "数据流向声明见 SECURITY.md；本地免费替代：scripts/verify-video.sh。")
    out_path = Path(args.output) if args.output else video.parent / f"{video.stem}-AI评审.md"

    context_text = ""
    if args.context:
        ctx = Path(args.context)
        if not ctx.exists():
            sys.exit(f"Error: 上下文文件不存在 {ctx}")
        context_text = ctx.read_text(encoding="utf-8")[:12000]

    api_key = load_api_key()
    session = requests.Session()
    session.trust_env = False  # 免疫 ALL_PROXY 等代理坑

    duration, has_audio = probe(video)
    log(f"视频 {fmt_ts(duration)}，音轨={'有' if has_audio else '无'}")

    onsets = detect_audio_onsets(video) if has_audio else []
    if has_audio:
        log(f"音效onset检测：{len(onsets)}个 → {['%.1f' % t for t in onsets]}")

    # 静止段客观检测（相邻区间合并）
    raw_statics = detect_static_segments(video)
    statics = []
    for a, b in raw_statics:
        if statics and a - statics[-1][1] < 0.2:
            statics[-1] = (statics[-1][0], b)
        else:
            statics.append((a, b))
    log(f"静止段检测（≥3s）：{len(statics)}个 → "
        f"{[f'{a:.0f}-{b:.0f}s' for a, b in statics]}")

    total_usage = {"input_tokens": 0, "output_tokens": 0}

    def add_usage(u):
        for k in total_usage:
            total_usage[k] += u.get(k, 0) or 0

    seg_reports, failures = [], []
    with tempfile.TemporaryDirectory(prefix="ai-review-") as tmp:
        tmp = Path(tmp)
        # 分段
        bounds = []
        t0 = 0.0
        while t0 < duration - 1:
            bounds.append((t0, min(t0 + args.segment_len, duration)))
            t0 += args.segment_len
        log(f"分段：{len(bounds)}段 × ≤{args.segment_len}s")

        for i, (s, e) in enumerate(bounds, 1):
            seg = tmp / f"seg{i}.mp4"
            compress(video, seg, ss=s, t=e - s)
            if seg.stat().st_size > MAX_SEGMENT_MB * 1024 * 1024:
                compress(video, seg, ss=s, t=e - s, width=960, fps=10, crf=32)
            mb = seg.stat().st_size / 1048576
            onsets_in = [t for t in onsets if s <= t < e]
            statics_in = [(a, b) for a, b in statics if a < e and b > s]
            log(f"段{i} {fmt_ts(s)}–{fmt_ts(e)}（{mb:.1f}MB，onset×{len(onsets_in)}，"
                f"静止段×{len(statics_in)}）送审...")
            try:
                text, usage = ask_model(session, api_key, args.model,
                                        segment_prompt(s, e, duration, context_text,
                                                       onsets_in, statics_in),
                                        seg)
                add_usage(usage)
                seg_reports.append((s, e, text))
            except RuntimeError as err:
                log(f"  段{i}送审失败：{err}")
                failures.append((s, e, str(err)))

        # 全片低清pass
        log("全片低清版送审（叙事/hero/节奏）...")
        full = tmp / "full.mp4"
        compress(video, full, width=960, fps=10, crf=30)
        global_report, global_fail = "", None
        try:
            global_report, usage = ask_model(session, api_key, args.model,
                                             global_prompt(duration, context_text), full)
            add_usage(usage)
        except RuntimeError as err:
            global_fail = str(err)
            log(f"  全片pass失败：{err}")

    if not seg_reports and not global_report:
        sys.exit("Error: 所有送审调用均失败，无法产出报告。不编造评审结果。\n" +
                 "\n".join(f"{fmt_ts(s)}–{fmt_ts(e)}: {m}" for s, e, m in failures))

    # 汇总
    log("汇总最终报告...")
    try:
        body, usage = ask_model(session, api_key, args.model,
                                synthesis_prompt(duration, seg_reports,
                                                 global_report or "（全片pass调用失败，无记录）"))
        add_usage(usage)
    except RuntimeError as err:
        log(f"汇总call失败（{err}），退化为原始记录拼接")
        body = "> 汇总call失败，以下为各pass原始记录直接拼接。\n\n" + \
               (global_report or "") + "\n\n" + \
               "\n\n".join(f"## 分段 {fmt_ts(s)}–{fmt_ts(e)}\n{t}" for s, e, t in seg_reports)

    lines = [f"# {video.name} · AI评审报告",
             "",
             f"> 模型：{args.model} | 评审时间：{time.strftime('%Y-%m-%d %H:%M')} | "
             f"片长：{fmt_ts(duration)} | 分段：{len(seg_reports)}成功/{len(failures)}失败 | "
             f"音效onset：{len(onsets)}个 / 静止段≥3s：{len(statics)}个"
             f"（均为本地ffmpeg客观检测；模型不闻声，音画对位=onset+画面核对） | "
             f"tokens：in {total_usage['input_tokens']} / out {total_usage['output_tokens']}",
             ""]
    if failures:
        lines.append("> ⚠️ 以下时间段送审失败，未被评审覆盖：" +
                     "；".join(f"{fmt_ts(s)}–{fmt_ts(e)}（{m[:100]}）" for s, e, m in failures))
        lines.append("")
    if global_fail:
        lines.append(f"> ⚠️ 全片连贯性pass调用失败：{global_fail[:200]}")
        lines.append("")
    lines.append(body)
    lines.append("\n\n---\n\n## 附录 · 客观检测数据（ffmpeg，非模型判断）\n")
    lines.append("静止段≥3s：" + ("、".join(
        f"{fmt_ts(a)}–{fmt_ts(b)}（{b - a:.1f}s）" for a, b in statics) or "无"))
    lines.append("\n音效onset：" + ("、".join(fmt_ts(t) for t in onsets) or "无/无音轨"))
    lines.append("\n## 附录 · 各段原始评审记录\n")
    if global_report:
        lines.append("### 全片pass（叙事/hero/节奏）\n\n" + global_report + "\n")
    for s, e, t in seg_reports:
        lines.append(f"### 分段 原片{fmt_ts(s)}–{fmt_ts(e)}\n\n{t}\n")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    log(f"报告已写入: {out_path}")
    print(out_path)


if __name__ == "__main__":
    main()
