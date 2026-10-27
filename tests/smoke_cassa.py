"""Smoke test della cassa (backend). Uso: python tests/smoke_cassa.py"""
import os
import random
import re
import sys

import httpx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def env(path, key):
    for line in open(path, encoding="utf-8"):
        if line.startswith(key + "="):
            return line.strip().split("=", 1)[1].strip().strip('"').strip("'")
    return None


B = env(f"{ROOT}/frontend/.env", "REACT_APP_BACKEND_URL").rstrip("/")
AP = env(f"{ROOT}/backend/.env", "ADMIN_PASSWORD")
c = httpx.Client(base_url=B, timeout=40)


def ok(label, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + label, extra)
    if not cond:
        sys.exit(1)


r = c.post("/api/admin/login", json={"password": AP})
ok("admin login", r.status_code == 200, r.text[:120])
AH = {"Authorization": f"Bearer {r.json()['token']}"}

r = c.put("/api/admin/payments/settings", headers=AH, json={
    "ton_address": "UQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_p0p",
    "tron_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    "sepa": {"iban": "IT60 X054 2811 1010 0000 0123 456", "holder": "Test Holder", "bank": "Banca Test", "note": ""},
    "enabled": {"ton": True, "usdt_ton": True, "usdt_trc20": True, "sepa": True},
    "discounts": {"ton": 5, "sepa": 0}, "order_hours": 48, "texts": {},
})
ok("settings salvate", r.status_code == 200 and all(m["available"] for m in r.json()["methods"]), str([(m["id"], m["available"]) for m in r.json().get("methods", [])]))

r = c.put("/api/admin/payments/settings", headers=AH, json={"ton_address": "abc", "tron_address": "", "sepa": {}, "enabled": {}, "discounts": {}, "order_hours": 48, "texts": {}})
ok("indirizzo TON invalido rifiutato", r.status_code == 400, r.text[:100])

u = f"tfan{random.randint(1000, 99999)}"
r = c.post("/api/fans/register", json={"username": u, "display_name": "Test Fan", "code": "codice123", "is_adult": True})
ok("fan registrato", r.status_code == 200, u)
FH = {"Authorization": f"Bearer {r.json()['token']}"}

r = c.get("/api/pay/quote", params={"kind": "offer", "ref": "premium"})
ok("quote premium", r.status_code == 200 and r.json()["item"]["price_eur"] == 49.99, str(r.json()["item"]["price_eur"]))

r = c.post("/api/orders", headers=FH, json={"kind": "offer", "ref": "premium", "method": "usdt_ton", "accept_terms": True, "is_adult": True})
ok("ordine creato usdt_ton", r.status_code == 200, r.text[:200])
o = r.json()
code = o["code"]
ok("codice formato", re.fullmatch(r"KV-[A-Z0-9]{6}", code) is not None, code)
ok("importo crypto e link", o["payment"]["currency"] == "USDT" and "tonkeeper" in o["payment"]["links"], o["payment"]["amount"])

r = c.post("/api/orders", headers=FH, json={"kind": "offer", "ref": "premium", "method": "usdt_ton", "accept_terms": True, "is_adult": True})
ok("duplicato evitato", r.status_code == 200 and r.json()["code"] == code)

r = c.get(f"/api/orders/{code}/tonconnect", headers=FH, params={"owner": "UQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_p0p"})
ok("tonconnect jetton tx", r.status_code == 200 and r.json()["messages"][0]["amount"] == "50000000", r.text[:120])

r = c.patch(f"/api/orders/{code}/method", headers=FH, json={"method": "ton"})
ok("cambio metodo -> TON con sconto 5%", r.status_code == 200 and r.json()["discount_pct"] == 5 and r.json()["total_eur"] == 47.49, str(r.json().get("total_eur")))
r = c.get(f"/api/orders/{code}/tonconnect", headers=FH)
ok("tonconnect ton tx", r.status_code == 200 and r.json()["messages"][0]["payload"].startswith("te6"))

r = c.patch(f"/api/orders/{code}/method", headers=FH, json={"method": "sepa"})
ok("cambio metodo -> SEPA", r.status_code == 200 and r.json()["payment"]["iban"] == "IT60X0542811101000000123456" and r.json()["payment"]["reference"] == code)

r = c.get(f"/api/orders/{code}")
ok("ordine protetto senza login", r.status_code == 401)

r = c.post(f"/api/orders/{code}/paid", headers=FH, json={"reference": "CRO12345"})
ok("ho pagato (sepa) -> verifica_manuale", r.status_code == 200 and r.json()["status"] == "verifica_manuale")

r = c.patch(f"/api/admin/orders/{code}", headers=AH, json={"action": "consegnato"})
ok("consegnato prima di conferma bloccato", r.status_code == 400)
r = c.patch(f"/api/admin/orders/{code}", headers=AH, json={"action": "conferma", "delivery_message": "Link privato: https://example.com/x"})
ok("admin conferma", r.status_code == 200 and r.json()["status"] == "confermato")
r = c.patch(f"/api/admin/orders/{code}", headers=AH, json={"action": "consegnato"})
ok("admin consegnato", r.status_code == 200 and r.json()["status"] == "consegnato")

r = c.get("/api/fans/me", headers=FH)
d = r.json()
ok("fans/me acquisti e speso", d["spent"] == 49.99 and len(d["purchases"]) == 1 and d["unlocked"][0]["name"] == "Premium", str(d["spent"]))

# richiesta personalizzata -> prezzo accettato -> paga ora
r = c.post("/api/requests", headers=FH, json={"contact_channel": "telegram", "contact_handle": "@testfan", "request_type": "video", "description": "Video personalizzato di prova per il test", "is_adult": True})
ok("richiesta creata", r.status_code == 200)
rid = r.json()["id"]
r = c.get("/api/pay/quote", headers=FH, params={"kind": "request", "request_id": rid})
ok("richiesta senza prezzo non pagabile", r.status_code == 400)
r = c.patch(f"/api/admin/requests/{rid}", headers=AH, json={"accepted_price": 35, "admin_reply": "Perfetto, 35 euro e consegna in 3 giorni"})
ok("prezzo accettato", r.status_code == 200 and r.json()["accepted_price"] == 35)
r = c.get("/api/fans/me", headers=FH)
ok("payable contiene richiesta", rid in r.json()["payable"])
r = c.post("/api/orders", headers=FH, json={"kind": "request", "request_id": rid, "method": "usdt_trc20", "accept_terms": True, "is_adult": True})
ok("ordine richiesta trc20", r.status_code == 200 and r.json()["total_eur"] == 35 and r.json()["payment"]["network"] == "tron", r.text[:150])
code2 = r.json()["code"]
r = c.post(f"/api/orders/{code2}/paid", headers=FH, json={"txid": "abc123"})
ok("ho pagato crypto senza tx -> verifica_manuale", r.status_code == 200 and r.json()["status"] == "verifica_manuale", r.json().get("status"))
r = c.patch(f"/api/admin/orders/{code2}", headers=AH, json={"action": "rifiuta", "reject_reason": "Pagamento non trovato"})
ok("rifiuto con motivo", r.status_code == 200 and r.json()["reject_reason"] == "Pagamento non trovato")
r = c.patch(f"/api/admin/orders/{code2}", headers=AH, json={"action": "riapri"})
ok("riapri", r.status_code == 200 and r.json()["status"] == "in_attesa")
r = c.patch(f"/api/admin/orders/{code2}", headers=AH, json={"action": "conferma"})
ok("conferma richiesta -> in_lavorazione", r.status_code == 200)
r = c.get("/api/admin/requests", headers=AH, params={"status": "in_lavorazione"})
ok("richiesta aggiornata con ordine", any(x["id"] == rid and x.get("order_code") == code2 for x in r.json()))

r = c.get("/api/admin/orders", headers=AH)
ok("admin orders", r.status_code == 200 and r.json()["counts"]["tutti"] >= 2, str(r.json()["counts"]))
r = c.get("/api/topfans")
ok("topfans include fan", any(x["total"] >= 84.99 for x in r.json()), r.text[:120])
r = c.post("/api/admin/payments/scan", headers=AH)
ok("scan reti", r.status_code == 200, r.text)
r = c.post("/api/admin/payments/verify", headers=AH, json={"type": "tron", "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"})
ok("verifica indirizzo tron", r.status_code == 200 and r.json()["ok"], r.text[:100])
r = c.get("/api/admin/payments/unmatched", headers=AH)
ok("unmatched list", r.status_code == 200, f"{len(r.json())} pagamenti non riconosciuti (indirizzi di test pubblici)")
print("TUTTO OK")
