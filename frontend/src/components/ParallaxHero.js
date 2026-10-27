import { E } from "../context/ContentContext";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lock, MessageCircleHeart, ChevronDown } from "lucide-react";
import { BRAND, PHOTOS } from "../config/site";
import { Sparkles } from "./Sparkles";
import { EASE } from "./Reveal";
import { goTo } from "../lib/scroll";

export const ParallaxHero = ({ ready }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const a = (d) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, ease: EASE, delay: d },
  });

  return (
    <section id="top" ref={ref} data-testid="hero-section" className="relative min-h-[100svh] overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={PHOTOS.hero}
          alt="Kimmberlyy"
          className="kenburns h-full w-full object-cover object-[42%_30%]"
          fetchpriority="high"
        />
      </motion.div>
      {/* overlays */}
      <div className="absolute inset-0 bg-[#0b0b0d]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/50 to-[#0b0b0d]/30" />
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#0b0b0d]/90 via-[#0b0b0d]/40 to-transparent md:w-2/3" />
      <div className="pointer-events-none absolute -right-20 top-10 h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,175,240,0.20), rgba(0,175,240,0) 65%)" }} />
      <div className="pointer-events-none absolute -left-24 bottom-24 h-[380px] w-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(231,184,200,0.16), rgba(231,184,200,0) 65%)" }} />
      <Sparkles density={45} />

      <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-32 pt-28 sm:px-8 md:justify-center md:pb-20">
        <motion.div {...a(0.1)} className="flex items-center gap-3">
          <span className="dot-glow" />
          <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--blush)]"><E k="hero.label">Club privato · 18+ · Italia</E></span>
        </motion.div>

        <motion.h1 {...a(0.25)} className="mt-6 font-display leading-[0.9]" data-testid="hero-title">
          <span className="text-gold-sheen block text-[3.3rem] italic min-[400px]:text-[3.7rem] sm:text-8xl lg:text-[9.5rem]"><E k="brand.short">{BRAND.short}</E></span>
          <span className="mt-3 flex items-center gap-4 font-sans text-sm font-semibold uppercase tracking-[0.6em] text-[#f5f2ee] sm:text-base">
            <E k="hero.sub1">ITA</E> <span className="h-px w-10 bg-[color:var(--gold)]" /> <E k="hero.sub2">VIP</E>
          </span>
        </motion.h1>

        <motion.p {...a(0.4)} className="mt-7 max-w-md text-base leading-relaxed text-[#e9e4de] sm:text-lg">
          <E k="hero.p1">Foto e video</E> <span className="text-[color:var(--rose)]"><E k="hero.p2">inediti</E></span><E k="hero.p3">, mai pubblicati altrove. Bundle, cataloghi privati e contenuti creati</E> <span className="text-[color:var(--gold-light)]"><E k="hero.p4">solo per te</E></span><E k="hero.p5">, su richiesta.</E>
        </motion.p>

        <motion.div {...a(0.55)} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            data-testid="hero-primary-cta"
            onClick={() => goTo("esclusivi")}
            className="btn-gold flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em]"
          >
            <Lock className="h-4 w-4" /> <E k="hero.cta1">Sblocca i contenuti</E>
          </button>
          <button
            data-testid="hero-secondary-cta"
            onClick={() => goTo("richieste")}
            className="btn-ghost-lux flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm uppercase tracking-[0.14em]"
          >
            <MessageCircleHeart className="h-4 w-4" /> <E k="hero.cta2">Richiesta personalizzata</E>
          </button>
        </motion.div>

        <motion.div {...a(0.7)} className="mt-10 grid max-w-lg grid-cols-3 gap-3">
          {[
            ["100%", "Inediti"],
            ["24h", "Risposta"],
            ["VIP", "Su richiesta"],
          ].map(([k, v], i) => (
            <div key={v} className="rounded-2xl border border-[rgba(0,175,240,0.16)] bg-[#111114]/90 px-4 py-3">
              <div className="font-display text-xl text-[color:var(--gold-light)] tabular-nums"><E k={`hero.stat${i}.k`}>{k}</E></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#b9b2aa]"><E k={`hero.stat${i}.v`}>{v}</E></div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <button
        data-testid="hero-scroll-hint"
        onClick={() => goTo("mondo")}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:flex items-center gap-2 rounded-full border border-[rgba(242,215,208,0.2)] bg-[#111114]/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b9b2aa] backdrop-blur"
      >
        Scorri <ChevronDown className="floaty h-3.5 w-3.5 text-[color:var(--gold)]" />
      </button>
    </section>
  );
};
