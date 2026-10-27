// Configurazione centrale del sito — modifica qui testi, prezzi, link e foto.
// NOTA: prezzi, offerte e cataloghi sono ESEMPI modificabili (ripresi dal tuo progetto precedente).

export const BRAND = {
  name: "KimmberlyyITAVIP",
  short: "Kimmberlyy",
  tagline: "Il lato che non mostro a nessuno. Solo per pochi.",
};

export const PHOTOS = {
  hero: "https://customer-assets-0z36b82j.emergentagent.net/job_588f2616-bd6e-4bf9-a505-f17b9acdd6d9/artifacts/c015e1711039f903_IMG_1482.jpeg",
  about: "https://customer-assets-0z36b82j.emergentagent.net/job_588f2616-bd6e-4bf9-a505-f17b9acdd6d9/artifacts/9d00e0c5dea96c11_E80AE596-C117-47A8-9A51-A1771FD0608D.jpeg",
};

// Link contatti: DA AGGIORNARE. Finché sono vuoti il sito mostra "in arrivo".
export const CONTACTS = {
  telegram: "",
  instagram: "",
  whatsapp: "",
  telegramChannel: "",
};

// Foto in home: vengono mostrate SOLO le versioni pixelate pre-generate in /public/photos/pix/<set>-{a,b,c}.webp.
// Gli originali NON sono nel sito pubblico (backend/private_media). Per aggiungere una foto: genera i 3 file pixelati e aggiungi una riga.
export const GALLERY = [
  { id: "g1", set: "set1", kind: "Foto", count: "24 scatti", title: "Notte in nero", badge: "Nuova" },
  { id: "g2", set: "set2", kind: "Foto", count: "18 scatti", title: "Shorts & cap" },
  { id: "g3", set: "set3", kind: "Foto", count: "30 scatti", title: "Mirror session", badge: "Top" },
];

export const PREVIEWS = [
  { id: "p1", img: PHOTOS.hero, kind: "Foto", title: "Mirror session", count: "24 scatti", pos: "40% 30%" },
  { id: "p2", img: PHOTOS.about, kind: "Video", title: "Backstage privato", count: "6 min", pos: "45% 35%" },
  { id: "p3", img: PHOTOS.about, kind: "Foto", title: "Inediti di stanotte", count: "18 scatti", pos: "30% 25%" },
  { id: "p4", img: PHOTOS.about, kind: "Video", title: "Solo per VIP", count: "11 min", pos: "55% 60%" },
  { id: "p5", img: PHOTOS.hero, kind: "Foto", title: "Ink & Gold", count: "30 scatti", pos: "35% 55%" },
  { id: "p6", img: PHOTOS.hero, kind: "Video", title: "Mai pubblicato", count: "8 min", pos: "60% 70%" },
];

// ---------- OFFERTE (dal progetto precedente, evolute) ----------
export const OFFER_TABS = [
  { id: "tutto", label: "Tutto" },
  { id: "abbonamento", label: "Abbonamenti" },
  { id: "pacchetto", label: "Pacchetti" },
  { id: "extra", label: "Extra" },
  { id: "chat_tempo", label: "Chat privata" },
  { id: "tip", label: "Tip Jar" },
];

export const OFFER_GROUPS = {
  abbonamento: { title: "Abbonamenti mensili", sub: "Nessun rinnovo automatico: ogni mese decidi tu." },
  pacchetto: { title: "Pacchetti a scelta", sub: "One-shot. Paghi una volta, resta tuo." },
  extra: { title: "Catalogo Extra", sub: "Contenuti singoli senza abbonamento." },
  chat_tempo: { title: "Chat privata a tempo", sub: "1-a-1 su WhatsApp, Instagram o Telegram: scegli tu il canale." },
};

export const OFFERS = [
  { id: "kimm-mensile", cat: "abbonamento", name: "Kimm Mensile", price: 29.99, period: "/mese", badge: "Il più scelto",
    perks: ["5 foto inedite ogni mese", "Video inediti nel Vault riservato", "1 contenuto custom incluso", "Chat prioritaria 24/7"] },
  { id: "elite-mese", cat: "abbonamento", name: "Elite del Mese", price: 199, period: "/mese", badge: "Max 10 posti", featured: true,
    perks: ["Tutto della Kimm Mensile", "Videocall privata 20 min/mese", "4 contenuti custom al mese", "Anteprime esclusive e priorità assoluta"] },

  { id: "starter", cat: "pacchetto", name: "Starter", price: 19.99, period: "one-shot",
    perks: ["5 foto esclusive", "1 video breve", "Chat 24h"] },
  { id: "premium", cat: "pacchetto", name: "Premium", price: 49.99, period: "one-shot", badge: "Best value",
    perks: ["15 foto HD", "3 video HD", "Chat 7 giorni"] },
  { id: "vip", cat: "pacchetto", name: "VIP", price: 129, period: "one-shot", featured: true, badge: "VIP",
    perks: ["30 foto HD", "6 video HD", "Videocall privata 15 min", "3 contenuti custom", "Chat prioritaria 30 giorni"] },

  { id: "foto-singola", cat: "extra", name: "Foto singola esclusiva", price: 10, period: "cad.", perks: ["Scatto inedito, solo per te"] },
  { id: "video-richiesta", cat: "extra", name: "Video su richiesta", price: 14.99, period: "da", perks: ["Durata 1–2 min", "Minuti extra a parte"] },
  { id: "audio", cat: "extra", name: "Audio personalizzato", price: 9.99, period: "cad.", perks: ["Vocale con il tuo nome"] },
  { id: "videocall-10", cat: "extra", name: "Videocall 10 min", price: 39.99, period: "cad.", perks: ["Privata, su appuntamento"] },

  { id: "chat-30", cat: "chat_tempo", name: "Chat privata 30 min", price: 24.99, period: "sessione",
    perks: ["Chat privata 1-a-1", "Durata garantita 30 min"] },
  { id: "chat-60", cat: "chat_tempo", name: "Chat privata 60 min", price: 44.99, period: "sessione", featured: true, badge: "Più intensa",
    perks: ["Chat privata 1-a-1", "Durata garantita 60 min", "Foto e vocali inclusi", "WhatsApp, Instagram o Telegram"] },
];

// Bundle speciale con countdown reale (modifica la data di fine). Se scaduto mostra "Terminata".
export const SPECIAL = {
  id: "bundle-speciale",
  name: "Bundle Speciale",
  price: 39.99,
  oldPrice: 69.99,
  endsAt: "2026-11-30T23:59:59+01:00",
  perks: ["20 foto inedite", "2 video esclusivi", "1 audio personalizzato"],
};

export const TIPS = [5, 10, 25, 50];

export const RULES = [
  { t: "Nessun rinnovo automatico", d: "Ogni mese decidi tu. Ti scrivo io per la conferma." },
  { t: "Sblocco dopo conferma", d: "Appena il pagamento è confermato, il contenuto ti viene inviato." },
  { t: "Contenuti con consenso", d: "Tutte le persone presenti nei contenuti hanno firmato il consenso." },
  { t: "Solo pubblico 18+", d: "Verifica età obbligatoria all'ingresso. Zero eccezioni." },
  { t: "Nessuna rivendita", d: "I contenuti custom restano tuoi: non li rivendo ad altri." },
  { t: "Privacy totale", d: "Nessuna email richiesta. Solo username e codice privato." },
];

export const VAULT = [
  { id: "v1", title: "Video #1", img: PHOTOS.about, pos: "45% 40%", dur: "07:12" },
  { id: "v2", title: "Video #2", img: PHOTOS.hero, pos: "40% 55%", dur: "05:48" },
  { id: "v3", title: "Video #3", img: PHOTOS.hero, pos: "55% 35%", dur: "09:30" },
];

export const CATALOG_FILTERS = ["Tutti", "Foto", "Video", "Bundle", "Novità"];

export const CATALOG = [
  { id: "c1", cat: "Foto", title: "Mirror Collection", meta: "36 foto", price: 19, img: PHOTOS.hero, pos: "40% 35%", isNew: true },
  { id: "c2", cat: "Video", title: "Notte a Milano", meta: "9 min · HD", price: 25, img: PHOTOS.about, pos: "45% 40%" },
  { id: "c3", cat: "Bundle", title: "Ink Lovers Pack", meta: "60 foto + 3 video", price: 49, img: PHOTOS.about, pos: "35% 30%", isNew: true },
  { id: "c4", cat: "Foto", title: "Denim & Lace", meta: "28 foto", price: 15, img: PHOTOS.about, pos: "50% 70%" },
  { id: "c5", cat: "Video", title: "Dietro lo specchio", meta: "12 min · 4K", price: 35, img: PHOTOS.hero, pos: "35% 60%", isNew: true },
  { id: "c6", cat: "Bundle", title: "Weekend Privé", meta: "80 foto + 5 video", price: 79, img: PHOTOS.hero, pos: "60% 50%" },
];

export const BUDGETS = ["€20 – €50", "€50 – €100", "€100 – €250", "€250+"];

export const REQUEST_TYPES = [
  { value: "foto", label: "Foto personalizzate" },
  { value: "video", label: "Video personalizzato" },
  { value: "abbonamento", label: "Abbonamento" },
  { value: "pacchetto", label: "Pacchetto" },
  { value: "bundle", label: "Bundle / Catalogo" },
  { value: "extra", label: "Extra" },
  { value: "chat_tempo", label: "Chat privata a tempo" },
  { value: "chat", label: "Chat" },
  { value: "tip", label: "Tip" },
  { value: "altro", label: "Altro" },
];

export const CHANNELS = [
  { value: "telegram", label: "Telegram" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

// Livelli fan (calcolati sulla spesa reale confermata da te)
export const LEVELS = [
  { name: "Fan", min: 0 },
  { name: "Crew", min: 30 },
  { name: "VIP", min: 130 },
  { name: "Elite", min: 300 },
];

export const FAQ = [
  { q: "Come funziona l'acquisto?", a: "Scegli un'offerta, un contenuto del catalogo o invia una richiesta personalizzata. Ti rispondo io personalmente sul canale che preferisci con tutti i dettagli per sbloccarlo." },
  { q: "A cosa serve il codice privato?", a: "Crei un username e un codice segreto: niente email, niente social. Con il codice vedi i tuoi ordini, i contenuti sbloccati e il tuo livello." },
  { q: "I contenuti sono davvero inediti?", a: "Sì. Foto e video che trovi qui non sono mai stati pubblicati sui miei social: nascono solo per questo spazio." },
  { q: "Posso chiedere un contenuto su misura?", a: "Certo. Usa il modulo \"Richiesta personalizzata\": descrivi cosa desideri e ti ricontatto per confermare tempi e prezzo." },
  { q: "Come funziona la classifica Top Fan?", a: "Si basa sugli acquisti confermati del mese. Il #1 riceve un premio speciale. Nella classifica compare solo il nome visualizzato abbreviato." },
  { q: "Perché devo confermare di avere 18 anni?", a: "Questo spazio è riservato esclusivamente a un pubblico adulto. È una regola che rispetto senza eccezioni." },
];

export const fmtEur = (n) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
