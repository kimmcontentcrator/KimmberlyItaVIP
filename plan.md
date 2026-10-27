# plan.md

## 1) Objectives
- **(COMPLETED)** Realizzare una landing page **KimmberlyyITAVIP** (IT) con intro/age gate 18+, identità premium, layout editoriale, scroll fluido e animazioni.
- **(COMPLETED)** Implementare MVP richieste personalizzate salvate su DB + area admin protetta.
- **(COMPLETED)** Dare alla creator un modo **senza codice** per cambiare testi/prezzi/link mantenendo tipografia e dimensioni (modalità modifica + pagina contenuti).
- **(IN PROGRESS — in attesa allegati)** Rendere la **Home molto più diretta** (meno testo, meno “perdi tempo”) con:
  - **foto censurate subito visibili** (griglia/strip),
  - **palette aggiornata**: azzurro stile OnlyFans `#00AFF0` come colore primario al posto dell’oro + **scritte/badge rosa cipria** (come già generato),
  - due **preview alternative** da far scegliere alla creator (A e B sotto).
- **(PARTIAL: backend COMPLETED, frontend NEXT)** Aggiungere una **Cassa reale** (pagamenti veri da subito) per offerte/bundle/richieste accettate, con:
  - TON Connect (TON + USDT su rete TON) e conferma automatica via blockchain
  - USDT TRC20 con riconoscimento automatico tramite importi univoci
  - Bonifico SEPA istantaneo con conferma manuale
  - Ordini e consegna gestiti dall’account fan e dal pannello creator
- **(NEXT)** Predisporre evoluzione pagamenti (carte 18+, Amazon gift, Telegram Stars), avvisi e pagine legali.

---

## 2) Implementation Steps

### Phase 1 — Core Landing + Richieste (COMPLETED)
**User stories**
1. Fan: conferma 18+ per accedere.
2. Fan: invia richiesta personalizzata.
3. Fan: riceve conferma invio.
4. Creator: login admin per vedere richieste.
5. Creator: cambia stato e note.

**Delivered**
- Backend FastAPI + MongoDB: auth fan/admin, CRUD richieste, presenza online, TopFan.
- Frontend: landing premium completa (hero, offerte, cataloghi, vault, top fan, regole, FAQ, contatti), account sheet fan.
- Admin: `/admin`, `/admin/requests`.


### Phase 2 — UX V1 + Performance (COMPLETED)
- Motion/reveal, smooth scroll (Lenis), card premium, UI mobile-first.
- CTA e prefill da offerte/cataloghi verso il flusso richieste.


### Phase 3 — Editing senza codice (COMPLETED)
**Goal**: modifiche manuali preservando design.
- Backend: `GET /api/content`, `PUT /api/admin/content`, `GET /api/admin/content`.
- Frontend: `ContentContext`, `EditMode`, pagina `/admin/contenuti`, modalità modifica `/?modifica=1`.

---

### Phase 4 — Home veloce + palette azzurra (IN PROGRESS — WAITING FOR ASSETS)
> Priorità attuale prima del frontend della cassa: rendere la home **rapidissima**, “diretta, esplicita e reale” su colori/layout.

#### 4.1 Decisioni/vincoli (26/10 sera)
- **Colore primario**: azzurro stile OnlyFans `#00AFF0` al posto dell’oro.
- **Rosa cipria**: mantenere scritte/badge/accenti rosa come già impostato.
- **Copy**: ridurre testo in home, ridurre sezioni lunghe, aumentare “visual-first”.
- **Censura foto**: la creator allegherà un’immagine di riferimento. **Non programmare la griglia/censura definitiva finché non arriva l’allegato.**
- **Foto griglia**: NON riusare le 2 foto esistenti; attendere le nuove foto.

#### 4.2 Output richiesto: due preview alternative
- **Preview A — “Solo foto e piani”**
  1) Hero/intro minimal
  2) Griglia/strip di **foto censurate** (first fold)
  3) Sezione **Piani/Pacchetti** (CTA “Acquista/Sblocca”)
  4) Footer minimale
  5) Tutto il resto spostato in pagine separate (FAQ, Regole, Contatti, ecc.)

- **Preview B — “Foto → piani → resto compatto”**
  1) Hero/intro minimal
  2) Griglia/strip **foto censurate**
  3) **Piani e pacchetti**
  4) Resto **molto compatto** (accordion/snippets) in coda

> Nota: finché non arrivano gli allegati, si prepara solo lo scheletro (layout e navigazione), senza asset definitivi e senza introdurre effetti censura finali.

#### 4.3 Navigazione/IA
- Nuove pagine dedicate per “il resto” (da agganciare a navbar/bottom nav):
  - `/faq` (Domande)
  - `/regole` (Regole/consenso/privacy)
  - `/contatti`
  - (opzionale) `/come-funziona`
- Home diventa “conversion-first”: **foto + piani + CTA**.

#### 4.4 Design system (update)
- Sostituire progressivamente:
  - bottoni primari, bordi focus/active, stati positivi: oro → **azzurro #00AFF0**
  - badge/tags: rosa cipria (coerente)
  - sfondo: nero profondo invariato
- Micro-interazioni più “secche” e meno narrative: meno reveal lunghi, più feedback immediato.

#### 4.5 Checkpoint (fine Phase 4)
- Due route di preview (o toggles) per A e B; la creator sceglie quella definitiva.
- Home più corta e più rapida (foto first), con CTA chiare.
- Nessun riutilizzo delle foto vecchie.

---

### Phase 5 — Cassa reale (Fase 1 pagamenti) (BACKEND COMPLETED, FRONTEND NEXT)
> Obiettivo: pagamenti veri da subito (no carte), conferma automatica crypto, bonifico manuale, ordini visibili sia al fan che alla creator.

#### 5.1 Stato attuale
- **Backend cassa: COMPLETATO e verificato** con `tests/smoke_cassa.py` (tutti PASS):
  - settings pagamenti (wallet/iban, toggle, sconti)
  - preventivo/quote
  - creazione ordine server-authoritative + prezzo bloccato
  - cambio metodo
  - TON Connect payload TON + USDT (jetton)
  - “Ho pagato” (sepa/crypto) → verifica manuale
  - admin: conferma/rifiuta/consegnato + messaggio consegna
  - richieste con **accepted_price** → “Paga ora”
  - topfans aggiornato includendo ordini
  - scan reti + verify indirizzi
- **Pulizia dati test**: eseguita (ordini/richieste/fans test rimossi).

#### 5.2 User stories (fan)
1. Da Offerte/Bundle/Catalogo/Richiesta accettata → arrivo in **/cassa** con riepilogo articolo e prezzo.
2. Se non registrato → registro/login “al volo” e torno in cassa senza perdere l’articolo.
3. Spunta obbligatoria: **18+ + termini + politica rimborsi** prima di generare ordine.
4. Scelgo metodo:
   - **TON Connect** (TON / USDT-TON) “Paga con wallet” (primario)
   - **USDT TRC20** (indirizzo+QR+importo univoco)
   - **Bonifico SEPA istantaneo**
5. Dopo pagamento crypto: stato ordine si aggiorna in real-time (*visto → conferma → confermato*).
6. Ordine scade dopo X ore (default 48) con countdown.
7. Vedo l’area **Consegna** quando confermato, con messaggio/link inserito dalla creator.
8. Sezione **I miei acquisti** nell’account fan.

#### 5.3 User stories (creator/admin)
1. Pannello ordini: lista, filtri, dettagli, contatori nuovi.
2. Azioni 1-click: **Conferma** (bonifico/manuale), **Rifiuta** (motivo visibile), **Segna consegnato**, inserisci messaggio/link di consegna.
3. Parziali/importo errato → stato **In verifica manuale** (mai auto-sblocco).
4. Richieste personalizzate: quando accettate con prezzo → fan vede **Paga ora** e segue la stessa cassa.

#### 5.4 Frontend pages/components (DA FARE dopo Phase 4)
- `/cassa`
- `/ordine/:code`
- Account fan: “I miei ordini/acquisti”
- CTA: offerte/catalogo/topfan/richieste accettate → cassa
- TON Connect:
  - `TonConnectUIProvider` + manifest servito da backend (`/api/tonconnect-manifest.json`)

#### 5.5 Admin UI (DA FARE)
- `/admin/ordini` (pannello ordini)
- `/admin/pagamenti` (impostazioni pagamenti)

#### 5.6 Testing checkpoint (fine Phase 5)
- E2E fan: login → /cassa → crea ordine → QR/TON Connect → watcher conferma → /ordine/:code consegna.
- E2E admin: /admin/ordini → conferma manuale bonifico → messaggio consegna → fan vede consegna.
- Regressioni: richieste personalizzate e modalità modifica non devono rompersi.

---

### Phase 6 — Pagamenti Fase 2 (NOT STARTED)
- Carte con processori specializzati 18+ (Segpay/Verotel/CCBill) + pagine pubbliche Termini/Privacy/Rimborsi.
- Metodo “Buono regalo Amazon.it” (verifica manuale).
- Avvisi creator/fan (email o Telegram) quando verranno forniti i canali.
- Opzionale: NOWPayments (multi-coin) come metodo crypto aggiuntivo.


### Phase 7 — Evoluzioni Fase 3 (NOT STARTED)
- Vetrina anteprime dedicate (/foto, /video, /bundle) con preview sfocate e metadati.
- Bot Telegram + Telegram Stars (canale secondario) con ordine precompilato.
- Consegna protetta nel sito per ordine (storage/entitlement).
- Portafoglio crediti ricaricabile + Top Fan ricorrente.

---

## 3) Next Actions
1. **Attendere gli allegati** (foto nuove + immagine stile censura). Appena arrivano: implementazione immediata Phase 4.
2. Implementare **Preview A e Preview B** (home veloce) + palette azzurra.
3. Dopo scelta definitiva della home: procedere con **frontend cassa** (Phase 5.4-5.5).


## 4) Success Criteria
- (COMPLETED) Landing premium IT, age gate, richieste e admin funzionanti.
- (COMPLETED) Modalità modifica testi/prezzi/link senza toccare codice.
- (PHASE 4) Home “conversion-first”:
  - foto censurate immediatamente visibili,
  - palette azzurra `#00AFF0` + rosa cipria,
  - meno testo/meno scroll, due preview tra cui scegliere.
- (PHASE 5) Cassa reale:
  - Ordine generato solo da server, prezzo bloccato per 48h.
  - TON/USDT-TON confermati automaticamente (TonAPI) e visibili in /ordine.
  - USDT TRC20 confermato automaticamente tramite importo univoco (TronGrid).
  - Bonifico gestibile con conferma manuale.
  - Fan vede “I miei acquisti” e la consegna; admin gestisce ordini e impostazioni senza codice.
