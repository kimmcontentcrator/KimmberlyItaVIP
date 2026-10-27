import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { HOME_VARIANTS, useHomeVariant } from "../lib/homeVariant";

// Selettore temporaneo per confrontare le due home (A/B). Da rimuovere quando la creator sceglie la definitiva.
export const PreviewToggle = () => {
  const [v, set] = useHomeVariant();
  return (
    <div data-testid="home-preview-toggle" className="fixed right-3 top-[4.6rem] z-[55] flex items-center gap-1 rounded-full border border-[rgba(0,175,240,0.35)] bg-[#0b0b0d]/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:right-6 lg:top-20">
      <span className="hidden items-center gap-1 pl-2 text-[10px] uppercase tracking-[0.2em] text-[#8a847d] sm:flex"><LayoutTemplate className="h-3 w-3" /> Preview</span>
      {HOME_VARIANTS.map((h) => {
        const on = h.id === v;
        return (
          <button
            key={h.id}
            data-testid={`home-preview-${h.id}`}
            title={h.title}
            aria-pressed={on}
            onClick={() => { set(h.id); if (window.location.pathname !== "/") window.__navigate?.("/"); }}
            className={`relative h-8 min-w-[2.2rem] rounded-full px-3 text-[11px] font-semibold tracking-[0.12em] transition-colors ${on ? "text-[#0b0b0d]" : "text-[#b9b2aa] hover:text-[#f5f2ee]"}`}
          >
            {on && <motion.span layoutId="preview-pill" className="btn-gold absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{h.label}</span>
          </button>
        );
      })}
    </div>
  );
};
