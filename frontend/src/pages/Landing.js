import { useCallback } from "react";
import { Shell } from "../components/Shell";
import { MiniHero } from "../components/MiniHero";
import { PixelGallery } from "../components/PixelGallery";
import { OffersSection } from "../components/OffersSection";
import { CatalogSection } from "../components/CatalogSection";
import { VaultSection } from "../components/VaultSection";
import { TopFanSection } from "../components/TopFanSection";
import { CustomRequestForm } from "../components/CustomRequestForm";
import { QuickLinks } from "../components/QuickLinks";
import { CompactInfo } from "../components/CompactInfo";
import { useHomeVariant } from "../lib/homeVariant";
import { goTo } from "../lib/scroll";
import { useRequestPrefill } from "../context/RequestPrefill";

// Home conversion-first: foto pixelate subito, poi piani. A = resto in pagine separate, B = resto compatto in fondo.
export default function Landing() {
  const [variant] = useHomeVariant();
  const { setPrefill, prefill } = useRequestPrefill();

  const onRequest = useCallback((p) => {
    setPrefill({ ...p, nonce: Date.now() });
    setTimeout(() => goTo("richieste"), 60);
  }, [setPrefill]);

  return (
    <Shell testId={`landing-page-${variant}`}>
      <MiniHero />
      <PixelGallery onRequest={onRequest} />
      <OffersSection onRequest={onRequest} />
      <CatalogSection onRequest={onRequest} />
      {variant === "a" ? (
        <QuickLinks />
      ) : (
        <>
          <VaultSection />
          <TopFanSection />
          <CustomRequestForm prefill={prefill} />
          <CompactInfo />
        </>
      )}
    </Shell>
  );
}
