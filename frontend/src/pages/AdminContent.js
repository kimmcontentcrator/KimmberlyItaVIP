import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, PenLine, RotateCcw, Save, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { API } from "../lib/scroll";
import { BRAND, CONTACTS, SPECIAL } from "../config/site";
import { ADMIN_KEY, useContent } from "../context/ContentContext";
import { errMsg } from "../context/FanContext";

const SETTINGS = [
  { k: "contact.telegram", l: "Link Telegram", ph: "https://t.me/tuousername", def: CONTACTS.telegram },
  { k: "contact.instagram", l: "Link Instagram", ph: "https://instagram.com/tuoprofilo", def: CONTACTS.instagram },
  { k: "contact.whatsapp", l: "Link WhatsApp", ph: "https://wa.me/39333...", def: CONTACTS.whatsapp },
  { k: "contact.telegramChannel", l: "Canale Telegram (invita amici)", ph: "https://t.me/+invito", def: CONTACTS.telegramChannel },
  { k: "special.endsAt", l: "Fine offerta Bundle Speciale (data e ora)", ph: "2026-11-30T23:59", def: SPECIAL.endsAt, type: "datetime-local" },
];

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function AdminContent() {
  const nav = useNavigate();
  const token = localStorage.getItem(ADMIN_KEY);
  const { get, save } = useContent();
  const [vals, setVals] = useState({});
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    if (!token) { nav("/admin"); return; }
    try {
      const { data } = await axios.get(`${API}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
      setList(data);
    } catch (e) {
      if (e?.response?.status === 401) { localStorage.removeItem(ADMIN_KEY); nav("/admin"); }
    }
  }, [token, nav]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const v = {};
    SETTINGS.forEach((s) => { const cur = get(s.k, s.def); v[s.k] = s.type ? toLocalInput(cur) : cur; });
    setVals(v);
  }, [get]);

  const saveSetting = async (s) => {
    setBusy(s.k);
    try {
      let v = (vals[s.k] || "").trim();
      if (s.type && v) v = new Date(v).toISOString();
      await save(s.k, v === "" ? null : v);
      toast.success("Salvato");
      load();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(null); }
  };

  const reset = async (k) => {
    setBusy(k);
    try { await save(k, null); toast.success("Testo originale ripristinato"); load(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f5f2ee]" data-testid="admin-content-page">
      <header className="sticky top-0 z-30 border-b border-[rgba(214,178,94,0.14)] bg-[#0b0b0d]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link to="/admin/requests" data-testid="admin-content-back" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#b9b2aa] hover:text-[#f5f2ee]">
            <ArrowLeft className="h-3.5 w-3.5" /> Richieste
          </Link>
          <span className="text-gold-sheen font-display text-xl italic">{BRAND.short}</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-4xl italic">Testi & impostazioni</h1>
        <p className="mt-2 text-sm text-[#b9b2aa]">Modifica qualsiasi testo o prezzo direttamente sul sito: dimensioni, font e colori restano quelli del design.</p>
        <a href="/?modifica=1" data-testid="admin-open-edit-mode" className="btn-gold mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em]">
          <PenLine className="h-4 w-4" /> Apri il sito in modalità modifica
        </a>

        <h2 className="mt-12 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Link e offerta a tempo</h2>
        <div className="mt-4 space-y-3">
          {SETTINGS.map((s) => (
            <div key={s.k} className="lux-card p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#b9b2aa]">{s.l}</div>
              <div className="mt-2 flex gap-2">
                <Input
                  data-testid={`setting-${s.k}`}
                  type={s.type || "text"}
                  value={vals[s.k] || ""}
                  onChange={(e) => setVals({ ...vals, [s.k]: e.target.value })}
                  placeholder={s.ph}
                  className="h-11 rounded-xl border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-[#f5f2ee] [color-scheme:dark]"
                />
                <button data-testid={`setting-save-${s.k}`} onClick={() => saveSetting(s)} disabled={busy === s.k} className="btn-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" aria-label="Salva">
                  {busy === s.k ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Modifiche salvate</h2>
        {list === null ? (
          <div className="mt-4 h-20 animate-pulse rounded-[22px] bg-[#141418]" />
        ) : list.length === 0 ? (
          <p data-testid="admin-content-empty" className="mt-4 text-sm text-[#6f6a64]">Nessuna modifica: il sito usa i testi originali.</p>
        ) : (
          <ul className="mt-4 space-y-2" data-testid="admin-content-list">
            {list.map((c) => (
              <li key={c.key} className="lux-card flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#6f6a64]">{c.key}</div>
                  <div className="mt-1 break-words text-sm text-[#f5f2ee]">{c.value}</div>
                </div>
                <button data-testid={`content-reset-${c.key}`} onClick={() => reset(c.key)} disabled={busy === c.key} className="btn-ghost-lux flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]">
                  <RotateCcw className="h-3 w-3" /> Originale
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
