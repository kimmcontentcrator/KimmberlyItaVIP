import { Link } from "react-router-dom";
import { Lock, MessageCircleHeart, Sparkles, User, ShieldCheck, HelpCircle, Send, ArrowUpRight } from "lucide-react";
import { E } from "../context/ContentContext";

const LINKS = [
  { to: "/vault", icon: Lock, t: "Vault & Top Fan", d: "Video privati e classifica del mese" },
  { to: "/richiesta", icon: MessageCircleHeart, t: "Richiesta personalizzata", d: "Dimmi cosa vuoi: ti rispondo in 24h" },
  { to: "/come-funziona", icon: Sparkles, t: "Come funziona", d: "Scegli, paghi, ricevi" },
  { to: "/chi-sono", icon: User, t: "Chi sono", d: "Niente filtri. Solo io." },
  { to: "/regole", icon: ShieldCheck, t: "Regole", d: "Consenso, privacy, nessun rinnovo" },
  { to: "/domande", icon: HelpCircle, t: "Domande", d: "Tutto quello che vuoi sapere" },
  { to: "/contatti", icon: Send, t: "Contatti", d: "Telegram, Instagram, WhatsApp" },
];

// Preview A: il resto del sito e' a un tap, fuori dalla home.
export const QuickLinks = () => (
  <section id="altro" data-testid="quick-links" className="bg-[#0b0b0d] py-12 sm:py-16">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--blush)]/80"><E k="quick.label">Tutto il resto</E></span>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} data-testid={`quick-link-${l.to.slice(1)}`} className="lux-card group flex min-h-[44px] flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5">
            <span className="flex items-center justify-between">
              <l.icon className="h-5 w-5 text-[color:var(--gold)]" />
              <ArrowUpRight className="h-4 w-4 text-[#6f6a64] transition-colors group-hover:text-[color:var(--gold-light)]" />
            </span>
            <span>
              <span className="block font-display text-lg italic leading-tight text-[#f5f2ee]">{l.t}</span>
              <span className="mt-1 block text-xs text-[#8a847d]">{l.d}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
