import { Reveal } from "./Reveal";
import { E } from "../context/ContentContext";

// k = prefisso chiave per i testi modificabili (label / text)
export const SectionHeader = ({ k, label, title, text, align = "left", testId }) => (
  <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`} data-testid={testId}>
    <Reveal>
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="dot-glow" />
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--blush)]/80">
          {k ? <E k={`${k}.label`}>{label}</E> : label}
        </span>
      </div>
    </Reveal>
    <Reveal delay={0.08}>
      <h2 className="mt-5 font-display text-[2.1rem] font-semibold uppercase leading-[1.02] tracking-[0.01em] text-[#f5f2ee] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
    </Reveal>
    {text && (
      <Reveal delay={0.16}>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#b9b2aa] sm:text-base">
          {k ? <E k={`${k}.text`} multiline>{text}</E> : text}
        </p>
      </Reveal>
    )}
  </div>
);

// Titolo a 2 righe con parte evidenziata, tutto modificabile
export const T = ({ k, a, b, c, bClass = "text-gold-sheen italic", br = true }) => (
  <>
    <E k={`${k}.t1`}>{a}</E>
    {br ? <br /> : " "}
    {b && <span className={bClass}><E k={`${k}.t2`}>{b}</E></span>}
    {c && <> <E k={`${k}.t3`}>{c}</E></>}
  </>
);
