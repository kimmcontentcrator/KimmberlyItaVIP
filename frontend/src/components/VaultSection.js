import { Lock, Play, KeyRound } from "lucide-react";
import { VAULT } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";
import { scrollToId } from "../lib/scroll";
import { useFan } from "../context/FanContext";

export const VaultSection = () => {
  const { fan, setSheetOpen } = useFan();
  return (
    <section id="vault" data-testid="vault-section" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <SectionHeader k="vault"
              label="Riservato · Solo Crew"
              title={<T k="vault" a="Il" b="Vault" c="privato." br={false} />}
              text="Video inediti esclusivi, accessibili solo con Kimm Mensile o Elite attiva. Contenuti nuovi ogni mese."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                data-testid="vault-unlock-button"
                onClick={() => scrollToId("offerte")}
                className="btn-gold flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em]"
              >
                <Lock className="h-4 w-4" /> <E k="vault.cta">Sblocca l'abbonamento</E>
              </button>
              {!fan && (
                <button
                  data-testid="vault-login-button"
                  onClick={() => setSheetOpen(true)}
                  className="btn-ghost-lux flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm uppercase tracking-[0.14em]"
                >
                  <KeyRound className="h-4 w-4" /> Ho già un codice
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {VAULT.map((v, i) => (
              <Reveal key={v.id} delay={i * 0.1}>
                <div data-testid={`vault-item-${v.id}`} className="group relative aspect-[9/16] overflow-hidden rounded-[20px] border border-[rgba(214,178,94,0.2)]">
                  <img src={v.img} alt={v.title} loading="lazy" style={{ objectPosition: v.pos }} className="gpu h-full w-full scale-125 object-cover blur-[16px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/30 to-[#0b0b0d]/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(242,215,208,0.35)] bg-[#0b0b0d]/70 transition-transform duration-500 group-hover:scale-110">
                      <Play className="h-4 w-4 text-[#f5f2ee]" />
                    </span>
                  </div>
                  <span className="absolute right-2 top-2 rounded-full bg-[#0b0b0d]/80 px-2 py-0.5 text-[10px] tabular-nums text-[#e9e4de]">{v.dur}</span>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-display text-base text-[#f5f2ee] sm:text-lg"><E k={`vault.${v.id}.title`}>{v.title}</E></div>
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-[color:var(--gold)]"><Lock className="h-2.5 w-2.5" /> Solo Crew</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
