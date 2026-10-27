import { motion } from "framer-motion";
import { Lock, ChevronDown } from "lucide-react";
import { BRAND } from "../config/site";
import { E } from "../context/ContentContext";
import { EASE } from "./Reveal";
import { goTo } from "../lib/scroll";

// Hero compatto: brand, una frase diretta, due azioni. Le foto arrivano subito sotto.
export const MiniHero = () => {
  const a = (d) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: EASE, delay: d } });
  return (
    <section id="top" data-testid="mini-hero" className="relative overflow-hidden px-5 pb-5 pt-24 sm:px-8 sm:pt-28">
      <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,175,240,0.16), rgba(0,175,240,0) 65%)" }} />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.div {...a(0)} className="flex flex-wrap items-center gap-3">
            <span className="dot-glow" />
            <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--blush)]"><E k="hero.label">Privato · 18+ · Italia</E></span>
          </motion.div>
          <motion.h1 {...a(0.06)} className="mt-3 font-display leading-[0.9]" data-testid="hero-title">
            <span className="text-gold-sheen block text-[3rem] italic min-[400px]:text-[3.4rem] sm:text-7xl lg:text-8xl"><E k="brand.short">{BRAND.short}</E></span>
            <span className="mt-2 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.55em] text-[#f5f2ee] sm:text-sm">
              <E k="hero.sub1">ITA</E> <span className="h-px w-8 bg-[color:var(--gold)]" /> <E k="hero.sub2">VIP</E>
            </span>
          </motion.h1>
          <motion.p {...a(0.12)} className="mt-4 max-w-md text-base leading-snug text-[#e9e4de] sm:text-lg">
            <E k="hero.direct1">Foto e video</E> <span className="text-[color:var(--rose)]"><E k="hero.direct2">inediti</E></span><E k="hero.direct3">. Paghi, sblocchi, vedi subito. Niente rinnovi automatici.</E>
          </motion.p>
        </div>
        <motion.div {...a(0.18)} className="flex gap-3 md:flex-col md:items-end">
          <button data-testid="hero-primary-cta" onClick={() => goTo("offerte")} className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] md:flex-none md:px-8">
            <Lock className="h-4 w-4" /> <E k="hero.cta1">Sblocca ora</E>
          </button>
          <button data-testid="hero-secondary-cta" onClick={() => goTo("foto")} className="btn-ghost-lux flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm uppercase tracking-[0.14em]">
            <E k="hero.cta2">Le foto</E> <ChevronDown className="floaty h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
