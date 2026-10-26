import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../lib/scroll";

// Contatore reale di visitatori attivi (ultimi 90 secondi)
export const usePresence = () => {
  const [online, setOnline] = useState(null);
  useEffect(() => {
    let sid = sessionStorage.getItem("kv_sid");
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("kv_sid", sid);
    }
    let alive = true;
    const ping = async () => {
      try {
        const { data } = await axios.post(`${API}/presence`, { sid });
        if (alive) setOnline(data.online);
      } catch (e) { /* silenzioso */ }
    };
    ping();
    const t = setInterval(ping, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return online;
};
