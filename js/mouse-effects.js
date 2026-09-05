(() => {
  "use strict";

  // 触屏设备或开启“减少动画”时不运行
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!finePointer || reduceMotion) return;

  const cardSelector = [
    "#recent-posts > .recent-post-item",
    "#aside-content .card-widget",
    "#post",
    "#page",
    "#archive",
    "#tag",
    "#category"
  ].join(",");

  // 添加特效样式
  function addEffectStyles() {
    if (document.getElementById("mouse-effects-style")) return;

    const style = document.createElement("style");
    style.id = "mouse-effects-style";

    style.textContent = `
      #mouse-glow,
      #mouse-dot {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        user-select: none;
        opacity: 0;
        will-change: left, top, opacity;
      }

      /* 鼠标周围的蓝色柔光 */
      #mouse-glow {
        z-index: 9998;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(
          circle,
          rgba(87, 176, 196, 0.22) 0%,
          rgba(87, 176, 196, 0.11) 35%,
          rgba(87, 176, 196, 0) 70%
        );
        transition: opacity 0.18s ease;
      }

      /* 鼠标中心的金色光点 */
      #mouse-dot {
        z-index: 9999;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: #d28b45;
        box-shadow:
          0 0 0 5px rgba(210, 139, 69, 0.16),
          0 0 16px rgba(210, 139, 69, 0.55);
        transition:
          width 0.14s ease,
          height 0.14s ease,
          opacity 0.18s ease;
      }

      body.mouse-visible #mouse-glow,
      body.mouse-visible #mouse-dot {
        opacity: 1;
      }

      body.mouse-pressed #mouse-dot {
        width: 14px;
        height: 14px;
      }

      /* 卡片倾斜过渡 */
      .mouse-tilt-card {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        transition:
          transform 0.16s ease-out,
          box-shadow 0.26s ease !important;
      }

      /* 文章链接悬停效果 */
      #article-container a {
        background-image: linear-gradient(#d28b45, #d28b45);
        background-position: 0 100%;
        background-repeat: no-repeat;
        background-size: 0 2px;
        transition:
          color 0.2s ease,
          background-size 0.24s ease;
      }

      #article-container a:hover {
        color: #d28b45 !important;
        background-size: 100% 2px;
      }

      /* 菜单悬停效果 */
      #nav .site-page {
        transition:
          transform 0.2s ease,
          color 0.2s ease !important;
      }

      #nav .site-page:hover {
        color: #ffd19b !important;
        transform: translateY(-2px);
      }

      /* 按钮过渡 */
      #aside-content .card-info #card-info-btn {
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease !important;
      }

      #aside-content .card-info #card-info-btn:hover {
        transform: translateY(-3px) scale(1.02);
      }
    `;

    document.head.appendChild(style);
  }

  // 创建鼠标光晕
  function createPointerEffects() {
    if (window.mouseEffectsInstalled) return;
    window.mouseEffectsInstalled = true;

    const glow = document.createElement("div");
    glow.id = "mouse-glow";
    glow.setAttribute("aria-hidden", "true");

    const dot = document.createElement("div");
    dot.id = "mouse-dot";
    dot.setAttribute("aria-hidden", "true");

    document.body.append(glow, dot);

    let mouseX = 0;
    let mouseY = 0;
    let animationFrame = 0;

    document.addEventListener(
      "pointermove",
      event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        document.body.classList.add("mouse-visible");

        if (animationFrame) return;

        animationFrame = requestAnimationFrame(() => {
          glow.style.left = `${mouseX}px`;
          glow.style.top = `${mouseY}px`;

          dot.style.left = `${mouseX}px`;
          dot.style.top = `${mouseY}px`;

          animationFrame = 0;
        });
      },
      { passive: true }
    );

    document.addEventListener("pointerdown", () => {
      document.body.classList.add("mouse-pressed");
    });

    document.addEventListener("pointerup", () => {
      document.body.classList.remove("mouse-pressed");
    });

    document.documentElement.addEventListener("mouseleave", () => {
      document.body.classList.remove(
        "mouse-visible",
        "mouse-pressed"
      );
    });
  }

  // 给文章和侧栏卡片增加跟随鼠标的倾斜效果
  function bindCardEffects() {
    document.querySelectorAll(cardSelector).forEach(card => {
      if (card.dataset.mouseEffectBound === "true") return;

      card.dataset.mouseEffectBound = "true";
      card.classList.add("mouse-tilt-card");

      card.addEventListener(
        "pointermove",
        event => {
          const rect = card.getBoundingClientRect();

          const horizontal =
            (event.clientX - rect.left) / rect.width - 0.5;

          const vertical =
            (event.clientY - rect.top) / rect.height - 0.5;

          const rotateX = (-vertical * 4).toFixed(2);
          const rotateY = (horizontal * 4).toFixed(2);

          card.style.transform =
            `perspective(1000px) translateY(-4px) ` +
            `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        },
        { passive: true }
      );

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function initializeMouseEffects() {
    addEffectStyles();
    createPointerEffects();
    bindCardEffects();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeMouseEffects,
      { once: true }
    );
  } else {
    initializeMouseEffects();
  }

  // 兼容Butterfly页面无刷新跳转
  document.addEventListener("pjax:complete", bindCardEffects);
})(); 