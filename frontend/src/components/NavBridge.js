import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId } from "../lib/scroll";

// Espone navigate() fuori da React (lib/scroll.goTo) e gestisce lo scroll alla sezione richiesta dopo un cambio pagina.
export const NavBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { window.__navigate = navigate; return () => { window.__navigate = null; }; }, [navigate]);
  useEffect(() => {
    const id = location.state?.scrollTo;
    if (id === "top" || !id) { window.scrollTo(0, 0); return; }
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      if (scrollToId(id, -80) || tries > 20) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, [location.pathname, location.state]);
  return null;
};
