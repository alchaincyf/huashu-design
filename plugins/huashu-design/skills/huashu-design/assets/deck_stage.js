/**
 * <deck-stage> — HTML幻灯片外壳web component
 *
 * 提供功能：
 * - 固定尺寸canvas（默认1920×1080）+ auto-scale + letterbox
 * - 键盘导航（←/→/Space/Home/End/Esc）
 * - 左右点击区域导航
 * - slide counter (当前/总数)
 * - localStorage持久化当前slide
 * - Speaker notes postMessage (支持外层渲染)
 * - Hash导航 (#slide-5 跳到第5张)
 * - Print-to-PDF支持 (Cmd+P / Ctrl+P 一页一slide)
 * - 自动给每个slide添加 data-screen-label
 *
 * 用法：
 *   <deck-stage>
 *     <section>Slide 1</section>
 *     <section>Slide 2</section>
 *   </deck-stage>
 *
 * 自定义尺寸：
 *   <deck-stage width="1080" height="1920">...</deck-stage>
 *
 * Speaker notes：在<head>加
 *   <script type="application/json" id="speaker-notes">
 *   ["slide 1 notes", "slide 2 notes"]
 *   </script>
 */

(function() {
  const STORAGE_KEY_PREFIX = 'deck-stage-slide-';

  class DeckStage extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._currentSlide = 0;
      this._slides = [];
      this._storageKey = STORAGE_KEY_PREFIX + (location.pathname || 'default');
    }

    connectedCallback() {
      this._width = parseInt(this.getAttribute('width')) || 1920;
      this._height = parseInt(this.getAttribute('height')) || 1080;

      // Shadow DOM 先渲染（独立于子节点，不受 parser 时机影响）
      this._render();

      // 防御：若 script 放在 <head> 里（而非 </deck-stage> 之后），
      // parser 此刻可能还没处理完子 <section>，querySelectorAll 会返回空。
      // 延迟到下一个事件循环，确保子节点都已 parse 完毕。
      const init = () => {
        this._collectSlides();
        this._setupEventListeners();
        this._restoreSlide();
        this._updateDisplay();
        this._setupPrintStyles();
      };

      if (this.ownerDocument.readyState === 'loading') {
        // 文档还在 parse，等 DOMContentLoaded 一次搞定所有 section
        this.ownerDocument.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        // 文档已 parse 完（script 在 body 底部或 defer），下一帧收集即可
        requestAnimationFrame(init);
      }
    }

    _render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            position: fixed;
            inset: 0;
            background: #000;
            overflow: hidden;
            font-family: -apple-system, 'SF Pro Text', 'PingFang SC', sans-serif;
          }

          :host([noscale]) .stage {
            transform: none !important;
            top: 0 !important;
            left: 0 !important;
          }

          .stage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: top left;
            will-change: transform;
            background: #fff;
          }

          .slide-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
          }

          ::slotted(section) {
            display: none;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
          }

          ::slotted(section.active) {
            display: block;
          }

          .counter {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-variant-numeric: tabular-nums;
            z-index: 100;
            user-select: none;
            opacity: 0.6;
            transition: opacity 0.2s;
          }

          .counter:hover {
            opacity: 1;
          }

          .nav-zone {
            position: fixed;
            top: 0;
            bottom: 0;
            width: 15%;
            cursor: pointer;
            z-index: 50;
          }

          .nav-zone.left { left: 0; }
          .nav-zone.right { right: 0; }

          .nav-hint {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            opacity: 0;
            transition: opacity 0.2s;
          }

          .nav-zone.left .nav-hint { left: 20px; }
          .nav-zone.right .nav-hint { right: 20px; }

          .nav-zone:hover .nav-hint {
            opacity: 1;
          }

          @media print {
            :host {
              position: static;
              background: #fff;
            }
            .counter, .nav-zone {
              display: none !important;
            }
            .stage {
              position: static;
              transform: none !important;
              page-break-after: always;
            }
            ::slotted(section) {
              display: block !important;
              position: relative !important;
              page-break-after: always;
              width: 100%;
              height: 100%;
            }
          }
        </style>

        <div class="stage" id="stage" style="width: ${this._width}px; height: ${this._height}px;">
          <div class="slide-wrapper">
            <slot></slot>
          </div>
        </div>

        <div class="nav-zone left" id="navLeft">
          <div class="nav-hint">‹</div>
        </div>
        <div class="nav-zone right" id="navRight">
          <div class="nav-hint">›</div>
        </div>

        <div class="counter" id="counter">1 / 1</div>
      `;
    }

    _collectSlides() {
      this._slides = Array.from(this.querySelectorAll(':scope > section'));

      this._slides.forEach((slide, idx) => {
        if (!slide.hasAttribute('data-screen-label')) {
          const num = String(idx + 1).padStart(2, '0');
          slide.setAttribute('data-screen-label', num);
        }
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', '');
        }
      });
    }

    _setupEventListeners() {
      window.addEventListener('resize', () => this._updateScale());

      document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea, [contenteditable]')) return;

        switch (e.key) {
          case 'ArrowRight':
          case ' ':
          case 'PageDown':
            e.preventDefault();
            this.next();
            break;
          case 'ArrowLeft':
          case 'PageUp':
            e.preventDefault();
            this.prev();
            break;
          case 'Home':
            e.preventDefault();
            this.goTo(0);
            break;
          case 'End':
            e.preventDefault();
            this.goTo(this._slides.length - 1);
            break;
        }
      });

      this.shadowRoot.getElementById('navLeft').addEventListener('click', () => this.prev());
      this.shadowRoot.getElementById('navRight').addEventListener('click', () => this.next());

      window.addEventListener('hashchange', () => this._handleHash());
      if (location.hash) {
        setTimeout(() => this._handleHash(), 0);
      }

      const observer = new MutationObserver(() => {
        if (this.hasAttribute('noscale')) {
          this._updateScale();
        }
      });
      observer.observe(this, { attributes: true, attributeFilter: ['noscale'] });
    }

    _handleHash() {
      const match = location.hash.match(/^#slide-(\d+)$/);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        if (idx >= 0 && idx < this._slides.length) {
          this.goTo(idx);
        }
      }
    }

    _restoreSlide() {
      try {
        const stored = localStorage.getItem(this._storageKey);
        if (stored !== null) {
          const idx = parseInt(stored);
          if (idx >= 0 && idx < this._slides.length) {
            this._currentSlide = idx;
          }
        }
      } catch (e) {}
    }

    _saveSlide() {
      try {
        localStorage.setItem(this._storageKey, String(this._currentSlide));
      } catch (e) {}
    }

    _updateScale() {
      if (this.hasAttribute('noscale')) {
        const stage = this.shadowRoot.getElementById('stage');
        stage.style.transform = 'none';
        stage.style.top = '0';
        stage.style.left = '0';
        return;
      }

      const stage = this.shadowRoot.getElementById('stage');
      if (!stage) return;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const scale = Math.min(viewportW / this._width, viewportH / this._height);
      const scaledW = this._width * scale;
      const scaledH = this._height * scale;
      const offsetX = (viewportW - scaledW) / 2;
      const offsetY = (viewportH - scaledH) / 2;

      stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      stage.style.top = '0';
      stage.style.left = '0';
    }

    _updateDisplay() {
      this._slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === this._currentSlide);
      });

      const counter = this.shadowRoot.getElementById('counter');
      if (counter) {
        counter.textContent = `${this._currentSlide + 1} / ${this._slides.length}`;
      }

      this._updateScale();

      try {
        window.postMessage({
          slideIndexChanged: this._currentSlide,
          totalSlides: this._slides.length
        }, '*');
      } catch (e) {}

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            slideIndexChanged: this._currentSlide,
            totalSlides: this._slides.length
          }, '*');
        }
      } catch (e) {}
    }

    _setupPrintStyles() {
      const printStyle = document.createElement('style');
      printStyle.textContent = `
        @media print {
          @page {
            size: ${this._width}px ${this._height}px;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          deck-stage {
            position: static !important;
          }
          deck-stage > section {
            display: block !important;
            position: relative !important;
            width: ${this._width}px !important;
            height: ${this._height}px !important;
            page-break-after: always;
            overflow: hidden;
          }
          deck-stage > section:last-child {
            page-break-after: auto;
          }
        }
      `;
      document.head.appendChild(printStyle);
    }

    next() {
      if (this._currentSlide < this._slides.length - 1) {
        this._currentSlide++;
        this._saveSlide();
        this._updateDisplay();
      }
    }

    prev() {
      if (this._currentSlide > 0) {
        this._currentSlide--;
        this._saveSlide();
        this._updateDisplay();
      }
    }

    goTo(idx) {
      if (idx >= 0 && idx < this._slides.length) {
        this._currentSlide = idx;
        this._saveSlide();
        this._updateDisplay();
      }
    }

    get currentSlide() {
      return this._currentSlide;
    }

    get totalSlides() {
      return this._slides.length;
    }
  }

  customElements.define('deck-stage', DeckStage);

  window.DeckStage = DeckStage;
})();
