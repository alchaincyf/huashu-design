---
title: md还是html，这是个蠢问题
gap: 0.5
---

## opening
前两天，[[cue:thariq]]Claude Code 团队的 Thariq 发了篇爆文。
标题就一句话，HTML 是新的 markdown。
他说他几乎不再写 md 文件了，全让 AI 给他生成 HTML。
500 万阅读，X 上立马吵翻了。
一派是 md 党，[[cue:two-camps]]觉得 md 才是 AI 时代的源代码。
另一派觉得 Thariq 说得对，HTML 才是终极答案。

## md-side
md 党的证据其实挺硬的。
你看 OpenAI 去年发的 AGENTS.md，[[cue:agents-md]]60000 多个项目用，AWS、Anthropic、Google、微软、OpenAI，AI 半壁江山一起捐进 Linux Foundation 做开放标准。
Karpathy 的 llm-wiki，主体就是三层 markdown，单一个 CLAUDE.md 文件，5 万 star。
Cloudflare 实测过一组数据，[[cue:token-saving]]同一篇博客，HTML 一万六千 token，转成 md 只要三千。
省 80%。
GitHub 官方也讲过一句，文档不再是描述代码，[[cue:doc-is-code]]文档就是代码。

## html-side
但 html 党也没说错。
Thariq 那篇文章里几条论据我都同意。
第一是空间信息。[[cue:spatial]]diff、调用图、架构图，本来就是有空间维度的，md 把它压成一行字，html 能左右对照，理解效率不是一个量级的。
第二是动态体验。[[cue:dynamic]]做产品原型，按钮按下去什么颜色、什么 easing 曲线，文字描述再多没用，html 能让你直接看见。
第三是结构化阅读。[[cue:structured]]可折叠章节、tab 代码块、边栏术语表，跟同样的字线性堆一遍是两种东西。
Anthropic 现在的 Live Artifacts，HTML 已经从静态产物升级成可以交互、能拉实时数据的 dashboard。

## the-real-question
我看完想说，[[cue:reveal]]这俩根本是在争一个蠢问题。
两边都赢了。
但赢的是不同的问题。
md 党回答的是，[[cue:question-md]]我们用什么写。
html 党回答的是，[[cue:question-html]]我们给人什么看。
这是两个问题。
怎么会有谁取代谁。

## the-split
我觉得真问题是这个。
md 和 html 不是替代关系，[[cue:split]]是分工关系。
以前你写 md 自己也看 md。
那时候要折中，所以 md 胜出。
但 AI 出现后，[[cue:ai-changes]]第一次有了一个新情况。
生产成本可以被 AI 吸收。
HTML 那部分太重的代价，AI 替你扛。
你只负责消费。
原来要折中的需求，被拆成了两端的极端最优。
生产端要轻、要快、要 token efficient，[[cue:md-side-win]]那就是 md。
消费端要丰富、要可视化、要好分享，[[cue:html-side-win]]那就是 html。
两端各自登顶。
中间那个折中位置，没人需要了。

## activity-proof
最干净的活样本是 Thariq 自己。
3 月份他发了篇 Skills 指南，[[cue:thariq-march]]强调核心还是 markdown。
5 月份他发了 HTML 是新 markdown。
同一个人，[[cue:same-person]]两端各自登顶，互不打架。
Karpathy 和 Lex Fridman 那对组合也一样。
内核是 markdown wiki，[[cue:karpathy-lex]]外壳是动态 HTML。
不是 Lex 替换了 Karpathy，是他在 Karpathy 的基础上加了一层消费层。

## closing
所以下次你想吵这个的时候，[[cue:final]]先问自己一句。
你现在面对的是「写」，还是「看」。
写，[[cue:md-final]]用 md。
看，[[cue:html-final]]用 html。
工具替你处理切换。
立场可以放下了。
