import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Images, Gem, Lock, User } from "lucide-react";
import { goTo } from "../lib/scroll";
import { useFan } from "../context/FanContext";

const ITEMS = [
  { id: "top", label: "Casa", icon: Home },
  { id: "foto", label: "Foto", icon: Images },
  { id: "offerte", label: "Piani", icon: Gem },
  { id: "vault", label: "Vault", icon: Lock },
];

// Navigazione inferiore stile app (solo mobile/tablet)
export const BottomNav = () => {
  const { setSheetOpen, fan } = useFan();
  const [active, setActive] = useState("top");

  useEffect(() => {
    const ids = ITEMS.map((i) => i.id);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const tap = (id) => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (id === "profilo") { setSheetOpen(true); return; }
    goTo(id);
  };

  return (
    <nav data-testid="bottom-nav" className="fixed bottom-3 left-3 right-3 z-50 rounded-[22px] border border-[rgba(0,175,240,0.2)] bg-[#111114]/95 px-2 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {[...ITEMS, { id: "profilo", label: fan ? "Profilo" : "Accedi", icon: User }].map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} data-testid={`bottom-nav-${it.id}`} onClick={() => tap(it.id)} className="relative flex flex-col items-center gap-1 rounded-2xl py-2">
              {on && <motion.span layoutId="bnav" className="absolute inset-0 rounded-2xl bg-[rgba(0,175,240,0.12)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <it.icon className={`relative h-[18px] w-[18px] ${on ? "text-[color:var(--gold-light)]" : "text-[#b9b2aa]"}`} />
              <span className={`relative text-[10px] tracking-[0.06em] ${on ? "text-[#f5f2ee]" : "text-[#8a847d]"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
