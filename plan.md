# plan.md

## 1) Objectives
- Realizzare una landing page **KimmberlyyITAVIP** (IT) ispirata allo stile del video: intro cinematica + age gate 18+, dark UI con **nero/oro/rosa cipria**, scroll fluido, reveal animations, card arrotondate e badge.
- Mostrare una **prima bozza** con le **foto fornite** (non esplicite) come hero/gallery.
- Implementare il core business MVP: **richieste personalizzate** (form pubblico) salvate su DB + **pagina admin privata** (password semplice) per leggere/gestire le richieste.
- Nessun pagamento in V1: CTA che aprono richiesta/contatti.
- Preparare “slot” contatti (Telegram/Instagram/WhatsApp) con placeholder chiari; integrazione chat evoluta rimandata a fase successiva.

## 2) Implementation Steps

### Phase 1 — Build Core Feature (no POC needed: CRUD + simple auth)
**User stories (core)**
1. Come fan, voglio confermare 18+ per accedere al sito.
2. Come fan, voglio inviare una richiesta personalizzata con dettagli e budget indicativo.
3. Come fan, voglio ricevere conferma che la richiesta è stata inviata e sapere i prossimi step.
4. Come creator, voglio entrare in una pagina admin protetta da password per vedere le richieste.
5. Come creator, voglio cambiare stato richiesta (nuova/in lavorazione/chiusa) e aggiungere note interne.

**Backend (MVP)**
- Definire schema `Request`: 
  - `nameOrNickname`, `contactPreference`, `contactHandle`, `requestType` (foto/video/chat/altro), `description`, `budgetRange`, `turnaround`, `status`, `internalNotes`, `createdAt`.
- API REST:
  - `POST /api/requests` (crea richiesta)
  - `GET /api/admin/requests` (lista) 
  - `PATCH /api/admin/requests/:id` (update status/notes)
- Protezione admin semplice:
  - Password via env (`ADMIN_PASSWORD`), login endpoint `POST /api/admin/login` che ritorna session token (JWT semplice) oppure cookie signed.
- Validazioni: campi obbligatori, rate limit basilare su `POST /api/requests`, sanitizzazione input.

**Frontend (MVP landing + admin)**
- Intro/age gate:
  - Splash con logo + glow + pulsanti “Audio: off” (UI only) e “Salta intro”.
  - Modal/step 18+ con CTA “Entra”. Persistenza con `localStorage`.
- Landing sections (ordine):
  1. **Hero parallax** con logo KimmberlyyITAVIP, tagline, 2 CTA (“Guarda contenuti”, “Fai una richiesta”).
  2. **Il mio mondo** (dot label + headline uppercase) + breve bio/posizionamento.
  3. **Anteprima contenuti**: cards con blur/lock (placeholder copy “sblocco su richiesta”).
  4. **Bundle & livelli**: 3 tier cards (pill badge “più richiesto”, ecc.). CTA → form richiesta.
  5. **Cataloghi**: griglia filtrabile (pills) con card arrotondate.
  6. **Richiesta personalizzata**: form completo + conferma invio.
  7. **Contatti**: bottoni social con placeholder (da aggiornare domani).
  8. **FAQ** + footer con nav + disclaimer 18+.
- Admin UI:
  - `/admin` login (password)
  - `/admin/requests` tabella/cards richieste + filtri per stato + dettaglio richiesta.

**Design system (coerente con reference)**
- Palette (approx):
  - Background: `#0B0B0F`
  - Gold: `#D4AF37`
  - Powder pink: `#E7B8C8`
  - Text off-white: `#E9E9EE`
  - Card: `#141420` con bordi `rgba(231,184,200,0.15)`
- Tipografia: sans bold per headline uppercase; body leggibile.
- Motion: smooth scroll, fade/slide-in on reveal, sparkle particle overlay leggero (toggleable per performance).

### Phase 2 — V1 App Development (assemble end-to-end)
**User stories (UX V1)**
1. Come utente mobile, voglio un’esperienza fluida (scroll + animazioni) senza lag.
2. Come fan, voglio vedere foto/preview in qualità alta ma ottimizzata.
3. Come fan, voglio capire chiaramente che non sto pagando sul sito e che devo inviare una richiesta.
4. Come fan, voglio scegliere rapidamente un bundle e precompilare il form.
5. Come creator, voglio esportare/consultare richieste ordinate per data.

**Build (in poche “bulk changes”)**
- Implementare layout responsive + component library (buttons, pills, cards, section header con dot).
- Integrare le **foto fornite** in hero/preview (no contenuti espliciti; blur dove necessario).
- Implementare filtri catalogo lato client (mock data) + deep-link con querystring.
- Collegare form → `POST /api/requests` + toast di successo + fallback error states.
- Admin: listing + update status/notes + logout.

**Testing checkpoint (fine Phase 2)**
- E2E manuale: age gate → navigazione → invio richiesta → login admin → vedere richiesta → aggiornare stato.

### Phase 3 — Feature Expansion (post-V1)
**User stories (espansioni)**
1. Come fan, voglio contattarti su Telegram/IG/WhatsApp con un click.
2. Come fan, voglio un’area “messaggi” integrata (chat) per seguire la mia richiesta.
3. Come creator, voglio template di risposta rapida e tag alle richieste.
4. Come creator, voglio notifiche (email/telegram) quando arriva una richiesta.
5. Come creator, voglio gestire contenuti/catologhi da una mini dashboard.

**Roadmap tecnica**
- Aggiornare contatti reali (domani) + tracking click.
- Valutare integrazione chat (websocket o provider) con **POC separato** prima dell’integrazione.
- Preparare payments (Stripe) in fase dedicata con POC webhook/redirect.
- Hardening sicurezza admin (multi-user, 2FA) se richiesto.

## 3) Next Actions
- Conferma copy base (bio + tone of voice) e nomi dei bundle (3-6).
- Domani: inviare link/handle ufficiali Telegram/Instagram/WhatsApp + eventuali regole (orari, prezzi min/max, cosa offri/non offri).
- Confermare password admin e email di riferimento (solo per te, non pubblica) per eventuali notifiche future.
- Allegare eventuali altre foto/asset (logo in PNG/SVG se disponibile).

## 4) Success Criteria
- Landing visivamente coerente con reference (dark cinematic + oro/rosa), **mobile-first**, scroll fluido.
- Age gate 18+ funzionante (persistente) e intro skippabile.
- Form richieste: invio stabile, validazioni, feedback chiaro.
- Admin: login protetto + lista richieste + update stato/notes funzionanti.
- Test end-to-end completato senza errori bloccanti (creazione richiesta → gestione admin).