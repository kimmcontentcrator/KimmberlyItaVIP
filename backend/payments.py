"""Pagamenti crypto senza intermediari: cambi, scansione blockchain, matching e payload TON Connect.

Nessuna chiave privata: il server legge solo dati pubblici (TonAPI, TronGrid) e costruisce i messaggi
che il wallet del fan firma. Chiavi API opzionali (TONAPI_KEY, TRONGRID_API_KEY) alzano solo i limiti.
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import logging
import os
import re
import secrets
import time
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_DOWN
from typing import Optional
from urllib.parse import quote

import httpx
from pytoniq_core import Address, begin_cell

log = logging.getLogger("payments")

TONAPI = "https://tonapi.io/v2"
TRONGRID = "https://api.trongrid.io"
COINGECKO = "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,tether&vs_currencies=eur"

USDT_TON_MASTER = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"  # Tether USD su TON (6 decimali)
USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # Tether USD su Tron (6 decimali)

METHODS = {
    "ton": {"label": "TON", "currency": "TON", "network": "ton", "decimals": 9, "auto": True, "needs": "ton_address"},
    "usdt_ton": {"label": "USDT (rete TON)", "currency": "USDT", "network": "ton", "decimals": 6, "auto": True, "needs": "ton_address"},
    "usdt_trc20": {"label": "USDT (rete Tron TRC20)", "currency": "USDT", "network": "tron", "decimals": 6, "auto": True, "needs": "tron_address"},
    "sepa": {"label": "Bonifico SEPA istantaneo", "currency": "EUR", "network": "bank", "decimals": 2, "auto": False, "needs": "iban"},
}
CRYPTO_METHODS = ("ton", "usdt_ton", "usdt_trc20")

# Passo con cui rendiamo univoco l'importo (sottraendo pochi centesimi): TON 0.001, USDT 0.01
UNIQUE_STEP = {"TON": Decimal("0.001"), "USDT": Decimal("0.01")}
SHOW_DECIMALS = {"TON": 3, "USDT": 2}
TOLERANCE = Decimal("0.99")  # importi >= 99% del dovuto valgono come completi

CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CODE_RE = re.compile(r"KV-([A-Z0-9]{6})")


def gen_code() -> str:
    return "KV-" + "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))


def extract_code(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    m = CODE_RE.search(text.upper())
    return f"KV-{m.group(1)}" if m else None


# ---------------- Indirizzi ----------------
def ton_raw(addr: Optional[str]) -> Optional[str]:
    if not addr:
        return None
    try:
        return Address(addr.strip()).to_str(is_user_friendly=False).lower()
    except Exception:
        return None


def ton_friendly(addr: str, bounceable: bool = False) -> str:
    return Address(addr.strip()).to_str(is_user_friendly=True, is_bounceable=bounceable, is_url_safe=True)


_B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def valid_tron_address(addr: Optional[str]) -> bool:
    if not addr or not re.fullmatch(r"T[1-9A-HJ-NP-Za-km-z]{33}", addr.strip()):
        return False
    n = 0
    for ch in addr.strip():
        n = n * 58 + _B58.index(ch)
    raw = n.to_bytes(25, "big")
    if raw[0] != 0x41:
        return False
    chk = hashlib.sha256(hashlib.sha256(raw[:21]).digest()).digest()[:4]
    return chk == raw[21:]


def valid_iban(iban: Optional[str]) -> bool:
    if not iban:
        return False
    s = re.sub(r"\s+", "", iban).upper()
    if not re.fullmatch(r"[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}", s):
        return False
    moved = s[4:] + s[:4]
    num = "".join(str(int(c, 36)) for c in moved)
    return int(num) % 97 == 1


# ---------------- Cambi EUR -> crypto ----------------
_rates_cache: dict = {"at": 0, "rates": None}


def _headers_ton() -> dict:
    k = os.environ.get("TONAPI_KEY")
    return {"Authorization": f"Bearer {k}"} if k else {}


def _headers_tron() -> dict:
    k = os.environ.get("TRONGRID_API_KEY")
    return {"TRON-PRO-API-KEY": k} if k else {}


async def fetch_rates(force: bool = False) -> Optional[dict]:
    """Ritorna {"TON": eur per 1 TON, "USDT": eur per 1 USDT, "source", "at"} con cache 60s."""
    now = time.time()
    if not force and _rates_cache["rates"] and now - _rates_cache["at"] < 60:
        return _rates_cache["rates"]
    rates = None
    async with httpx.AsyncClient(timeout=12) as c:
        try:
            r = await c.get(f"{TONAPI}/rates", params={"tokens": f"ton,{USDT_TON_MASTER}", "currencies": "eur"}, headers=_headers_ton())
            if r.status_code == 200:
                d = r.json()["rates"]
                ton = float(d["TON"]["prices"]["EUR"])
                usdt = float(d[USDT_TON_MASTER]["prices"]["EUR"])
                if ton > 0 and usdt > 0:
                    rates = {"TON": ton, "USDT": usdt, "source": "tonapi"}
        except Exception as e:  # noqa: BLE001
            log.warning("tonapi rates: %s", e)
        if not rates:
            try:
                r = await c.get(COINGECKO)
                if r.status_code == 200:
                    d = r.json()
                    rates = {"TON": float(d["the-open-network"]["eur"]), "USDT": float(d["tether"]["eur"]), "source": "coingecko"}
            except Exception as e:  # noqa: BLE001
                log.warning("coingecko rates: %s", e)
    if rates:
        rates["at"] = int(now)
        _rates_cache.update({"at": now, "rates": rates})
        return rates
    # fallback: ultimo cambio noto (anche se vecchio), segnalato come stale
    if _rates_cache["rates"]:
        return {**_rates_cache["rates"], "stale": True}
    return None


def eur_to_crypto(eur: float, currency: str, rate_eur: float) -> Decimal:
    """Importo base (non ancora univoco) con i decimali mostrati al fan."""
    q = Decimal(1).scaleb(-SHOW_DECIMALS[currency])
    return (Decimal(str(eur)) / Decimal(str(rate_eur))).quantize(q, rounding=ROUND_DOWN)


def to_units(amount: Decimal, decimals: int) -> int:
    return int((amount * (Decimal(10) ** decimals)).to_integral_value())


def from_units(units: int, decimals: int) -> Decimal:
    return Decimal(units) / (Decimal(10) ** decimals)


def unique_amount(base: Decimal, currency: str, taken: set[int], decimals: int) -> Decimal:
    """Sottrae pochi centesimi finche' l'importo non e' univoco tra gli ordini aperti (max 80 tentativi)."""
    step = UNIQUE_STEP[currency]
    for k in range(0, 80):
        cand = base - step * k
        if cand <= 0:
            break
        if to_units(cand, decimals) not in taken:
            return cand
    # improbabile: aggiunge invece di sottrarre
    for k in range(1, 200):
        cand = base + step * k
        if to_units(cand, decimals) not in taken:
            return cand
    return base


# ---------------- Payload TON Connect ----------------
def comment_payload(text: str) -> str:
    cell = begin_cell().store_uint(0, 32).store_snake_string(text).end_cell()
    return base64.b64encode(cell.to_boc()).decode()


def jetton_transfer_payload(units: int, destination: str, response_to: str, comment: str, forward_ton: int = 1) -> str:
    fwd = begin_cell().store_uint(0, 32).store_snake_string(comment).end_cell()
    body = (
        begin_cell()
        .store_uint(0xF8A7EA5, 32)      # op: jetton transfer (TEP-74)
        .store_uint(int(time.time()), 64)  # query_id
        .store_coins(units)
        .store_address(Address(destination))
        .store_address(Address(response_to))
        .store_bit(0)                    # nessun custom payload
        .store_coins(forward_ton)        # TON inoltrati al destinatario (notifica)
        .store_bit(1)                    # forward payload come riferimento
        .store_ref(fwd)
        .end_cell()
    )
    return base64.b64encode(body.to_boc()).decode()


async def get_jetton_wallet(owner: str, master: str = USDT_TON_MASTER) -> Optional[str]:
    """Indirizzo del jetton wallet USDT del fan (serve per inviare USDT via TON Connect)."""
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(f"{TONAPI}/blockchain/accounts/{master}/methods/get_wallet_address",
                            params={"args": owner}, headers=_headers_ton())
            if r.status_code != 200:
                log.warning("get_wallet_address %s: %s", r.status_code, r.text[:200])
                return None
            d = r.json()
            addr = (d.get("decoded") or {}).get("jetton_wallet_address")
            if not addr:
                return None
            return ton_friendly(addr, bounceable=True)
    except Exception as e:  # noqa: BLE001
        log.warning("get_jetton_wallet: %s", e)
        return None


def deep_links(method: str, address: str, units: int, comment: str) -> dict:
    """Link che aprono il wallet con importo e commento gia' compilati."""
    if method == "ton":
        q = f"amount={units}&text={quote(comment)}"
    elif method == "usdt_ton":
        q = f"amount={units}&text={quote(comment)}&jetton={USDT_TON_MASTER}"
    else:
        return {"qr": address}
    return {
        "ton": f"ton://transfer/{address}?{q}",
        "tonkeeper": f"https://app.tonkeeper.com/transfer/{address}?{q}",
        "qr": f"ton://transfer/{address}?{q}",
    }


# ---------------- Scansione blockchain ----------------
@dataclass
class Transfer:
    txid: str
    network: str          # ton | tron
    currency: str         # TON | USDT
    units: int            # nanoton o micro-USDT
    decimals: int
    sender: str
    comment: Optional[str]
    ts: int               # unix seconds
    pending: bool         # True = visto ma non ancora definitivo
    extra: dict = field(default_factory=dict)

    @property
    def amount(self) -> Decimal:
        return from_units(self.units, self.decimals)


async def scan_ton(address: str, limit: int = 60) -> Optional[list[Transfer]]:
    """Trasferimenti TON e USDT in ENTRATA sull'indirizzo della creator (eventi recenti)."""
    me = ton_raw(address)
    usdt_master = ton_raw(USDT_TON_MASTER)
    if not me:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{TONAPI}/accounts/{address}/events", params={"limit": limit}, headers=_headers_ton())
            if r.status_code != 200:
                log.warning("tonapi events %s: %s", r.status_code, r.text[:200])
                return None
            data = r.json()
    except Exception as e:  # noqa: BLE001
        log.warning("scan_ton: %s", e)
        return None
    out: list[Transfer] = []
    for ev in data.get("events", []):
        pending = bool(ev.get("in_progress"))
        for i, act in enumerate(ev.get("actions", [])):
            if act.get("status") != "ok":
                continue
            t = act.get("type")
            if t == "TonTransfer":
                a = act["TonTransfer"]
                if ton_raw(a["recipient"]["address"]) != me:
                    continue
                out.append(Transfer(f"{ev['event_id']}:{i}", "ton", "TON", int(a["amount"]), 9,
                                    a["sender"]["address"], a.get("comment"), int(ev["timestamp"]), pending))
            elif t == "JettonTransfer":
                a = act["JettonTransfer"]
                if ton_raw(a.get("recipient", {}).get("address")) != me:
                    continue
                if ton_raw(a.get("jetton", {}).get("address")) != usdt_master:
                    continue
                dec = int(a["jetton"].get("decimals", 6))
                out.append(Transfer(f"{ev['event_id']}:{i}", "ton", "USDT", int(a["amount"]), dec,
                                    a.get("sender", {}).get("address", ""), a.get("comment"), int(ev["timestamp"]), pending))
    return out


async def scan_tron(address: str, limit: int = 60) -> Optional[list[Transfer]]:
    """Trasferimenti USDT TRC20 in ENTRATA (confermati + non confermati) sull'indirizzo Tron della creator."""
    if not valid_tron_address(address):
        return None
    out: list[Transfer] = []
    seen: set[str] = set()
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            for only, pending in (("only_confirmed", False), ("only_unconfirmed", True)):
                if pending:
                    await asyncio.sleep(1.1)  # TronGrid senza chiave: max 1 richiesta/secondo
                params = {"only_to": "true", only: "true", "limit": limit, "contract_address": USDT_TRC20}
                r = await c.get(f"{TRONGRID}/v1/accounts/{address}/transactions/trc20", params=params, headers=_headers_tron())
                if r.status_code != 200:
                    log.warning("trongrid %s: %s", r.status_code, r.text[:200])
                    if not pending:
                        return None
                    continue
                for tx in r.json().get("data", []):
                    if tx.get("type") != "Transfer" or tx.get("to") != address:
                        continue
                    if (tx.get("token_info") or {}).get("address") != USDT_TRC20:
                        continue
                    txid = tx["transaction_id"]
                    if txid in seen:
                        continue
                    seen.add(txid)
                    dec = int((tx.get("token_info") or {}).get("decimals", 6))
                    out.append(Transfer(txid, "tron", "USDT", int(tx["value"]), dec, tx.get("from", ""), None,
                                        int(tx["block_timestamp"]) // 1000, pending))
    except Exception as e:  # noqa: BLE001
        log.warning("scan_tron: %s", e)
        return None
    return out


async def check_ton_account(address: str) -> dict:
    """Verifica indirizzo TON dal pannello: esiste? e' un wallet? saldo."""
    if not ton_raw(address):
        return {"ok": False, "error": "Indirizzo TON non valido"}
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(f"{TONAPI}/accounts/{address}", headers=_headers_ton())
            if r.status_code != 200:
                return {"ok": False, "error": "Indirizzo non trovato sulla rete TON"}
            d = r.json()
            return {"ok": True, "status": d.get("status"), "is_wallet": d.get("is_wallet"), "name": d.get("name"),
                    "balance_ton": str(from_units(int(d.get("balance", 0)), 9)), "friendly": ton_friendly(address)}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": f"Rete TON non raggiungibile: {e}"}


async def check_tron_account(address: str) -> dict:
    if not valid_tron_address(address):
        return {"ok": False, "error": "Indirizzo Tron non valido (deve iniziare con T, 34 caratteri)"}
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(f"{TRONGRID}/v1/accounts/{address}", headers=_headers_tron())
            if r.status_code != 200:
                return {"ok": False, "error": "Rete Tron non raggiungibile"}
            data = r.json().get("data", [])
            activated = bool(data)
            return {"ok": True, "activated": activated,
                    "note": None if activated else "Indirizzo valido ma mai usato: va bene, si attiva al primo USDT ricevuto"}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": f"Rete Tron non raggiungibile: {e}"}
