import { useState } from "react";
import { Lock, Play, Camera, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { PREVIEWS } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";

export const LockedPreviewGrid = ({ onRequest }) => {
  const [active, setActive] = useState(null);

  return (
    <section id="esclusivi" data-testid="locked-preview-section" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader k="previews"
            label="Anteprima esclusiva"
            title={<T k="previews" a="Inediti. Privati." b="Tuoi." />}
            text="Tocca un contenuto per scoprire come sbloccarlo. Le anteprime sono volutamente sfocate: il resto lo vedi solo tu."
          />
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {PREVIEWS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <button
                data-testid="locked-preview-item"
                onClick={() => setActive(p)}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[22px] border border-[rgba(214,178,94,0.16)] text-left"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  style={{ objectPosition: p.pos }}
                  className="gpu h-full w-full scale-125 object-cover blur-[14px] transition-transform duration-700 group-hover:scale-[1.3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/30 to-[#0b0b0d]/20" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#0b0b0d]/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--blush)] backdrop-blur">
                  {p.kind === "Video" ? <Play className="h-3 w-3" /> : <Camera className="h-3 w-3" />} {p.kind}
                </span>
                <span className="absolute right-3 top-3 rounded-full border border-[rgba(214,178,94,0.4)] bg-[#0b0b0d]/80 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-[color:var(--gold)]">VIP</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(242,215,208,0.35)] bg-[#0b0b0d]/70 backdrop-blur transition-[transform,border-color] duration-500 group-hover:scale-110 group-hover:border-[color:var(--gold)]">
                    <Lock className="h-5 w-5 text-[#f5f2ee]" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-display text-lg leading-tight text-[#f5f2ee] sm:text-xl"><E k={`preview.${p.id}.title`}>{p.title}</E></div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]"><E k={`preview.${p.id}.count`}>{p.count}</E></div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent data-testid="locked-preview-dialog" className="max-w-md overflow-hidden rounded-[24px] border border-[rgba(214,178,94,0.22)] bg-[#111114] p-0 text-[#f5f2ee]">
          {active && (
            <>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={active.img} alt={active.title} style={{ objectPosition: active.pos }} className="h-full w-full scale-125 object-cover blur-[18px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111114] to-[#111114]/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Lock className="h-7 w-7 text-[color:var(--gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--blush)]">Contenuto bloccato</span>
                </div>
              </div>
              <div className="p-6 pt-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">{active.kind} · {active.count}</span>
                <DialogTitle className="mt-2 font-display text-3xl font-normal italic"><E k={`preview.${active.id}.title`}>{active.title}</E></DialogTitle>
                <DialogDescription className="mt-3 text-sm leading-relaxed text-[#b9b2aa]">
                  Contenuto inedito disponibile solo in privato. Invia una richiesta e ti rispondo con tutti i dettagli per sbloccarlo.
                </DialogDescription>
                <button
                  data-testid="locked-preview-request-button"
                  onClick={() => {
                    onRequest({ type: active.kind === "Video" ? "video" : "foto", item: active.title });
                    setActive(null);
                  }}
                  className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  <Crown className="h-4 w-4" /> Richiedi accesso
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
