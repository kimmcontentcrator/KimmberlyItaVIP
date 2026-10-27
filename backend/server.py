from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import hmac
import time
import asyncio
import bcrypt
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Literal
from decimal import Decimal
import uuid
import jwt
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta

import payments as pay
from pricing import resolve_item

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
JWT_SECRET = os.environ.get('JWT_SECRET', '')
JWT_ALG = "HS256"

app = FastAPI(title="KimmberlyyITAVIP API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

Channel = Literal["telegram", "instagram", "whatsapp", "email"]
ReqType = Literal["foto", "video", "bundle", "chat", "abbonamento", "pacchetto", "extra", "chat_tempo", "tip", "altro"]
Status = Literal["nuova", "in_lavorazione", "completata", "rifiutata"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def clean(s: Optional[str], max_len: int) -> Optional[str]:
    if s is None:
        return None
    s = s.replace("<", "").replace(">", "").strip()
    return s[:max_len]


# ---------------- Models ----------------
class RequestCreate(BaseModel):
    name: Optional[str] = None
    contact_channel: Channel
    contact_handle: str
    request_type: ReqType
    item: Optional[str] = None
    item_price: Optional[float] = None
    budget: Optional[str] = None
    description: str
    is_adult: bool

    @field_validator("name")
    @classmethod
    def v_name(cls, v):
        return clean(v, 60) or None

    @field_validator("contact_handle")
    @classmethod
    def v_handle(cls, v):
        v = clean(v, 120)
        if not v or len(v) < 3:
            raise ValueError("Inserisci un contatto valido")
        return v

    @field_validator("item")
    @classmethod
    def v_item(cls, v):
        return clean(v, 80) or None

    @field_validator("budget")
    @classmethod
    def v_budget(cls, v):
        return clean(v, 40) or None

    @field_validator("item_price")
    @classmethod
    def v_price(cls, v):
        if v is None:
            return None
        if v < 0 or v > 100000:
            raise ValueError("Prezzo non valido")
        return round(v, 2)

    @field_validator("description")
    @classmethod
    def v_desc(cls, v):
        v = clean(v, 2000)
        if not v or len(v) < 10:
            raise ValueError("Descrivi la richiesta (minimo 10 caratteri)")
        return v


class CustomRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    contact_channel: str
    contact_handle: str
    request_type: str
    item: Optional[str] = None
    item_price: Optional[float] = None
    budget: Optional[str] = None
    description: str
    fan_id: Optional[str] = None
    fan_username: Optional[str] = None
    status: str = "nuova"
    amount_paid: float = 0
    internal_notes: str = ""
    accepted_price: Optional[float] = None   # prezzo fissato dalla creator -> il fan vede "Paga ora"
    admin_reply: Optional[str] = None        # messaggio visibile al fan
    order_code: Optional[str] = None         # ordine collegato (cassa)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class RequestUpdate(BaseModel):
    status: Optional[Status] = None
    internal_notes: Optional[str] = None
    amount_paid: Optional[float] = None
    accepted_price: Optional[float] = None
    admin_reply: Optional[str] = None


class LoginBody(BaseModel):
    password: str


class FanRegister(BaseModel):
    username: str
    display_name: str
    code: str
    is_adult: bool

    @field_validator("username")
    @classmethod
    def v_user(cls, v):
        v = (v or "").strip().lower()
        if not re.fullmatch(r"[a-z0-9_.]{3,24}", v):
            raise ValueError("Username: 3-24 caratteri, solo lettere, numeri, _ e .")
        return v

    @field_validator("display_name")
    @classmethod
    def v_disp(cls, v):
        v = clean(v, 40)
        if not v or len(v) < 2:
            raise ValueError("Inserisci un nome visualizzato")
        return v

    @field_validator("code")
    @classmethod
    def v_code(cls, v):
        if not v or len(v) < 6 or len(v) > 64:
            raise ValueError("Il codice deve avere almeno 6 caratteri")
        return v


class FanLogin(BaseModel):
    username: str
    code: str


class PresenceBody(BaseModel):
    sid: str


# ---------------- Helpers ----------------
_hits = defaultdict(deque)


def rate_limited(key: str, limit: int, window: int) -> bool:
    now = time.time()
    q = _hits[key]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def make_token(payload: dict, hours: int) -> str:
    payload = {**payload, "exp": datetime.now(timezone.utc) + timedelta(hours=hours)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(authorization: Optional[str]) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        return jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.InvalidTokenError:
        return None


async def require_admin(authorization: Optional[str] = Header(None)):
    p = decode_token(authorization)
    if not p or p.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Non autorizzato")
    return True


async def optional_fan(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    p = decode_token(authorization)
    if not p or p.get("role") != "fan":
        return None
    return await db.fans.find_one({"id": p.get("sub")}, {"_id": 0, "code_hash": 0})


async def require_fan(fan: Optional[dict] = Depends(optional_fan)) -> dict:
    if not fan:
        raise HTTPException(status_code=401, detail="Accedi con il tuo codice")
    return fan


async def actor(authorization: Optional[str] = Header(None)) -> dict:
    """Chi sta chiamando: {"role": "admin"} | {"role": "fan", "fan": {...}} | {"role": None}."""
    p = decode_token(authorization)
    if not p:
        return {"role": None}
    if p.get("role") == "admin":
        return {"role": "admin"}
    if p.get("role") == "fan":
        f = await db.fans.find_one({"id": p.get("sub")}, {"_id": 0, "code_hash": 0})
        if f:
            return {"role": "fan", "fan": f}
    return {"role": None}


def short_name(n: str) -> str:
    parts = (n or "").split()
    if len(parts) >= 2:
        return f"{parts[0]} {parts[1][0].upper()}."
    return parts[0] if parts else "Fan"


# ---------------- Public ----------------
@api_router.get("/")
async def root():
    return {"message": "KimmberlyyITAVIP API attiva"}


@api_router.post("/requests", response_model=CustomRequest)
async def create_request(body: RequestCreate, request: Request, fan: Optional[dict] = Depends(optional_fan)):
    if not body.is_adult:
        raise HTTPException(status_code=400, detail="Devi confermare di avere almeno 18 anni")
    if rate_limited(f"req:{client_ip(request)}", 8, 600):
        raise HTTPException(status_code=429, detail="Troppe richieste, riprova tra qualche minuto")
    data = body.model_dump(exclude={"is_adult"})
    if fan:
        data["fan_id"] = fan["id"]
        data["fan_username"] = fan["username"]
        data["name"] = data.get("name") or fan["display_name"]
    obj = CustomRequest(**data)
    await db.custom_requests.insert_one(obj.model_dump())
    logger.info("Nuova richiesta %s", obj.id)
    return obj


@api_router.post("/presence")
async def presence(body: PresenceBody):
    sid = clean(body.sid, 64)
    if not sid:
        raise HTTPException(status_code=400, detail="sid mancante")
    now = datetime.now(timezone.utc)
    await db.presence.update_one({"sid": sid}, {"$set": {"sid": sid, "last_seen": now.isoformat()}}, upsert=True)
    cutoff = (now - timedelta(seconds=90)).isoformat()
    online = await db.presence.count_documents({"last_seen": {"$gte": cutoff}})
    return {"online": online}


PAID_STATUSES = ("confermato", "consegnato")


async def spent_by_fan(since_iso: Optional[str]) -> dict:
    """Totale speso per fan: ordini confermati/consegnati + richieste legacy pagate fuori cassa."""
    totals: dict = defaultdict(float)
    q_orders = {"status": {"$in": list(PAID_STATUSES)}}
    q_req = {"status": "completata", "fan_id": {"$ne": None}, "amount_paid": {"$gt": 0}, "order_code": {"$in": [None, ""]}}
    if since_iso:
        q_orders["updated_at"] = {"$gte": since_iso}
        q_req["updated_at"] = {"$gte": since_iso}
    async for o in db.orders.find(q_orders, {"_id": 0, "fan_id": 1, "total_eur": 1}):
        totals[o["fan_id"]] += float(o.get("total_eur") or 0)
    async for r in db.custom_requests.find(q_req, {"_id": 0, "fan_id": 1, "amount_paid": 1}):
        totals[r["fan_id"]] += float(r.get("amount_paid") or 0)
    return totals


@api_router.get("/topfans")
async def top_fans():
    start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    totals = await spent_by_fan(start)
    rows = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:10]
    out = []
    for i, (fan_id, total) in enumerate(rows):
        f = await db.fans.find_one({"id": fan_id}, {"_id": 0, "display_name": 1})
        out.append({"rank": i + 1, "name": short_name(f["display_name"]) if f else "Fan", "total": round(total, 2)})
    return out


# ---------------- Fans (codice privato) ----------------
@api_router.post("/fans/register")
async def fan_register(body: FanRegister, request: Request):
    if not body.is_adult:
        raise HTTPException(status_code=400, detail="Devi confermare di avere almeno 18 anni")
    if rate_limited(f"reg:{client_ip(request)}", 5, 3600):
        raise HTTPException(status_code=429, detail="Troppi tentativi, riprova più tardi")
    if await db.fans.find_one({"username": body.username}):
        raise HTTPException(status_code=409, detail="Username già in uso")
    fan = {
        "id": str(uuid.uuid4()),
        "username": body.username,
        "display_name": body.display_name,
        "code_hash": bcrypt.hashpw(body.code.encode(), bcrypt.gensalt()).decode(),
        "created_at": now_iso(),
    }
    await db.fans.insert_one(fan)
    fan.pop("code_hash")
    fan.pop("_id", None)
    return {"token": make_token({"role": "fan", "sub": fan["id"]}, 24 * 30), "fan": fan}


@api_router.post("/fans/login")
async def fan_login(body: FanLogin, request: Request):
    if rate_limited(f"flogin:{client_ip(request)}", 10, 600):
        raise HTTPException(status_code=429, detail="Troppi tentativi, riprova più tardi")
    f = await db.fans.find_one({"username": (body.username or "").strip().lower()})
    if not f or not bcrypt.checkpw(body.code.encode(), f["code_hash"].encode()):
        raise HTTPException(status_code=401, detail="Username o codice errato")
    fan = {k: f[k] for k in ("id", "username", "display_name", "created_at")}
    return {"token": make_token({"role": "fan", "sub": fan["id"]}, 24 * 30), "fan": fan}


@api_router.get("/fans/me")
async def fan_me(fan: dict = Depends(require_fan)):
    await expire_orders()
    requests_ = await db.custom_requests.find(
        {"fan_id": fan["id"]}, {"_id": 0, "internal_notes": 0}
    ).sort("created_at", -1).to_list(200)
    purchases = await db.orders.find({"fan_id": fan["id"]}, ORDER_FAN_PROJ).sort("created_at", -1).to_list(200)
    legacy_unlocked = [r for r in requests_ if r["status"] == "completata" and not r.get("order_code")]
    spent = round(
        sum(float(o.get("total_eur") or 0) for o in purchases if o["status"] in PAID_STATUSES)
        + sum(float(r.get("amount_paid") or 0) for r in legacy_unlocked), 2
    )
    unlocked = [{"id": o["code"], "name": o["item"]["name"], "kind": "ordine", "code": o["code"], "status": o["status"]}
                for o in purchases if o["status"] in PAID_STATUSES]
    unlocked += [{"id": r["id"], "name": r.get("item") or "Richiesta personalizzata", "kind": "richiesta", "status": "completata"} for r in legacy_unlocked]
    # richieste accettate con prezzo e senza ordine attivo -> "Paga ora"
    payable = [r["id"] for r in requests_ if r.get("accepted_price") and r["status"] in ("nuova", "in_lavorazione")
               and not any(o.get("request_id") == r["id"] and o["status"] not in ("rifiutato", "scaduto") for o in purchases)]
    return {"fan": fan, "orders": requests_, "purchases": purchases, "unlocked": unlocked, "spent": spent, "payable": payable}


# ---------------- Admin ----------------
@api_router.post("/admin/login")
async def admin_login(body: LoginBody, request: Request):
    if rate_limited(f"login:{client_ip(request)}", 8, 600):
        raise HTTPException(status_code=429, detail="Troppi tentativi, riprova più tardi")
    if not ADMIN_PASSWORD or not hmac.compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        raise HTTPException(status_code=401, detail="Password errata")
    return {"token": make_token({"role": "admin"}, 12)}


@api_router.get("/admin/me")
async def admin_me(_: bool = Depends(require_admin)):
    return {"ok": True}


@api_router.get("/admin/requests", response_model=List[CustomRequest])
async def list_requests(status: Optional[str] = None, _: bool = Depends(require_admin)):
    q = {}
    if status and status != "tutte":
        q["status"] = status
    return await db.custom_requests.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.get("/admin/stats")
async def stats(_: bool = Depends(require_admin)):
    out = {"totale": await db.custom_requests.count_documents({})}
    for s in ["nuova", "in_lavorazione", "completata", "rifiutata"]:
        out[s] = await db.custom_requests.count_documents({"status": s})
    out["fans"] = await db.fans.count_documents({})
    totals = await spent_by_fan(None)
    out["incassato"] = round(sum(totals.values()), 2)
    out["ordini_da_gestire"] = await db.orders.count_documents({"status": {"$in": ["verifica_manuale", "confermato", "pagamento_visto"]}})
    return out


@api_router.patch("/admin/requests/{req_id}", response_model=CustomRequest)
async def update_request(req_id: str, body: RequestUpdate, _: bool = Depends(require_admin)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if "internal_notes" in upd:
        upd["internal_notes"] = clean(upd["internal_notes"], 3000) or ""
    if "admin_reply" in upd:
        upd["admin_reply"] = clean(upd["admin_reply"], 1500) or ""
    for k in ("amount_paid", "accepted_price"):
        if k in upd:
            if upd[k] < 0 or upd[k] > 100000:
                raise HTTPException(status_code=400, detail="Importo non valido")
            upd[k] = round(upd[k], 2)
    if "accepted_price" in upd and upd["accepted_price"] == 0:
        upd["accepted_price"] = None
    if not upd:
        raise HTTPException(status_code=400, detail="Nessuna modifica")
    upd["updated_at"] = now_iso()
    res = await db.custom_requests.find_one_and_update(
        {"id": req_id}, {"$set": upd}, projection={"_id": 0}, return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Richiesta non trovata")
    return res


@api_router.delete("/admin/requests/{req_id}")
async def delete_request(req_id: str, _: bool = Depends(require_admin)):
    res = await db.custom_requests.delete_one({"id": req_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Richiesta non trovata")
    return {"ok": True}


# ---------------- Contenuti modificabili (testi, prezzi, link) ----------------
class ContentUpdate(BaseModel):
    key: str
    value: Optional[str] = None  # None = ripristina testo originale

    @field_validator("key")
    @classmethod
    def v_key(cls, v):
        if not re.fullmatch(r"[a-zA-Z0-9_.\-]{1,80}", v or ""):
            raise ValueError("Chiave non valida")
        return v

    @field_validator("value")
    @classmethod
    def v_value(cls, v):
        if v is None:
            return None
        return v.replace("<", "").replace(">", "")[:3000]


async def content_overrides() -> dict:
    docs = await db.site_content.find({}, {"_id": 0}).to_list(2000)
    return {d["key"]: d["value"] for d in docs}


@api_router.get("/content")
async def get_content():
    return await content_overrides()


@api_router.put("/admin/content")
async def put_content(body: ContentUpdate, _: bool = Depends(require_admin)):
    if body.value is None:
        await db.site_content.delete_one({"key": body.key})
        return {"key": body.key, "value": None}
    await db.site_content.update_one(
        {"key": body.key}, {"$set": {"key": body.key, "value": body.value, "updated_at": now_iso()}}, upsert=True
    )
    return {"key": body.key, "value": body.value}


@api_router.get("/admin/content")
async def list_content(_: bool = Depends(require_admin)):
    return await db.site_content.find({}, {"_id": 0}).sort("updated_at", -1).to_list(2000)


# =====================================================================
#                      CASSA: impostazioni, ordini, pagamenti
# =====================================================================
Method = Literal["ton", "usdt_ton", "usdt_trc20", "sepa"]
Kind = Literal["offer", "catalog", "special", "tip", "request"]
OPEN_STATUSES = ("in_attesa", "pagamento_visto")
MATCHABLE = ("in_attesa", "pagamento_visto", "scaduto", "verifica_manuale")
ORDER_FAN_PROJ = {"_id": 0, "admin_notes": 0}

DEFAULT_SETTINGS = {
    "key": "payments",
    "ton_address": "",
    "ton_memo": "",            # solo se l'indirizzo TON e' di un exchange che richiede memo
    "tron_address": "",
    "sepa": {"iban": "", "holder": "", "bank": "", "note": "Bonifico istantaneo: arriva in pochi secondi. Inserisci il codice ordine nella causale."},
    "enabled": {"ton": True, "usdt_ton": True, "usdt_trc20": True, "sepa": True},
    "discounts": {"ton": 0, "usdt_ton": 0, "usdt_trc20": 0, "sepa": 0},
    "order_hours": 48,
    "texts": {
        "refund_policy": "Contenuti digitali personali: una volta consegnati non sono rimborsabili. Se un ordine non puo' essere evaso, viene rimborsato per intero sullo stesso metodo di pagamento.",
        "thanks": "Grazie! Appena il pagamento e' confermato ti preparo tutto con cura e lo trovi qui, nell'area Consegna.",
        "checkout_notice": "Il prezzo in crypto resta bloccato per tutta la durata dell'ordine. Nessun intermediario: paghi direttamente a me.",
        "delivery_default": "",
    },
}

SEPA_PUBLIC = ("iban", "holder", "bank", "note")


async def get_settings() -> dict:
    doc = await db.settings.find_one({"key": "payments"}, {"_id": 0}) or {}
    s = {**DEFAULT_SETTINGS, **doc}
    for k in ("sepa", "enabled", "discounts", "texts"):
        s[k] = {**DEFAULT_SETTINGS[k], **(doc.get(k) or {})}
    return s


def method_available(s: dict, m: str) -> bool:
    if not s["enabled"].get(m):
        return False
    if m in ("ton", "usdt_ton"):
        return bool(pay.ton_raw(s.get("ton_address")))
    if m == "usdt_trc20":
        return pay.valid_tron_address(s.get("tron_address"))
    if m == "sepa":
        return pay.valid_iban(s["sepa"].get("iban")) and bool(s["sepa"].get("holder"))
    return False


def public_methods(s: dict) -> list:
    out = []
    for m, meta in pay.METHODS.items():
        out.append({
            "id": m, "label": meta["label"], "currency": meta["currency"], "network": meta["network"],
            "auto": meta["auto"], "available": method_available(s, m),
            "discount_pct": float(s["discounts"].get(m) or 0),
            "wallet_connect": m in ("ton", "usdt_ton"),
        })
    return out


def apply_discount(price: float, pct: float) -> float:
    return round(float(Decimal(str(price)) * (Decimal(100) - Decimal(str(pct))) / Decimal(100)), 2)


async def rates_or_503() -> dict:
    r = await pay.fetch_rates()
    if not r:
        raise HTTPException(status_code=503, detail="Cambio crypto non disponibile al momento, riprova tra poco o scegli il bonifico")
    return r


async def build_payment(code: str, total_eur: float, method: str, s: dict) -> dict:
    """Istruzioni di pagamento per l'ordine: importo univoco bloccato, indirizzo, link e QR."""
    meta = pay.METHODS[method]
    if method == "sepa":
        return {
            "method": method, "label": meta["label"], "currency": "EUR", "network": "bank", "auto": False,
            "amount": f"{total_eur:.2f}", "reference": code,
            "iban": re.sub(r"\s+", "", s["sepa"]["iban"]).upper(), "holder": s["sepa"]["holder"],
            "bank": s["sepa"].get("bank") or "", "note": s["sepa"].get("note") or "",
        }
    rates = await rates_or_503()
    cur = meta["currency"]
    rate = float(rates[cur])
    base = pay.eur_to_crypto(total_eur, cur, rate)
    address = s["ton_address"].strip() if meta["network"] == "ton" else s["tron_address"].strip()
    taken = set()
    async for o in db.orders.find({"status": {"$in": list(OPEN_STATUSES)}, "payment.method": method, "code": {"$ne": code}},
                                  {"_id": 0, "payment.units": 1}):
        u = (o.get("payment") or {}).get("units")
        if u is not None:
            taken.add(int(u))
    amount = pay.unique_amount(base, cur, taken, meta["decimals"])
    units = pay.to_units(amount, meta["decimals"])
    comment = (s.get("ton_memo") or "").strip() or code
    friendly = pay.ton_friendly(address) if meta["network"] == "ton" else address
    out = {
        "method": method, "label": meta["label"], "currency": cur, "network": meta["network"], "auto": True,
        "address": friendly, "amount": f"{amount:f}", "units": units, "decimals": meta["decimals"],
        "rate_eur": rate, "rate_source": rates.get("source"), "comment": comment,
        "memo_required": bool((s.get("ton_memo") or "").strip()) if meta["network"] == "ton" else False,
        "links": pay.deep_links(method, friendly, units, comment),
    }
    if method == "usdt_ton":
        out["jetton_master"] = pay.USDT_TON_MASTER
    if method == "usdt_trc20":
        out["contract"] = pay.USDT_TRC20
    return out


def hist(status: str, by: str, note: Optional[str] = None) -> dict:
    return {"status": status, "at": now_iso(), "by": by, "note": note}


async def expire_orders():
    now = now_iso()
    cur = db.orders.find({"status": "in_attesa", "expires_at": {"$lt": now}}, {"_id": 0, "code": 1})
    async for o in cur:
        await db.orders.update_one({"code": o["code"], "status": "in_attesa"}, {
            "$set": {"status": "scaduto", "updated_at": now},
            "$push": {"history": hist("scaduto", "sistema", "Tempo scaduto senza pagamento")},
        })


async def on_confirmed(order: dict):
    if order.get("request_id"):
        await db.custom_requests.update_one(
            {"id": order["request_id"], "status": {"$in": ["nuova", "in_lavorazione"]}},
            {"$set": {"status": "in_lavorazione", "order_code": order["code"], "amount_paid": order["total_eur"], "updated_at": now_iso()}},
        )


async def on_delivered(order: dict):
    if order.get("request_id"):
        await db.custom_requests.update_one(
            {"id": order["request_id"]},
            {"$set": {"status": "completata", "order_code": order["code"], "amount_paid": order["total_eur"], "updated_at": now_iso()}},
        )


async def set_status(code: str, status: str, by: str, note: Optional[str] = None, extra: Optional[dict] = None) -> dict:
    upd = {"status": status, "updated_at": now_iso(), **(extra or {})}
    res = await db.orders.find_one_and_update(
        {"code": code}, {"$set": upd, "$push": {"history": hist(status, by, note)}},
        projection={"_id": 0}, return_document=True,
    )
    if res and status == "confermato":
        await on_confirmed(res)
    if res and status == "consegnato":
        await on_delivered(res)
    return res


METHOD_BY_CHAIN = {("ton", "TON"): "ton", ("ton", "USDT"): "usdt_ton", ("tron", "USDT"): "usdt_trc20"}


async def apply_transfer(order: dict, t: pay.Transfer):
    expected = int(order["payment"]["units"])
    received = t.units
    full = Decimal(received) >= Decimal(expected) * pay.TOLERANCE
    dec = order["payment"]["decimals"]
    paid = {
        "txid": t.txid, "amount": f"{t.amount:f}", "units": received, "currency": t.currency, "network": t.network,
        "sender": t.sender, "seen_at": now_iso(), "confirmed_at": None if t.pending else now_iso(),
        "shortfall": None if full else f"{pay.from_units(expected - received, dec):f}",
    }
    if not full:
        status, note = "verifica_manuale", f"Ricevuto {paid['amount']} {t.currency}: mancano {paid['shortfall']} {t.currency}"
    elif order["status"] == "scaduto":
        status, note = "verifica_manuale", "Pagamento arrivato dopo la scadenza dell'ordine"
    elif t.pending:
        status, note = "pagamento_visto", "Transazione vista sulla rete, in attesa di conferma definitiva"
    else:
        status, note = "confermato", "Pagamento confermato automaticamente dalla blockchain"
    await db.payments_seen.update_one({"txid": t.txid}, {"$set": {"txid": t.txid, "order_code": order["code"], "pending": t.pending, "at": now_iso()}}, upsert=True)
    await set_status(order["code"], status, "sistema", note, {"paid": paid})
    logger.info("Ordine %s -> %s (%s)", order["code"], status, t.txid[:16])


async def process_transfers(transfers: list):
    for t in sorted(transfers, key=lambda x: x.ts):
        method = METHOD_BY_CHAIN.get((t.network, t.currency))
        if not method or t.units <= 0:
            continue
        seen = await db.payments_seen.find_one({"txid": t.txid}, {"_id": 0})
        if seen:
            # transizione visto -> confermato
            if seen.get("pending") and not t.pending and seen.get("order_code"):
                o = await db.orders.find_one({"code": seen["order_code"], "status": "pagamento_visto"}, {"_id": 0})
                if o:
                    await set_status(o["code"], "confermato", "sistema", "Pagamento confermato automaticamente dalla blockchain",
                                     {"paid.confirmed_at": now_iso()})
                await db.payments_seen.update_one({"txid": t.txid}, {"$set": {"pending": False}})
            continue
        order = None
        code = pay.extract_code(t.comment)
        if code:
            order = await db.orders.find_one({"code": code, "payment.method": method, "status": {"$in": list(MATCHABLE)}, "paid": None}, {"_id": 0})
        if not order:
            order = await db.orders.find_one(
                {"payment.method": method, "payment.units": t.units, "status": {"$in": list(MATCHABLE)}, "paid": None},
                {"_id": 0}, sort=[("created_at", -1)],
            )
        if not order:
            await db.unmatched_payments.update_one({"txid": t.txid}, {"$setOnInsert": {
                "id": str(uuid.uuid4()), "txid": t.txid, "method": method, "currency": t.currency, "network": t.network,
                "amount": f"{t.amount:f}", "units": t.units, "sender": t.sender, "comment": t.comment,
                "ts": t.ts, "pending": t.pending, "assigned_to": None, "created_at": now_iso(),
            }}, upsert=True)
            continue
        await apply_transfer(order, t)


_last_scan = {"ton": 0.0, "tron": 0.0}


async def scan_network(network: str, s: dict, force: bool = False) -> bool:
    now = time.time()
    if not force and now - _last_scan[network] < 15:
        return False
    _last_scan[network] = now
    if network == "ton" and pay.ton_raw(s.get("ton_address")):
        tr = await pay.scan_ton(s["ton_address"].strip())
    elif network == "tron" and pay.valid_tron_address(s.get("tron_address")):
        tr = await pay.scan_tron(s["tron_address"].strip())
    else:
        return False
    if tr is None:
        return False
    await process_transfers(tr)
    return True


async def payment_watcher():
    await asyncio.sleep(4)
    while True:
        try:
            await expire_orders()
            s = await get_settings()
            for network in ("ton", "tron"):
                pending = await db.orders.count_documents({"status": {"$in": list(OPEN_STATUSES)}, "payment.network": network})
                if pending:
                    await scan_network(network, s)
        except Exception as e:  # noqa: BLE001
            logger.warning("watcher: %s", e)
        await asyncio.sleep(20)


# ---------- Public: config, cambi, preventivo, manifest ----------
@api_router.get("/pay/config")
async def pay_config():
    s = await get_settings()
    rates = await pay.fetch_rates()
    methods = public_methods(s)
    return {
        "methods": methods, "any_available": any(m["available"] for m in methods),
        "order_hours": int(s.get("order_hours") or 48), "texts": s["texts"], "rates": rates,
        "sepa_holder": s["sepa"]["holder"] if method_available(s, "sepa") else None,
    }


@api_router.get("/pay/rates")
async def pay_rates():
    return await rates_or_503()


@api_router.get("/pay/quote")
async def pay_quote(kind: Kind, ref: Optional[str] = None, amount: Optional[float] = None,
                    request_id: Optional[str] = None, who: dict = Depends(actor)):
    s = await get_settings()
    item = await resolve_any(kind, ref, amount, request_id, who)
    rates = await pay.fetch_rates()
    methods = []
    for m in public_methods(s):
        total = apply_discount(item["price_eur"], m["discount_pct"])
        row = {**m, "total_eur": total}
        if m["currency"] in ("TON", "USDT") and rates:
            row["crypto_amount"] = f"{pay.eur_to_crypto(total, m['currency'], rates[m['currency']]):f}"
        methods.append(row)
    return {"item": item, "methods": methods, "rates": rates, "order_hours": int(s.get("order_hours") or 48), "texts": s["texts"]}


async def resolve_any(kind: str, ref, amount, request_id, who: dict) -> dict:
    if kind == "request":
        if who.get("role") != "fan":
            raise HTTPException(status_code=401, detail="Accedi per pagare la tua richiesta")
        r = await db.custom_requests.find_one({"id": request_id, "fan_id": who["fan"]["id"]}, {"_id": 0})
        if not r:
            raise HTTPException(status_code=404, detail="Richiesta non trovata")
        if not r.get("accepted_price"):
            raise HTTPException(status_code=400, detail="Questa richiesta non ha ancora un prezzo confermato")
        if r["status"] in ("rifiutata", "completata"):
            raise HTTPException(status_code=400, detail="Questa richiesta non e' piu' pagabile")
        return {
            "kind": "request", "ref": r["id"], "name": r.get("item") or "Richiesta personalizzata",
            "category": r.get("request_type"), "period": None,
            "details": [r["description"][:160] + ("…" if len(r["description"]) > 160 else "")] + ([f"Nota: {r['admin_reply']}"] if r.get("admin_reply") else []),
            "price_eur": round(float(r["accepted_price"]), 2), "delivery": "Tempi concordati nella richiesta. Ti aggiorno io in privato.",
        }
    item = resolve_item(kind, ref, amount, await content_overrides())
    if not item:
        raise HTTPException(status_code=404, detail="Articolo non acquistabile")
    if kind == "special":
        try:
            ends = datetime.fromisoformat(item["ends_at"].replace("Z", "+00:00"))
            if ends.tzinfo is None:
                ends = ends.replace(tzinfo=timezone.utc)
            if ends < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Offerta terminata")
        except ValueError:
            pass
    return item


@api_router.get("/tonconnect-manifest.json")
async def tonconnect_manifest(request: Request):
    proto = request.headers.get("x-forwarded-proto", "https").split(",")[0].strip()
    host = (request.headers.get("x-forwarded-host") or request.headers.get("host") or "").split(",")[0].strip()
    origin = f"{proto}://{host}"
    return {"url": origin, "name": "KimmberlyyITAVIP", "iconUrl": f"{origin}/icon.png"}


# ---------- Fan: ordini ----------
class OrderCreate(BaseModel):
    kind: Kind
    ref: Optional[str] = None
    amount: Optional[float] = None
    request_id: Optional[str] = None
    method: Method
    accept_terms: bool
    is_adult: bool
    fan_note: Optional[str] = None

    @field_validator("fan_note")
    @classmethod
    def v_note(cls, v):
        return clean(v, 500) or None


class MethodChange(BaseModel):
    method: Method


class PaidClaim(BaseModel):
    txid: Optional[str] = None
    reference: Optional[str] = None
    note: Optional[str] = None

    @field_validator("txid", "reference")
    @classmethod
    def v_ids(cls, v):
        v = clean(v, 120)
        return v or None

    @field_validator("note")
    @classmethod
    def v_note(cls, v):
        return clean(v, 500) or None


async def load_order_for(code: str, who: dict) -> dict:
    o = await db.orders.find_one({"code": code.upper()}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Ordine non trovato")
    if who.get("role") == "admin":
        return o
    if who.get("role") == "fan" and who["fan"]["id"] == o["fan_id"]:
        o.pop("admin_notes", None)
        return o
    raise HTTPException(status_code=401, detail="Accedi con il tuo codice per vedere questo ordine")


@api_router.post("/orders")
async def create_order(body: OrderCreate, request: Request, fan: dict = Depends(require_fan)):
    if not body.is_adult or not body.accept_terms:
        raise HTTPException(status_code=400, detail="Conferma di avere 18 anni e di accettare termini e politica rimborsi")
    if rate_limited(f"order:{fan['id']}", 12, 3600):
        raise HTTPException(status_code=429, detail="Hai creato troppi ordini, riprova piu' tardi")
    s = await get_settings()
    if not method_available(s, body.method):
        raise HTTPException(status_code=400, detail="Metodo di pagamento non disponibile al momento")
    item = await resolve_any(body.kind, body.ref, body.amount, body.request_id, {"role": "fan", "fan": fan})
    if body.kind == "request":
        existing = await db.orders.find_one({"request_id": body.request_id, "status": {"$in": [*OPEN_STATUSES, "verifica_manuale", *PAID_STATUSES]}}, ORDER_FAN_PROJ)
        if existing:
            return existing
    # evita duplicati accidentali: stesso articolo gia' in attesa negli ultimi minuti
    recent = await db.orders.find_one({"fan_id": fan["id"], "item.kind": item["kind"], "item.ref": item["ref"], "status": "in_attesa",
                                       "payment.method": body.method}, ORDER_FAN_PROJ, sort=[("created_at", -1)])
    if recent:
        return recent
    pct = float(s["discounts"].get(body.method) or 0)
    total = apply_discount(item["price_eur"], pct)
    hours = int(s.get("order_hours") or 48)
    for _ in range(6):
        code = pay.gen_code()
        if not await db.orders.find_one({"code": code}):
            break
    payment = await build_payment(code, total, body.method, s)
    now = datetime.now(timezone.utc)
    order = {
        "id": str(uuid.uuid4()), "code": code,
        "fan_id": fan["id"], "fan_username": fan["username"], "fan_display_name": fan["display_name"],
        "item": item, "request_id": body.request_id if body.kind == "request" else None,
        "price_eur": item["price_eur"], "discount_pct": pct, "total_eur": total,
        "payment": payment, "status": "in_attesa", "history": [hist("in_attesa", "fan", "Ordine creato")],
        "paid": None, "fan_claim": None, "fan_note": body.fan_note,
        "reject_reason": None, "delivery_message": None, "delivered_at": None, "admin_notes": "",
        "expires_at": (now + timedelta(hours=hours)).isoformat(), "created_at": now.isoformat(), "updated_at": now.isoformat(),
    }
    await db.orders.insert_one(order)
    order.pop("_id", None)
    order.pop("admin_notes", None)
    logger.info("Nuovo ordine %s %s %.2f EUR via %s", code, item["name"], total, body.method)
    return order


@api_router.get("/orders/mine")
async def my_orders(fan: dict = Depends(require_fan)):
    await expire_orders()
    return await db.orders.find({"fan_id": fan["id"]}, ORDER_FAN_PROJ).sort("created_at", -1).to_list(200)


@api_router.get("/orders/{code}")
async def get_order(code: str, who: dict = Depends(actor)):
    await expire_orders()
    return await load_order_for(code, who)


@api_router.patch("/orders/{code}/method")
async def change_method(code: str, body: MethodChange, who: dict = Depends(actor)):
    o = await load_order_for(code, who)
    if o["status"] not in ("in_attesa", "scaduto"):
        raise HTTPException(status_code=400, detail="Il metodo si puo' cambiare solo per ordini ancora da pagare")
    s = await get_settings()
    if not method_available(s, body.method):
        raise HTTPException(status_code=400, detail="Metodo di pagamento non disponibile")
    pct = float(s["discounts"].get(body.method) or 0)
    total = apply_discount(o["price_eur"], pct)
    payment = await build_payment(o["code"], total, body.method, s)
    hours = int(s.get("order_hours") or 48)
    upd = {"payment": payment, "discount_pct": pct, "total_eur": total, "status": "in_attesa", "updated_at": now_iso(),
           "expires_at": (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()}
    res = await db.orders.find_one_and_update({"code": o["code"]}, {"$set": upd, "$push": {"history": hist("in_attesa", "fan", f"Metodo cambiato: {payment['label']}")}},
                                              projection=ORDER_FAN_PROJ, return_document=True)
    return res


@api_router.post("/orders/{code}/paid")
async def claim_paid(code: str, body: PaidClaim, who: dict = Depends(actor)):
    o = await load_order_for(code, who)
    if o["status"] in PAID_STATUSES or o["status"] == "rifiutato":
        raise HTTPException(status_code=400, detail="Questo ordine non e' piu' in attesa di pagamento")
    claim = {"txid": body.txid, "reference": body.reference, "note": body.note, "at": now_iso()}
    await db.orders.update_one({"code": o["code"]}, {"$set": {"fan_claim": claim, "updated_at": now_iso()}})
    if o["payment"]["method"] == "sepa":
        await set_status(o["code"], "verifica_manuale", "fan", "Il fan ha segnalato il bonifico" + (f" (rif. {body.reference})" if body.reference else ""))
    else:
        s = await get_settings()
        await scan_network(o["payment"]["network"], s, force=True)
        fresh = await db.orders.find_one({"code": o["code"]}, {"_id": 0, "status": 1})
        if fresh and fresh["status"] in ("in_attesa", "scaduto"):
            await set_status(o["code"], "verifica_manuale", "fan", "Il fan ha segnalato il pagamento" + (f" (TXID {body.txid[:18]}…)" if body.txid else "") + ": non ancora trovato sulla rete")
    return await load_order_for(code, who)


@api_router.post("/orders/{code}/check")
async def check_order(code: str, who: dict = Depends(actor)):
    o = await load_order_for(code, who)
    if o["payment"]["method"] != "sepa" and o["status"] in MATCHABLE:
        s = await get_settings()
        await scan_network(o["payment"]["network"], s)
    return await load_order_for(code, who)


@api_router.get("/orders/{code}/tonconnect")
async def tonconnect_tx(code: str, owner: Optional[str] = None, who: dict = Depends(actor)):
    """Messaggio TON Connect gia' compilato (TON nativo o USDT jetton) che il wallet del fan firma."""
    o = await load_order_for(code, who)
    p = o["payment"]
    if p["method"] not in ("ton", "usdt_ton"):
        raise HTTPException(status_code=400, detail="Questo ordine non si paga con TON Connect")
    if o["status"] not in ("in_attesa", "pagamento_visto", "verifica_manuale", "scaduto"):
        raise HTTPException(status_code=400, detail="Ordine non pagabile")
    valid_until = int(time.time()) + 600
    if p["method"] == "ton":
        return {"validUntil": valid_until, "messages": [{"address": p["address"], "amount": str(p["units"]), "payload": pay.comment_payload(p["comment"])}]}
    if not owner or not pay.ton_raw(owner):
        raise HTTPException(status_code=400, detail="Collega prima il wallet")
    jw = await pay.get_jetton_wallet(owner)
    if not jw:
        raise HTTPException(status_code=400, detail="Nessun wallet USDT trovato per questo indirizzo: assicurati di avere USDT (rete TON) nel wallet")
    payload = pay.jetton_transfer_payload(int(p["units"]), p["address"], owner, p["comment"])
    return {"validUntil": valid_until, "messages": [{"address": jw, "amount": "50000000", "payload": payload}],
            "note": "0.05 TON coprono le commissioni di rete; l'eccedenza torna nel tuo wallet"}


# ---------- Admin: ordini, impostazioni, pagamenti non riconosciuti ----------
class OrderAdminUpdate(BaseModel):
    action: Optional[Literal["conferma", "rifiuta", "consegnato", "verifica", "riapri"]] = None
    reject_reason: Optional[str] = None
    delivery_message: Optional[str] = None
    admin_notes: Optional[str] = None
    amount_received_eur: Optional[float] = None

    @field_validator("reject_reason")
    @classmethod
    def v_rr(cls, v):
        return clean(v, 500) or None

    @field_validator("delivery_message")
    @classmethod
    def v_dm(cls, v):
        if v is None:
            return None
        return v.replace("<", "").replace(">", "").strip()[:4000]

    @field_validator("admin_notes")
    @classmethod
    def v_an(cls, v):
        return clean(v, 3000) if v is not None else None


@api_router.get("/admin/orders")
async def admin_orders(status: Optional[str] = None, _: bool = Depends(require_admin)):
    await expire_orders()
    q = {}
    if status and status != "tutti":
        q["status"] = status
    rows = await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    counts = {}
    for st in ("in_attesa", "pagamento_visto", "confermato", "consegnato", "verifica_manuale", "rifiutato", "scaduto"):
        counts[st] = await db.orders.count_documents({"status": st})
    counts["tutti"] = sum(counts.values())
    counts["da_gestire"] = counts["verifica_manuale"] + counts["confermato"]
    totals = await spent_by_fan(None)
    return {"orders": rows, "counts": counts, "incassato": round(sum(totals.values()), 2),
            "unmatched": await db.unmatched_payments.count_documents({"assigned_to": None})}


@api_router.patch("/admin/orders/{code}")
async def admin_update_order(code: str, body: OrderAdminUpdate, _: bool = Depends(require_admin)):
    o = await db.orders.find_one({"code": code.upper()}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Ordine non trovato")
    extra = {}
    if body.admin_notes is not None:
        extra["admin_notes"] = body.admin_notes
    if body.delivery_message is not None:
        extra["delivery_message"] = body.delivery_message or None
    if body.amount_received_eur is not None:
        extra["amount_received_eur"] = round(body.amount_received_eur, 2)
    res = o
    if body.action == "conferma":
        if o["status"] in ("consegnato",):
            raise HTTPException(status_code=400, detail="Ordine gia' consegnato")
        res = await set_status(o["code"], "confermato", "creator", "Confermato manualmente dalla creator", extra)
    elif body.action == "rifiuta":
        if not body.reject_reason:
            raise HTTPException(status_code=400, detail="Indica il motivo del rifiuto (lo vede il fan)")
        res = await set_status(o["code"], "rifiutato", "creator", body.reject_reason, {**extra, "reject_reason": body.reject_reason})
    elif body.action == "consegnato":
        if o["status"] not in PAID_STATUSES:
            raise HTTPException(status_code=400, detail="Prima conferma il pagamento, poi segna come consegnato")
        res = await set_status(o["code"], "consegnato", "creator", "Contenuto consegnato", {**extra, "delivered_at": now_iso()})
    elif body.action == "verifica":
        res = await set_status(o["code"], "verifica_manuale", "creator", "Messo in verifica dalla creator", extra)
    elif body.action == "riapri":
        hours = int((await get_settings()).get("order_hours") or 48)
        res = await set_status(o["code"], "in_attesa", "creator", "Ordine riaperto dalla creator",
                               {**extra, "expires_at": (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat(), "reject_reason": None})
    elif extra:
        res = await db.orders.find_one_and_update({"code": o["code"]}, {"$set": {**extra, "updated_at": now_iso()}}, projection={"_id": 0}, return_document=True)
    else:
        raise HTTPException(status_code=400, detail="Nessuna modifica")
    return res


@api_router.get("/admin/payments/unmatched")
async def unmatched(_: bool = Depends(require_admin)):
    return await db.unmatched_payments.find({"assigned_to": None}, {"_id": 0}).sort("ts", -1).to_list(200)


class AssignBody(BaseModel):
    code: str


@api_router.post("/admin/payments/unmatched/{pid}/assign")
async def assign_unmatched(pid: str, body: AssignBody, _: bool = Depends(require_admin)):
    u = await db.unmatched_payments.find_one({"id": pid, "assigned_to": None}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=404, detail="Pagamento non trovato")
    o = await db.orders.find_one({"code": body.code.strip().upper()}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Ordine non trovato")
    t = pay.Transfer(u["txid"], u["network"], u["currency"], int(u["units"]), pay.METHODS[u["method"]]["decimals"], u.get("sender", ""), u.get("comment"), int(u["ts"]), bool(u.get("pending")))
    await apply_transfer(o, t)
    await db.unmatched_payments.update_one({"id": pid}, {"$set": {"assigned_to": o["code"], "assigned_at": now_iso()}})
    return await db.orders.find_one({"code": o["code"]}, {"_id": 0})


@api_router.delete("/admin/payments/unmatched/{pid}")
async def dismiss_unmatched(pid: str, _: bool = Depends(require_admin)):
    res = await db.unmatched_payments.update_one({"id": pid}, {"$set": {"assigned_to": "ignorato", "assigned_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pagamento non trovato")
    return {"ok": True}


class SepaBody(BaseModel):
    iban: str = ""
    holder: str = ""
    bank: str = ""
    note: str = ""


class SettingsBody(BaseModel):
    ton_address: str = ""
    ton_memo: str = ""
    tron_address: str = ""
    sepa: SepaBody = SepaBody()
    enabled: dict = {}
    discounts: dict = {}
    order_hours: int = 48
    texts: dict = {}


@api_router.get("/admin/payments/settings")
async def get_pay_settings(_: bool = Depends(require_admin)):
    s = await get_settings()
    s["methods"] = public_methods(s)
    return s


@api_router.put("/admin/payments/settings")
async def put_pay_settings(body: SettingsBody, _: bool = Depends(require_admin)):
    ton = body.ton_address.strip()
    tron = body.tron_address.strip()
    iban = re.sub(r"\s+", "", body.sepa.iban).upper()
    if ton and not pay.ton_raw(ton):
        raise HTTPException(status_code=400, detail="Indirizzo TON non valido (deve iniziare con UQ o EQ)")
    if tron and not pay.valid_tron_address(tron):
        raise HTTPException(status_code=400, detail="Indirizzo Tron non valido (inizia con T, 34 caratteri)")
    if iban and not pay.valid_iban(iban):
        raise HTTPException(status_code=400, detail="IBAN non valido")
    if not 1 <= body.order_hours <= 24 * 14:
        raise HTTPException(status_code=400, detail="Validita' ordine: da 1 a 336 ore")
    enabled = {m: bool(body.enabled.get(m, True)) for m in pay.METHODS}
    discounts = {}
    for m in pay.METHODS:
        try:
            d = float(body.discounts.get(m, 0) or 0)
        except (TypeError, ValueError):
            d = 0
        discounts[m] = min(max(d, 0), 50)
    texts = {k: (str(body.texts.get(k, DEFAULT_SETTINGS["texts"][k]) or "")).replace("<", "").replace(">", "")[:3000] for k in DEFAULT_SETTINGS["texts"]}
    doc = {
        "key": "payments", "ton_address": pay.ton_friendly(ton) if ton else "", "ton_memo": clean(body.ton_memo, 60) or "",
        "tron_address": tron,
        "sepa": {"iban": iban, "holder": clean(body.sepa.holder, 80) or "", "bank": clean(body.sepa.bank, 80) or "", "note": clean(body.sepa.note, 400) or ""},
        "enabled": enabled, "discounts": discounts, "order_hours": body.order_hours, "texts": texts, "updated_at": now_iso(),
    }
    await db.settings.update_one({"key": "payments"}, {"$set": doc}, upsert=True)
    s = await get_settings()
    s["methods"] = public_methods(s)
    return s


class VerifyBody(BaseModel):
    type: Literal["ton", "tron"]
    address: str


@api_router.post("/admin/payments/verify")
async def verify_address(body: VerifyBody, _: bool = Depends(require_admin)):
    if body.type == "ton":
        return await pay.check_ton_account(body.address.strip())
    return await pay.check_tron_account(body.address.strip())


@api_router.post("/admin/payments/scan")
async def admin_scan(_: bool = Depends(require_admin)):
    s = await get_settings()
    done = {n: await scan_network(n, s, force=True) for n in ("ton", "tron")}
    return {"scanned": done, "at": now_iso()}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.fans.create_index("username", unique=True)
    await db.fans.create_index("id", unique=True)
    await db.custom_requests.create_index("id", unique=True)
    await db.custom_requests.create_index("fan_id")
    await db.presence.create_index("sid", unique=True)
    await db.orders.create_index("code", unique=True)
    await db.orders.create_index("fan_id")
    await db.orders.create_index([("status", 1), ("payment.method", 1)])
    await db.payments_seen.create_index("txid", unique=True)
    await db.unmatched_payments.create_index("txid", unique=True)
    await db.settings.create_index("key", unique=True)
    app.state.watcher = asyncio.create_task(payment_watcher())


@app.on_event("shutdown")
async def shutdown_db_client():
    task = getattr(app.state, "watcher", None)
    if task:
        task.cancel()
    client.close()
