import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { FAQ } from "../config/site";
import { SectionHeader, T } from "./SectionHeader";
import { E } from "../context/ContentContext";

export const FAQSection = () => (
  <section id="faq" data-testid="faq-section" className="py-24 sm:py-32">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
      <SectionHeader k="faq" label="Domande" title={<T k="faq" a="Tutto quello che vuoi" b="sapere." bClass="text-[color:var(--rose)] italic" />} />
      <Accordion type="single" collapsible data-testid="faq-accordion" className="w-full">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={`f${i}`} className="border-b border-[rgba(214,178,94,0.14)]">
            <AccordionTrigger data-testid={`faq-item-${i}`} className="py-6 text-left font-display text-xl text-[#f5f2ee] hover:no-underline sm:text-2xl">
              <E k={`faq.${i}.q`}>{f.q}</E>
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-sm leading-relaxed text-[#b9b2aa] sm:text-base"><E k={`faq.${i}.a`} multiline>{f.a}</E></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
