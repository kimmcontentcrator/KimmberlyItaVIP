import { Check, Clock, Eye, PackageCheck, ShieldAlert, XCircle, Hourglass } from "lucide-react";
import { STATUS_META } from "../lib/pay";

const STEPS = [
  { n: 1, t: "Ordine creato", d: "Prezzo bloccato, istruzioni pronte", icon: Clock },
  { n: 2, t: "Pagamento visto", d: "La rete ha ricevuto la transazione", icon: Eye },
  { n: 3, t: "Confermato", d: "Pagamento definitivo: preparo la consegna", icon: Check },
  { n: 4, t: "Consegnato", d: "Contenuto tuo, in chiaro", icon: PackageCheck },
];

// Timeline verticale: i pallini si accendono in azzurro man mano che l'ordine avanza.
export const OrderTimeline = ({ order }) => {
  const meta = STATUS_META[order.status] || STATUS_META.in_attesa;
  const special = order.status === "verifica_manuale" || order.status === "rifiutato" || order.status === "scaduto";
  const reached = meta.step;
  return (
    <ol data-testid="order-status-timeline" className="relative ml-3 border-l border-[rgba(0,175,240,0.2)]">
      {STEPS.map((s) => {
        const on = s.n <= reached && !(special && s.n === 2 && order.status !== "verifica_manuale");
        const current = s.n === reached;
        const I = s.icon;
        return (
          <li key={s.n} className="relative pb-6 pl-7 last:pb-0" data-testid={`timeline-step-${s.n}`} data-active={on ? "true" : "false"}>
            <span className={`absolute -left-[11px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border transition-colors duration-300 ${on ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[#0b0b0d]" : "border-[rgba(242,215,208,0.2)] bg-[#0b0b0d] text-[#6f6a64]"} ${current && on ? "shadow-[0_0_0_5px_rgba(0,175,240,0.18),0_0_22px_rgba(0,175,240,0.6)]" : ""}`}>
              <I className="h-3 w-3" />
            </span>
            <div className={`text-sm font-semibold ${on ? "text-[#f5f2ee]" : "text-[#6f6a64]"}`}>{s.t}</div>
            <div className="text-xs text-[#8a847d]">{s.d}</div>
          </li>
        );
      })}
      {special && (
        <li className="relative pl-7" data-testid="timeline-special">
          <span className={`absolute -left-[11px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border ${order.status === "verifica_manuale" ? "border-[#ffcc66] bg-[#ffcc66] text-[#0b0b0d]" : order.status === "rifiutato" ? "border-[#ff4d4d] bg-[#ff4d4d] text-[#0b0b0d]" : "border-[#8a847d] bg-[#8a847d] text-[#0b0b0d]"}`}>
            {order.status === "verifica_manuale" ? <ShieldAlert className="h-3 w-3" /> : order.status === "rifiutato" ? <XCircle className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
          </span>
          <div className="text-sm font-semibold text-[#f5f2ee]">{meta.label}</div>
          <div className="text-xs text-[#8a847d]">{order.history?.[order.history.length - 1]?.note || ""}</div>
        </li>
      )}
    </ol>
  );
};
