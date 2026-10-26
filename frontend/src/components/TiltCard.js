import { useRef } from "react";

// Card con effetto tilt 3D al tocco/mouse + riflesso di luce
export const TiltCard = ({ children, className = "", testId, max = 7 }) => {
  const ref = useRef(null);
  const glare = useRef(null);

  const move = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,240,220,0.14), rgba(255,240,220,0) 55%)`;
    }
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      data-testid={testId}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerUp={leave}
      className={`relative will-change-transform [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1)] ${className}`}
    >
      {children}
      <div ref={glare} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 [transition:opacity_0.4s_ease]" />
    </div>
  );
};
