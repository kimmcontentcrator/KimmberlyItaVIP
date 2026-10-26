import { useEffect, useRef } from "react";

// Particelle ottimizzate: sprite pre-renderizzati (niente shadowBlur), pausa fuori schermo / tab nascosta
export const Sparkles = ({ density = 40, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const mobile = window.innerWidth < 768;
    const count = mobile ? Math.round(density * 0.55) : density;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    let w = 0, h = 0, raf;

    const colors = ["241,217,152", "214,178,94", "242,215,208", "231,184,200"];
    const sprites = colors.map((c) => {
      const s = document.createElement("canvas");
      s.width = s.height = 32;
      const g = s.getContext("2d");
      const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grd.addColorStop(0, `rgba(${c},1)`);
      grd.addColorStop(0.25, `rgba(${c},0.55)`);
      grd.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, 32, 32);
      return s;
    });

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts = Array.from({ length: count }).map(() => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 5 + 3,
      vy: -(Math.random() * 0.25 + 0.06), vx: (Math.random() - 0.5) * 0.15,
      t: Math.random() * Math.PI * 2, s: sprites[Math.floor(Math.random() * sprites.length)],
    }));

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    let last = performance.now();
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 16.67, 3); // indipendente dagli Hz (60/90/120)
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.t += 0.03 * dt;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.globalAlpha = 0.25 + (Math.sin(p.t) + 1) * 0.3;
        ctx.drawImage(p.s, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); io.disconnect(); };
  }, [density]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
};
