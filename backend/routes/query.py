from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date, timedelta
import os
import logging
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv
from database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

def get_groq_client():
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured. Please set it in your .env file.")
    return Groq(api_key=groq_api_key)

def fetch_messages_for_context(days: int = 7) -> str:
    conn = get_db()
    cursor = conn.cursor()
    from_date = (date.today() - timedelta(days=days)).isoformat()
    
    cursor.execute("""
        SELECT m.message_date, m.sender_name, m.phone, m.content, tm.role
        FROM messages m
        LEFT JOIN team_members tm ON m.member_id = tm.id
        WHERE m.message_date >= ?
        ORDER BY m.message_date ASC, m.created_at ASC
    """, (from_date,))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return "No messages found for this period."
    
    lines = []
    for row in rows:
        role = f" ({row['role']})" if row['role'] else ""
        lines.append(f"[{row['message_date']}] {row['sender_name']}{role}: {row['content']}")
    
    return "\n".join(lines)

def fetch_all_messages_context() -> str:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.message_date, m.sender_name, m.phone, m.content, tm.role
        FROM messages m
        LEFT JOIN team_members tm ON m.member_id = tm.id
        ORDER BY m.message_date ASC, m.created_at ASC
        LIMIT 500
    """)
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return "No messages in the database yet."
    
    lines = []
    for row in rows:
        role = f" ({row['role']})" if row['role'] else ""
        lines.append(f"[{row['message_date']}] {row['sender_name']}{role}: {row['content']}")
    return "\n".join(lines)

class QueryRequest(BaseModel):
    question: str
    days_context: Optional[int] = 7  # how many days of messages to include

class QueryResponse(BaseModel):
    question: str
    answer: str
    messages_analyzed: int

@router.post("/ask", response_model=QueryResponse)
def ask_question(req: QueryRequest):
    conn = None
    try:
        client = get_groq_client()

        # Fetch messages
        context = fetch_messages_for_context(req.days_context)

        # Count messages
        conn = get_db()
        cursor = conn.cursor()
        from_date = (date.today() - timedelta(days=req.days_context)).isoformat()
        cursor.execute("SELECT COUNT(*) as c FROM messages WHERE message_date >= ?", (from_date,))
        msg_count = cursor.fetchone()["c"]

        system_prompt = f"""You are a smart business intelligence assistant for a small business owner in India.
Your job is to analyze WhatsApp updates sent by the sales/field team and answer the owner's questions clearly and helpfully.

Today's date: {date.today().isoformat()}

The messages below are team updates from the last {req.days_context} days.
Each line format: [DATE] Person Name (Role): message content

TEAM MESSAGES:
{context}

INSTRUCTIONS:
- Answer the owner's question directly and clearly
- If asked about pending items, list them with who they're assigned to
- If asked about a specific person, summarize their activity
- If asked about sales/deals, extract numbers and names where available
- If something is not mentioned in the messages, say so honestly
- Be concise but complete — bullet points are fine for lists
- Use Indian business context (rupees, common names, etc.)
- Never make up information not in the messages
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.question}
            ],
            temperature=0.3,
            max_tokens=1024
        )

        answer = response.choices[0].message.content

        # Save to history
        cursor.execute(
            "INSERT INTO query_history (question, answer) VALUES (?, ?)",
            (req.question, answer)
        )
        conn.commit()

        return QueryResponse(
            question=req.question,
            answer=answer,
            messages_analyzed=msg_count
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to answer query")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")
    finally:
        if conn is not None:
            conn.close()

@router.get("/history")
def get_query_history(limit: int = 20):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM query_history ORDER BY created_at DESC LIMIT ?", (limit,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/suggestions")
def get_query_suggestions():
    return {
        "suggestions": [
            "What's pending from this week?",
            "Did anyone follow up with Rajan?",
            "Who had the most sales activity today?",
            "What deals are close to closing?",
            "Summarize this week's team performance",
            "Which clients were visited this week?",
            "Are there any blockers or issues reported?",
            "What was the total revenue discussed this week?",
            "Who hasn't sent an update recently?",
            "What follow-ups are due tomorrow?"
        ]
    }
