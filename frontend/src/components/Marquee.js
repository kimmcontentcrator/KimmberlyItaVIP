import { E } from "../context/ContentContext";
import { Sparkle } from "lucide-react";

const WORDS = ["Foto inedite", "Video privati", "Bundle esclusivi", "Cataloghi", "Su richiesta", "Solo 18+", "Mai pubblicati"];

export const Marquee = () => {
  const items = [...WORDS, ...WORDS];
  return (
    <div data-testid="marquee-strip" className="relative overflow-hidden border-y border-[rgba(0,175,240,0.14)] bg-[#0f0f12] py-5">
      <div className="marquee-track">
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-6 px-6 font-display text-2xl italic text-[#f5f2ee]/90 sm:text-3xl">
            <E k={`marquee.${i % WORDS.length}`}>{w}</E>
            <Sparkle className="h-4 w-4 text-[color:var(--gold)]" />
          </span>
        ))}
      </div>
    </div>
  );
};
