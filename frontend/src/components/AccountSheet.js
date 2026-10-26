import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { KeyRound, Loader2, LogOut, Lock, Package, Sparkles as SparkIcon, Eye, EyeOff } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useFan, errMsg } from "../context/FanContext";
import { LEVELS, fmtEur, BRAND } from "../config/site";
import { scrollToId } from "../lib/scroll";
import { EASE } from "./Reveal";

const field = "h-12 rounded-[14px] border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-[#f5f2ee] placeholder:text-[#6f6a64] focus-visible:ring-[color:var(--gold)]";

const STATUS = {
  nuova: { l: "Ricevuta", c: "text-[color:var(--blush)] border-[rgba(242,215,208,0.3)]" },
  in_lavorazione: { l: "In lavorazione", c: "text-[color:var(--gold-light)] border-[rgba(214,178,94,0.4)]" },
  completata: { l: "Sbloccata", c: "text-[#9fe0b5] border-[rgba(159,224,181,0.35)]" },
  rifiutata: { l: "Non disponibile", c: "text-[#b9b2aa] border-[rgba(185,178,170,0.3)]" },
};

const levelInfo = (spent) => {
  let cur = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (spent >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
  }
  const pct = next ? Math.min(100, Math.round(((spent - cur.min) / (next.min - cur.min)) * 100)) : 100;
  return { cur, next, pct };
};

const Ring = ({ pct }) => {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
      <circle cx="42" cy="42" r={r} stroke="rgba(214,178,94,0.15)" strokeWidth="5" fill="none" />
      <motion.circle
        cx="42" cy="42" r={r} stroke="url(#g)" strokeWidth="5" fill="none" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1d998" />
          <stop offset="100%" stopColor="#e7b8c8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const AuthForms = () => {
  const { register, login } = useFan();
  const [mode, setMode] = useState("register");
  const [f, setF] = useState({ username: "", display_name: "", code: "", is_adult: false });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (mode === "register" && !f.is_adult) { toast.error("Conferma di avere almeno 18 anni"); return; }
    if (f.code.length < 6) { toast.error("Il codice deve avere almeno 6 caratteri"); return; }
    setBusy(true);
    try {
      if (mode === "register") {
        await register(f);
        toast.success("Benvenuto nella Crew! Il tuo codice è attivo.");
      } else {
        await login({ username: f.username, code: f.code });
        toast.success("Bentornato!");
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 rounded-full border border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] p-1" data-testid="auth-mode-switch">
        {[["register", "Nuovo accesso"], ["login", "Ho un codice"]].map(([k, l]) => (
          <button key={k} type="button" data-testid={`auth-mode-${k}`} onClick={() => setMode(k)} className={`relative rounded-full py-2.5 text-[11px] uppercase tracking-[0.14em] ${mode === k ? "text-[#141014]" : "text-[#b9b2aa]"}`}>
            {mode === k && <motion.span layoutId="authpill" className="btn-gold absolute inset-0 rounded-full" />}
            <span className="relative z-10 font-semibold">{l}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form key={mode} onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mt-7 space-y-5" data-testid={`auth-form-${mode}`}>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{mode === "register" ? "Nuovo accesso Crew" : "Accedi"}</span>
            <h3 className="mt-2 font-display text-3xl italic text-[#f5f2ee]">{mode === "register" ? "Crea il tuo codice privato" : "Bentornato"}</h3>
            <p className="mt-2 text-sm text-[#b9b2aa]">Nessuna email. Nessun social. Solo tu, {BRAND.short} e il tuo codice.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Username</Label>
            <Input data-testid="auth-username-input" autoCapitalize="none" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase() })} placeholder="es. marcorossi" className={field} />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Nome visualizzato (visto solo da me)</Label>
              <Input data-testid="auth-display-name-input" value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} placeholder="es. Marco R." className={field} />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.18em] text-[#b9b2aa]">Codice personale (segreto)</Label>
            <div className="relative">
              <Input data-testid="auth-code-input" type={show ? "text" : "password"} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="min. 6 caratteri, tienilo al sicuro" className={`${field} pr-12`} />
              <button type="button" data-testid="auth-code-toggle" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9b2aa]" aria-label="Mostra codice">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {mode === "register" && (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox data-testid="auth-adult-checkbox" checked={f.is_adult} onCheckedChange={(v) => setF({ ...f, is_adult: !!v })} className="mt-0.5 border-[color:var(--gold)] data-[state=checked]:bg-[color:var(--gold)] data-[state=checked]:text-[#141014]" />
              <span className="text-sm text-[#b9b2aa]">Ho almeno 18 anni</span>
            </label>
          )}
          <button type="submit" disabled={busy} data-testid="auth-submit-button" className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {mode === "register" ? "Crea codice ed entra" : "Accedi"}
          </button>
        </motion.form>
      </AnimatePresence>
    </div>
  );
};

const Profile = ({ close }) => {
  const { data, logout } = useFan();
  const { fan, orders, unlocked, spent } = data;
  const lv = levelInfo(spent || 0);
  return (
    <div data-testid="fan-profile">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring pct={lv.pct} />
          <div className="absolute inset-0 flex items-center justify-center font-display text-2xl italic text-[#f5f2ee]">{fan.display_name[0]?.toUpperCase()}</div>
        </div>
        <div>
          <div className="font-display text-2xl text-[#f5f2ee]" data-testid="fan-display-name">{fan.display_name}</div>
          <div className="text-sm text-[#b9b2aa]">@{fan.username}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)]" data-testid="fan-level">
            Livello {lv.cur.name}{lv.next ? ` · ${lv.pct}% verso ${lv.next.name}` : " · Massimo"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[["Ordini", orders.length], ["Sbloccati", unlocked.length], ["Totale", fmtEur(spent || 0)]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-[rgba(214,178,94,0.16)] bg-[#0b0b0d] px-3 py-3">
            <div className="font-display text-xl tabular-nums text-[color:var(--gold-light)]">{v}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">{k}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[color:var(--blush)]"><SparkIcon className="h-3.5 w-3.5" /> Contenuti sbloccati</div>
        {unlocked.length === 0 ? (
          <p data-testid="fan-unlocked-empty" className="mt-3 text-sm text-[#6f6a64]">Non hai ancora sbloccato nulla.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {unlocked.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-xl border border-[rgba(159,224,181,0.2)] bg-[#0b0b0d] px-4 py-3 text-sm">
                <span className="text-[#f5f2ee]">{o.item || "Richiesta personalizzata"}</span>
                <Lock className="h-3.5 w-3.5 text-[#9fe0b5]" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[color:var(--blush)]"><Package className="h-3.5 w-3.5" /> I miei ordini</div>
        {orders.length === 0 ? (
          <div className="mt-3">
            <p data-testid="fan-orders-empty" className="text-sm text-[#6f6a64]">Nessun ordine ancora.</p>
            <button data-testid="fan-browse-offers" onClick={() => { close(); setTimeout(() => scrollToId("offerte"), 300); }} className="btn-ghost-lux mt-4 rounded-xl px-5 py-3 text-xs uppercase tracking-[0.14em]">Scopri le offerte</button>
          </div>
        ) : (
          <ul className="mt-3 space-y-2" data-testid="fan-orders-list">
            {orders.map((o) => {
              const s = STATUS[o.status] || STATUS.nuova;
              return (
                <li key={o.id} className="rounded-xl border border-[rgba(214,178,94,0.14)] bg-[#0b0b0d] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#f5f2ee]">{o.item || "Richiesta personalizzata"}</span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${s.c}`}>{s.l}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-[#6f6a64]">
                    <span>{new Date(o.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</span>
                    {o.item_price != null && <span className="tabular-nums">{fmtEur(o.item_price)}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button data-testid="fan-logout-button" onClick={() => { logout(); toast("Sei uscito"); }} className="btn-ghost-lux mt-10 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm uppercase tracking-[0.14em]">
        <LogOut className="h-4 w-4" /> Esci
      </button>
    </div>
  );
};

export const AccountSheet = () => {
  const { data, sheetOpen, setSheetOpen, token, loading } = useFan();
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="right" data-testid="account-sheet" className="w-full overflow-y-auto border-l border-[rgba(214,178,94,0.18)] bg-[#0b0b0d] p-6 text-[#f5f2ee] sm:max-w-md" data-lenis-prevent>
        <SheetTitle className="text-gold-sheen font-display text-2xl italic">Il tuo spazio</SheetTitle>
        <SheetDescription className="text-xs uppercase tracking-[0.2em] text-[#6f6a64]">Profilo privato</SheetDescription>
        <div className="mt-8">
          {token && !data && loading && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" /></div>}
          {data ? <Profile close={() => setSheetOpen(false)} /> : !token && <AuthForms />}
        </div>
      </SheetContent>
    </Sheet>
  );
};
