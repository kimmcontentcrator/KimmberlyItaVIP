import { useEffect, useState } from "react";
import { Menu, Crown, User, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { scrollToId } from "../lib/scroll";
import { BRAND } from "../config/site";
import { useFan } from "../context/FanContext";
import { usePresence } from "../hooks/usePresence";

export const NAV = [
  { id: "mondo", label: "Il mio mondo" },
  { id: "esclusivi", label: "Esclusivi" },
  { id: "offerte", label: "Offerte" },
  { id: "cataloghi", label: "Cataloghi" },
  { id: "vault", label: "Vault" },
  { id: "topfan", label: "Top Fan" },
  { id: "richieste", label: "Su richiesta" },
  { id: "contatti", label: "Contatti" },
];

export const LiveCounter = () => {
  const online = usePresence();
  if (!online) return null;
  return (
    <span data-testid="live-counter" className="flex items-center gap-2 rounded-full border border-[rgba(242,215,208,0.2)] bg-[#141418] px-3 py-1.5 text-[11px] text-[#e9e4de]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--rose)] opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rose)]" />
      </span>
      <span className="tabular-nums">{online}</span><span className="whitespace-nowrap">qui ora</span>
    </span>
  );
};

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { fan, setSheetOpen } = useFan();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), 150);
  };

  return (
    <header
      data-testid="main-navbar"
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-[rgba(214,178,94,0.12)] bg-[#0b0b0d]/90 backdrop-blur-xl" : "bg-gradient-to-b from-[#0b0b0d] to-[#0b0b0d]/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-5 sm:px-8">
        <button data-testid="nav-logo" onClick={() => go("top")} className="flex items-baseline gap-2">
          <span className="text-gold-sheen font-display text-2xl italic">{BRAND.short}</span>
          <span className="hidden text-[10px] font-semibold tracking-[0.35em] text-[#f5f2ee]/80 sm:inline">ITA·VIP</span>
        </button>

        <nav className="hidden items-center gap-5 2xl:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-link-${n.id}`}
              onClick={() => go(n.id)}
              className="whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-[#b9b2aa] transition-colors hover:text-[color:var(--blush)]"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LiveCounter />
          <button
            data-testid="nav-account-button"
            onClick={() => setSheetOpen(true)}
            className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-[rgba(242,215,208,0.25)] bg-[#141418] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#f5f2ee] transition-colors hover:border-[color:var(--rose)] lg:flex"
          >
            <User className="h-3.5 w-3.5" /> {fan ? `@${fan.username}` : "Accedi"}
          </button>
          <button
            data-testid="nav-contact-cta-button"
            onClick={() => go("offerte")}
            className="btn-gold hidden items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] md:flex"
          >
            <Crown className="h-3.5 w-3.5" /> Entra nella Crew
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="nav-open-menu-button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(242,215,208,0.25)] bg-[#141418] text-[#f5f2ee] 2xl:hidden"
                aria-label="Apri menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" data-lenis-prevent className="w-[85%] overflow-y-auto border-l border-[rgba(214,178,94,0.18)] bg-[#0b0b0d] text-[#f5f2ee]">
              <SheetTitle className="text-gold-sheen font-display text-3xl italic">{BRAND.short}</SheetTitle>
              <div className="mt-8 flex flex-col">
                {NAV.map((n, i) => (
                  <button
                    key={n.id}
                    data-testid={`mobile-nav-link-${n.id}`}
                    onClick={() => go(n.id)}
                    className="flex items-center justify-between border-b border-[rgba(214,178,94,0.1)] py-3.5 text-left font-display text-2xl text-[#f5f2ee] transition-colors hover:text-[color:var(--rose)]"
                  >
                    {n.label}
                    <span className="font-sans text-[10px] tracking-[0.3em] text-[color:var(--gold)]">0{i + 1}</span>
                  </button>
                ))}
              </div>
              <button
                data-testid="mobile-nav-account-button"
                onClick={() => { setOpen(false); setTimeout(() => setSheetOpen(true), 250); }}
                className="btn-ghost-lux mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm uppercase tracking-[0.14em]"
              >
                <User className="h-4 w-4" /> {fan ? "Il mio profilo" : "Accedi con codice"}
              </button>
              <button
                data-testid="mobile-nav-cta-button"
                onClick={() => go("offerte")}
                className="btn-gold mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-[0.14em]"
              >
                <Crown className="h-4 w-4" /> Entra nella Crew
              </button>
              <a
                href="/admin"
                data-testid="mobile-nav-admin-link"
                className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8a847d] hover:text-[color:var(--blush)]"
              >
                <Lock className="h-3 w-3" /> Area creator · Modifica sito
              </a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
