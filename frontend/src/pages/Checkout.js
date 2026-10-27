import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Loader2, ArrowRight, Wallet, Landmark, Coins, Lock, Clock, ChevronLeft } from "lucide-react";
import { Shell } from "../components/Shell";
import { AuthForms } from "../components/AccountSheet";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { useFan, errMsg } from "../context/FanContext";
import { API } from "../lib/scroll";
import { METHOD_META } from "../lib/pay";
import { fmtEur } from "../config/site";
import { EASE } from "../components/Reveal";

const ICON = { ton: Wallet, usdt_ton: Coins, usdt_trc20: Coins, sepa: Landmark };

const parseQuery = (sp) => {
  const kind = sp.get("tipo") || "offer";
  return {
    kind,
    ref: sp.get("id") || undefined,
    amount: sp.get("importo") ? Number(sp.get("importo")) : undefined,
    request_id: sp.get("richiesta") || undefined,
  };
};

export default function Checkout() {
  const [sp] = useSearchParams();
  const q = useMemo(() => parseQuery(sp), [sp]);
  const nav = useNavigate();
  const { fan, token, authHeaders } = useFan();
  const [quote, setQuote] = useState(null);
  const [err, setErr] = useState(null);
  const [method, setMethod] = useState(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const { data } = await axios.get(`${API}/pay/quote`, { params: q, headers: authHeaders() });
      setQuote(data);
      const avail = data.methods.filter((m) => m.available);
      setMethod((m) => (m && avail.some((a) => a.id === m) ? m : avail[0]?.id || null));
    } catch (e) {
      if (q.kind === "request" && e?.response?.status === 401 && !token) { setQuote(null); return; }
      setErr(errMsg(e, "Articolo non disponibile"));
    }
  }, [q, authHeaders, token]);

  useEffect(() => { load(); }, [load]);

  const available = quote?.methods.filter((m) => m.available) || [];
  const chosen = quote?.methods.find((m) => m.id === method) || null;

  const confirm = async () => {
    if (!fan) { toast.error("Accedi o crea il tuo codice per continuare"); return; }
    if (!agree) { toast.error("Conferma di avere 18 anni e di accettare i termini"); return; }
    if (!method) { toast.error("Scegli un metodo di pagamento"); return; }
    setBusy(true);
    try {
      const body = { kind: q.kind, ref: q.ref, amount: q.amount, request_id: q.request_id, method, accept_terms: true, is_adult: true };
      const { data } = await axios.post(`${API}/orders`, body, { headers: authHeaders() });
      toast.success(`Ordine ${data.code} creato`);
      nav(`/ordine/${data.code}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell testId="checkout-page" footer={false}>
      <section className="mx-auto max-w-6xl px-5 pb-36 pt-24 sm:px-8 sm:pt-28">
        <Link to="/" data-testid="checkout-back-link" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-[#8a847d] hover:text-[#f5f2ee]"><ChevronLeft className="h-3.5 w-3.5" /> Torna al sito</Link>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h1 className="font-display text-4xl italic text-[#f5f2ee] sm:text-5xl">Cassa</h1>
          <span className="flex items-center gap-2 rounded-full border border-[rgba(0,175,240,0.3)] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold-light)]"><Lock className="h-3 w-3" /> Pagamento diretto</span>
        </div>

        {err && (
          <div data-testid="checkout-error" className="lux-card mt-8 p-8 text-center">
            <p className="font-display text-2xl italic text-[#f5f2ee]">{err}</p>
            <button onClick={() => nav("/")} className="btn-gold mt-5 rounded-xl px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Torna ai piani</button>
          </div>
        )}

        {!err && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-5">
              {/* Passo 1: accesso */}
              <Step n="1" title={fan ? `Accesso: @${fan.username}` : "Accedi o crea il tuo codice"} done={!!fan} testId="checkout-step-auth">
                {!fan && (
                  <div className="mt-4">
                    <p className="text-sm text-[#b9b2aa]">Venti secondi: username + codice segreto. Nessuna email. Serve per vedere l'ordine e ricevere la consegna.</p>
                    <div className="mt-5"><AuthForms compact /></div>
                  </div>
                )}
              </Step>

              {/* Passo 2: metodo */}
              <Step n="2" title="Come paghi" done={!!method} testId="checkout-step-method">
                {!quote && !err && (q.kind !== "request" || token) && <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl bg-[#141418]" />)}</div>}
                {quote && available.length === 0 && (
                  <div data-testid="checkout-no-methods" className="mt-4 rounded-2xl border border-[rgba(255,204,102,0.35)] bg-[rgba(255,204,102,0.06)] p-4 text-sm text-[#f5f2ee]">
                    I pagamenti sono in configurazione. Nel frattempo invia una <Link to="/richiesta" className="text-[color:var(--gold-light)] underline underline-offset-4">richiesta</Link>: ti rispondo io con le istruzioni.
                  </div>
                )}
                {quote && available.length > 0 && (
                  <RadioGroup value={method || ""} onValueChange={setMethod} className="mt-4 grid gap-3" data-testid="checkout-payment-method-radio">
                    {available.map((m) => {
                      const meta = METHOD_META[m.id];
                      const I = ICON[m.id];
                      const on = method === m.id;
                      return (
                        <label key={m.id} data-testid={`checkout-method-${m.id}`} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${on ? "border-[rgba(0,175,240,0.6)] bg-[rgba(0,175,240,0.07)]" : "border-[rgba(242,215,208,0.14)] bg-[#141418] hover:border-[rgba(0,175,240,0.35)]"}`}>
                          <RadioGroupItem value={m.id} className="mt-1 border-[color:var(--gold)] text-[color:var(--gold)]" />
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${on ? "btn-gold" : "border border-[rgba(242,215,208,0.2)] text-[#b9b2aa]"}`}><I className="h-5 w-5" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-xl italic text-[#f5f2ee]">{meta.label}</span>
                              {m.discount_pct > 0 && <span className="rounded-full bg-[color:var(--rose)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0b0b0d]">-{m.discount_pct}%</span>}
                            </span>
                            <span className="mt-0.5 block text-xs text-[#b9b2aa]">{meta.sub}</span>
                            <span className="mt-2 flex flex-wrap gap-1.5">
                              {meta.badges.map((b) => <span key={b} className="rounded-full border border-[rgba(0,175,240,0.3)] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[color:var(--gold-light)]">{b}</span>)}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block font-display text-xl tabular-nums text-[#f5f2ee]">{fmtEur(m.total_eur)}</span>
                            {m.crypto_amount && <span className="block font-mono text-[11px] text-[color:var(--gold-light)]">≈ {m.crypto_amount} {m.currency}</span>}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                )}
              </Step>

              {/* Passo 3: conferma */}
              <Step n="3" title="Conferma e paga" done={false} testId="checkout-step-confirm">
                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <Checkbox data-testid="checkout-age-checkbox" checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5 border-[color:var(--gold)] data-[state=checked]:bg-[color:var(--gold)] data-[state=checked]:text-[#0b0b0d]" />
                  <span className="text-sm text-[#e9e4de]">
                    Ho 18 anni e accetto i termini e la{" "}
                    <Dialog>
                      <DialogTrigger asChild><button type="button" data-testid="checkout-refund-link" className="text-[color:var(--gold-light)] underline underline-offset-4">politica rimborsi</button></DialogTrigger>
                      <DialogContent className="border-[rgba(0,175,240,0.25)] bg-[#111114] text-[#f5f2ee]">
                        <DialogTitle className="font-display text-2xl italic">Termini e rimborsi</DialogTitle>
                        <DialogDescription className="whitespace-pre-wrap text-sm leading-relaxed text-[#b9b2aa]" data-testid="checkout-refund-text">{quote?.texts?.refund_policy || "Contenuti digitali: nessun rimborso dopo la consegna."}</DialogDescription>
                        <p className="text-xs text-[#8a847d]">Il prezzo in crypto resta bloccato per {quote?.order_hours || 48} ore. Pagamenti parziali vengono verificati manualmente.</p>
                      </DialogContent>
                    </Dialog>.
                  </span>
                </label>
                <button
                  data-testid="checkout-confirm-button"
                  onClick={confirm}
                  disabled={busy || !fan || !method || !agree}
                  className="btn-gold mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {chosen ? `Genera ordine · ${fmtEur(chosen.total_eur)}` : "Genera ordine"} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 flex items-start gap-2 text-xs text-[#8a847d]"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]" /> {quote?.texts?.checkout_notice || "Nessun intermediario: paghi direttamente a me. Hai 48 ore per completare il pagamento."}</p>
              </Step>
            </div>

            {/* Riepilogo */}
            <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="lux-card p-6 lg:sticky lg:top-24" data-testid="checkout-summary">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--blush)]">Riepilogo</span>
              {quote ? (
                <>
                  <h2 className="mt-2 font-display text-3xl italic text-[#f5f2ee]" data-testid="checkout-item-name">{quote.item.name}</h2>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8a847d]">{quote.item.category}{quote.item.period ? ` · ${quote.item.period}` : ""}</div>
                  <ul className="mt-4 space-y-2">
                    {quote.item.details?.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#e9e4de]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gold)]" />{d}</li>)}
                  </ul>
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-[rgba(242,215,208,0.12)] bg-[#0b0b0d] p-3 text-xs text-[#b9b2aa]"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--rose)]" /> {quote.item.delivery}</div>
                  <div className="mt-5 border-t border-[rgba(0,175,240,0.14)] pt-4">
                    <div className="flex items-baseline justify-between text-sm text-[#b9b2aa]"><span>Prezzo</span><span className="tabular-nums">{fmtEur(quote.item.price_eur)}</span></div>
                    {quote.item.old_price_eur && <div className="flex items-baseline justify-between text-xs text-[#6f6a64]"><span>Prezzo pieno</span><span className="tabular-nums line-through">{fmtEur(quote.item.old_price_eur)}</span></div>}
                    {chosen && chosen.discount_pct > 0 && <div className="flex items-baseline justify-between text-sm text-[color:var(--rose)]"><span>Sconto {METHOD_META[chosen.id].label}</span><span className="tabular-nums">-{fmtEur(quote.item.price_eur - chosen.total_eur)}</span></div>}
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-sm uppercase tracking-[0.18em] text-[#f5f2ee]">Totale</span>
                      <span className="text-gold-sheen font-display text-4xl tabular-nums" data-testid="checkout-total">{fmtEur(chosen ? chosen.total_eur : quote.item.price_eur)}</span>
                    </div>
                    {chosen?.crypto_amount && <div className="mt-1 text-right font-mono text-xs text-[color:var(--gold-light)]" data-testid="checkout-crypto-total">≈ {chosen.crypto_amount} {chosen.currency} al cambio attuale</div>}
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-3"><Skeleton className="h-8 w-2/3 bg-[#141418]" /><Skeleton className="h-4 w-1/2 bg-[#141418]" /><Skeleton className="h-24 bg-[#141418]" /></div>
              )}
            </motion.aside>
          </div>
        )}
      </section>
    </Shell>
  );
}

const Step = ({ n, title, done, children, testId }) => (
  <div className="lux-card p-5 sm:p-6" data-testid={testId}>
    <div className="flex items-center gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${done ? "btn-gold" : "border border-[rgba(0,175,240,0.4)] text-[color:var(--gold-light)]"}`}>{n}</span>
      <h2 className="font-display text-2xl italic text-[#f5f2ee]">{title}</h2>
    </div>
    {children}
  </div>
);
