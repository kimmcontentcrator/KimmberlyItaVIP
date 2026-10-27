import { useEffect, useState } from "react";
import axios from "axios";
import { Crown, Medal, Trophy } from "lucide-react";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";
import { API, goTo } from "../lib/scroll";
import { fmtEur } from "../config/site";

const MEDAL = [
  { c: "#f1d998", ring: "rgba(0,175,240,0.6)", label: "Gold", h: "h-40 sm:h-48" },
  { c: "#d9d6d2", ring: "rgba(217,214,210,0.45)", label: "Silver", h: "h-32 sm:h-40" },
  { c: "#c98f6b", ring: "rgba(201,143,107,0.5)", label: "Bronze", h: "h-28 sm:h-32" },
];

export const TopFanSection = () => {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    axios.get(`${API}/topfans`).then((r) => setRows(r.data)).catch(() => setRows([]));
  }, []);

  const podium = rows ? [rows[1], rows[0], rows[2]] : [];
  const order = [1, 0, 2];

  return (
    <section id="topfan" data-testid="topfan-section" className="relative overflow-hidden bg-[#0f0f12] py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-10 h-[360px] w-[700px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,175,240,0.10), rgba(0,175,240,0) 70%)" }} />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeader k="topfan"
          align="center"
          label="Classifica del mese"
          title={<T k="topfan" a="Top Fan" b="del mese" br={false} />}
          text="I sostenitori più vicini a me. Premio speciale ogni mese per il #1. Basata solo sugli acquisti confermati."
        />

        {rows === null && <div className="mx-auto mt-14 h-48 max-w-xl animate-pulse rounded-[24px] bg-[#141418]" />}

        {rows && rows.length === 0 && (
          <Reveal>
            <div data-testid="topfan-empty-state" className="lux-card mx-auto mt-14 max-w-xl p-10 text-center">
              <Trophy className="mx-auto h-10 w-10 text-[color:var(--gold)]" />
              <p className="mt-5 font-display text-3xl italic text-[#f5f2ee]"><E k="topfan.empty.t">Il trono è libero.</E></p>
              <p className="mt-2 text-sm text-[#b9b2aa]"><E k="topfan.empty.d" multiline>La classifica di questo mese è appena partita. Il primo posto può essere tuo.</E></p>
              <button onClick={() => goTo("offerte")} data-testid="topfan-cta" className="btn-gold mt-6 rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em]">
                Conquista il #1
              </button>
            </div>
          </Reveal>
        )}

        {rows && rows.length > 0 && (
          <>
            <div className="mt-16 grid grid-cols-3 items-end gap-3 sm:gap-5" data-testid="topfan-podium">
              {podium.map((r, i) => {
                const idx = order[i];
                const m = MEDAL[idx];
                return (
                  <Reveal key={idx} delay={i * 0.1}>
                    <div className="flex flex-col items-center text-center">
                      {r ? (
                        <>
                          {idx === 0 && <Crown className="mb-2 h-6 w-6 text-[color:var(--gold)]" />}
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#141418] font-display text-xl text-[#f5f2ee] sm:h-16 sm:w-16" style={{ boxShadow: `0 0 0 2px ${m.ring}, 0 0 30px ${m.ring}` }}>
                            {r.name[0]}
                          </div>
                          <div className="mt-3 text-sm font-semibold text-[#f5f2ee]">{r.name}</div>
                          <div className="font-display text-lg tabular-nums" style={{ color: m.c }}>{fmtEur(r.total)}</div>
                        </>
                      ) : (
                        <div className="text-xs uppercase tracking-[0.2em] text-[#b9b2aa]">Libero</div>
                      )}
                      <div className={`mt-4 flex w-full items-start justify-center rounded-t-2xl border-x border-t pt-3 ${m.h}`} style={{ borderColor: m.ring, background: "linear-gradient(180deg, rgba(26,26,32,0.95), rgba(15,15,18,0.4))" }}>
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: m.c }}><Medal className="h-3 w-3" /> #{idx + 1}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            {rows.length > 3 && (
              <div className="mx-auto mt-6 max-w-xl space-y-2" data-testid="topfan-list">
                {rows.slice(3).map((r) => (
                  <div key={r.rank} className="lux-card flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-[#b9b2aa]">#{r.rank}</span>
                    <span className="flex-1 px-4 text-sm text-[#f5f2ee]">{r.name}</span>
                    <span className="font-display tabular-nums text-[color:var(--gold-light)]">{fmtEur(r.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
