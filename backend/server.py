from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import hmac
import time
import bcrypt
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Literal
import uuid
import jwt
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta

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
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class RequestUpdate(BaseModel):
    status: Optional[Status] = None
    internal_notes: Optional[str] = None
    amount_paid: Optional[float] = None


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


@api_router.get("/topfans")
async def top_fans():
    start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    pipeline = [
        {"$match": {"status": "completata", "fan_id": {"$ne": None}, "amount_paid": {"$gt": 0}, "updated_at": {"$gte": start}}},
        {"$group": {"_id": "$fan_id", "total": {"$sum": "$amount_paid"}}},
        {"$sort": {"total": -1}},
        {"$limit": 10},
    ]
    rows = await db.custom_requests.aggregate(pipeline).to_list(10)
    out = []
    for i, r in enumerate(rows):
        f = await db.fans.find_one({"id": r["_id"]}, {"_id": 0, "display_name": 1})
        out.append({"rank": i + 1, "name": short_name(f["display_name"]) if f else "Fan", "total": round(r["total"], 2)})
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
    orders = await db.custom_requests.find(
        {"fan_id": fan["id"]}, {"_id": 0, "internal_notes": 0}
    ).sort("created_at", -1).to_list(200)
    unlocked = [o for o in orders if o["status"] == "completata"]
    spent = round(sum(o.get("amount_paid") or 0 for o in unlocked), 2)
    return {"fan": fan, "orders": orders, "unlocked": unlocked, "spent": spent}


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
    agg = await db.custom_requests.aggregate([
        {"$match": {"status": "completata"}},
        {"$group": {"_id": None, "t": {"$sum": "$amount_paid"}}},
    ]).to_list(1)
    out["incassato"] = round(agg[0]["t"], 2) if agg else 0
    return out


@api_router.patch("/admin/requests/{req_id}", response_model=CustomRequest)
async def update_request(req_id: str, body: RequestUpdate, _: bool = Depends(require_admin)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if "internal_notes" in upd:
        upd["internal_notes"] = clean(upd["internal_notes"], 3000) or ""
    if "amount_paid" in upd:
        if upd["amount_paid"] < 0 or upd["amount_paid"] > 100000:
            raise HTTPException(status_code=400, detail="Importo non valido")
        upd["amount_paid"] = round(upd["amount_paid"], 2)
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


@api_router.get("/content")
async def get_content():
    docs = await db.site_content.find({}, {"_id": 0}).to_list(2000)
    return {d["key"]: d["value"] for d in docs}


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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
