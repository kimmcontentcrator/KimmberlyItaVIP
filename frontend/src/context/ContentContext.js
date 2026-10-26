import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../lib/scroll";

const Ctx = createContext(null);
export const ADMIN_KEY = "kv_admin_token";

// Testi/prezzi/link modificabili. get(key, default) restituisce il testo salvato o quello originale.
export const ContentProvider = ({ children }) => {
  const [over, setOver] = useState({});
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(null); // {k, def, multiline}

  useEffect(() => {
    axios.get(`${API}/content`).then((r) => setOver(r.data || {})).catch(() => {});
  }, []);

  // Attiva modalità modifica con ?modifica=1 se l'admin ha una sessione valida
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const want = params.get("modifica") === "1" || sessionStorage.getItem("kv_edit") === "1";
    const tok = localStorage.getItem(ADMIN_KEY);
    if (!want || !tok) return;
    axios.get(`${API}/admin/me`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(() => { setEditing(true); sessionStorage.setItem("kv_edit", "1"); localStorage.setItem("kv_age_verified", "1"); })
      .catch(() => { sessionStorage.removeItem("kv_edit"); });
  }, []);

  const get = useCallback((k, def) => (over[k] !== undefined && over[k] !== null ? over[k] : def), [over]);

  const save = async (k, value) => {
    const tok = localStorage.getItem(ADMIN_KEY);
    const { data } = await axios.put(`${API}/admin/content`, { key: k, value }, { headers: { Authorization: `Bearer ${tok}` } });
    setOver((o) => {
      const n = { ...o };
      if (data.value === null) delete n[k];
      else n[k] = data.value;
      return n;
    });
  };

  const stopEditing = () => {
    sessionStorage.removeItem("kv_edit");
    setEditing(false);
    const u = new URL(window.location.href);
    u.searchParams.delete("modifica");
    window.history.replaceState({}, "", u.toString());
  };

  return (
    <Ctx.Provider value={{ over, get, editing, stopEditing, save, target, setTarget }}>
      {children}
    </Ctx.Provider>
  );
};

export const useContent = () => useContext(Ctx);

export const toNum = (v, def) => {
  const n = parseFloat(String(v).replace(/[^0-9,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : def;
};

// Testo modificabile: mantiene classi/dimensioni/font del contenitore
export const E = ({ k, children, as: Tag = "span", className = "", multiline = false }) => {
  const { get, editing, setTarget } = useContent();
  const def = Array.isArray(children) ? children.join("") : String(children ?? "");
  const val = get(k, def);
  if (!editing) return <Tag className={className}>{val}</Tag>;
  return (
    <Tag
      data-testid={`edit-${k}`}
      data-edit-key={k}
      role="button"
      tabIndex={0}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTarget({ k, def, multiline }); }}
      className={`${className} kv-editable`}
    >
      {val}
    </Tag>
  );
};

// Valore modificabile senza rendering (prezzi, link, date)
export const useEditable = () => {
  const { get } = useContent();
  return get;
};
