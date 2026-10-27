import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Camera, Layers, Lock, ArrowUpRight } from "lucide-react";
import { CATALOG, CATALOG_FILTERS } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E, useEditable, toNum } from "../context/ContentContext";
import { EASE } from "./Reveal";
import { goTo } from "../lib/scroll";

const ICON = { Foto: Camera, Video: Play, Bundle: Layers };

export const CatalogSection = ({ onRequest }) => {
  const [filter, setFilter] = useState("Tutti");
  const get = useEditable();

  const items = useMemo(() => {
    if (filter === "Tutti") return CATALOG;
    if (filter === "Novità") return CATALOG.filter((c) => c.isNew);
    return CATALOG.filter((c) => c.cat === filter);
  }, [filter]);

  return (
    <section id="cataloghi" data-testid="catalog-section" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader k="catalog"
          label="Cataloghi privati"
          title={<T k="catalog" a="Il catalogo" b="segreto." br={false} bClass="text-[color:var(--rose)] italic" />}
          text="Collezioni di foto, video e bundle pronti da sbloccare. Contenuti e prezzi di esempio, li aggiorniamo insieme."
        />

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist" data-testid="catalog-filters">
          {CATALOG_FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={on}
                data-testid={`catalog-filter-pill-${f.toLowerCase().replace("à", "a")}`}
                onClick={() => setFilter(f)}
                className={`relative shrink-0 rounded-full px-5 py-2.5 text-[12px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                  on ? "text-[#0b0b0d]" : "border border-[rgba(242,215,208,0.2)] bg-[#141418] text-[#b9b2aa] hover:text-[#f5f2ee]"
                }`}
              >
                {on && <motion.span layoutId="pill" className="btn-gold absolute inset-0 rounded-full" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="relative z-10 font-semibold">{f}</span>
              </button>
            );
          })}
        </div>

        <motion.div layout data-testid="catalog-results-grid" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((c) => {
              const Icon = ICON[c.cat] || Camera;
              return (
                <motion.article
                  layout
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  data-testid="catalog-item-card"
                  className="lux-card group overflow-hidden"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img src={c.img} alt={c.title} loading="lazy" style={{ objectPosition: c.pos }} className="gpu h-full w-full scale-110 object-cover blur-[8px] transition-transform duration-700 group-hover:scale-[1.18]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-[#0b0b0d]/20 to-[#0b0b0d]/10" />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#0b0b0d]/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--blush)] backdrop-blur">
                        <Icon className="h-3 w-3" /> {c.cat}
                      </span>
                      {c.isNew && <span className="btn-gold rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">Nuovo</span>}
                    </div>
                    <Lock className="absolute right-4 top-4 h-4 w-4 text-[#f5f2ee]/80" />
                  </div>
                  <div className="flex items-end justify-between gap-4 p-5">
                    <div>
                      <h3 className="font-display text-2xl text-[#f5f2ee]"><E k={`catalog.${c.id}.title`}>{c.title}</E></h3>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]"><E k={`catalog.${c.id}.meta`}>{c.meta}</E></p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">da</div>
                      <div className="font-display text-2xl text-[color:var(--gold-light)] tabular-nums">€<E k={`catalog.${c.id}.price`}>{String(c.price)}</E></div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <button
                      data-testid={`catalog-request-${c.id}`}
                      onClick={() => onRequest({ type: c.cat === "Video" ? "video" : c.cat === "Bundle" ? "bundle" : "foto", item: get(`catalog.${c.id}.title`, c.title), price: toNum(get(`catalog.${c.id}.price`, String(c.price)), c.price), kind: "catalog", id: c.id })}
                      className="btn-ghost-lux flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] uppercase tracking-[0.16em]"
                    >
                      Richiedi <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <div data-testid="catalog-empty-state" className="lux-card mt-8 p-10 text-center">
            <p className="font-display text-2xl italic text-[#f5f2ee]">Nulla qui, per ora.</p>
            <button onClick={() => goTo("richieste")} className="btn-gold mt-5 rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em]">
              Chiedimelo tu
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
