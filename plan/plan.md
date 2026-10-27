# KimmberlyyITAVIP – Cassa e strategia pagamenti

Una pagina "Cassa" integrata nel sito per comprare offerte, bundle e richieste personalizzate: codice ordine, pagamento in TON/USDT con un tap dal wallet o bonifico, conferma automatica letta dalla blockchain e sblocco dell'acquisto nell'account del fan.
Tutto reale fin dalla Fase 1 (nessun pagamento finto), senza circuiti carte che per contenuti 18+ bloccano gli account, e predisposta per carte, regali Amazon e Telegram nelle fasi successive.

## Per chi è
- **I fan**: comprare in pochi passaggi, sapere esattamente cosa ricevono, pagare con il wallet o la banca che già usano e vedere lo stato dell'ordine senza scrivere in privato.
- **La creator (admin)**: incassare direttamente sul proprio wallet o conto senza intermediari che possano bloccare o congelare i fondi, confermare gli ordini da un unico pannello e cambiare indirizzi, IBAN, testi e prezzi senza toccare il codice.

## Parliamone: le strategie di pagamento, senza illusioni

### La strada da NON prendere (lo "scamotage" classico)
Stripe, PayPal, Satispay, SumUp, Revolut Business, Coinbase Commerce e anche Wallet Pay di Telegram vietano o escludono contenuti digitali per adulti. Aprire l'account come "coaching" o "foto artistiche" funziona qualche settimana, poi: account chiuso senza preavviso, fondi congelati fino a 180 giorni, lista nera MATCH dei circuiti (5 anni senza poter aprire altri account carte), chargeback persi. Il piano esclude questa strada.

### Le strade legittime, dalla migliore in giù
**Approvato dalla creator: l'opzione 1 è il metodo PRINCIPALE della cassa.** Il pulsante "Paga con wallet" è l'azione dorata in evidenza; bonifico e indirizzo/QR restano come alternative sotto.

1. **Wallet reale della creator + TON Connect (metodo principale approvato, Fase 1)**. Il fan preme "Paga con wallet": si apre Telegram Wallet, Tonkeeper o Trust Wallet con importo e codice ordine già compilati; conferma con un tap. Il sito legge la blockchain pubblica e conferma l'ordine da solo in 1-2 minuti. Monete: **TON**, **USDT su rete TON**, **USDT su rete Tron (TRC20)**. Nessun intermediario, nessuna commissione (solo pochi centesimi di rete), nessun chargeback, nessuno che possa chiudere nulla: i soldi arrivano direttamente nel wallet della creator. Chi non ha un wallet collegabile vede comunque indirizzo + QR + codice e paga da qualsiasi app o exchange.
2. **Bonifico SEPA istantaneo (Fase 1)**. IBAN e codice ordine in causale, zero commissioni, irrevocabile. Conferma manuale dal pannello (un clic). Mostra ai fan il nome dell'intestatario.
3. **Carte di credito tramite processori specializzati 18+ (Fase 2)**: Segpay (approvazione 24-72 ore, licenza UE), Verotel (Olanda, 13-15,5% + riserva 10%), CCBill (lo storico, 11-14,5%). Costano 500-1.950 €/anno di registrazione, richiedono Partita IVA/società, termini, privacy e barriera 18+ pubblicati. Conversione più alta per i fan abituati alla carta.
4. **Regali Amazon (Fase 2)**: buono regalo Amazon.it inviato dal fan con il codice ordine, verificato dalla creator riscattandolo, più lista desideri pubblica per i regali dei Top Fan. Semplice e diffuso, ma vale come "regalo": tempi manuali e nessuna garanzia di rimborso in caso di codici non validi.
5. **Telegram Stars tramite bot (Fase 3)**: comodo per chi vive dentro Telegram, ma Telegram trattiene circa il 30% sugli acquisti da telefono, blocca i soldi 21 giorni e per contenuti 18+ dipende dalle regole di Apple/Google. Va usato come canale secondario, con bot e descrizioni pubbliche "safe".
6. **Leve di conversione in cassa**: sconto per i metodi senza commissioni (wallet, bonifico), prezzo barrato bundle vs singoli, codice ordine e stato sempre visibili, prenotazione del prezzo 48 ore con conto alla rovescia.

## Funzionalità principali ed esperienza (Fase 1)

### Cassa (per i fan)
- Ogni pulsante "Acquista / Sblocca / Paga ora" porta alla Cassa con il riepilogo dell'articolo: nome, cosa contiene, prezzo in euro, cosa riceve il fan e tempi di consegna. Per le monete viene mostrato anche l'equivalente in TON o USDT al cambio del momento.
- Per pagare serve essere registrati come fan (accesso già esistente): chi non lo è si registra al volo senza perdere l'articolo scelto.
- Spunta obbligatoria "Ho 18 anni e accetto termini e politica rimborsi" prima di generare l'ordine.
- Scelta del metodo con badge chiari ("Conferma automatica", "Senza commissioni"):
  - **Paga con wallet (TON / USDT-TON)**: pulsante TON Connect che apre Telegram Wallet, Tonkeeper, Trust Wallet o MyTonWallet con importo e codice ordine precompilati nel commento. In alternativa indirizzo + QR + codice da copiare.
  - **USDT su Tron (TRC20)**: indirizzo + QR + importo "unico" (centesimi dedicati all'ordine) che permette il riconoscimento automatico anche senza commento.
  - **Bonifico / SEPA istantaneo**: IBAN, intestatario, importo, codice ordine in causale, pulsanti "Copia".
- Dopo il pagamento in crypto il sito controlla la blockchain da solo e aggiorna lo stato in tempo reale ("Pagamento visto, in conferma…" → "Confermato"). Il fan può comunque premere "Ho pagato" e inserire il TXID se vuole accelerare un caso dubbio. Per il bonifico inserisce il riferimento (CRO/TRN).
- Pagina ordine sempre raggiungibile dall'account, con stato: *In attesa di pagamento → Pagamento visto → Confermato → Consegnato*, oppure *In verifica manuale*, *Rifiutato*, *Scaduto*. Il prezzo resta prenotato 48 ore con conto alla rovescia.
- Alla conferma compare l'area "Consegna" con il messaggio o link privato scritto dalla creator.
- Sezione "I miei ordini" nell'account del fan.

### Pannello Ordini (per la creator)
- Elenco ordini con filtri per stato, contatore dei nuovi, dettaglio con metodo, moneta, importo ricevuto, TXID/riferimento e articolo.
- Azioni in un clic: **Conferma** (per bonifico o casi manuali), **Rifiuta** con motivo visibile al fan, **Segna consegnato**, messaggio/link di consegna.
- Pagamenti crypto parziali o con importo sbagliato finiscono "In verifica manuale" con la differenza evidenziata, mai confermati da soli.
- Le richieste personalizzate accettate con un prezzo generano il pulsante "Paga ora" nell'account del fan e seguono la stessa cassa.

### Impostazioni pagamenti (dal pannello, senza codice)
- **Configura wallet** guidato: incolla l'indirizzo TON (vale per TON e USDT-TON) e l'indirizzo Tron; ogni metodo si accende solo quando il suo indirizzo è salvato. Guida in 5 passi per creare un wallet personale (Telegram Wallet → TON Space, oppure Tonkeeper) e avviso chiaro: gli indirizzi di deposito degli exchange (Binance, Bybit, Crypto.com) richiedono un memo loro e quindi passano a conferma manuale.
- IBAN, intestatario, banca, istruzioni bonifico.
- Attiva/disattiva ogni metodo, sconto percentuale per metodo (predefinito 0%), ore di validità dell'ordine (predefinito 48).
- Testi editabili: politica rimborsi, messaggio di ringraziamento, avvisi in cassa. Stesse font e dimensioni del sito: cambia solo il testo.

## Flusso utente
1. Il fan vede un'offerta o un bundle e preme "Acquista" (o "Paga ora" su una richiesta personalizzata accettata).
2. In Cassa trova il riepilogo, il prezzo in euro e in crypto, la spunta 18+/termini. Se non è registrato, si registra in 20 secondi e torna allo stesso punto.
3. Sceglie "Paga con wallet": si apre il suo wallet con tutto compilato, conferma con un tap e torna al sito. Oppure copia indirizzo e codice, o i dati del bonifico.
4. La pagina ordine mostra "Pagamento visto, in conferma…" appena la transazione compare, poi "Confermato" automaticamente. Con il bonifico lo stato resta "In verifica" finché la creator non conferma.
5. La creator vede l'ordine nel pannello già confermato (crypto) o da confermare (bonifico), scrive il messaggio/link di consegna.
6. Il fan vede "Confermato" e l'area Consegna; a contenuti ricevuti l'ordine diventa "Consegnato".

## Aspetto e sensazioni
- Stessa identità del sito: nero profondo, oro champagne per pulsanti e stati positivi, rosa cipria per accenti e badge; tipografia editoriale già in uso.
- Cassa "in quiete": una colonna su mobile, riepilogo a lato su desktop, passi numerati, pochi elementi per schermata.
- Pulsante "Paga con wallet" come azione principale dorata; codice ordine in grande con font monospaziato; QR dorato su fondo scuro; pulsanti "Copia" con feedback immediato.
- Stati dell'ordine come timeline verticale con pallini dorati che si accendono in tempo reale; animazioni brevi e fluide.
- Messaggi sempre in italiano semplice ("Transazione vista sulla rete: la conferma arriva di solito entro 2 minuti").

## Fasi di realizzazione

### Fase 1 – Cassa reale da subito (si costruisce ora)
- Cassa con riepilogo, registrazione al volo, spunta 18+/termini, prezzo in euro e in crypto.
- Paga con wallet via TON Connect (TON e USDT su TON) con conferma automatica dalla blockchain; USDT TRC20 con importo unico e conferma automatica; indirizzo + QR per chi paga da altre app o exchange.
- Bonifico SEPA con codice ordine e conferma manuale.
- Pagina ordine con stati in tempo reale, conto alla rovescia 48 ore, area Consegna, "I miei ordini".
- Pannello Ordini con conferma/rifiuto/consegna e gestione dei pagamenti parziali.
- Configurazione guidata wallet e IBAN dal pannello; i metodi crypto si attivano appena la creator incolla i suoi indirizzi.
- Collegamento alla cassa da offerte, bundle, Top Fan e richieste personalizzate accettate.

### Fase 2 – Carte, regali e avvisi
- Carte via processore specializzato scelto dopo i preventivi (Segpay consigliato per velocità, Verotel per trasparenza UE, CCBill per storico): pagina di pagamento ospitata e conferma automatica.
- Regali Amazon: metodo "Buono regalo Amazon.it" con invio codice + verifica manuale, e lista desideri pubblica collegata ai Top Fan.
- Avvisi alla creator per ogni nuovo ordine e al fan per ogni conferma (email o Telegram, quando verranno forniti i canali).
- Pagine pubbliche Termini, Privacy e Rimborsi complete, richieste dai processori carte.
- Opzionale: gateway crypto NOWPayments per accettare 350+ monete oltre a TON/USDT.

### Fase 3 – Vetrina, Telegram e consegna evoluta
- Pagine di anteprima per /foto, /video e /bundle: prima di comprare il fan vede cosa contiene il pacchetto (anteprime sfocate, numero di file, durata), poi passa in cassa.
- Bot Telegram con Telegram Stars: pulsante "Paga con Telegram" anche nel sito che apre il bot con l'ordine già pronto; se il fan arriva dal link Telegram o apre il sito dentro Telegram viene portato direttamente al pagamento in Telegram. Il bot conferma l'ordine sul sito e consegna lì.
- Consegna dei contenuti direttamente nel sito con accesso protetto per ordine, invece del link manuale.
- Portafoglio crediti ricaricabile e abbonamento Top Fan ricorrente.

## Assunzioni (scelte fatte senza chiedere)
- I contenuti sono per adulti (18+): tutta l'analisi sui circuiti parte da qui. Se fossero "soft" e non classificabili come adult, Stripe tornerebbe praticabile e il piano cambierebbe.
- Nessun uso di circuiti che vietano l'adult con categorie mascherate (Stripe, PayPal, Satispay, SumUp, Revolut Business, Coinbase Commerce, Wallet Pay).
- Nessun pagamento simulato: la verifica crypto legge davvero le reti TON e Tron tramite servizi pubblici gratuiti; chiavi gratuite opzionali solo per alzare i limiti di richieste. Nessun account a pagamento richiesto.
- Gli indirizzi wallet li inserisce la creator dal pannello quando ha creato il wallet; fino ad allora i metodi crypto restano pronti ma spenti e il bonifico funziona comunque. Il wallet consigliato è personale (Telegram Wallet TON Space o Tonkeeper); un indirizzo di exchange è accettato ma passa a conferma manuale.
- Valuta di listino: euro. L'equivalente in TON/USDT viene calcolato al momento dell'ordine e vale per le 48 ore di prenotazione; piccoli scostamenti (fino all'1%) vengono accettati come pagamento completo.
- Un pagamento crypto viene confermato solo quando è definitivo sulla rete; importi inferiori finiscono in verifica manuale e non sbloccano nulla da soli.
- Con il bonifico i fan vedono l'IBAN e il nome dell'intestatario. Se serve anonimato: conto intestato a ditta/società oppure solo crypto.
- Per pagare serve un account fan (già esistente); niente acquisti ospite.
- La consegna in Fase 1 avviene con messaggio/link privato scritto dalla creator nella pagina ordine; non c'è ancora archiviazione protetta dei file nel sito.
- Nessuna notifica email o Telegram in Fase 1: i nuovi ordini si vedono nel pannello con un contatore.
- Ordini non pagati scadono dopo 48 ore; valore modificabile dal pannello. Sconto per metodo spento di default (0%).
- Politica rimborsi predefinita: contenuto digitale, nessun rimborso dopo la consegna; testo modificabile.
- Regali Amazon e Telegram Stars valgono come canali secondari con limiti dichiarati (verifica manuale per i buoni; ~30% di commissioni, 21 giorni di attesa e regole Apple/Google per le Stars).
- Aspetti fiscali e legali (Partita IVA, fatturazione, dichiarazione delle crypto, identità legale per i processori carte) restano a carico della creator; il sito mostra barriera 18+, termini e politica rimborsi.
- Il prezzo di una richiesta personalizzata lo fissa la creator all'accettazione; solo allora il fan vede "Paga ora".
