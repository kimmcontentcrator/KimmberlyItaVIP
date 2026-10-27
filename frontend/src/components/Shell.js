import { useEffect, useState } from "react";
import Lenis from "lenis";
import { IntroGate } from "./IntroGate";
import { Navbar } from "./Navbar";
import { FooterLuxury } from "./FooterLuxury";
import { AccountSheet } from "./AccountSheet";
import { BottomNav } from "./BottomNav";
import { PreviewToggle } from "./PreviewToggle";
import { useContent } from "../context/ContentContext";

// Involucro comune: age gate, navbar, scroll fluido, footer, account, barra inferiore.
export const Shell = ({ children, testId = "page", footer = true }) => {
  const [verified, setVerified] = useState(() => localStorage.getItem("kv_age_verified") === "1");
  const { editing } = useContent();
  useEffect(() => { if (editing) setVerified(true); }, [editing]);

  useEffect(() => {
    if (!verified) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; };
  }, [verified]);

  return (
    <div className="grain relative min-h-screen bg-[#0b0b0d]" data-testid={testId}>
      {!verified && <IntroGate onDone={() => setVerified(true)} />}
      <Navbar />
      <PreviewToggle />
      <main>{children}</main>
      {footer && <FooterLuxury />}
      <AccountSheet />
      <BottomNav />
    </div>
  );
};
