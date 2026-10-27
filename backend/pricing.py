"""Listino server-authoritative.

Rispecchia frontend/src/config/site.js: il prezzo che il fan paga viene SEMPRE calcolato qui,
mai preso dal browser. Gli override salvati dalla creator (modalita' modifica) hanno la precedenza
tramite le chiavi `offer.<id>.price`, `catalog.<id>.price`, `special.price` e i relativi nomi.
"""
from __future__ import annotations

import re
from typing import Optional

# Offerte acquistabili (prezzo fisso). Gli articoli "da" (prezzo variabile) restano nel flusso richieste.
OFFERS = {
    "kimm-mensile": {"name": "Kimm Mensile", "price": 29.99, "cat": "abbonamento", "period": "/mese",
                      "perks": ["5 foto inedite ogni mese", "Video inediti nel Vault riservato", "1 contenuto custom incluso", "Chat prioritaria 24/7"]},
    "elite-mese": {"name": "Elite del Mese", "price": 199, "cat": "abbonamento", "period": "/mese",
                    "perks": ["Tutto della Kimm Mensile", "Videocall privata 20 min/mese", "4 contenuti custom al mese", "Anteprime esclusive e priorita' assoluta"]},
    "starter": {"name": "Starter", "price": 19.99, "cat": "pacchetto", "period": "one-shot", "perks": ["5 foto esclusive", "1 video breve", "Chat 24h"]},
    "premium": {"name": "Premium", "price": 49.99, "cat": "pacchetto", "period": "one-shot", "perks": ["15 foto HD", "3 video HD", "Chat 7 giorni"]},
    "vip": {"name": "VIP", "price": 129, "cat": "pacchetto", "period": "one-shot",
            "perks": ["30 foto HD", "6 video HD", "Videocall privata 15 min", "3 contenuti custom", "Chat prioritaria 30 giorni"]},
    "foto-singola": {"name": "Foto singola esclusiva", "price": 10, "cat": "extra", "period": "cad.", "perks": ["Scatto inedito, solo per te"]},
    "audio": {"name": "Audio personalizzato", "price": 9.99, "cat": "extra", "period": "cad.", "perks": ["Vocale con il tuo nome"]},
    "videocall-10": {"name": "Videocall 10 min", "price": 39.99, "cat": "extra", "period": "cad.", "perks": ["Privata, su appuntamento"]},
    "chat-30": {"name": "Chat privata 30 min", "price": 24.99, "cat": "chat_tempo", "period": "sessione", "perks": ["Chat privata 1-a-1", "Durata garantita 30 min"]},
    "chat-60": {"name": "Chat privata 60 min", "price": 44.99, "cat": "chat_tempo", "period": "sessione",
                "perks": ["Chat privata 1-a-1", "Durata garantita 60 min", "Foto e vocali inclusi", "WhatsApp, Instagram o Telegram"]},
}

CATALOG = {
    "c1": {"name": "Mirror Collection", "price": 19, "cat": "Foto", "meta": "36 foto"},
    "c2": {"name": "Notte a Milano", "price": 25, "cat": "Video", "meta": "9 min - HD"},
    "c3": {"name": "Ink Lovers Pack", "price": 49, "cat": "Bundle", "meta": "60 foto + 3 video"},
    "c4": {"name": "Denim & Lace", "price": 15, "cat": "Foto", "meta": "28 foto"},
    "c5": {"name": "Dietro lo specchio", "price": 35, "cat": "Video", "meta": "12 min - 4K"},
    "c6": {"name": "Weekend Prive", "price": 79, "cat": "Bundle", "meta": "80 foto + 5 video"},
}

SPECIAL = {"name": "Bundle Speciale", "price": 39.99, "old_price": 69.99, "ends_at": "2026-11-30T23:59:59+01:00",
           "perks": ["20 foto inedite", "2 video esclusivi", "1 audio personalizzato"]}

TIP_MIN, TIP_MAX = 1, 1000
DELIVERY_NOTE = {
    "abbonamento": "Accesso attivato entro 24 ore dalla conferma, consegna in privato sul canale che preferisci.",
    "pacchetto": "Consegna in privato entro 24-48 ore dalla conferma del pagamento.",
    "extra": "Consegna in privato entro 48 ore dalla conferma (videocall su appuntamento).",
    "chat_tempo": "Ti scrivo io per fissare la sessione entro 24 ore dalla conferma.",
    "catalog": "Link privato alla collezione entro 24 ore dalla conferma.",
    "special": "Consegna in privato entro 24-48 ore dalla conferma.",
    "tip": "Grazie di cuore. Nessuna consegna prevista, ma puo' sbloccare un bonus a sorpresa.",
    "request": "Tempi concordati nella richiesta. Ti aggiorno io in privato.",
}


def to_num(v, default: float) -> float:
    if v is None:
        return default
    s = re.sub(r"[^0-9,.\-]", "", str(v)).replace(",", ".")
    try:
        n = float(s)
    except ValueError:
        return default
    return n if n > 0 else default


def resolve_item(kind: str, ref: Optional[str], amount: Optional[float], overrides: dict) -> Optional[dict]:
    """Ritorna lo snapshot dell'articolo (nome, descrizione, prezzo EUR) o None se non acquistabile."""
    g = overrides.get
    if kind == "offer" and ref in OFFERS:
        o = OFFERS[ref]
        return {
            "kind": kind, "ref": ref,
            "name": g(f"offer.{ref}.name") or o["name"],
            "category": o["cat"], "period": g(f"offer.{ref}.period") or o["period"],
            "details": [g(f"offer.{ref}.perk{i}") or p for i, p in enumerate(o["perks"])],
            "price_eur": round(to_num(g(f"offer.{ref}.price"), o["price"]), 2),
            "delivery": DELIVERY_NOTE.get(o["cat"], DELIVERY_NOTE["pacchetto"]),
        }
    if kind == "catalog" and ref in CATALOG:
        c = CATALOG[ref]
        return {
            "kind": kind, "ref": ref,
            "name": g(f"catalog.{ref}.title") or c["name"],
            "category": c["cat"], "period": None,
            "details": [g(f"catalog.{ref}.meta") or c["meta"]],
            "price_eur": round(to_num(g(f"catalog.{ref}.price"), c["price"]), 2),
            "delivery": DELIVERY_NOTE["catalog"],
        }
    if kind == "special":
        return {
            "kind": kind, "ref": "bundle-speciale",
            "name": g("special.name") or SPECIAL["name"],
            "category": "bundle", "period": None,
            "details": [g(f"special.perk{i}") or p for i, p in enumerate(SPECIAL["perks"])],
            "price_eur": round(to_num(g("special.price"), SPECIAL["price"]), 2),
            "old_price_eur": round(to_num(g("special.oldPrice"), SPECIAL["old_price"]), 2),
            "ends_at": g("special.endsAt") or SPECIAL["ends_at"],
            "delivery": DELIVERY_NOTE["special"],
        }
    if kind == "tip":
        if amount is None or amount < TIP_MIN or amount > TIP_MAX:
            return None
        amt = round(float(amount), 2)
        return {
            "kind": kind, "ref": f"tip-{amt:g}",
            "name": f"Tip {amt:g} EUR".replace(".", ","),
            "category": "tip", "period": None,
            "details": ["Una mancia per dire grazie"],
            "price_eur": amt,
            "delivery": DELIVERY_NOTE["tip"],
        }
    return None
