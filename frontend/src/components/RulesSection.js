import { ShieldCheck, RefreshCcw, Unlock, Users, Ban, EyeOff } from "lucide-react";
import { RULES } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";

const ICONS = [RefreshCcw, Unlock, Users, ShieldCheck, Ban, EyeOff];

export const RulesSection = () => (
  <section id="regole" data-testid="rules-section" className="relative py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <SectionHeader k="rules" label="Trasparenza" title={<T k="rules" a="Regole chiare." b="Zero sorprese." bClass="text-[color:var(--rose)] italic" />} />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map((r, i) => {
          const I = ICONS[i % ICONS.length];
          return (
            <Reveal key={r.t} delay={(i % 3) * 0.08}>
              <div className="lux-card flex h-full gap-4 p-6" data-testid={`rule-${i}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(214,178,94,0.25)] bg-[#0b0b0d]">
                  <I className="h-4 w-4 text-[color:var(--gold)]" />
                </span>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f5f2ee]"><E k={`rule.${i}.t`}>{r.t}</E></div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#b9b2aa]"><E k={`rule.${i}.d`} multiline>{r.d}</E></p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
