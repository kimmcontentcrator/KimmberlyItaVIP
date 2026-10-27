import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { API } from "../lib/scroll";
import { BRAND } from "../config/site";
import { errMsg } from "../context/FanContext";

export const ADMIN_KEY = "kv_admin_token";

export default function AdminLogin() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_KEY);
    if (!t) return;
    axios.get(`${API}/admin/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(() => nav("/admin/requests"))
      .catch(() => localStorage.removeItem(ADMIN_KEY));
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    if (!pw) return;
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { password: pw });
      localStorage.setItem(ADMIN_KEY, data.token);
      toast.success("Accesso effettuato");
      nav("/admin/requests");
    } catch (err) {
      toast.error(errMsg(err, "Password errata"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0d] px-5" data-testid="admin-login-page">
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,175,240,0.14), rgba(0,175,240,0) 65%)" }} />
      <form onSubmit={submit} className="lux-card relative w-full max-w-sm p-8">
        <Link to="/" data-testid="admin-back-home" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#b9b2aa] hover:text-[#f5f2ee]">
          <ArrowLeft className="h-3.5 w-3.5" /> Torna al sito
        </Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,175,240,0.3)] bg-[#0b0b0d]">
          <Lock className="h-5 w-5 text-[color:var(--gold)]" />
        </div>
        <h1 className="mt-6 font-display text-3xl italic text-[#f5f2ee]">Area riservata</h1>
        <p className="mt-2 text-sm text-[#b9b2aa]">Solo per {BRAND.short}. Inserisci la password per gestire le richieste.</p>
        <Input
          data-testid="admin-password-input"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="mt-6 h-12 rounded-[14px] border-[rgba(242,215,208,0.16)] bg-[#0b0b0d] text-[#f5f2ee]"
        />
        <button type="submit" disabled={busy} data-testid="admin-login-submit-button" className="btn-gold mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entra
        </button>
      </form>
    </div>
  );
}
