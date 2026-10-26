import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, RefreshCcw, Copy, Trash2, Loader2, Inbox, ExternalLink, PenLine } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { API } from "../lib/scroll";
import { BRAND, CHANNELS, REQUEST_TYPES, fmtEur } from "../config/site";
import { ADMIN_KEY } from "./AdminLogin";
import { errMsg } from "../context/FanContext";

const STATUSES = [
  { v: "tutte", l: "Tutte" },
  { v: "nuova", l: "Nuove" },
  { v: "in_lavorazione", l: "In lavorazione" },
  { v: "completata", l: "Completate" },
  { v: "rifiutata", l: "Rifiutate" },
];
const S_STYLE = {
  nuova: "text-[color:var(--blush)] border-[rgba(242,215,208,0.35)]",
  in_lavorazione: "text-[color:var(--gold-light)] border-[rgba(214,178,94,0.45)]",
  completata: "text-[#9fe0b5] border-[rgba(159,224,181,0.4)]",
  rifiutata: "text-[#8a847d] border-[rgba(138,132,125,0.4)]",
};
const sLabel = (v) => STATUSES.find((s) => s.v === v)?.l || v;
const chLabel = (v) => CHANNELS.find((c) => c.value === v)?.label || v;
const tLabel = (v) => REQUEST_TYPES.find((c) => c.value === v)?.label || v;
const fmtDate = (iso) => new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const contactUrl = (r) => {
  const h = (r.contact_handle || "").trim();
  if (r.contact_channel === "telegram") return `https://t.me/${h.replace(/^@/, "")}`;
  if (r.contact_channel === "instagram") return `https://instagram.com/${h.replace(/^@/, "")}`;
  if (r.contact_channel === "whatsapp") return `https://wa.me/${h.replace(/[^0-9]/g, "")}`;
  if (r.contact_channel === "email") return `mailto:${h}`;
  return null;
};

const Badge = ({ s }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${S_STYLE[s] || ""}`}>{sLabel(s)}</span>
);

export default function AdminRequests() {
  const nav = useNavigate();
  const token = localStorage.getItem(ADMIN_KEY);
  const [filter, setFilter] = useState("tutte");
  const [rows, setRows] = useState(null);
  const [stats, setStats] = useState(null);
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState({ status: "nuova", internal_notes: "", amount_paid: "" });
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const handleAuthErr = useCallback((e) => {
    if (e?.response?.status === 401) {
      localStorage.removeItem(ADMIN_KEY);
      toast.error("Sessione scaduta, accedi di nuovo");
      nav("/admin");
      return true;
    }
    return false;
  }, [nav]);

  const load = useCallback(async () => {
    if (!token) { nav("/admin"); return; }
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [r, s] = await Promise.all([
        axios.get(`${API}/admin/requests`, { headers: h, params: { status: filter } }),
        axios.get(`${API}/admin/stats`, { headers: h }),
      ]);
      setRows(r.data);
      setStats(s.data);
    } catch (e) {
      if (!handleAuthErr(e)) toast.error(errMsg(e));
    }
  }, [token, filter, nav, handleAuthErr]);

  useEffect(() => { load(); }, [load]);

  const open = (r) => {
    setSel(r);
    setEdit({ status: r.status, internal_notes: r.internal_notes || "", amount_paid: r.amount_paid ? String(r.amount_paid) : "" });
  };

  const save = async () => {
    setSaving(true);
    try {
      const amt = edit.amount_paid === "" ? 0 : parseFloat(String(edit.amount_paid).replace(",", "."));
      if (Number.isNaN(amt)) { toast.error("Importo non valido"); setSaving(false); return; }
      const { data } = await axios.patch(`${API}/admin/requests/${sel.id}`, { status: edit.status, internal_notes: edit.internal_notes, amount_paid: amt }, { headers });
      setSel(data);
      toast.success("Richiesta aggiornata");
      load();
    } catch (e) {
      if (!handleAuthErr(e)) toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await axios.delete(`${API}/admin/requests/${sel.id}`, { headers });
      toast.success("Richiesta eliminata");
      setSel(null);
      load();
    } catch (e) {
      if (!handleAuthErr(e)) toast.error(errMsg(e));
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY);
    nav("/admin");
  };

  const copy = async (t) => {
    try { await navigator.clipboard.writeText(t); toast.success("Contatto copiato"); } catch { toast.error("Impossibile copiare"); }
  };

  const STAT_CARDS = stats ? [
    ["Totale", stats.totale], ["Nuove", stats.nuova], ["In lavorazione", stats.in_lavorazione], ["Completate", stats.completata], ["Fan registrati", stats.fans], ["Incassato", fmtEur(stats.incassato || 0)],
  ] : [];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f5f2ee]" data-testid="admin-requests-page">
      <header className="sticky top-0 z-30 border-b border-[rgba(214,178,94,0.14)] bg-[#0b0b0d]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-baseline gap-2" data-testid="admin-home-link">
            <span className="text-gold-sheen font-display text-2xl italic">{BRAND.short}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#b9b2aa]">Admin</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/admin/contenuti" data-testid="admin-content-link" className="btn-gold flex items-center gap-2 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.14em]"><PenLine className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Testi & prezzi</span></Link>
            <button data-testid="admin-refresh-button" onClick={load} className="btn-ghost-lux flex h-10 w-10 items-center justify-center rounded-full" aria-label="Aggiorna"><RefreshCcw className="h-4 w-4" /></button>
            <button data-testid="admin-logout-button" onClick={logout} className="btn-ghost-lux flex items-center gap-2 rounded-full px-4 text-[11px] uppercase tracking-[0.14em]"><LogOut className="h-3.5 w-3.5" /> Esci</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-4xl italic">Richieste</h1>
        <p className="mt-1 text-sm text-[#b9b2aa]">Gestisci ordini, richieste personalizzate e incassi. Quando segni una richiesta come completata con un importo, si aggiorna la classifica Top Fan.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-testid="admin-stats">
          {stats ? STAT_CARDS.map(([k, v]) => (
            <div key={k} className="lux-card px-4 py-4">
              <div className="font-display text-2xl tabular-nums text-[color:var(--gold-light)]">{v}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">{k}</div>
            </div>
          )) : Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-[22px] bg-[#141418]" />)}
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1" data-testid="admin-status-filters">
          {STATUSES.map((s) => (
            <button key={s.v} data-testid={`admin-filter-${s.v}`} onClick={() => setFilter(s.v)} className={`shrink-0 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${filter === s.v ? "btn-gold font-semibold" : "btn-ghost-lux"}`}>
              {s.l}
            </button>
          ))}
        </div>

        {rows === null ? (
          <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" /></div>
        ) : rows.length === 0 ? (
          <div data-testid="admin-empty-state" className="lux-card mt-8 flex flex-col items-center p-12 text-center">
            <Inbox className="h-10 w-10 text-[color:var(--gold)]" />
            <p className="mt-4 font-display text-2xl italic">Nessuna richiesta qui.</p>
            <p className="mt-1 text-sm text-[#b9b2aa]">Le nuove richieste dal sito appariranno in questa lista.</p>
          </div>
        ) : (
          <>
            <div className="lux-card mt-6 hidden overflow-hidden md:block">
              <Table data-testid="admin-requests-table">
                <TableHeader>
                  <TableRow className="border-[rgba(214,178,94,0.14)] hover:bg-transparent">
                    {["Data", "Nome", "Richiesta", "Canale", "Prezzo", "Stato"].map((h) => <TableHead key={h} className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} data-testid="admin-requests-row" onClick={() => open(r)} className="cursor-pointer border-[rgba(214,178,94,0.08)] hover:bg-[#141418]">
                      <TableCell className="whitespace-nowrap text-xs text-[#b9b2aa]">{fmtDate(r.created_at)}</TableCell>
                      <TableCell className="text-sm">{r.name || "—"}{r.fan_username && <span className="ml-1 text-xs text-[color:var(--gold)]">@{r.fan_username}</span>}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-sm">{r.item || tLabel(r.request_type)}</TableCell>
                      <TableCell className="text-sm">{chLabel(r.contact_channel)}</TableCell>
                      <TableCell className="text-sm tabular-nums">{r.item_price != null ? fmtEur(r.item_price) : r.budget || "—"}</TableCell>
                      <TableCell><Badge s={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 space-y-3 md:hidden">
              {rows.map((r) => (
                <button key={r.id} data-testid="admin-requests-card" onClick={() => open(r)} className="lux-card block w-full p-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg">{r.item || tLabel(r.request_type)}</span>
                    <Badge s={r.status} />
                  </div>
                  <div className="mt-1 text-sm text-[#b9b2aa]">{r.name || "—"} · {chLabel(r.contact_channel)}</div>
                  <div className="mt-1 flex justify-between text-xs text-[#6f6a64]">
                    <span>{fmtDate(r.created_at)}</span>
                    <span className="tabular-nums">{r.item_price != null ? fmtEur(r.item_price) : r.budget}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent side="right" data-testid="admin-request-detail" className="w-full overflow-y-auto border-l border-[rgba(214,178,94,0.18)] bg-[#0b0b0d] p-6 text-[#f5f2ee] sm:max-w-lg">
          {sel && (
            <>
              <SheetTitle className="font-display text-3xl font-normal italic text-[#f5f2ee]">{sel.item || tLabel(sel.request_type)}</SheetTitle>
              <SheetDescription className="text-xs text-[#6f6a64]">Ricevuta il {fmtDate(sel.created_at)} · #{sel.id.slice(0, 8)}</SheetDescription>

              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Nome", sel.name || "—"],
                  ["Account", sel.fan_username ? `@${sel.fan_username}` : "Ospite"],
                  ["Tipo", tLabel(sel.request_type)],
                  ["Prezzo / budget", sel.item_price != null ? fmtEur(sel.item_price) : sel.budget || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-[rgba(214,178,94,0.12)] bg-[#111114] p-3">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">{k}</dt>
                    <dd className="mt-1 text-[#f5f2ee]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[rgba(231,184,200,0.25)] bg-[#141016] p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--blush)]">{chLabel(sel.contact_channel)}</div>
                  <div className="text-sm" data-testid="admin-detail-contact">{sel.contact_handle}</div>
                </div>
                <div className="flex gap-2">
                  <button data-testid="admin-copy-contact" onClick={() => copy(sel.contact_handle)} className="btn-ghost-lux flex h-9 w-9 items-center justify-center rounded-full" aria-label="Copia"><Copy className="h-3.5 w-3.5" /></button>
                  {contactUrl(sel) && <a data-testid="admin-open-contact" href={contactUrl(sel)} target="_blank" rel="noopener noreferrer" className="btn-gold flex h-9 w-9 items-center justify-center rounded-full" aria-label="Apri"><ExternalLink className="h-3.5 w-3.5" /></a>}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">Messaggio</div>
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-[rgba(214,178,94,0.12)] bg-[#111114] p-4 text-sm leading-relaxed" data-testid="admin-detail-description">{sel.description}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">Stato</div>
                  <Select value={edit.status} onValueChange={(v) => setEdit({ ...edit, status: v })}>
                    <SelectTrigger data-testid="admin-request-status-select" className="h-11 rounded-xl border-[rgba(242,215,208,0.16)] bg-[#111114]"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-[rgba(214,178,94,0.2)] bg-[#141418] text-[#f5f2ee]">
                      {STATUSES.filter((s) => s.v !== "tutte").map((s) => <SelectItem key={s.v} value={s.v} data-testid={`admin-status-option-${s.v}`}>{s.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">Importo incassato €</div>
                  <Input data-testid="admin-amount-input" inputMode="decimal" value={edit.amount_paid} onChange={(e) => setEdit({ ...edit, amount_paid: e.target.value })} placeholder="0" className="h-11 rounded-xl border-[rgba(242,215,208,0.16)] bg-[#111114]" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#b9b2aa]">Note interne (solo tu)</div>
                <Textarea data-testid="admin-request-notes-textarea" value={edit.internal_notes} onChange={(e) => setEdit({ ...edit, internal_notes: e.target.value })} className="min-h-[100px] rounded-xl border-[rgba(242,215,208,0.16)] bg-[#111114]" placeholder="Es. pagato, consegnato su Telegram…" />
              </div>

              <div className="mt-6 flex gap-3">
                <button data-testid="admin-save-button" onClick={save} disabled={saving} className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salva
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button data-testid="admin-delete-button" className="btn-ghost-lux flex items-center justify-center rounded-xl px-4" aria-label="Elimina"><Trash2 className="h-4 w-4" /></button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-[rgba(214,178,94,0.2)] bg-[#111114] text-[#f5f2ee]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminare questa richiesta?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#b9b2aa]">L'operazione non si può annullare.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="admin-delete-cancel" className="border-[rgba(242,215,208,0.2)] bg-transparent text-[#f5f2ee]">Annulla</AlertDialogCancel>
                      <AlertDialogAction data-testid="admin-delete-confirm" onClick={remove} className="bg-[#8b2a3a] text-white hover:bg-[#a03246]">Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
