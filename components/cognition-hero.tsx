"use client";

import React, { useEffect, useRef, useState } from "react";

// Alignment matrix for base portrait and Spider-Man reveal mask
const ALIGN = {
  desktop: {
    scale: 1,
    x: 0,
    y: 0,
  },
  mobile: {
    scale: 1,
    x: 0,
    y: 0,
  },
};

interface NodePoint {
  x: number;
  y: number;
}

export function CognitionHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preloaded images reference
  const imagesRef = useRef<{
    baseDesktop: HTMLImageElement | null;
    revealDesktop: HTMLImageElement | null;
    baseMobile: HTMLImageElement | null;
    revealMobile: HTMLImageElement | null;
  }>({
    baseDesktop: null,
    revealDesktop: null,
    baseMobile: null,
    revealMobile: null,
  });

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const isMobileRef = useRef<boolean>(false);

  // Animation & Liquid simulation refs (No React state inside RAF loop)
  const nodesRef = useRef<NodePoint[]>(
    Array.from({ length: 20 }, () => ({ x: -1000, y: -1000 }))
  );
  const pointerRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    pointerType: string;
  }>({
    x: -1000,
    y: -1000,
    active: false,
    pointerType: "mouse",
  });

  const engagementRef = useRef<number>(0);
  const hasSnappedRef = useRef<boolean>(false);
  const clockRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Responsive devicePixelRatio cap at 2
  const dprRef = useRef<number>(1);

  // Custom Monogram AS SVG component
  const MonogramSVG = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white shrink-0"
      aria-hidden="true"
    >
      {/* Outer geometric frame accent */}
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="2"
        stroke="#7C3AED"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Letter 'A' stroke */}
      <path
        d="M8 23L13.5 9L19 23"
        stroke="#F6F2FF"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 18H16.8"
        stroke="#F6F2FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Letter 'S' stroke */}
      <path
        d="M23.5 11.5C23.5 10.1 22.2 9 20.5 9C18.8 9 17.5 10 17.5 11.5C17.5 14.5 23.5 14 23.5 17.5C23.5 19.5 21.8 21 19.5 21C17.5 21 16.2 19.8 16 18.2"
        stroke="#F6F2FF"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Trailing slash-like strokes */}
      <line
        x1="23.5"
        y1="23.5"
        x2="26.5"
        y2="20.5"
        stroke="#A855F7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="26"
        y1="25.5"
        x2="28"
        y2="23.5"
        stroke="#7C3AED"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );

  // Preload images on mount
  useEffect(() => {
    let isMounted = true;

    const loadImg = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    Promise.all([
      loadImg("/images/Base_image_desktop.png"),
      loadImg("/images/Reveal_image_desktop.png"),
      loadImg("/images/Base_image_mobile.png"),
      loadImg("/images/Reveal_image_mobile.png"),
    ])
      .then(([baseDesk, revDesk, baseMob, revMob]) => {
        if (!isMounted) return;
        imagesRef.current = {
          baseDesktop: baseDesk,
          revealDesktop: revDesk,
          baseMobile: baseMob,
          revealMobile: revMob,
        };
        setImagesLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load hero images", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Main RAF Engine Loop
  useEffect(() => {
    if (!imagesLoaded || !heroRef.current || !mainCanvasRef.current) return;

    const heroEl = heroRef.current;
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
    if (!mainCtx) return;

    // Create offscreen field canvas operating at 0.8x resolution
    const fieldCanvas = document.createElement("canvas");
    const fieldCtx = fieldCanvas.getContext("2d");
    if (!fieldCtx) return;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Resize handler
    const updateSize = () => {
      const rect = heroEl.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Mobile check: max-width 767px
      isMobileRef.current = width <= 767;

      // Cap devicePixelRatio at 2
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;

      // Main canvas resolution
      mainCanvas.width = Math.round(width * dpr);
      mainCanvas.height = Math.round(height * dpr);

      // Offscreen field canvas at ~0.8x main canvas resolution
      fieldCanvas.width = Math.max(1, Math.round(mainCanvas.width * 0.8));
      fieldCanvas.height = Math.max(1, Math.round(mainCanvas.height * 0.8));
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(heroEl);

    // Single requestAnimationFrame animation loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      clockRef.current += deltaTime;

      const cw = mainCanvas.width;
      const ch = mainCanvas.height;
      const dpr = dprRef.current;
      const isMobile = isMobileRef.current;

      // Select active images
      const baseImg = isMobile
        ? imagesRef.current.baseMobile
        : imagesRef.current.baseDesktop;
      const revealImg = isMobile
        ? imagesRef.current.revealMobile
        : imagesRef.current.revealDesktop;

      // Update engagement towards target (1 if active, 0 if inactive)
      const targetEng = pointerRef.current.active ? 1 : 0;
      if (prefersReducedMotion) {
        engagementRef.current = targetEng;
      } else {
        engagementRef.current +=
          (targetEng - engagementRef.current) * 0.11;
      }

      const eng = engagementRef.current;

      // Write --p custom property to hero element for CSS crossfades & glow
      heroEl.style.setProperty("--p", eng.toFixed(4));

      // Node interpolation
      const nodes = nodesRef.current;
      const ptr = pointerRef.current;

      if (ptr.active || eng > 0.001) {
        // Node 0 follows raw pointer (interpolation 0.32)
        const node0Lerp = prefersReducedMotion ? 1 : 0.32;
        nodes[0].x += (ptr.x - nodes[0].x) * node0Lerp;
        nodes[0].y += (ptr.y - nodes[0].y) * node0Lerp;

        // Every subsequent node follows previous node (interpolation 0.34)
        const nodeLerp = prefersReducedMotion ? 1 : 0.34;
        for (let i = 1; i < nodes.length; i++) {
          nodes[i].x += (nodes[i - 1].x - nodes[i].x) * nodeLerp;
          nodes[i].y += (nodes[i - 1].y - nodes[i].y) * nodeLerp;
        }
      }

      // Pointer size based on pointer type (smaller liquid touch size)
      const isCoarse =
        ptr.pointerType === "touch" || ptr.pointerType === "pen";
      const headRadius = (isCoarse ? 50 : 100) * dpr;

      // 1. Clear offscreen field canvas
      const fw = fieldCanvas.width;
      const fh = fieldCanvas.height;
      fieldCtx.clearRect(0, 0, fw, fh);

      if (eng > 0.0005) {
        fieldCtx.globalCompositeOperation = "lighter";

        // Render all 20 nodes to field canvas
        const numNodes = nodes.length;
        const fieldScale = 0.8;

        for (let i = 0; i < numNodes; i++) {
          const t = i / (numNodes - 1);
          const radius = headRadius * (1 - t * 0.58);

          // Wobble effect
          const wobble = prefersReducedMotion
            ? 0
            : Math.sin(clockRef.current * 1.6 + i * 0.9) * headRadius * 0.05;

          const r = Math.max(0, (radius + wobble) * eng * fieldScale);
          const alpha = Math.max(0, (0.72 - t * 0.22) * eng);

          if (r > 0.5 && alpha > 0.001) {
            const fx = nodes[i].x * fieldScale;
            const fy = nodes[i].y * fieldScale;

            const grad = fieldCtx.createRadialGradient(fx, fy, 0, fx, fy, r);
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
            grad.addColorStop(
              0.55,
              `rgba(255, 255, 255, ${(alpha * 0.78).toFixed(3)})`
            );
            grad.addColorStop(1, "rgba(255, 255, 255, 0)");

            fieldCtx.fillStyle = grad;
            fieldCtx.beginPath();
            fieldCtx.arc(fx, fy, r, 0, Math.PI * 2);
            fieldCtx.fill();
          }
        }
      }

      // 2. Clear main canvas
      mainCtx.clearRect(0, 0, cw, ch);

      // Render Reveal inside Liquid Canvas Mask
      if (eng > 0.0005 && revealImg && baseImg) {
        // Draw field onto main canvas with blur (10px * dpr) drawn twice to firm liquid edge
        const blurAmount = Math.max(1, Math.round(10 * dpr));
        mainCtx.filter = `blur(${blurAmount}px)`;
        mainCtx.drawImage(fieldCanvas, 0, 0, cw, ch);
        mainCtx.drawImage(fieldCanvas, 0, 0, cw, ch);
        mainCtx.filter = "none";

        // Set composite operation: source-in
        mainCtx.globalCompositeOperation = "source-in";

        // Calculate Image Cover Position & Scale
        const scale = Math.max(cw / revealImg.width, ch / revealImg.height);
        const align = isMobile ? ALIGN.mobile : ALIGN.desktop;

        const revealScale = scale * align.scale;
        const drawW = revealImg.width * revealScale;
        const drawH = revealImg.height * revealScale;

        // Centered cover calculation with ALIGN offset
        const offsetX = (cw - drawW) / 2 + align.x * cw;
        const offsetY = (ch - drawH) / 2 + align.y * ch;

        // Draw reveal image inside liquid field
        mainCtx.drawImage(revealImg, offsetX, offsetY, drawW, drawH);

        // Reset composite operation
        mainCtx.globalCompositeOperation = "source-over";
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [imagesLoaded]);

  // Pointer Interaction Handlers
  const handlePointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") {
      const rect = e.currentTarget.getBoundingClientRect();
      const dpr = dprRef.current;
      const px = (e.clientX - rect.left) * dpr;
      const py = (e.clientY - rect.top) * dpr;

      pointerRef.current = {
        x: px,
        y: py,
        active: true,
        pointerType: e.pointerType,
      };

      // Snap all 20 nodes to cursor position on first reading
      if (!hasSnappedRef.current) {
        nodesRef.current.forEach((node) => {
          node.x = px;
          node.y = py;
        });
        hasSnappedRef.current = true;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = dprRef.current;
    const px = (e.clientX - rect.left) * dpr;
    const py = (e.clientY - rect.top) * dpr;

    pointerRef.current.x = px;
    pointerRef.current.y = py;
    pointerRef.current.pointerType = e.pointerType;

    // For mouse hover or active drag, activate
    if (e.pointerType === "mouse") {
      pointerRef.current.active = true;
    }

    // Snap on first pointer reading
    if (!hasSnappedRef.current) {
      nodesRef.current.forEach((node) => {
        node.x = px;
        node.y = py;
      });
      hasSnappedRef.current = true;
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") {
      pointerRef.current.active = false;
    }
  };

  // Mobile / Touch handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = dprRef.current;
    const px = (e.clientX - rect.left) * dpr;
    const py = (e.clientY - rect.top) * dpr;

    e.currentTarget.setPointerCapture(e.pointerId);

    pointerRef.current = {
      x: px,
      y: py,
      active: true,
      pointerType: e.pointerType,
    };

    if (!hasSnappedRef.current) {
      nodesRef.current.forEach((node) => {
        node.x = px;
        node.y = py;
      });
      hasSnappedRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") {
      pointerRef.current.active = false;
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    pointerRef.current.active = false;
  };

  return (
    <section
      ref={heroRef}
      aria-label="Portfolio Hero Section"
      className="w-full h-[100svh] min-h-[34rem] min-w-[320px] relative overflow-hidden bg-[#030304] select-none isolation-isolate"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: "none" }}
    >
      {/* Visually hidden H1 for SEO & Accessibility */}
      <h1 className="sr-only">
        Ameer Suhail — AI/ML Engineer & Creative Developer
      </h1>

      {/* LAYER 1: Base Portrait Image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full bg-cover bg-center animate-hero-portrait z-0 pointer-events-none"
        style={{
          backgroundImage: isMobileRef.current
            ? "url('/images/Base_image_mobile.png')"
            : "url('/images/Base_image_desktop.png')",
        }}
      >
        <picture>
          <source
            media="(max-width: 767px) and (orientation: portrait)"
            srcSet="/images/Base_image_mobile.png"
          />
          <img
            src="/images/Base_image_desktop.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </picture>
      </div>

      {/* LAYER 2: Liquid Mask & Exo-Mask Reveal Canvas */}
      <canvas
        ref={mainCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* LAYER 3: Interface Chrome */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10 pointer-events-none animate-chrome-fade">
        {/* TOP CHROME BAR */}
        <header className="w-full flex items-center justify-between pointer-events-auto">
          {/* Top Left: Monogram & Name */}
          <div className="flex items-center gap-3">
            <MonogramSVG />
            <span className="font-mono-custom text-xs uppercase tracking-[0.2em] font-medium text-[#F6F2FF]">
              AMEER SUHAIL
            </span>
          </div>
        </header>
      </div>
    </section>
  );
}
