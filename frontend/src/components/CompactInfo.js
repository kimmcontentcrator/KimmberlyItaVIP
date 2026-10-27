import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Send, Instagram, MessageCircle, ShieldCheck, Sparkles, HelpCircle, User } from "lucide-react";
import { RULES, FAQ, CONTACTS, BRAND } from "../config/site";
import { E } from "../context/ContentContext";

const STEPS = [
  { n: "01", t: "Scegli", d: "Un piano, un pacchetto o una foto: prezzo chiaro, nessuna sorpresa." },
  { n: "02", t: "Paghi", d: "In pochi tap. Nessun rinnovo automatico, nessun abbonamento nascosto." },
  { n: "03", t: "Vedi", d: "Appena confermo, sblocco: contenuti in chiaro, solo tuoi." },
];

const Row = ({ icon: I, children }) => (
  <li className="flex items-start gap-3 text-sm text-[#e9e4de]"><I className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold)]" /><span>{children}</span></li>
);

// Preview B: il resto del sito in fondo, compatto, apri solo cio' che ti serve.
export const CompactInfo = () => {
  const chans = [
    { k: "telegram", icon: Send, l: "Telegram", url: CONTACTS.telegram },
    { k: "instagram", icon: Instagram, l: "Instagram", url: CONTACTS.instagram },
    { k: "whatsapp", icon: MessageCircle, l: "WhatsApp", url: CONTACTS.whatsapp },
  ];
  return (
    <section id="info" data-testid="compact-info" className="bg-[#0b0b0d] py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--blush)]/80"><E k="compact.label">In breve</E></span>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-none text-[#f5f2ee] sm:text-4xl"><E k="compact.title">Tutto il resto,</E> <span className="text-gold-sheen italic"><E k="compact.title2">senza giri.</E></span></h2>
        <Accordion type="single" collapsible className="mt-6" data-testid="compact-accordion">
          <AccordionItem value="come" id="come" className="border-[rgba(0,175,240,0.14)]">
            <AccordionTrigger data-testid="compact-trigger-come" className="font-display text-xl italic text-[#f5f2ee] hover:no-underline"><span className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Come funziona</span></AccordionTrigger>
            <AccordionContent>
              <ol className="grid gap-3 sm:grid-cols-3">
                {STEPS.map((s) => (
                  <li key={s.n} className="rounded-2xl border border-[rgba(242,215,208,0.12)] bg-[#141418] p-4">
                    <span className="text-[10px] tracking-[0.3em] text-[color:var(--gold)]">{s.n}</span>
                    <span className="mt-1 block font-display text-lg italic text-[#f5f2ee]">{s.t}</span>
                    <span className="mt-1 block text-xs text-[#b9b2aa]">{s.d}</span>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="chi" id="mondo" className="border-[rgba(0,175,240,0.14)]">
            <AccordionTrigger data-testid="compact-trigger-chi" className="font-display text-xl italic text-[#f5f2ee] hover:no-underline"><span className="flex items-center gap-3"><User className="h-4 w-4 text-[color:var(--gold)]" /> Chi sono</span></AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-relaxed text-[#e9e4de]"><E k="about.short" multiline>Sono {BRAND.short}. Qui trovi quello che non pubblico da nessun'altra parte: foto e video inediti, tatuaggi e zero filtri. Tutto quello che compri resta tuo, e se vuoi qualcosa solo per te, me lo chiedi.</E></p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="regole" id="regole" className="border-[rgba(0,175,240,0.14)]">
            <AccordionTrigger data-testid="compact-trigger-regole" className="font-display text-xl italic text-[#f5f2ee] hover:no-underline"><span className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[color:var(--gold)]" /> Regole</span></AccordionTrigger>
            <AccordionContent>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {RULES.map((r, i) => <Row key={r.t} icon={ShieldCheck}><strong className="font-semibold text-[#f5f2ee]"><E k={`rules.${i}.t`}>{r.t}</E></strong> — <E k={`rules.${i}.d`}>{r.d}</E></Row>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq" id="faq" className="border-[rgba(0,175,240,0.14)]">
            <AccordionTrigger data-testid="compact-trigger-faq" className="font-display text-xl italic text-[#f5f2ee] hover:no-underline"><span className="flex items-center gap-3"><HelpCircle className="h-4 w-4 text-[color:var(--gold)]" /> Domande</span></AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {FAQ.map((f, i) => (
                  <li key={f.q} className="rounded-2xl border border-[rgba(242,215,208,0.12)] bg-[#141418] p-4">
                    <span className="block font-semibold text-[#f5f2ee]"><E k={`faq.${i}.q`}>{f.q}</E></span>
                    <span className="mt-1 block text-sm text-[#b9b2aa]"><E k={`faq.${i}.a`} multiline>{f.a}</E></span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="contatti" id="contatti" className="border-[rgba(0,175,240,0.14)]">
            <AccordionTrigger data-testid="compact-trigger-contatti" className="font-display text-xl italic text-[#f5f2ee] hover:no-underline"><span className="flex items-center gap-3"><Send className="h-4 w-4 text-[color:var(--gold)]" /> Contatti</span></AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {chans.map((c) => c.url ? (
                  <a key={c.k} href={c.url} target="_blank" rel="noopener noreferrer" data-testid={`compact-contact-${c.k}`} className="btn-ghost-lux flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm"><c.icon className="h-4 w-4" /> {c.l}</a>
                ) : (
                  <span key={c.k} data-testid={`compact-contact-${c.k}`} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(242,215,208,0.12)] px-4 text-sm text-[#8a847d]"><c.icon className="h-4 w-4" /> {c.l} <span className="rounded-full border border-[rgba(231,184,200,0.3)] px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[color:var(--rose)]">in arrivo</span></span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};
