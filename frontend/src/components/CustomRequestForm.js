import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, CheckCircle2, Loader2, X, UserCheck } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";
import { BUDGETS, CHANNELS, REQUEST_TYPES, fmtEur } from "../config/site";
import { API } from "../lib/scroll";
import { useFan, errMsg } from "../context/FanContext";
import { EASE } from "./Reveal";

const HANDLE_PH = {
  telegram: "@iltuousername",
  instagram: "@iltuoprofilo",
  whatsapp: "+39 333 000 0000",
  email: "nome@email.it",
};

const empty = { name: "", contact_channel: "telegram", contact_handle: "", request_type: "foto", item: "", item_price: null, budget: "", description: "", is_adult: false };

const field = "h-12 rounded-[14px] border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-[#f5f2ee] placeholder:text-[#6f6a64] focus-visible:ring-[color:var(--gold)]";

export const CustomRequestForm = ({ prefill }) => {
  const { fan, authHeaders, refresh } = useFan();
  const [f, setF] = useState(empty);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!prefill) return;
    setDone(null);
    setF((p) => ({ ...p, request_type: prefill.type || p.request_type, item: prefill.item || "", item_price: prefill.price ?? null }));
  }, [prefill]);

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!f.contact_handle || f.contact_handle.trim().length < 3) e.contact_handle = "Inserisci il tuo contatto";
    if (!f.description || f.description.trim().length < 10) e.description = "Descrivi la richiesta (minimo 10 caratteri)";
    if (!f.item && !f.budget) e.budget = "Seleziona un budget indicativo";
    if (!f.is_adult) e.is_adult = "Conferma di avere almeno 18 anni";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const body = { ...f, item: f.item || null, budget: f.budget || null, name: f.name || null };
      const { data } = await axios.post(`${API}/requests`, body, { headers: authHeaders() });
      setDone(data);
      toast.success("Richiesta inviata! Ti ricontatto presto.");
      setF({ ...empty, contact_channel: f.contact_channel, contact_handle: f.contact_handle });
      if (fan) refresh();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSending(false);
    }
  };

  const channelLabel = (v) => CHANNELS.find((c) => c.value === v)?.label || v;

  return (
    <section id="richieste" data-testid="request-section" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-40 top-40 h-[480px] w-[480px] rounded-full" style={{ background: "radial-gradient(circle, rgba(214,178,94,0.10), rgba(214,178,94,0) 65%)" }} />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHeader k="request"
            label="Su richiesta"
            title={<T k="request" a="Dimmi cosa" b="desideri." />}
            text="Foto, video, audio, chat o un pacchetto su misura. Leggo ogni richiesta personalmente e ti rispondo sul canale che preferisci con prezzo e tempi."
          />
          <ul className="mt-10 space-y-4 text-sm text-[#e9e4de]">
            {["Risposta di solito entro 24h", "Prezzo confermato prima di procedere", "Massima discrezione, puoi usare un nickname"].map((t, i) => (
              <li key={t} className="flex items-center gap-3"><span className="dot-glow" /><E k={`request.b${i}`}>{t}</E></li>
            ))}
          </ul>
        </div>

        <div className="lux-card relative p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" data-testid="request-success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="flex min-h-[420px] flex-col items-start justify-center">
                <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}>
                  <CheckCircle2 className="h-14 w-14 text-[color:var(--gold)]" />
                </motion.div>
                <h3 className="mt-6 font-display text-4xl italic text-[#f5f2ee]">Richiesta inviata.</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#b9b2aa]">
                  {done.item ? <>Hai richiesto <span className="text-[#f5f2ee]">{done.item}</span>. </> : null}
                  Ti ricontatto su <span className="text-[color:var(--rose)]">{channelLabel(done.contact_channel)}</span> ({done.contact_handle}) il prima possibile.
                  {fan ? " La trovi anche nel tuo profilo, in \"I miei ordini\"." : ""}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#6f6a64]">Codice richiesta · {done.id.slice(0, 8)}</p>
                <button data-testid="request-new-button" onClick={() => setDone(null)} className="btn-ghost-lux mt-8 rounded-xl px-6 py-3 text-sm uppercase tracking-[0.14em]">
                  Invia un'altra richiesta
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" data-testid="custom-request-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5" noValidate>
                {fan && (
                  <div data-testid="request-linked-account" className="flex items-center gap-2 rounded-xl border border-[rgba(214,178,94,0.2)] bg-[#0b0b0d] px-4 py-2.5 text-xs text-[#e9e4de]">
                    <UserCheck className="h-4 w-4 text-[color:var(--gold)]" /> Collegata al tuo account <span className="text-[color:var(--gold-light)]">@{fan.username}</span>
                  </div>
                )}

                {f.item && (
                  <div data-testid="request-selected-item" className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(231,184,200,0.3)] bg-[#1a1418] px-4 py-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--blush)]">Hai scelto</div>
                      <div className="font-display text-lg text-[#f5f2ee]">{f.item}{f.item_price != null && <span className="ml-2 text-[color:var(--gold-light)] tabular-nums">{fmtEur(f.item_price)}</span>}</div>
                    </div>
                    <button type="button" data-testid="request-clear-item" onClick={() => setF((p) => ({ ...p, item: "", item_price: null }))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(242,215,208,0.2)] text-[#b9b2aa] hover:text-[#f5f2ee]" aria-label="Rimuovi">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Nome o nickname</Label>
                    <Input data-testid="custom-request-name-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={fan ? fan.display_name : "Facoltativo"} className={field} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Tipo di richiesta</Label>
                    <Select value={f.request_type} onValueChange={(v) => set("request_type", v)}>
                      <SelectTrigger data-testid="custom-request-type-select" className={field}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[rgba(214,178,94,0.2)] bg-[#141418] text-[#f5f2ee]">
                        {REQUEST_TYPES.map((t) => <SelectItem key={t.value} value={t.value} data-testid={`request-type-option-${t.value}`}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Canale preferito</Label>
                    <Select value={f.contact_channel} onValueChange={(v) => set("contact_channel", v)}>
                      <SelectTrigger data-testid="custom-request-channel-select" className={field}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[rgba(214,178,94,0.2)] bg-[#141418] text-[#f5f2ee]">
                        {CHANNELS.map((c) => <SelectItem key={c.value} value={c.value} data-testid={`channel-option-${c.value}`}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Il tuo contatto *</Label>
                    <Input data-testid="custom-request-handle-input" value={f.contact_handle} onChange={(e) => set("contact_handle", e.target.value)} placeholder={HANDLE_PH[f.contact_channel]} className={field} />
                    {errors.contact_handle && <p className="text-xs text-[color:var(--rose)]">{errors.contact_handle}</p>}
                  </div>
                </div>

                {!f.item && (
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Budget indicativo *</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {BUDGETS.map((b) => (
                        <button
                          type="button"
                          key={b}
                          data-testid={`budget-option-${BUDGETS.indexOf(b)}`}
                          onClick={() => set("budget", b)}
                          className={`rounded-xl px-3 py-3 text-xs tabular-nums transition-colors ${f.budget === b ? "btn-gold font-semibold" : "btn-ghost-lux"}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    {errors.budget && <p className="text-xs text-[color:var(--rose)]">{errors.budget}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Descrivi la richiesta *</Label>
                  <Textarea
                    data-testid="custom-request-message-textarea"
                    value={f.description}
                    onChange={(e) => set("description", e.target.value.slice(0, 2000))}
                    placeholder="Cosa desideri? Stile, outfit, durata, dettagli…"
                    className="min-h-[130px] rounded-[14px] border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-[#f5f2ee] placeholder:text-[#6f6a64] focus-visible:ring-[color:var(--gold)]"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-[color:var(--rose)]">{errors.description || ""}</span>
                    <span className="tabular-nums text-[#6f6a64]">{f.description.length}/2000</span>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox data-testid="custom-request-adult-checkbox" checked={f.is_adult} onCheckedChange={(v) => set("is_adult", !!v)} className="mt-0.5 border-[color:var(--gold)] data-[state=checked]:bg-[color:var(--gold)] data-[state=checked]:text-[#141014]" />
                  <span className="text-sm text-[#b9b2aa]">Confermo di avere almeno 18 anni e di inviare una richiesta per contenuti destinati ad adulti.</span>
                </label>
                {errors.is_adult && <p className="-mt-3 text-xs text-[color:var(--rose)]">{errors.is_adult}</p>}

                <button
                  type="submit"
                  data-testid="custom-request-submit-button"
                  disabled={sending}
                  className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Invio in corso…" : "Invia richiesta"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
