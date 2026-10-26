import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { IntroGate } from "../components/IntroGate";
import { Navbar } from "../components/Navbar";
import { ParallaxHero } from "../components/ParallaxHero";
import { Marquee } from "../components/Marquee";
import { AboutSection } from "../components/AboutSection";
import { HowItWorks } from "../components/HowItWorks";
import { LockedPreviewGrid } from "../components/LockedPreviewGrid";
import { OffersSection } from "../components/OffersSection";
import { CatalogSection } from "../components/CatalogSection";
import { VaultSection } from "../components/VaultSection";
import { TopFanSection } from "../components/TopFanSection";
import { RulesSection } from "../components/RulesSection";
import { CustomRequestForm } from "../components/CustomRequestForm";
import { ContactSection } from "../components/ContactSection";
import { FAQSection } from "../components/FAQSection";
import { FooterLuxury } from "../components/FooterLuxury";
import { AccountSheet } from "../components/AccountSheet";
import { BottomNav } from "../components/BottomNav";
import { scrollToId } from "../lib/scroll";
import { useContent } from "../context/ContentContext";

export default function Landing() {
  const [verified, setVerified] = useState(() => localStorage.getItem("kv_age_verified") === "1");
  const [prefill, setPrefill] = useState(null);
  const { editing } = useContent();
  useEffect(() => { if (editing) setVerified(true); }, [editing]);

  useEffect(() => {
    if (!verified) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; };
  }, [verified]);

  const onRequest = useCallback((p) => {
    setPrefill({ ...p, nonce: Date.now() });
    setTimeout(() => scrollToId("richieste"), 60);
  }, []);

  return (
    <div className="grain relative bg-[#0b0b0d]" data-testid="landing-page">
      {!verified && <IntroGate onDone={() => setVerified(true)} />}
      <Navbar />
      <main>
        <ParallaxHero ready={verified} />
        <Marquee />
        <AboutSection />
        <HowItWorks />
        <LockedPreviewGrid onRequest={onRequest} />
        <OffersSection onRequest={onRequest} />
        <CatalogSection onRequest={onRequest} />
        <VaultSection />
        <TopFanSection />
        <CustomRequestForm prefill={prefill} />
        <RulesSection />
        <ContactSection />
        <FAQSection />
      </main>
      <FooterLuxury />
      <AccountSheet />
      <BottomNav />
    </div>
  );
}
