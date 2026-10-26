import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Camera, Film, MessageCircleHeart } from "lucide-react";
import { PHOTOS } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: Camera, t: "Foto inedite", d: "Scatti privati mai usciti dai miei social." },
  { icon: Film, t: "Video privati", d: "Clip esclusive, girate solo per questo spazio." },
  { icon: MessageCircleHeart, t: "Su richiesta", d: "Mi dici cosa desideri, lo creo per te." },
];

export const AboutSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="mondo" ref={ref} data-testid="about-section" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-3 rounded-[30px] border border-[rgba(214,178,94,0.22)]" />
            <div className="relative overflow-hidden rounded-[26px] aspect-[4/5]">
              <motion.img style={{ y, scale: 1.15 }} src={PHOTOS.about} alt="Il mio mondo" loading="lazy" className="h-full w-full object-cover object-[40%_center]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d]/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-2 rounded-2xl border border-[rgba(242,215,208,0.22)] bg-[#141418] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:-right-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#b9b2aa]"><E k="about.badge1">Nuovi drop</E></div>
              <div className="font-display text-2xl italic text-[color:var(--rose)]"><E k="about.badge2">ogni settimana</E></div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeader k="about"
            label="Il mio mondo"
            title={<T k="about" a="Niente filtri." b="Solo io." />}
            text="Qui trovi la versione di me che non pubblico da nessuna parte. Contenuti inediti, privati, curati nei minimi dettagli — e la possibilità di chiedermi esattamente ciò che desideri."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} delay={0.1 * i}>
                <div className="lux-card h-full p-5" data-testid={`about-feature-${i}`}>
                  <f.icon className="h-5 w-5 text-[color:var(--gold)]" />
                  <div className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f5f2ee]"><E k={`about.f${i}.t`}>{f.t}</E></div>
                  <p className="mt-2 text-sm text-[#b9b2aa]"><E k={`about.f${i}.d`} multiline>{f.d}</E></p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
