import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Flame, Heart, Timer, ArrowUpRight } from "lucide-react";
import { OFFERS, OFFER_TABS, OFFER_GROUPS, SPECIAL, TIPS, fmtEur } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E, useEditable, toNum } from "../context/ContentContext";

const plain = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
import { TiltCard } from "./TiltCard";
import { EASE } from "./Reveal";

const pad = (n) => String(n).padStart(2, "0");

const useCountdown = (iso) => {
  const end = new Date(iso).getTime();
  const [left, setLeft] = useState(() => Math.max(0, end - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(t);
  }, [end]);
  const s = Math.floor(left / 1000);
  return { done: left <= 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

const Digit = ({ v, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[rgba(214,178,94,0.3)] bg-[#0b0b0d] sm:h-16 sm:w-16">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={v}
          initial={{ y: -18, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center font-display text-2xl text-[color:var(--gold-light)] tabular-nums sm:text-3xl"
        >
          {pad(v)}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-[#b9b2aa]">{label}</span>
  </div>
);

export const SpecialBundle = ({ onRequest }) => {
  const get = useEditable();
  const c = useCountdown(get("special.endsAt", SPECIAL.endsAt));
  const price = toNum(get("special.price", plain(SPECIAL.price)), SPECIAL.price);
  const name = get("special.name", SPECIAL.name);
  return (
    <div data-testid="special-bundle-card" className="relative overflow-hidden rounded-[26px] border border-[rgba(231,184,200,0.35)] bg-gradient-to-br from-[#22161b] via-[#141418] to-[#1c170e] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(231,184,200,0.25), rgba(231,184,200,0) 70%)" }} />
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--rose)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#141014]">
            <Flame className="h-3 w-3" /> <E k="special.badge">Offerta a tempo</E>
          </span>
          <h3 className="mt-4 font-display text-4xl italic text-[#f5f2ee]"><E k="special.name">{SPECIAL.name}</E></h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-gold-sheen font-display text-5xl tabular-nums">€<E k="special.price">{plain(SPECIAL.price)}</E></span>
            <span className="text-sm text-[#b9b2aa] line-through tabular-nums">€<E k="special.oldPrice">{plain(SPECIAL.oldPrice)}</E></span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {SPECIAL.perks.map((p, i) => (
              <span key={p} className="rounded-full border border-[rgba(242,215,208,0.2)] px-3 py-1 text-xs text-[#e9e4de]"><E k={`special.perk${i}`}>{p}</E></span>
            ))}
          </div>
        </div>
        <div>
          {c.done ? (
            <p data-testid="special-bundle-ended" className="font-display text-2xl italic text-[#b9b2aa]">Offerta terminata</p>
          ) : (
            <div className="flex items-start gap-2" data-testid="special-bundle-countdown">
              <Digit v={c.d} label="Giorni" />
              <Digit v={c.h} label="Ore" />
              <Digit v={c.m} label="Min" />
              <Digit v={c.s} label="Sec" />
            </div>
          )}
          <button
            data-testid="special-bundle-cta"
            disabled={c.done}
            onClick={() => onRequest({ type: "bundle", item: name, price })}
            className="btn-gold mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-40"
          >
            <Timer className="h-4 w-4" /> <E k="special.cta">Prendilo ora</E>
          </button>
        </div>
      </div>
    </div>
  );
};

const OfferCard = ({ o, onRequest }) => {
  const get = useEditable();
  const pk = `offer.${o.id}`;
  const price = toNum(get(`${pk}.price`, plain(o.price)), o.price);
  const name = get(`${pk}.name`, o.name);
  return (
  <TiltCard testId={`offer-card-${o.id}`} className="h-full rounded-[24px]">
    <div
      className={`flex h-full flex-col rounded-[24px] p-6 ${
        o.featured
          ? "border border-[rgba(214,178,94,0.55)] bg-gradient-to-b from-[#1f1a12] to-[#121214] shadow-[0_0_0_1px_rgba(214,178,94,0.18),0_30px_80px_rgba(214,178,94,0.10)]"
          : "lux-card"
      }`}
    >
      <div className="flex min-h-[26px] items-center justify-between gap-2">
        {o.badge ? (
          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${o.featured ? "btn-gold" : "border border-[rgba(242,215,208,0.25)] text-[color:var(--blush)]"}`}><E k={`${pk}.badge`}>{o.badge}</E></span>
        ) : <span />}
        {o.featured && <Crown className="h-5 w-5 text-[color:var(--gold)]" />}
      </div>
      <h4 className="mt-5 font-display text-2xl italic text-[#f5f2ee]"><E k={`${pk}.name`}>{o.name}</E></h4>
      <div className="mt-3 flex items-baseline gap-2">
        {o.period === "da" && <span className="text-xs uppercase tracking-[0.18em] text-[#b9b2aa]">da</span>}
        <span className={`font-display text-4xl tabular-nums ${o.featured ? "text-gold-sheen" : "text-[#f5f2ee]"}`}>€<E k={`${pk}.price`}>{plain(o.price)}</E></span>
        {o.period !== "da" && <span className="text-xs uppercase tracking-[0.16em] text-[#b9b2aa]"><E k={`${pk}.period`}>{o.period}</E></span>}
      </div>
      <div className="my-5 h-px bg-[rgba(214,178,94,0.14)]" />
      <ul className="flex-1 space-y-2.5">
        {o.perks.map((p, i) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-[#e9e4de]">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(214,178,94,0.16)]">
              <Check className="h-2.5 w-2.5 text-[color:var(--gold)]" />
            </span>
            <E k={`${pk}.perk${i}`}>{p}</E>
          </li>
        ))}
      </ul>
      <button
        data-testid={`offer-cta-${o.id}`}
        onClick={() => onRequest({ type: o.cat, item: name, price })}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] ${o.featured ? "btn-gold" : "btn-ghost-lux"}`}
      >
        <E k={`${pk}.cta`}>{o.cat === "abbonamento" ? "Entra nella Crew" : o.cat === "extra" ? "Richiedi" : "Sblocca ora"}</E> <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  </TiltCard>
  );
};

const TipJar = ({ onRequest }) => (
  <div data-testid="tip-jar" className="lux-card p-6 sm:p-8">
    <div className="flex items-center gap-3">
      <Heart className="h-5 w-5 text-[color:var(--rose)]" />
      <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--blush)]"><E k="tip.label">Grazie mille</E></span>
    </div>
    <h4 className="mt-4 font-display text-3xl italic text-[#f5f2ee]"><E k="tip.title">Tip Jar</E></h4>
    <p className="mt-2 max-w-md text-sm text-[#b9b2aa]"><E k="tip.text" multiline>Una mancia veloce per dire grazie. Ogni tip conta e può sbloccare contenuti bonus a sorpresa.</E></p>
    <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
      {TIPS.map((t) => (
        <button
          key={t}
          data-testid={`tip-${t}`}
          onClick={() => onRequest({ type: "tip", item: `Tip ${fmtEur(t)}`, price: t })}
          className="btn-ghost-lux rounded-2xl py-4 font-display text-2xl tabular-nums transition-colors hover:text-[color:var(--gold-light)]"
        >
          {t}€
        </button>
      ))}
    </div>
  </div>
);

const Group = ({ cat, onRequest }) => {
  const g = OFFER_GROUPS[cat];
  const items = OFFERS.filter((o) => o.cat === cat);
  return (
    <div className="mt-12 first:mt-0" data-testid={`offer-group-${cat}`}>
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <h3 className="font-display text-3xl text-[#f5f2ee]"><E k={`group.${cat}.title`}>{g.title}</E></h3>
        <p className="text-xs uppercase tracking-[0.16em] text-[#b9b2aa]"><E k={`group.${cat}.sub`}>{g.sub}</E></p>
      </div>
      <div className={`mt-6 grid gap-4 sm:grid-cols-2 ${items.length >= 3 ? "lg:grid-cols-3" : ""} ${cat === "extra" ? "lg:grid-cols-4" : ""}`}>
        {items.map((o) => <OfferCard key={o.id} o={o} onRequest={onRequest} />)}
      </div>
    </div>
  );
};

export const OffersSection = ({ onRequest }) => {
  const [tab, setTab] = useState("tutto");
  const cats = ["abbonamento", "pacchetto", "extra", "chat_tempo"];

  return (
    <section id="offerte" data-testid="offers-section" className="relative overflow-hidden bg-[#0f0f12] py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(231,184,200,0.10), rgba(231,184,200,0) 65%)" }} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader k="offers"
          label="Offerte & abbonamenti"
          title={<T k="offers" a="Scegli quanto" b="vicino" c="vuoi arrivare." br={false} />}
          text="Abbonamenti, pacchetti one-shot, extra e chat privata. Scegli: ti porto alla richiesta già compilata. Prezzi di esempio modificabili."
        />

        <div className="sticky top-16 z-20 -mx-5 mt-10 bg-[#0f0f12]/95 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:px-2">
          <div className="flex gap-2 overflow-x-auto" role="tablist" data-testid="offer-tabs">
            {OFFER_TABS.map((t) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={on}
                  data-testid={`offer-tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`relative shrink-0 rounded-full px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    on ? "text-[#141014]" : "border border-[rgba(242,215,208,0.2)] bg-[#141418] text-[#b9b2aa] hover:text-[#f5f2ee]"
                  }`}
                >
                  {on && <motion.span layoutId="offer-pill" className="btn-gold absolute inset-0 rounded-full" transition={{ duration: 0.5, ease: EASE }} />}
                  <span className="relative z-10 font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-8"
          >
            {tab === "tutto" && (
              <>
                <SpecialBundle onRequest={onRequest} />
                <div className="mt-12">{cats.map((c) => <Group key={c} cat={c} onRequest={onRequest} />)}</div>
                <div className="mt-12"><TipJar onRequest={onRequest} /></div>
              </>
            )}
            {cats.includes(tab) && <Group cat={tab} onRequest={onRequest} />}
            {tab === "tip" && <TipJar onRequest={onRequest} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
