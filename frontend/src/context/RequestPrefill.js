import { createContext, useContext, useState } from "react";

// Articolo scelto (offerta/catalogo/foto) che precompila il modulo richieste, anche cambiando pagina.
const Ctx = createContext({ prefill: null, setPrefill: () => {} });
export const RequestPrefillProvider = ({ children }) => {
  const [prefill, setPrefill] = useState(null);
  return <Ctx.Provider value={{ prefill, setPrefill }}>{children}</Ctx.Provider>;
};
export const useRequestPrefill = () => useContext(Ctx);
