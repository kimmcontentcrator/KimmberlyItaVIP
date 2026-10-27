import { Shell } from "../components/Shell";
import { LockedPreviewGrid } from "../components/LockedPreviewGrid";
import { VaultSection } from "../components/VaultSection";
import { TopFanSection } from "../components/TopFanSection";
import { CustomRequestForm } from "../components/CustomRequestForm";
import { HowItWorks } from "../components/HowItWorks";
import { AboutSection } from "../components/AboutSection";
import { RulesSection } from "../components/RulesSection";
import { FAQSection } from "../components/FAQSection";
import { ContactSection } from "../components/ContactSection";
import { useRequestPrefill } from "../context/RequestPrefill";
import { goTo } from "../lib/scroll";

// Pagine separate (Preview A): ogni sezione "lunga" vive qui, raggiungibile in un tap.
export default function SectionPage({ which }) {
  const { prefill, setPrefill } = useRequestPrefill();
  const onRequest = (p) => { setPrefill({ ...p, nonce: Date.now() }); setTimeout(() => goTo("richieste"), 60); };
  return (
    <Shell testId={`section-page-${which}`}>
      <div className="pt-16" />
      {which === "vault" && (<><LockedPreviewGrid onRequest={onRequest} /><VaultSection /><TopFanSection /></>)}
      {which === "richiesta" && <CustomRequestForm prefill={prefill} />}
      {which === "come-funziona" && <HowItWorks />}
      {which === "chi-sono" && <AboutSection />}
      {which === "regole" && <RulesSection />}
      {which === "domande" && <FAQSection />}
      {which === "contatti" && <ContactSection />}
    </Shell>
  );
}
