import { useEffect, useState } from "react";

// Preview della home: "a" = solo foto + piani (resto in pagine separate), "b" = foto -> piani -> resto compatto.
export const HOME_VARIANTS = [
  { id: "a", label: "A", title: "Solo foto e piani" },
  { id: "b", label: "B", title: "Foto, piani e resto compatto" },
];

export const readVariant = () => {
  const q = new URLSearchParams(window.location.search).get("home");
  if (q === "a" || q === "b") { localStorage.setItem("kv_home", q); return q; }
  const saved = localStorage.getItem("kv_home");
  return saved === "b" ? "b" : "a";
};

export const useHomeVariant = () => {
  const [v, setV] = useState(readVariant);
  useEffect(() => {
    const on = () => setV(readVariant());
    window.addEventListener("kv-home-variant", on);
    return () => window.removeEventListener("kv-home-variant", on);
  }, []);
  const set = (id) => {
    localStorage.setItem("kv_home", id);
    const url = new URL(window.location.href);
    url.searchParams.set("home", id);
    window.history.replaceState({}, "", url);
    window.dispatchEvent(new Event("kv-home-variant"));
  };
  return [v, set];
};
