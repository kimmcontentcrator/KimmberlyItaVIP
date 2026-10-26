import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";

const STEPS = [
  { n: "01", t: "Scegli", d: "Un bundle, un catalogo o un contenuto singolo che ti intriga." },
  { n: "02", t: "Richiedi", d: "Invia la richiesta dal sito o scrivimi sul tuo canale preferito." },
  { n: "03", t: "Sblocca", d: "Ti rispondo personalmente e ricevi il contenuto in privato." },
];

export const HowItWorks = () => (
  <section data-testid="how-section" className="relative overflow-hidden bg-[#0f0f12] py-24 sm:py-32">
    <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(214,178,94,0.10), rgba(214,178,94,0) 70%)" }} />
    <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
      <SectionHeader k="how" label="Come funziona" title={<T k="how" a="Scegli. Richiedi." b="Sblocca." bClass="text-[color:var(--rose)] italic" />} />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div className="lux-card group relative h-full overflow-hidden p-7" data-testid={`how-step-${s.n}`}>
              <span className="absolute -right-2 -top-6 font-display text-[7rem] italic leading-none text-[rgba(214,178,94,0.08)] transition-colors duration-500 group-hover:text-[rgba(231,184,200,0.14)]">{s.n}</span>
              <span className="text-[11px] tracking-[0.3em] text-[color:var(--gold)]">{s.n}</span>
              <h3 className="mt-6 font-display text-3xl uppercase text-[#f5f2ee]"><E k={`how.s${i}.t`}>{s.t}</E></h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b9b2aa]"><E k={`how.s${i}.d`} multiline>{s.d}</E></p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
