export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
