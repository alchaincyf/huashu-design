// Copyright (c) 2026 alchaincyf (花叔). MIT License.
//
// 独立实现：按一份只描述输入、输出和可观察行为的规格从零编写，实现过程中没有
// 查看其他 html2pptx 的源码。依赖 Playwright 与 pptxgenjs 两个公开库。
//
// 职责：把一页 960pt×540pt（约定俗成，实际以 body 尺寸为准）的 HTML，用 Playwright
// 起一个真实 Chromium 打开、量出每个元素的渲染结果（位置/尺寸/computed style），
// 翻译成 pptxgenjs 的原生可编辑对象（文本框 / 形状 / 线条 / 图片）。

'use strict';

const path = require('path');
const { chromium } = require('playwright');

// ---- 单位换算常量 ----
const PT_PER_PX = 0.75; // CSS px -> pt
const IN_PER_PX = 1 / 96; // CSS px -> inch
const EMU_PER_INCH = 914400;

function toPt(px) {
  return px * PT_PER_PX;
}
function toIn(px) {
  return px * IN_PER_PX;
}

// ============================================================================
// 浏览器内提取逻辑：作为字符串函数整体交给 page.evaluate 执行，运行在页面上下文里，
// 不能依赖外层闭包变量（Playwright 序列化 Function.toString() 后在浏览器里重新求值）。
// ============================================================================
function extractPageDataInBrowser() {
  const PT_PER_PX = 0.75;
  function toPt(px) {
    return px * PT_PER_PX;
  }
  function toIn(px) {
    return px / 96;
  }
  const SINGLE_WEIGHT_FONTS = ['impact'];
  const INLINE_TAGS = new Set(['SPAN', 'B', 'STRONG', 'I', 'EM', 'U']);
  const TEXT_TAG_BG_CHECK = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI']);
  const TEXT_ELEMENT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI']);
  const MANUAL_BULLET_CHARS_VALIDATE = ['•', '-', '*', '▪', '▸', '○', '●', '◆', '◇', '■', '□'];
  const MANUAL_BULLET_CHARS_STRIP = ['•', '-', '*', '▪', '▸'];

  const errors = [];
  const elements = [];
  const placeholders = [];
  const consumed = new Set();

  // ---- 基础工具 ----
  function parsePx(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  function truncate(str, max) {
    if (str.length <= max) return str;
    return str.slice(0, max) + '...';
  }

  function collapseWs(s) {
    return s.replace(/[\t\n\r ]+/g, ' ');
  }

  function parseColorString(str) {
    if (!str) return null;
    const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(str);
    if (!m) return null;
    const r = Math.max(0, Math.min(255, Math.round(parseFloat(m[1]))));
    const g = Math.max(0, Math.min(255, Math.round(parseFloat(m[2]))));
    const b = Math.max(0, Math.min(255, Math.round(parseFloat(m[3]))));
    const hasAlpha = m[4] !== undefined;
    const alpha = hasAlpha ? parseFloat(m[4]) : 1;
    const hex = [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
    return { hex, alpha, hasAlpha };
  }

  function isVisibleColor(c) {
    return !!c && c.alpha > 0;
  }

  // {color, transparency?} —— 只有解析出显式 alpha 通道时才带 transparency
  function fillFieldOf(c) {
    const out = { color: c.hex };
    if (c.hasAlpha) out.transparency = Math.round((1 - c.alpha) * 100);
    return out;
  }

  function firstFontFamily(v) {
    if (!v) return '';
    const first = v.split(',')[0].trim();
    return first.replace(/^["']|["']$/g, '');
  }

  function isSingleWeightFont(fontFace) {
    return SINGLE_WEIGHT_FONTS.indexOf((fontFace || '').toLowerCase()) !== -1;
  }

  function normalizeAlign(v) {
    return v === 'start' ? 'left' : v;
  }

  function parseLineHeightPt(lineHeightStr, fontSizePt) {
    const v = parseFloat(lineHeightStr);
    if (!isNaN(v) && /px\s*$/.test(String(lineHeightStr).trim())) {
      return v * PT_PER_PX;
    }
    // 防御性兜底：真实 Chromium 的 computed line-height 基本总是已解析的 px 值，
    // 这里的 fontSize*1.2 分支理论上不会命中。
    return fontSizePt * 1.2;
  }

  function applyTextTransform(str, tt) {
    if (tt === 'uppercase') return str.toUpperCase();
    if (tt === 'lowercase') return str.toLowerCase();
    if (tt === 'capitalize') return str.replace(/\b\w/g, (c) => c.toUpperCase());
    return str;
  }

  function getBordersInfo(cs) {
    return {
      top: { w: parsePx(cs.borderTopWidth), c: cs.borderTopColor },
      right: { w: parsePx(cs.borderRightWidth), c: cs.borderRightColor },
      bottom: { w: parsePx(cs.borderBottomWidth), c: cs.borderBottomColor },
      left: { w: parsePx(cs.borderLeftWidth), c: cs.borderLeftColor },
    };
  }

  function computeRectRadius(cs, widthPx, heightPx) {
    const raw = (cs.borderTopLeftRadius || '0px').trim();
    const m = /^(-?[\d.]+)(px|pt|%)?$/.exec(raw);
    if (!m) return 0;
    const val = parseFloat(m[1]);
    const unit = m[2] || 'px';
    if (!val) return 0;
    if (unit === '%') {
      if (val >= 50) return 1;
      return ((val / 100) * Math.min(widthPx, heightPx)) / 96;
    }
    if (unit === 'pt') return val / 72;
    return val / 96;
  }

  function parseBoxShadow(str) {
    if (!str || str === 'none') return null;
    if (/inset/i.test(str)) return null;
    const colorMatch = str.match(/rgba?\([^)]+\)/i);
    const colorParsed = colorMatch ? parseColorString(colorMatch[0]) : null;
    const withoutColor = colorMatch ? str.replace(colorMatch[0], '') : str;
    const nums = withoutColor.match(/-?[\d.]+px/g) || [];
    if (nums.length < 2) return null;
    const vals = nums.map((s) => parseFloat(s));
    const offsetX = vals[0];
    const offsetY = vals[1];
    const blur = vals[2] || 0;
    const offsetPt = Math.hypot(offsetX, offsetY) * PT_PER_PX;
    let angleDeg = (Math.atan2(offsetY, offsetX) * 180) / Math.PI;
    angleDeg = ((angleDeg % 360) + 360) % 360;
    const blurPt = blur * PT_PER_PX;
    const color = colorParsed ? colorParsed.hex : '000000';
    const opacity = colorParsed && colorParsed.hasAlpha ? colorParsed.alpha : 0.5;
    return { type: 'outer', angle: angleDeg, blur: blurPt, color, offset: offsetPt, opacity };
  }

  function violationOf(el) {
    const cs = getComputedStyle(el);
    const bg = parseColorString(cs.backgroundColor);
    if (isVisibleColor(bg)) return 'background';
    const b = getBordersInfo(cs);
    if (b.top.w > 0 || b.right.w > 0 || b.bottom.w > 0 || b.left.w > 0) return 'border';
    if (cs.boxShadow && cs.boxShadow !== 'none') return 'shadow';
    return null;
  }

  // ---- 旋转角度 + 位置/尺寸（4.5 节） ----
  function computeRotationDeg(cs) {
    let angle = 0;
    if (cs.writingMode === 'vertical-rl') angle += 90;
    else if (cs.writingMode === 'vertical-lr') angle += 270;
    const t = cs.transform;
    if (t && t !== 'none') {
      const rm = /rotate\(([-\d.]+)deg\)/.exec(t);
      if (rm) {
        angle += parseFloat(rm[1]);
      } else {
        const mm = /matrix\(([^)]+)\)/.exec(t);
        if (mm) {
          const parts = mm[1].split(',').map((s) => parseFloat(s.trim()));
          angle += (Math.atan2(parts[1], parts[0]) * 180) / Math.PI;
        }
      }
    }
    return ((angle % 360) + 360) % 360;
  }

  function computeGeometryPx(el, rotationDeg) {
    const r = el.getBoundingClientRect();
    if (rotationDeg === 90 || rotationDeg === 270) {
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const w = r.height;
      const h = r.width;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    if (rotationDeg !== 0) {
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  // ---- 4.5.3 内联富文本通用解析 ----
  function hasInlineFormatting(el) {
    return !!el.querySelector('span,b,strong,i,em,u,br');
  }

  function buildRuns(containerEl, marginErrsOut) {
    const rawRuns = [];

    function styleOf(el) {
      const cs = getComputedStyle(el);
      const fontSizePt = parseFloat(cs.fontSize) * PT_PER_PX;
      const fontFace = firstFontFamily(cs.fontFamily);
      let bold = cs.fontWeight === 'bold' || parseInt(cs.fontWeight, 10) >= 600;
      if (isSingleWeightFont(fontFace)) bold = false;
      const italic = cs.fontStyle === 'italic';
      const deco = cs.textDecorationLine || cs.textDecoration || '';
      const underline = deco.indexOf('underline') !== -1;
      const colorParsed = parseColorString(cs.color);
      const textTransform = cs.textTransform;
      return { fontSizePt, bold, italic, underline, colorParsed, textTransform };
    }

    function sameStyle(a, b) {
      if (!a || !b) return false;
      return (
        a.fontSizePt === b.fontSizePt &&
        a.bold === b.bold &&
        a.italic === b.italic &&
        a.underline === b.underline &&
        a.textTransform === b.textTransform &&
        JSON.stringify(a.colorParsed) === JSON.stringify(b.colorParsed)
      );
    }

    function append(text, style) {
      if (text === '') return;
      const last = rawRuns[rawRuns.length - 1];
      if (last && sameStyle(last.style, style)) {
        last.text += text;
      } else {
        rawRuns.push({ text, style });
      }
    }

    function checkInlineMargins(el, tag) {
      const cs = getComputedStyle(el);
      ['Left', 'Right', 'Top', 'Bottom'].forEach((dir) => {
        const v = parsePx(cs['margin' + dir]);
        if (v !== 0) {
          marginErrsOut.push(
            `Inline element <${tag.toLowerCase()}> has a non-zero margin-${dir.toLowerCase()} (inline elements do not support margin — remove it).`
          );
        }
      });
    }

    function walk(node) {
      if (node.nodeType === 3) {
        const collapsed = collapseWs(node.textContent);
        if (collapsed === '') return;
        const style = styleOf(node.parentElement);
        append(applyTextTransform(collapsed, style.textTransform), style);
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      if (tag === 'BR') {
        const style = styleOf(node.parentElement);
        append('\n', style);
        return;
      }
      if (INLINE_TAGS.has(tag)) {
        const text = node.textContent;
        if (!text || !text.trim()) return;
        checkInlineMargins(node, tag);
        Array.from(node.childNodes).forEach(walk);
        return;
      }
      // 不认识的标签（比如 <code>）：整段忽略，文字从输出里消失（既有行为，不扩展）。
    }

    Array.from(containerEl.childNodes).forEach(walk);

    if (rawRuns.length > 0) {
      rawRuns[0].text = rawRuns[0].text.replace(/^ +/, '');
      rawRuns[rawRuns.length - 1].text = rawRuns[rawRuns.length - 1].text.replace(/ +$/, '');
    }

    // pptxgenjs 的 TextProps 要求 { text, options }：options 里只放和继承样式不同的
    // 覆盖项，缺省项交给 pptxgenjs 自己按顶层/上一个 run 的默认值处理。
    return rawRuns
      .filter((r) => r.text !== '')
      .map((r) => {
        const options = { fontSize: r.style.fontSizePt };
        if (r.style.bold) options.bold = true;
        if (r.style.italic) options.italic = true;
        if (r.style.underline) options.underline = true;
        const c = r.style.colorParsed;
        const isPureBlack = c && c.hex === '000000' && !c.hasAlpha;
        if (c && !isPureBlack) {
          options.color = c.hex;
          if (c.hasAlpha) options.transparency = Math.round((1 - c.alpha) * 100);
        }
        return { text: r.text, options };
      });
  }

  function stripLeadingManualBullet(run) {
    for (const ch of MANUAL_BULLET_CHARS_STRIP) {
      if (run.text.indexOf(ch) === 0) {
        run.text = run.text.slice(1).replace(/^\s+/, '');
        return;
      }
    }
  }

  // ---- 4.2 占位符 ----
  function processPlaceholder(el) {
    consumed.add(el);
    Array.from(el.querySelectorAll('*')).forEach((d) => consumed.add(d));
    const rect = rectOf(el);
    if (rect.w === 0 || rect.h === 0) {
      const dim = rect.w === 0 ? 'width' : 'height';
      const id = el.id || 'unnamed';
      errors.push(`占位区 #${id} 渲染出来的${dim === 'width' ? '宽度' : '高度'}是 0，检查它的 CSS 布局`);
      return;
    }
    const id = el.id || 'placeholder-' + placeholders.length;
    placeholders.push({ id, x: toIn(rect.x), y: toIn(rect.y), w: toIn(rect.w), h: toIn(rect.h) });
  }

  // ---- 4.3 图片 ----
  function processImage(el) {
    const rect = rectOf(el);
    if (rect.w === 0 || rect.h === 0) return;
    elements.push({ type: 'image', src: el.src, x: toIn(rect.x), y: toIn(rect.y), w: toIn(rect.w), h: toIn(rect.h) });
  }

  // ---- 4.4 div ----
  function buildBorderLines(rect, b) {
    const out = [];
    const sides = [
      { info: b.top, geo: () => ({ x: rect.x, y: rect.y + b.top.w / 2, w: rect.w, h: 0 }) },
      { info: b.right, geo: () => ({ x: rect.x + rect.w - b.right.w / 2, y: rect.y, w: 0, h: rect.h }) },
      { info: b.bottom, geo: () => ({ x: rect.x, y: rect.y + rect.h - b.bottom.w / 2, w: rect.w, h: 0 }) },
      { info: b.left, geo: () => ({ x: rect.x + b.left.w / 2, y: rect.y, w: 0, h: rect.h }) },
    ];
    sides.forEach((s) => {
      if (s.info.w > 0) {
        const g = s.geo();
        const c = parseColorString(s.info.c);
        out.push({
          type: 'line',
          x: toIn(g.x),
          y: toIn(g.y),
          w: toIn(g.w),
          h: toIn(g.h),
          color: c ? c.hex : '000000',
          widthPt: toPt(s.info.w),
        });
      }
    });
    return out;
  }

  function processDiv(div) {
    // 1: 裸文字校验（永远执行，不因为后面的 background-image 违规而跳过）
    const rawDirectText = Array.from(div.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('')
      .trim();
    if (rawDirectText) {
      errors.push(
        `<div> 里直接写了文字「${truncate(rawDirectText, 50)}」，PPT 里不会出现——请用 <p>、<h1>-<h6>、<ul>/<ol> 包起来`
      );
    }

    // 2: background-image 校验（命中时不产出 shape/line，但不消费该节点，子孙继续遍历）
    const cs = getComputedStyle(div);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      if (/gradient/i.test(cs.backgroundImage)) {
        errors.push(
          '<div> 背景不能用 CSS 渐变：换成纯色 background-color，或把渐变先导出成 PNG 再用 <img> / slide.addImage() 放上去'
        );
      } else {
        errors.push(
          '<div> 不能用 background-image：图片请改成 <img> 标签，或用 slide.addImage() 单独叠一层'
        );
      }
      return;
    }

    const rect = rectOf(div);
    if (rect.w === 0 || rect.h === 0) return;

    const bgColor = parseColorString(cs.backgroundColor);
    const hasBg = isVisibleColor(bgColor);
    const b = getBordersInfo(cs);
    const hasBorder = b.top.w > 0 || b.right.w > 0 || b.bottom.w > 0 || b.left.w > 0;
    const hasUniformBorder = hasBorder && b.top.w === b.right.w && b.right.w === b.bottom.w && b.bottom.w === b.left.w;

    let shapeEl = null;
    let lineEls = [];

    if (hasBorder && !hasUniformBorder) {
      lineEls = buildBorderLines(rect, b);
    }

    if (hasBg || hasBorder) {
      if (hasBg || hasUniformBorder) {
        const shadow = parseBoxShadow(cs.boxShadow);
        shapeEl = {
          type: 'shape',
          x: toIn(rect.x),
          y: toIn(rect.y),
          w: toIn(rect.w),
          h: toIn(rect.h),
          fill: hasBg ? fillFieldOf(bgColor) : null,
          line: hasUniformBorder ? { color: parseColorString(b.top.c).hex, width: toPt(b.top.w) } : null,
          rectRadius: computeRectRadius(cs, rect.w, rect.h),
          shadow,
        };
      }
      consumed.add(div);
    }

    if (shapeEl) elements.push(shapeEl);
    lineEls.forEach((l) => elements.push(l));
  }

  // ---- 4.1 data-pptx-merge 容器 ----
  function processMergeContainer(container) {
    const rect = rectOf(container);
    if (rect.w === 0 || rect.h === 0) {
      consumed.add(container);
      return;
    }

    const nested = container.querySelectorAll('[data-pptx-merge="true"]');
    if (nested.length > 0) {
      errors.push('data-pptx-merge containers cannot be nested. Remove the inner data-pptx-merge="true" attribute.');
      consumed.add(container);
      return;
    }

    const cs = getComputedStyle(container);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      if (/gradient/i.test(cs.backgroundImage)) {
        errors.push(
          'CSS gradients are not supported on data-pptx-merge containers. Use a solid background-color, or overlay the gradient with slide.addImage().'
        );
      } else {
        errors.push(
          'data-pptx-merge containers do not support background-image. Use a solid background-color/border, or overlay the picture with slide.addImage().'
        );
      }
      consumed.add(container);
      return;
    }

    const paragraphs = Array.from(container.querySelectorAll('p,h1,h2,h3,h4,h5,h6'));
    if (paragraphs.length === 0) {
      errors.push(
        'data-pptx-merge container has no mergeable text elements. Remove data-pptx-merge or add <p>/<h1>-<h6> text inside it.'
      );
      consumed.add(container);
      return;
    }

    const bgColor = parseColorString(cs.backgroundColor);
    const hasBg = isVisibleColor(bgColor);
    const b = getBordersInfo(cs);
    const hasUniformBorder = b.top.w > 0 && b.top.w === b.right.w && b.right.w === b.bottom.w && b.bottom.w === b.left.w;

    let shapeEl = null;
    if (hasBg || hasUniformBorder) {
      const shadow = parseBoxShadow(cs.boxShadow);
      shapeEl = {
        type: 'shape',
        x: toIn(rect.x),
        y: toIn(rect.y),
        w: toIn(rect.w),
        h: toIn(rect.h),
        fill: hasBg ? fillFieldOf(bgColor) : null,
        line: hasUniformBorder ? { color: parseColorString(b.top.c).hex, width: toPt(b.top.w) } : null,
        rectRadius: computeRectRadius(cs, rect.w, rect.h),
        shadow,
      };
    }

    // 框级基准样式取第一个文字后代
    const baseEl = paragraphs[0];
    const baseCs = getComputedStyle(baseEl);
    const baseFontSizePt = parseFloat(baseCs.fontSize) * PT_PER_PX;
    const baseFontFace = firstFontFamily(baseCs.fontFamily);
    const baseColorParsed = parseColorString(baseCs.color);
    const baseAlign = normalizeAlign(baseCs.textAlign);
    const baseLineSpacingPt = parseLineHeightPt(baseCs.lineHeight, baseFontSizePt);

    const marginArr = [
      toPt(parsePx(cs.paddingLeft)),
      toPt(parsePx(cs.paddingRight)),
      toPt(parsePx(cs.paddingBottom)),
      toPt(parsePx(cs.paddingTop)),
    ];

    paragraphs.forEach((p) => consumed.add(p));
    consumed.add(container);

    const allRuns = [];
    paragraphs.forEach((p, idx) => {
      const marginErrs = [];
      const runs = buildRuns(p, marginErrs);
      errors.push(...marginErrs);
      if (runs.length === 0) return;
      if (idx < paragraphs.length - 1) {
        runs[runs.length - 1].options.breakLine = true;
      }
      allRuns.push(...runs);
    });

    if (allRuns.length === 0) return;

    if (shapeEl) elements.push(shapeEl);
    elements.push({
      type: 'merged-text',
      x: toIn(rect.x),
      y: toIn(rect.y),
      w: toIn(rect.w),
      h: toIn(rect.h),
      fontSize: baseFontSizePt,
      fontFace: baseFontFace,
      color: baseColorParsed ? baseColorParsed.hex : null,
      transparency: baseColorParsed && baseColorParsed.hasAlpha ? Math.round((1 - baseColorParsed.alpha) * 100) : null,
      align: baseAlign,
      lineSpacing: baseLineSpacingPt,
      marginArr,
      items: allRuns,
    });
  }

  // ---- 4.6 列表 ----
  function processList(listEl) {
    const rect = rectOf(listEl);
    if (rect.w === 0 || rect.h === 0) return;

    const cs = getComputedStyle(listEl);
    const paddingLeftPt = toPt(parsePx(cs.paddingLeft));
    const half = paddingLeftPt / 2;

    const liEls = Array.from(listEl.querySelectorAll('li'));
    liEls.forEach((li) => consumed.add(li));
    consumed.add(listEl);
    if (liEls.length === 0) return;

    const baseCs = getComputedStyle(liEls[0]);
    const baseFontSizePt = parseFloat(baseCs.fontSize) * PT_PER_PX;
    const baseFontFace = firstFontFamily(baseCs.fontFamily);
    const baseColorParsed = parseColorString(baseCs.color);
    const baseAlign = normalizeAlign(baseCs.textAlign);
    const baseLineSpacingPt = parseLineHeightPt(baseCs.lineHeight, baseFontSizePt);
    const paraSpaceAfterPt = toPt(parsePx(baseCs.marginBottom));

    const allRuns = [];
    liEls.forEach((li, idx) => {
      const marginErrs = [];
      const runs = buildRuns(li, marginErrs);
      errors.push(...marginErrs);
      if (runs.length === 0) return;
      stripLeadingManualBullet(runs[0]);
      runs[0].options.bullet = { indent: half };
      if (idx < liEls.length - 1) {
        runs[runs.length - 1].options.breakLine = true;
      }
      allRuns.push(...runs);
    });

    if (allRuns.length === 0) return;

    elements.push({
      type: 'list',
      x: toIn(rect.x),
      y: toIn(rect.y),
      w: toIn(rect.w),
      h: toIn(rect.h),
      fontSize: baseFontSizePt,
      fontFace: baseFontFace,
      color: baseColorParsed ? baseColorParsed.hex : null,
      transparency: baseColorParsed && baseColorParsed.hasAlpha ? Math.round((1 - baseColorParsed.alpha) * 100) : null,
      align: baseAlign,
      lineSpacing: baseLineSpacingPt,
      paraSpaceAfter: paraSpaceAfterPt,
      marginArr: [half, 0, 0, 0],
      items: allRuns,
    });
  }

  // ---- 4.5 单个文本标签（含 4.5 preamble 提到的 li 兜底分支）----
  function processTextElement(el) {
    const tag = el.tagName;
    const rect = rectOf(el);
    const collapsedFull = collapseWs(el.textContent).trim();

    if (rect.w === 0 || rect.h === 0 || collapsedFull === '') return;

    if (tag !== 'LI') {
      const m = /^([•\-*▪▸○●◆◇■□])\s/.exec(collapsedFull);
      if (m) {
        errors.push(
          `<${tag.toLowerCase()}> 开头手打了项目符号「${truncate(collapsedFull, 20)}」——列表请用 <ul>/<ol>，不要自己打圆点`
        );
        return;
      }
    }

    const cs = getComputedStyle(el);
    const rotation = computeRotationDeg(cs);
    const geomPx = computeGeometryPx(el, rotation);

    const fontSizePt = parseFloat(cs.fontSize) * PT_PER_PX;
    const fontFace = firstFontFamily(cs.fontFamily);
    const colorParsed = parseColorString(cs.color);
    const align = normalizeAlign(cs.textAlign);
    const lineSpacingPt = parseLineHeightPt(cs.lineHeight, fontSizePt);
    const marginTopPt = toPt(parsePx(cs.marginTop));
    const marginBottomPt = toPt(parsePx(cs.marginBottom));
    const paddingArr = [
      toPt(parsePx(cs.paddingLeft)),
      toPt(parsePx(cs.paddingRight)),
      toPt(parsePx(cs.paddingBottom)),
      toPt(parsePx(cs.paddingTop)),
    ];
    const hasPadding = paddingArr.some((v) => v !== 0);

    let boldBase = cs.fontWeight === 'bold' || parseInt(cs.fontWeight, 10) >= 600;
    if (isSingleWeightFont(fontFace)) boldBase = false;
    const italicBase = cs.fontStyle === 'italic';
    const decoBase = cs.textDecorationLine || cs.textDecoration || '';
    const underlineBase = decoBase.indexOf('underline') !== -1;

    let textOut;
    let effectiveLineSpacing = lineSpacingPt;

    if (hasInlineFormatting(el)) {
      const marginErrs = [];
      const runs = buildRuns(el, marginErrs);
      errors.push(...marginErrs);
      if (runs.length === 0) return;
      textOut = runs;
      const maxRunFontSize = Math.max.apply(
        null,
        runs.map((r) => r.options.fontSize)
      );
      if (maxRunFontSize > fontSizePt) {
        effectiveLineSpacing = maxRunFontSize * (lineSpacingPt / fontSizePt);
      }
    } else {
      textOut = applyTextTransform(collapsedFull, cs.textTransform);
    }

    // 几何补偿（6.6）：给单个 p/h1-h6 文本框的宽度加宽 2%，补偿 pptxgenjs/PowerPoint
    // 对文字宽度的测量比浏览器偏窄这个已知误差。
    const heightIn = geomPx.h / 96;
    let xIn = geomPx.x / 96;
    let yIn = geomPx.y / 96;
    let wIn = geomPx.w / 96;
    let hIn = heightIn;
    {
      const widen = wIn * 0.02;
      if (align === 'right') {
        xIn -= widen;
        wIn += widen;
      } else if (align === 'center') {
        xIn -= widen / 2;
        wIn += widen;
      } else {
        wIn += widen;
      }
    }

    const outEl = {
      type: tag.toLowerCase(),
      x: xIn,
      y: yIn,
      w: wIn,
      h: hIn,
      fontSize: fontSizePt,
      fontFace,
      color: colorParsed ? colorParsed.hex : null,
      transparency: colorParsed && colorParsed.hasAlpha ? Math.round((1 - colorParsed.alpha) * 100) : null,
      align,
      lineSpacing: effectiveLineSpacing,
      paraSpaceBefore: marginTopPt,
      paraSpaceAfter: marginBottomPt,
      marginArr: hasPadding ? paddingArr : null,
      rotate: rotation !== 0 ? rotation : null,
      text: textOut,
    };
    if (typeof textOut === 'string') {
      outEl.bold = boldBase;
      outEl.italic = italicBase;
      outEl.underline = underlineBase;
    }
    elements.push(outEl);
  }

  // ---- 背景 ----
  function extractBackground() {
    const cs = getComputedStyle(document.body);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      const m = /url\((['"]?)(.*?)\1\)/.exec(cs.backgroundImage);
      if (m) return { type: 'image', value: m[2] };
    }
    const c = parseColorString(cs.backgroundColor);
    if (isVisibleColor(c)) return { type: 'color', value: c.hex };
    return null;
  }

  // ---- 主遍历 ----
  const allNodes = Array.from(document.body.querySelectorAll('*'));

  for (const el of allNodes) {
    const tag = el.tagName;

    if (TEXT_TAG_BG_CHECK.has(tag)) {
      const v = violationOf(el);
      if (v) {
        errors.push(
          `文字标签 <${tag.toLowerCase()}> 上设置了 ${v}：背景、边框、阴影只能加在 <div> 上，请在外面套一层 <div>`
        );
        continue;
      }
    }

    if (consumed.has(el)) continue;

    const classAttr = el.getAttribute('class') || '';

    if (el.getAttribute('data-pptx-merge') === 'true') {
      processMergeContainer(el);
      continue;
    }
    if (classAttr.indexOf('placeholder') !== -1) {
      processPlaceholder(el);
      continue;
    }
    if (tag === 'IMG') {
      processImage(el);
      continue;
    }
    if (tag === 'DIV') {
      processDiv(el);
      continue;
    }
    if (tag === 'UL' || tag === 'OL') {
      processList(el);
      continue;
    }
    if (TEXT_ELEMENT_TAGS.has(tag)) {
      processTextElement(el);
      continue;
    }
    // 其它任何元素：忽略，不产出、不报错
  }

  const bodyCs = getComputedStyle(document.body);
  return {
    background: extractBackground(),
    elements,
    placeholders,
    errors,
    body: {
      width: parseFloat(bodyCs.width),
      height: parseFloat(bodyCs.height),
      scrollWidth: document.body.scrollWidth,
      scrollHeight: document.body.scrollHeight,
    },
  };
}

// ============================================================================
// Node 侧：写入 pptxgenjs
// ============================================================================

function stripFileProtocol(p) {
  return p.replace(/^file:\/\//, '');
}

function previewTextOf(el) {
  if (typeof el.text === 'string') return el.text;
  const arr = Array.isArray(el.text) ? el.text : Array.isArray(el.items) ? el.items : [];
  for (const r of arr) {
    if (r && typeof r.text === 'string' && r.text.trim() !== '') return r.text;
  }
  return '';
}

function writeElement(slide, pres, el) {
  switch (el.type) {
    case 'image': {
      slide.addImage({ path: stripFileProtocol(el.src), x: el.x, y: el.y, w: el.w, h: el.h });
      break;
    }
    case 'line': {
      slide.addShape(pres.ShapeType.line, {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        line: { color: el.color, width: el.widthPt },
      });
      break;
    }
    case 'shape': {
      const shapeName = el.rectRadius > 0 ? pres.ShapeType.roundRect : pres.ShapeType.rect;
      const opts = { x: el.x, y: el.y, w: el.w, h: el.h, shape: shapeName };
      if (el.fill) opts.fill = el.fill;
      if (el.line) opts.line = el.line;
      if (el.rectRadius > 0) opts.rectRadius = el.rectRadius;
      if (el.shadow) opts.shadow = el.shadow;
      slide.addText('', opts);
      break;
    }
    case 'list': {
      const opts = {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize,
        fontFace: el.fontFace,
        color: el.color,
        align: el.align,
        valign: 'top',
        lineSpacing: el.lineSpacing,
        paraSpaceBefore: 0,
        paraSpaceAfter: el.paraSpaceAfter,
        margin: el.marginArr,
      };
      if (el.transparency != null) opts.transparency = el.transparency;
      slide.addText(el.items, opts);
      break;
    }
    case 'merged-text': {
      const opts = {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize,
        fontFace: el.fontFace,
        color: el.color,
        align: el.align,
        valign: 'top',
        lineSpacing: el.lineSpacing,
        paraSpaceBefore: 0,
        paraSpaceAfter: 0,
        margin: el.marginArr,
      };
      if (el.transparency != null) opts.transparency = el.transparency;
      slide.addText(el.items, opts);
      break;
    }
    default: {
      // p / h1-h6 / (兜底的 li)：单个文本框
      const opts = {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize,
        fontFace: el.fontFace,
        color: el.color,
        align: el.align,
        valign: 'top',
        lineSpacing: el.lineSpacing,
        paraSpaceBefore: el.paraSpaceBefore,
        paraSpaceAfter: el.paraSpaceAfter,
        inset: 0,
      };
      if (typeof el.text === 'string') {
        opts.bold = el.bold;
        opts.italic = el.italic;
        opts.underline = el.underline;
      }
      if (el.marginArr) opts.margin = el.marginArr;
      if (el.rotate) opts.rotate = el.rotate;
      if (el.transparency != null) opts.transparency = el.transparency;
      slide.addText(el.text, opts);
      break;
    }
  }
}

module.exports = async function html2pptx(htmlFile, pres, options) {
  options = options || {};
  const absHtmlPath = path.isAbsolute(htmlFile) ? htmlFile : path.resolve(process.cwd(), htmlFile);
  const tmpDir = options.tmpDir || process.env.TMPDIR || '/tmp';

  function finalizeError(rawMessage) {
    let message = rawMessage;
    if (!message.startsWith(htmlFile)) {
      message = `${htmlFile}: ${message}`;
    }
    return new Error(message);
  }

  let browser;
  let extraction;
  try {
    const launchOptions = { env: Object.assign({}, process.env, { TMPDIR: tmpDir }) };
    if (process.platform === 'darwin') launchOptions.channel = 'chrome';
    browser = await chromium.launch(launchOptions)
      .catch(() => chromium.launch({ ...launchOptions, channel: undefined }))
      .catch(() => chromium.launch({ ...launchOptions, channel: 'msedge' }));  // Mac 没装 Chrome、Windows 没下载浏览器时的兜底
    const page = await browser.newPage();
    await page.goto('file://' + absHtmlPath);

    const initialBodySize = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return { width: parseFloat(cs.width), height: parseFloat(cs.height) };
    });
    await page.setViewportSize({
      width: Math.max(1, Math.round(initialBodySize.width)),
      height: Math.max(1, Math.round(initialBodySize.height)),
    });

    extraction = await page.evaluate(extractPageDataInBrowser);
  } finally {
    if (browser) await browser.close();
  }

  // ---- 整页级校验（第 5 节），和提取阶段收集到的错误合并 ----
  const errors = extraction.errors.slice();

  const widthOverflowPx = Math.max(0, extraction.body.scrollWidth - extraction.body.width - 1);
  const heightOverflowPx = Math.max(0, extraction.body.scrollHeight - extraction.body.height - 1);
  if (widthOverflowPx > 0) {
    errors.push(`内容横向超出页面 ${(widthOverflowPx * PT_PER_PX).toFixed(1)}pt`);
  }
  if (heightOverflowPx > 0) {
    errors.push(
      `内容纵向超出页面 ${(heightOverflowPx * PT_PER_PX).toFixed(1)}pt（页面底部要留出 0.5 英寸空白）`
    );
  }

  let slideHeightIn = null;
  if (pres.presLayout) {
    const layoutWIn = pres.presLayout.width / EMU_PER_INCH;
    const layoutHIn = pres.presLayout.height / EMU_PER_INCH;
    const bodyWIn = extraction.body.width * IN_PER_PX;
    const bodyHIn = extraction.body.height * IN_PER_PX;
    if (Math.abs(bodyWIn - layoutWIn) > 0.1 || Math.abs(bodyHIn - layoutHIn) > 0.1) {
      errors.push(
        `页面尺寸不一致：HTML 的 body 是 ${bodyWIn.toFixed(1)}×${bodyHIn.toFixed(1)} 英寸，PPT 版式是 ${layoutWIn.toFixed(1)}×${layoutHIn.toFixed(1)} 英寸`
      );
    }
    slideHeightIn = layoutHIn;
  }

  if (slideHeightIn != null) {
    const CHECK_TYPES = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'list', 'merged-text']);
    for (const el of extraction.elements) {
      if (!CHECK_TYPES.has(el.type)) continue;
      if (!(el.fontSize > 12)) continue;
      const distance = slideHeightIn - (el.y + el.h);
      if (distance < 0.5) {
        const preview = previewTextOf(el).slice(0, 50);
        errors.push(`文本框「${preview}」离页面底边只有 ${distance.toFixed(2)} 英寸，至少要留 0.5 英寸`);
      }
    }
  }

  if (errors.length > 0) {
    let message;
    if (errors.length === 1) {
      message = errors[0];
    } else {
      message = `发现 ${errors.length} 处问题：\n` + errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n');
    }
    throw finalizeError(message);
  }

  // ---- 写入 slide ----
  const slide = options.slide || pres.addSlide();

  if (extraction.background) {
    if (extraction.background.type === 'image') {
      slide.background = { path: stripFileProtocol(extraction.background.value) };
    } else {
      slide.background = { color: extraction.background.value };
    }
  }

  for (const el of extraction.elements) {
    writeElement(slide, pres, el);
  }

  return { slide, placeholders: extraction.placeholders };
};
