import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PenLine, RotateCcw, X, Loader2, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useContent } from "../context/ContentContext";
import { errMsg } from "../context/FanContext";

// Barra + finestra della Modalità Modifica (solo admin)
export const EditMode = () => {
  const { editing, stopEditing, target, setTarget, get, save, over } = useContent();
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (target) setVal(get(target.k, target.def));
  }, [target, get]);

  if (!editing) return null;

  const doSave = async (value) => {
    setBusy(true);
    try {
      await save(target.k, value);
      toast.success(value === null ? "Testo originale ripristinato" : "Salvato, visibile a tutti");
      setTarget(null);
    } catch (e) {
      toast.error(errMsg(e, "Sessione scaduta: rientra dall'area riservata"));
    } finally {
      setBusy(false);
    }
  };

  const changed = target && over[target.k] !== undefined;

  return (
    <>
      <div data-testid="edit-mode-bar" className="fixed left-1/2 top-[72px] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[rgba(0,175,240,0.5)] bg-[#141418] py-1.5 pl-4 pr-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <PenLine className="h-3.5 w-3.5 text-[color:var(--gold)]" />
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-[#f5f2ee]">Modifica · tocca un testo</span>
        <Link to="/admin/contenuti" data-testid="edit-mode-settings" className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(242,215,208,0.25)] text-[#f5f2ee]" aria-label="Impostazioni">
          <Settings2 className="h-3.5 w-3.5" />
        </Link>
        <button data-testid="edit-mode-exit" onClick={stopEditing} className="btn-gold flex h-8 items-center gap-1 rounded-full px-3 text-[11px] font-semibold uppercase">
          <X className="h-3.5 w-3.5" /> Esci
        </button>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent data-testid="edit-dialog" className="max-w-lg rounded-[22px] border border-[rgba(0,175,240,0.25)] bg-[#111114] text-[#f5f2ee]">
          {target && (
            <>
              <DialogTitle className="font-display text-2xl font-normal italic">Modifica testo</DialogTitle>
              <DialogDescription className="text-[11px] uppercase tracking-[0.16em] text-[#6f6a64]">{target.k}</DialogDescription>
              <Textarea
                data-testid="edit-dialog-textarea"
                autoFocus
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) doSave(val); }}
                className="min-h-[120px] rounded-xl border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-base text-[#f5f2ee]"
              />
              <p className="text-xs text-[#6f6a64]">Originale: <span className="text-[#b9b2aa]">{target.def}</span></p>
              <div className="flex gap-2">
                <button data-testid="edit-dialog-save" disabled={busy || !val.trim()} onClick={() => doSave(val)} className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salva
                </button>
                {changed && (
                  <button data-testid="edit-dialog-reset" disabled={busy} onClick={() => doSave(null)} className="btn-ghost-lux flex items-center gap-2 rounded-xl px-4 text-xs uppercase tracking-[0.12em]">
                    <RotateCcw className="h-3.5 w-3.5" /> Originale
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
