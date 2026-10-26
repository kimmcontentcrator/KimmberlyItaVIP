import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../lib/scroll";

const FanCtx = createContext(null);
const KEY = "kv_fan_token";

export const FanProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(KEY));
  const [data, setData] = useState(null); // {fan, orders, unlocked, spent}
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const authHeaders = useCallback(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const refresh = useCallback(async () => {
    if (!token) { setData(null); return; }
    setLoading(true);
    try {
      const { data: d } = await axios.get(`${API}/fans/me`, { headers: { Authorization: `Bearer ${token}` } });
      setData(d);
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.removeItem(KEY);
        setToken(null);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const saveSession = (t) => {
    localStorage.setItem(KEY, t);
    setToken(t);
  };

  const register = async (body) => {
    const { data: d } = await axios.post(`${API}/fans/register`, body);
    saveSession(d.token);
    return d.fan;
  };

  const login = async (body) => {
    const { data: d } = await axios.post(`${API}/fans/login`, body);
    saveSession(d.token);
    return d.fan;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setToken(null);
    setData(null);
  };

  return (
    <FanCtx.Provider value={{ token, data, fan: data?.fan || null, loading, register, login, logout, refresh, authHeaders, sheetOpen, setSheetOpen }}>
      {children}
    </FanCtx.Provider>
  );
};

export const useFan = () => useContext(FanCtx);

export const errMsg = (e, fallback = "Qualcosa è andato storto, riprova") => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return String(d[0].msg).replace(/^Value error, /, "");
  return fallback;
};
