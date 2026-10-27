import { useEffect, useState } from "react";
import { toast } from "sonner";

// Metadati metodi di pagamento (mostrati al fan)
export const METHOD_META = {
  ton: { label: "TON", sub: "Telegram Wallet, Tonkeeper, Trust: un tap e hai pagato", badges: ["Conferma automatica", "Senza commissioni"], wallet: true },
  usdt_ton: { label: "USDT su rete TON", sub: "Dollari digitali dal tuo wallet TON, conferma in 1-2 minuti", badges: ["Conferma automatica", "Senza commissioni"], wallet: true },
  usdt_trc20: { label: "USDT su rete Tron (TRC20)", sub: "Da Binance, Bybit, Crypto.com, Trust e qualsiasi exchange", badges: ["Conferma automatica"], wallet: false },
  sepa: { label: "Bonifico istantaneo", sub: "Dalla tua banca, con il codice ordine in causale", badges: ["Senza commissioni", "Confermo io"], wallet: false },
};

export const STATUS_META = {
  in_attesa: { label: "In attesa di pagamento", short: "Da pagare", tone: "blue", step: 1 },
  pagamento_visto: { label: "Pagamento visto, in conferma", short: "In conferma", tone: "blue", step: 2 },
  confermato: { label: "Pagamento confermato", short: "Confermato", tone: "green", step: 3 },
  consegnato: { label: "Consegnato", short: "Consegnato", tone: "green", step: 4 },
  verifica_manuale: { label: "In verifica manuale", short: "In verifica", tone: "amber", step: 2 },
  rifiutato: { label: "Rifiutato", short: "Rifiutato", tone: "red", step: 0 },
  scaduto: { label: "Scaduto", short: "Scaduto", tone: "muted", step: 0 },
};

export const TONE = {
  blue: "text-[color:var(--gold-light)] border-[rgba(0,175,240,0.45)] bg-[rgba(0,175,240,0.08)]",
  green: "text-[#9fe0b5] border-[rgba(159,224,181,0.4)] bg-[rgba(159,224,181,0.08)]",
  amber: "text-[#ffcc66] border-[rgba(255,204,102,0.4)] bg-[rgba(255,204,102,0.08)]",
  red: "text-[#ff8a8a] border-[rgba(255,77,77,0.4)] bg-[rgba(255,77,77,0.08)]",
  muted: "text-[#8a847d] border-[rgba(138,132,125,0.4)] bg-transparent",
};

export const PAYABLE = ["in_attesa", "pagamento_visto", "verifica_manuale", "scaduto"];

export const copyText = async (text, label = "Copiato") => {
  try {
    await navigator.clipboard.writeText(String(text));
    toast.success(label);
  } catch {
    toast.error("Impossibile copiare: seleziona e copia a mano");
  }
};

// URL della cassa a partire dall'articolo scelto (offerta/catalogo/speciale/tip/richiesta)
export const checkoutUrl = (p) => {
  const q = new URLSearchParams();
  q.set("tipo", p.kind);
  if (p.kind === "request") q.set("richiesta", p.request_id);
  else if (p.kind === "tip") q.set("importo", String(p.amount));
  else if (p.id) q.set("id", p.id);
  return `/cassa?${q.toString()}`;
};

export const fmtDateTime = (iso) => new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// Conto alla rovescia (ore di validita' dell'ordine)
export const useCountdown = (expiresAt, createdAt) => {
  const calc = () => {
    const end = new Date(expiresAt).getTime();
    const start = createdAt ? new Date(createdAt).getTime() : end - 48 * 3600 * 1000;
    const left = Math.max(0, end - Date.now());
    const total = Math.max(1, end - start);
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return { left, pct: Math.max(0, Math.min(100, Math.round((left / total) * 100))), text: h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s` };
  };
  const [v, setV] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setV(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, createdAt]);
  return v;
};

// Testo con link cliccabili (messaggio di consegna)
export const linkify = (text) => {
  const parts = String(text || "").split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) => (/^https?:\/\//.test(p)
    ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all text-[color:var(--gold-light)] underline underline-offset-4">{p}</a>
    : <span key={i}>{p}</span>));
};
