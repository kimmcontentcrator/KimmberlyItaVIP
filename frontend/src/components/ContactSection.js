import { toast } from "sonner";
import { Send, Instagram, MessageCircle, Users, Gift } from "lucide-react";
import { CONTACTS } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E, useEditable } from "../context/ContentContext";
import { Reveal } from "./Reveal";

const ITEMS = [
  { key: "telegram", label: "Telegram", icon: Send, testId: "contact-telegram-button" },
  { key: "instagram", label: "Instagram", icon: Instagram, testId: "contact-instagram-button" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, testId: "contact-whatsapp-button" },
];

export const ContactSection = () => {
  const get = useEditable();
  const channel = get("contact.telegramChannel", CONTACTS.telegramChannel);
  return (
  <section id="contatti" data-testid="contact-section" className="relative overflow-hidden bg-[#0f0f12] py-24 sm:py-32">
    <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(231,184,200,0.12), rgba(231,184,200,0) 65%)" }} />
    <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
      <SectionHeader k="contact"
        label="La community"
        title={<T k="contact" a="Scrivimi dove" b="preferisci." />}
        text="Puoi chiedermi tutto anche in chat. Scegli il canale: ti rispondo io, personalmente."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((it, i) => {
          const url = get(`contact.${it.key}`, CONTACTS[it.key]);
          const onClick = (e) => {
            if (!url) {
              e.preventDefault();
              toast("Link in arrivo a breve", { description: `Il mio ${it.label} sarà attivo a breve. Intanto usa il modulo richieste.` });
            }
          };
          return (
            <Reveal key={it.key} delay={i * 0.08}>
              <a
                href={url || "#"}
                target={url ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={onClick}
                data-testid={it.testId}
                className="lux-card group flex items-center justify-between p-6"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(214,178,94,0.3)] bg-[#0b0b0d] transition-colors duration-500 group-hover:border-[color:var(--rose)]">
                    <it.icon className="h-5 w-5 text-[color:var(--gold)]" />
                  </span>
                  <span>
                    <span className="block font-display text-2xl text-[#f5f2ee]">{it.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#b9b2aa]">{url ? "Scrivimi ora" : "In arrivo"}</span>
                  </span>
                </span>
                <span className="text-[color:var(--rose)] transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <div data-testid="telegram-invite-card" className="mt-6 grid gap-6 rounded-[24px] border border-[rgba(214,178,94,0.25)] bg-gradient-to-r from-[#17140e] to-[#141418] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Porta un amico</span>
            <h3 className="mt-3 font-display text-3xl italic text-[#f5f2ee]"><E k="invite.title">Invita su Telegram</E></h3>
            <ul className="mt-4 space-y-2 text-sm text-[#e9e4de]">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[color:var(--rose)]" /> <E k="invite.b0">Solo per membri Kimm Mensile o VIP</E></li>
              <li className="flex items-center gap-2"><Send className="h-4 w-4 text-[color:var(--rose)]" /> <E k="invite.b1">Invita un amico sul canale Telegram</E></li>
              <li className="flex items-center gap-2"><Gift className="h-4 w-4 text-[color:var(--rose)]" /> <E k="invite.b2">Ricevi 1 Extra a scelta (foto, audio o video)</E></li>
            </ul>
          </div>
          <button
            data-testid="telegram-invite-button"
            onClick={() =>
              channel
                ? window.open(channel, "_blank", "noopener")
                : toast("Canale Telegram in arrivo", { description: "Presto attivo: ti avviso appena è online." })
            }
            className="btn-gold rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {channel ? "Entra nel canale" : "Canale in arrivo"}
          </button>
        </div>
      </Reveal>
    </div>
  </section>
);
};
