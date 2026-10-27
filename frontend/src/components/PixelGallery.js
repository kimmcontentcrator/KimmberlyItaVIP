import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Flame, ArrowRight } from "lucide-react";
import { GALLERY } from "../config/site";
import { E } from "../context/ContentContext";
import { UnlockDrawer } from "./UnlockDrawer";
import { EASE } from "./Reveal";

// Mostra SOLO versioni pixelate pre-generate (mai gli originali). 3 varianti in dissolvenza = mosaico che "vibra".
export const PixelatedPhotoCard = ({ photo, onUnlock, index = 0, className = "" }) => (
  <motion.button
    type="button"
    data-testid={`pixelated-photo-card-${photo.id}`}
    onClick={() => onUnlock(photo)}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
    className={`pix-card group relative aspect-[9/16] w-full overflow-hidden rounded-[22px] border border-[rgba(0,175,240,0.22)] bg-[#141418] text-left shadow-[0_18px_60px_rgba(0,0,0,0.55)] ${className}`}
    aria-label={`${photo.title}: sblocca`}
  >
    {["a", "b", "c"].map((v, i) => (
      <img
        key={v}
        src={`/photos/pix/${photo.set}-${v}.webp`}
        alt=""
        aria-hidden
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`pix-img pix-img-${i} absolute inset-0 h-full w-full object-cover`}
      />
    ))}
    <span className="pix-shimmer pointer-events-none absolute inset-0" />
    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/60 to-transparent" />

    <span className="absolute left-3 top-3 rounded-md border border-[rgba(0,175,240,0.45)] bg-[#0b0b0d]/85 px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-[color:var(--gold)]">18+</span>
    {photo.badge && (
      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[color:var(--rose)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0b0b0d]">
        <Flame className="h-3 w-3" /> {photo.badge}
      </span>
    )}

    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
      <span>
        <span className="block text-[10px] uppercase tracking-[0.25em] text-[color:var(--blush)]">{photo.kind} · {photo.count}</span>
        <span className="mt-1 block font-display text-xl italic leading-none text-[#f5f2ee] sm:text-2xl">{photo.title}</span>
      </span>
      <span className="btn-gold flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-transform group-hover:-translate-y-0.5">
        <Lock className="h-3.5 w-3.5" /> Sblocca
      </span>
    </span>
  </motion.button>
);

export const PixelGallery = ({ onRequest }) => {
  const [sel, setSel] = useState(null);
  return (
    <section id="foto" data-testid="pixel-gallery" className="relative pb-10 pt-4 sm:pb-16">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-5 sm:px-8">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--blush)]/80"><E k="gallery.label">Inediti · pixelati finché non sblocchi</E></span>
          <h2 className="mt-2 font-display text-3xl font-semibold uppercase leading-none text-[#f5f2ee] sm:text-5xl"><E k="gallery.title">Guarda.</E> <span className="text-gold-sheen italic"><E k="gallery.title2">Poi sblocca.</E></span></h2>
        </div>
        <button data-testid="gallery-see-plans" onClick={() => setSel(GALLERY[0])} className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold-light)] hover:text-[#f5f2ee] sm:flex">
          Sblocca tutto <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mobile: scorrimento orizzontale a scatti, card grandi (come il riferimento). Desktop: griglia. */}
      <div data-testid="pixel-gallery-track" className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        {GALLERY.map((p, i) => (
          <div key={p.id} className="w-[78vw] max-w-[380px] shrink-0 snap-center">
            <PixelatedPhotoCard photo={p} index={i} onUnlock={setSel} />
          </div>
        ))}
        <div className="w-[78vw] max-w-[380px] shrink-0 snap-center"><MoreTile onClick={() => setSel(GALLERY[0])} /></div>
      </div>
      <div className="mx-auto mt-6 hidden max-w-7xl grid-cols-4 gap-4 px-8 sm:grid">
        {GALLERY.map((p, i) => <PixelatedPhotoCard key={p.id} photo={p} index={i} onUnlock={setSel} />)}
        <MoreTile onClick={() => setSel(GALLERY[0])} />
      </div>

      <UnlockDrawer photo={sel} onClose={() => setSel(null)} onRequest={onRequest} />
    </section>
  );
};

const MoreTile = ({ onClick }) => (
  <motion.button
    type="button"
    data-testid="gallery-more-tile"
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: EASE }}
    className="lux-card relative flex aspect-[9/16] w-full flex-col items-center justify-center gap-4 rounded-[22px] p-6 text-center"
  >
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,175,240,0.4)] bg-[rgba(0,175,240,0.1)]">
      <Lock className="h-7 w-7 text-[color:var(--gold)]" />
    </span>
    <span className="font-display text-4xl italic text-[#f5f2ee]"><E k="gallery.more.n">120+</E></span>
    <span className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--blush)]"><E k="gallery.more.t">foto e video nel Vault</E></span>
    <span className="btn-gold mt-2 rounded-xl px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]">Sblocca tutto</span>
  </motion.button>
);
