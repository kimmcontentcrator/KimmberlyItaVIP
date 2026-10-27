import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Wallet, Loader2, Unplug } from "lucide-react";
import { useTonConnectUI, useTonWallet, useTonAddress } from "@tonconnect/ui-react";
import { API } from "../lib/scroll";

// "Paga con wallet": apre Telegram Wallet / Tonkeeper / Trust con importo e codice gia' compilati (TON Connect).
export const TonPayButton = ({ order, headers, onSent }) => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef(false);

  const pay = useCallback(async () => {
    setBusy(true);
    try {
      const { data } = await axios.get(`${API}/orders/${order.code}/tonconnect`, { params: address ? { owner: address } : {}, headers });
      await tonConnectUI.sendTransaction({ validUntil: data.validUntil, messages: data.messages });
      toast.success("Transazione inviata. La conferma arriva di solito entro 2 minuti.");
      onSent?.();
    } catch (e) {
      const detail = e?.response?.data?.detail;
      const rejected = /reject|cancel|annull/i.test(String(e?.message || e?.name || ""));
      toast.error(typeof detail === "string" ? detail : rejected ? "Hai annullato nel wallet" : "Pagamento non inviato, riprova o usa indirizzo e QR");
    } finally {
      setBusy(false);
    }
  }, [order.code, address, headers, tonConnectUI, onSent]);

  useEffect(() => {
    if (wallet && pendingRef.current) { pendingRef.current = false; pay(); }
  }, [wallet, pay]);

  const onClick = async () => {
    if (!wallet) { pendingRef.current = true; await tonConnectUI.openModal(); return; }
    pay();
  };

  return (
    <div className="space-y-2">
      <button data-testid="order-pay-wallet-button" onClick={onClick} disabled={busy} className="btn-gold flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {wallet ? `Paga con ${wallet.device?.appName || "wallet"}` : "Paga con wallet"}
      </button>
      {wallet && (
        <div className="flex items-center justify-between text-[11px] text-[#8a847d]">
          <span className="truncate font-mono" data-testid="order-connected-wallet">Collegato: {address.slice(0, 6)}…{address.slice(-4)}</span>
          <button data-testid="order-disconnect-wallet" onClick={() => tonConnectUI.disconnect()} className="flex items-center gap-1 hover:text-[#f5f2ee]"><Unplug className="h-3 w-3" /> Scollega</button>
        </div>
      )}
    </div>
  );
};
