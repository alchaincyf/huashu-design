# 音频设计规则 · huashu-design

> 所有动画 demo 的音频应用配方。和 `sfx-library.md`（资产清单）配套使用。
> 实战锤炼：huashu-design 发布 hero v1-v9 迭代 · Anthropic 三支官方片子的 Gemini 深度拆解 · 8000+ 次 A/B 对比

---

## 核心原则 · 音频双轨制（铁律）

动画音频**必须分两层独立设计**，不能只做一层：

| 层 | 作用 | 时间尺度 | 和视觉的关系 | 占据频段 |
|---|---|---|---|---|
| **SFX（节拍层）** | 标记每个视觉 beat | 0.2-2 秒短促 | **强同步**（帧级对齐） | **高频 800Hz+** |
| **BGM（氛围底）** | 情绪铺底、声场 | 连续 20-60 秒 | 弱同步（段落级） | **中低频 <4kHz** |

**只做BGM的动画是残废的**——观众潜意识感知到「画在动但没声音响应」，廉价感的根源就在这里。

---

## 金标准 · 黄金配比

这几组数值是实测 Anthropic 三支官方片子 + 我们自己 v9 定版对比得出的**工程硬参数**，直接套用即可：

### 音量
- **BGM 音量**：`0.40-0.50`（相对满刻度 1.0）
- **SFX 音量**：`1.00`
- **响度差**：BGM 比 SFX peak **低 -6 到 -8 dB**（不是靠SFX绝对响度突出，靠响度差）
- **amix 参数**：`normalize=0`（绝不用 normalize=1，会把动态范围压平）

### 频段隔离（P1 硬优化）
Anthropic 的秘诀不是「SFX 音量大」，是**频段分层**：

```bash
[bgm_raw]lowpass=f=4000[bgm]      # BGM 限制在 <4kHz 的中低频
[sfx_raw]highpass=f=800[sfx]      # SFX 推到 800Hz+ 的中高频
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]
```

为什么：人耳对 2-5kHz 区间最敏感（即「presence 频段」），SFX 如果都在这个区间，BGM 又全频段覆盖，**SFX 会被BGM的高频部分遮盖**。用 highpass 把 SFX 推高 + lowpass 把 BGM 压下，两者在频谱上各占一方，SFX 清晰度直接上一档。

### Fade
- BGM 入：`afade=in:st=0:d=0.3`（0.3s，避免硬切）
- BGM 出：`afade=out:st=N-1.5:d=1.5`（1.5s 长尾，收束感）
- SFX 自带 envelope，不需要额外 fade

---

## SFX cue 设计规则

### 密度（每10秒多少个SFX）
实测 Anthropic 三支片子的 SFX 密度有三档：

| 片子 | 每10s SFX 数 | 产品性格 | 场景 |
|---|---|---|---|
| Artifacts（ref-1） | **~9个/10s** | 功能密集、信息多 | 复杂工具演示 |
| Code Desktop（ref-2） | **0个** | 纯氛围、冥想感 | 开发工具专注状态 |
| Word（ref-3） | **~4个/10s** | 平衡、办公节奏 | 生产力工具 |

**启发式**：
- 产品性格冷静/专注 → SFX 密度低（0-3个/10s），BGM 为主
- 产品性格活泼/信息多 → SFX 密度高（6-9个/10s），SFX 驱动节奏
- **不要填满每个视觉 beat**——留白比密集更高级。**删掉 30-50% 的 cue 会让剩下的更有戏剧性**。

### Cue 选择优先级
每个视觉 beat 不都要配 SFX。按这个优先级选：

**P0 必配**（省略会有违和感）：
- 打字（终端/输入）
- 点击/选择（用户决策时刻）
- 焦点切换（视觉主角转移）
- Logo reveal（品牌收束）

**P1 推荐配**：
- 元素入场/离场（modal / card）
- 完成/成功反馈
- AI 生成开始/结束
- 重大过渡（scene 切换）

**P2 选配**（多了会乱）：
- hover / focus-in
- 进度 tick
- 装饰性 ambient

### 时间戳对齐精度
- **同帧对齐**（0ms 误差）：点击/焦点切换/Logo 落定
- **前置 1-2 帧**（-33ms）：快速 whoosh（给观众心理预期）
- **后置 1-2 帧**（+33ms）：物体落地/impact（符合真实物理）

---

## BGM 选择决策树

huashu-design skill 自带 6 首 BGM（`assets/bgm-*.mp3`）：

```
动画性格是什么？
├─ 产品发布 / 技术演示 → bgm-tech.mp3（minimal synth + piano）
├─ 教程讲解 / 工具使用 → bgm-tutorial.mp3（warm, instructional）
├─ 教育学习 / 原理解释 → bgm-educational.mp3（curious, thoughtful）
├─ 营销广告 / 品牌宣传 → bgm-ad.mp3（upbeat, promotional）
└─ 同类风格需要变体 → bgm-*-alt.mp3（各自替代版）
```

### 无 BGM 的场景（值得考虑）
参考 Anthropic Code Desktop（ref-2）：**0 SFX + 纯 Lo-fi BGM** 也能很高级。

**何时选无BGM**：
- 动画时长 <10s（BGM 建立不起来）
- 产品性格是「专注/冥想」
- 场景本身有环境音/讲解声
- SFX 密度很高时（避免听觉过载）

---

## 场景配方（开箱即用）

### 配方 A · 产品发布 hero（huashu-design v9 同款）
```
时长：25 秒
BGM：bgm-tech.mp3 · 45% · 频段 <4kHz
SFX 密度：~6个/10s

cue：
  终端打字 → type × 4（间隔0.6s）
  回车     → enter
  卡片汇聚 → card × 4（错峰 0.2s）
  选中     → click
  Ripple   → whoosh
  4次焦点  → focus × 4
  Logo     → thud（1.5s）

音量：BGM 0.45 / SFX 1.0 · amix normalize=0
```

### 配方 B · 工具功能演示（参考 Anthropic Code Desktop）
```
时长：30-45 秒
BGM：bgm-tutorial.mp3 · 50%
SFX 密度：0-2个/10s（极少）

策略：让 BGM + 讲解 voiceover 驱动，SFX 只在**决定性时刻**（文件保存/命令执行完成）
```

### 配方 C · AI 生成演示
```
时长：15-20 秒
BGM：bgm-tech.mp3 或无 BGM
SFX 密度：~8个/10s（高密度）

cue：
  用户输入 → type + enter
  AI 开始处理 → magic/ai-process（1.2s 循环）
  生成完成 → feedback/complete-done
  结果呈现 → magic/sparkle
  
亮点：ai-process 可以循环 2-3 次贯穿整个生成过程
```

### 配方 D · 纯氛围长镜头（参考 Artifacts）
```
时长：10-15 秒
BGM：无
SFX：单独使用 3-5 个精心设计的 cue

策略：每个 SFX 都是主角，没有BGM「糊在一起」的问题。
适合：单产品慢镜头、特写展示
```

---

## ffmpeg 合成模板

### 模板 1 · 单 SFX 叠加到视频
```bash
ffmpeg -y -i video.mp4 -itsoffset 2.5 -i sfx.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0[a]" \
  -map 0:v -map "[a]" output.mp4
```

### 模板 2 · 多 SFX 时间轴合成（按cue时间对齐）
```bash
ffmpeg -y \
  -i sfx-type.mp3 -i sfx-enter.mp3 -i sfx-click.mp3 -i sfx-thud.mp3 \
  -filter_complex "\
[0:a]adelay=1100|1100[a0];\
[1:a]adelay=3200|3200[a1];\
[2:a]adelay=7000|7000[a2];\
[3:a]adelay=21800|21800[a3];\
[a0][a1][a2][a3]amix=inputs=4:duration=longest:normalize=0[mixed]" \
  -map "[mixed]" -t 25 sfx-track.mp3
```
**关键参数**：
- `adelay=N|N`：前面是左声道延迟(ms)，后面是右声道，写两遍保证立体声对齐
- `normalize=0`：保留动态范围，关键！
- `-t 25`：截断到指定时长

### 模板 3 · 视频 + SFX track + BGM（带频段隔离）
```bash
ffmpeg -y -i video.mp4 -i sfx-track.mp3 -i bgm.mp3 \
  -filter_complex "\
[2:a]atrim=0:25,afade=in:st=0:d=0.3,afade=out:st=23.5:d=1.5,\
     lowpass=f=4000,volume=0.45[bgm];\
[1:a]highpass=f=800,volume=1.0[sfx];\
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k final.mp4
```

---

## 失败模式速查

| 症状 | 根因 | 修复 |
|---|---|---|
| SFX 听不见 | BGM 高频部分遮盖 | 加 `lowpass=f=4000` 给BGM + `highpass=f=800` 给SFX |
| 音效过响刺耳 | SFX 绝对音量太大 | SFX 音量降到 0.7，同时降低 BGM 到 0.3，保持差值 |
| BGM 和 SFX 节奏冲突 | BGM 选错了（用了有强beat的music） | 换成 ambient / minimal synth 的 BGM |
| 动画结束 BGM 突然断 | 没做 fade out | `afade=out:st=N-1.5:d=1.5` |
| SFX 重叠成糊 | cue 太密 + 每个 SFX 时长太长 | SFX 时长控到 0.5s 以内，cue 间隔 ≥ 0.2s |
| 公众号 mp4 没声音 | 公众号有时会 mute auto-play | 不用担心，用户点开会有声音；gif 本来就没声音 |

---

## 和视觉的联动（高级）

### SFX 音色要和视觉风格匹配
- 暖米/纸张感视觉 → SFX 用**木质/柔和**音色（Morse, paper snap, soft click）
- 冷黑科技视觉 → SFX 用**金属/数字**音色（beep, pulse, glitch）
- 手绘/童趣视觉 → SFX 用**卡通/夸张**音色（boing, pop, zap）

我们当前 `apple-gallery-showcase.md` 的暖米底色 → 搭配 `keyboard/type.mp3`（mechanical）+ `container/card-snap.mp3`（soft）+ `impact/logo-reveal-v2.mp3`（cinematic bass）

### SFX 可以引导视觉节奏
高级技巧：**先设计 SFX 时间轴，然后调整视觉动画去对齐 SFX**（不是反过来）。
因为 SFX 每个 cue 都是一个「钟表 tick」，视觉动画适配 SFX 节奏会非常稳——反之 SFX 去追视觉，常常 ±1 帧对不上就有违和感。

---

## 质量检查清单（发布前自检）

- [ ] 响度差：SFX peak - BGM peak = -6 到 -8 dB？
- [ ] 频段：BGM lowpass 4kHz + SFX highpass 800Hz？
- [ ] amix normalize=0（保留动态范围）？
- [ ] BGM fade-in 0.3s + fade-out 1.5s？
- [ ] SFX 数量是否合适（按场景性格选密度）？
- [ ] 每个 SFX 和视觉 beat 同帧对齐（±1 帧内）？
- [ ] Logo reveal 音效时长够（建议 1.5s）？
- [ ] 关闭 BGM 听一遍：SFX 单独是否足够有节奏感？
- [ ] 关闭 SFX 听一遍：BGM 单独是否有情绪起伏？

两层任何一层单独听都应该自洽。如果只有两层叠加才好听，说明没做好。

---

## 参考

- SFX 资产清单：`sfx-library.md`
- 视觉风格参考：`apple-gallery-showcase.md`
- Anthropic 三支片子深度音频分析：AUDIO-BEST-PRACTICES.md（作者本地资料，未随仓库分发）
- huashu-design v9 实战案例：hero-animation-v9-final.mp4（作者本地样本，未随仓库分发）
