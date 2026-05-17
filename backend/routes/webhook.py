from fastapi import APIRouter, Request, HTTPException, Query
from datetime import date
import hashlib
import hmac
import os
import json
from database import get_db

router = APIRouter()

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "my_verify_token_123")
WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET", "")

@router.get("/whatsapp")
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """WhatsApp webhook verification endpoint"""
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp")
async def receive_whatsapp(request: Request):
    """Receive incoming WhatsApp messages"""
    body = await request.body()
    
    # Verify signature if secret is set
    if WHATSAPP_APP_SECRET:
        signature = request.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(
            WHATSAPP_APP_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        data = json.loads(body)
        process_whatsapp_payload(data)
    except Exception as e:
        pass  # Always return 200 to WhatsApp

    return {"status": "ok"}

def process_whatsapp_payload(data: dict):
    """Parse WhatsApp Cloud API payload and save messages"""
    try:
        entry = data.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        
        messages = value.get("messages", [])
        contacts = value.get("contacts", [])
        
        contact_map = {}
        for c in contacts:
            wa_id = c.get("wa_id", "")
            name = c.get("profile", {}).get("name", "Unknown")
            contact_map[wa_id] = name

        conn = get_db()
        cursor = conn.cursor()

        for msg in messages:
            if msg.get("type") != "text":
                continue
            
            phone = "+" + msg.get("from", "")
            text = msg.get("text", {}).get("body", "")
            sender_name = contact_map.get(msg.get("from", ""), phone)

            # Lookup team member
            cursor.execute("SELECT id FROM team_members WHERE phone = ?", (phone,))
            row = cursor.fetchone()
            member_id = row["id"] if row else None

            cursor.execute(
                "INSERT INTO messages (member_id, phone, sender_name, content, source, message_date) VALUES (?, ?, ?, ?, 'whatsapp', ?)",
                (member_id, phone, sender_name, text, date.today().isoformat())
            )

        conn.commit()
        conn.close()
    except Exception as e:
        pass

@router.post("/simulate")
async def simulate_whatsapp_message(request: Request):
    """Simulate a WhatsApp message for testing (no auth required)"""
    body = await request.json()
    phone = body.get("phone", "+919999999999")
    sender_name = body.get("sender_name", "Test User")
    content = body.get("content", "Test message")
    message_date = body.get("message_date", date.today().isoformat())

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM team_members WHERE phone = ?", (phone,))
    row = cursor.fetchone()
    member_id = row["id"] if row else None

    cursor.execute(
        "INSERT INTO messages (member_id, phone, sender_name, content, source, message_date) VALUES (?, ?, ?, ?, 'whatsapp_sim', ?)",
        (member_id, phone, sender_name, content, message_date)
    )
    conn.commit()
    msg_id = cursor.lastrowid
    conn.close()
    return {"id": msg_id, "status": "simulated"}
