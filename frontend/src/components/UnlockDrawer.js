import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "./ui/drawer";
import { Lock, Crown, Zap, ArrowUpRight } from "lucide-react";
import { OFFERS, SPECIAL, fmtEur } from "../config/site";
import { useEditable, toNum } from "../context/ContentContext";
import { goTo } from "../lib/scroll";

// Acquisto rapido dalla foto: 3 scelte secche, poi "Vedi tutti i piani".
export const UnlockDrawer = ({ photo, onClose, onRequest }) => {
  const get = useEditable();
  const monthly = OFFERS.find((o) => o.id === "kimm-mensile");
  const starter = OFFERS.find((o) => o.id === "starter");
  const price = (k, d) => toNum(get(k, String(d)), d);
  const opts = [
    { id: "kimm-mensile", icon: Crown, name: get("offer.kimm-mensile.name", monthly.name), price: price("offer.kimm-mensile.price", monthly.price), per: "/mese", d: "Tutto il Vault + 5 foto nuove al mese. Nessun rinnovo automatico.", type: "abbonamento", featured: true },
    { id: "bundle-speciale", icon: Zap, name: get("special.name", SPECIAL.name), price: price("special.price", SPECIAL.price), per: "una volta", d: "20 foto + 2 video + 1 audio. Offerta a tempo.", type: "bundle" },
    { id: "starter", icon: Lock, name: get("offer.starter.name", starter.name), price: price("offer.starter.price", starter.price), per: "una volta", d: "5 foto esclusive + 1 video breve.", type: "pacchetto" },
  ];
  const pick = (o) => { onClose(); setTimeout(() => onRequest({ type: o.type, item: o.name, price: o.price, kind: o.id === "bundle-speciale" ? "special" : "offer", id: o.id }), 80); };
  return (
    <Drawer open={!!photo} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent data-testid="unlock-drawer" className="border-[rgba(0,175,240,0.3)] bg-[#0f0f12] text-[#f5f2ee]">
        <div className="mx-auto w-full max-w-lg px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-2">
          <DrawerTitle className="font-display text-3xl italic text-[#f5f2ee]">Sblocca {photo?.title ? `“${photo.title}”` : "tutto"}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-[#b9b2aa]">Scegli come entrare. Paghi, confermo, vedi: in chiaro, senza pixel.</DrawerDescription>
          <div className="mt-5 space-y-3">
            {opts.map((o) => (
              <button
                key={o.id}
                data-testid={`unlock-option-${o.id}`}
                onClick={() => pick(o)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${o.featured ? "border-[rgba(0,175,240,0.55)] bg-[rgba(0,175,240,0.08)]" : "border-[rgba(242,215,208,0.16)] bg-[#141418] hover:border-[rgba(0,175,240,0.4)]"}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${o.featured ? "btn-gold" : "border border-[rgba(242,215,208,0.2)]"}`}><o.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl italic leading-none">{o.name}</span>
                  <span className="mt-1 block text-xs text-[#b9b2aa]">{o.d}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-2xl tabular-nums text-[color:var(--gold-light)]">{fmtEur(o.price)}</span>
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8a847d]">{o.per}</span>
                </span>
              </button>
            ))}
          </div>
          <button data-testid="unlock-see-all" onClick={() => { onClose(); setTimeout(() => goTo("offerte"), 120); }} className="btn-ghost-lux mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs uppercase tracking-[0.16em]">
            Vedi tutti i piani e pacchetti <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
