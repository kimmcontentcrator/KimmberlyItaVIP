import { E } from "../context/ContentContext";
import { Link } from "react-router-dom";
import { BRAND } from "../config/site";
import { NAV } from "./Navbar";
import { goTo } from "../lib/scroll";

export const FooterLuxury = () => {
  const replayIntro = () => {
    localStorage.removeItem("kv_age_verified");
    window.scrollTo(0, 0);
    window.location.reload();
  };
  return (
    <footer data-testid="footer" className="relative border-t border-[rgba(0,175,240,0.14)] bg-[#08080a] pb-28 pt-20 lg:pb-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="text-gold-sheen font-display text-5xl italic"><E k="brand.short">{BRAND.short}</E></div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.5em] text-[#f5f2ee]/80">ITA · VIP</div>
            <p className="mt-5 max-w-xs font-display text-lg italic text-[#b9b2aa]"><E k="brand.tagline">{BRAND.tagline}</E></p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Il sito</div>
            <ul className="mt-5 space-y-3">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button data-testid={`footer-link-${n.id}`} onClick={() => goTo(n.id)} className="text-sm text-[#b9b2aa] transition-colors hover:text-[color:var(--blush)]">{n.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Altro</div>
            <ul className="mt-5 space-y-3">
              <li><button data-testid="footer-link-regole" onClick={() => goTo("regole")} className="text-sm text-[#b9b2aa] hover:text-[color:var(--blush)]">Regole e trasparenza</button></li>
              <li><button data-testid="footer-link-mondo" onClick={() => goTo("mondo")} className="text-sm text-[#b9b2aa] hover:text-[color:var(--blush)]">Chi sono</button></li>
              <li><button data-testid="footer-link-faq" onClick={() => goTo("faq")} className="text-sm text-[#b9b2aa] hover:text-[color:var(--blush)]">Domande frequenti</button></li>
              <li><button data-testid="footer-replay-intro" onClick={replayIntro} className="text-sm text-[#b9b2aa] hover:text-[color:var(--blush)]">Rivedi l'ingresso</button></li>
              <li><Link data-testid="footer-admin-link" to="/admin" className="text-sm text-[#b9b2aa] hover:text-[color:var(--blush)]">Area creator · Modifica sito</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-[rgba(0,175,240,0.1)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="footer-18plus-disclaimer" className="max-w-xl text-xs leading-relaxed text-[#6f6a64]">
            <span className="mr-2 rounded border border-[rgba(0,175,240,0.35)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--gold)]">18+</span>
            <E k="footer.disclaimer" multiline>Sito riservato esclusivamente a maggiorenni. Tutti i contenuti sono originali, prodotti con il consenso delle persone coinvolte e protetti: è vietata la diffusione.</E>
          </p>
          <p className="text-xs text-[#6f6a64]">© {new Date().getFullYear()} {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
};
