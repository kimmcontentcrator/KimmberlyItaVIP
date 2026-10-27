export const scrollToId = (id, offset = -70) => {
  const el = document.getElementById(id);
  if (!el) return false;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return true;
};

// Dove vive ogni sezione quando NON e' in home (Preview A). In Preview B e' tutto in home: si scorre.
export const SECTION_ROUTES = {
  top: "/",
  foto: "/",
  offerte: "/",
  cataloghi: "/",
  mondo: "/chi-sono",
  esclusivi: "/vault",
  vault: "/vault",
  topfan: "/vault",
  richieste: "/richiesta",
  come: "/come-funziona",
  regole: "/regole",
  faq: "/domande",
  contatti: "/contatti",
};

// Scorre alla sezione se e' nella pagina corrente, altrimenti naviga alla pagina che la contiene.
export const goTo = (id, state) => {
  if (id === "top") {
    if (window.location.pathname === "/") { window.__lenis ? window.__lenis.scrollTo(0, { duration: 1 }) : window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    window.__navigate?.("/", { state: { scrollTo: "top", ...(state || {}) } });
    return;
  }
  if (scrollToId(id)) return;
  const route = SECTION_ROUTES[id] || "/";
  window.__navigate?.(route, { state: { scrollTo: id, ...(state || {}) } });
};

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
