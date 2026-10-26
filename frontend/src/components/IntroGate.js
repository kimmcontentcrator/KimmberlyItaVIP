import { E } from "../context/ContentContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut } from "lucide-react";
import { BRAND } from "../config/site";
import { Sparkles } from "./Sparkles";
import { EASE } from "./Reveal";

// Intro cinematica + verifica 18+
export const IntroGate = ({ onDone }) => {
  const [step, setStep] = useState("intro");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setStep("gate"), reduce ? 0 : 3400);
    const onKey = (e) => e.key === "Escape" && setStep("gate");
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const enter = () => {
    localStorage.setItem("kv_age_verified", "1");
    setLeaving(true);
    setTimeout(() => {
      document.body.style.overflow = "";
      onDone();
    }, 900);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  const letters = BRAND.short.split("");

  return (
    <motion.div
      data-testid="intro-gate"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#070708]"
      animate={leaving ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/* glow orb */}
      <motion.div
        className="absolute h-[60vmax] w-[60vmax] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(214,178,94,0.22) 0%, rgba(231,184,200,0.10) 35%, rgba(7,7,8,0) 65%)" }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.1, 1], opacity: [0, 1, 0.85] }}
        transition={{ duration: 2.6, ease: EASE }}
      />
      <Sparkles density={70} />

      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#b9b2aa]">Club privato · 18+</span>
        {step === "intro" && (
          <button
            data-testid="intro-skip-button"
            onClick={() => setStep("gate")}
            className="whitespace-nowrap rounded-full border border-[rgba(242,215,208,0.25)] bg-[#141418] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#f5f2ee] transition-colors hover:border-[color:var(--rose)]"
          >
            Salta l'intro
          </button>
        )}
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          animate={{ opacity: 1, letterSpacing: "0.45em" }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
          className="text-[10px] uppercase text-[color:var(--rose)]"
        >
          <E k="intro.welcome">Benvenuto nel mio mondo</E>
        </motion.span>

        <h1 className="mt-5 font-display text-[3.1rem] italic leading-none sm:text-7xl" aria-label={BRAND.short}>
          {letters.map((l, i) => (
            <motion.span
              key={i}
              className="text-gold-sheen inline-block"
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: EASE, delay: 0.6 + i * 0.07 }}
            >
              {l}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1.5 }}
          className="mt-4 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-[color:var(--gold)]/60" />
          <span className="text-xs font-semibold uppercase tracking-[0.5em] text-[#f5f2ee]">ITA · VIP</span>
          <span className="h-px w-10 bg-[color:var(--gold)]/60" />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "gate" ? (
            <motion.div
              key="gate"
              data-testid="age-gate-dialog"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mt-12 w-full rounded-[24px] border border-[rgba(214,178,94,0.22)] bg-[#111114] p-6 text-left shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,178,94,0.35)] text-[color:var(--gold)]">
                  <span className="text-sm font-bold">18+</span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#f5f2ee]"><E k="gate.title">Spazio riservato ad adulti</E></p>
                  <p className="text-xs text-[#b9b2aa]"><E k="gate.sub">Contenuti privati e inediti</E></p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-[#b9b2aa]">
                Entrando confermi di avere almeno <span className="text-[#f5f2ee]">18 anni</span> e di voler visualizzare contenuti destinati a un pubblico adulto.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  data-testid="age-gate-enter-button"
                  onClick={enter}
                  className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  <ShieldCheck className="h-4 w-4" /> Ho 18+ anni, entra
                </button>
                <button
                  data-testid="age-gate-exit-button"
                  onClick={exit}
                  className="btn-ghost-lux flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm uppercase tracking-[0.14em]"
                >
                  <LogOut className="h-4 w-4" /> Esci
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="tag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3, delay: 0 } }}
              transition={{ duration: 1, delay: 2 }}
              className="mt-10 font-display text-lg italic text-[#b9b2aa]"
            >
              <E k="brand.tagline">{BRAND.tagline}</E>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
