from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from database import get_db

router = APIRouter()

class MessageCreate(BaseModel):
    phone: str
    sender_name: str
    content: str
    message_date: Optional[str] = None  # YYYY-MM-DD, defaults to today

class TeamMemberCreate(BaseModel):
    phone: str
    name: str
    role: Optional[str] = "Sales"

@router.post("/")
def add_message(msg: MessageCreate):
    conn = get_db()
    cursor = conn.cursor()
    msg_date = msg.message_date or date.today().isoformat()
    
    # Find member_id if exists
    cursor.execute("SELECT id FROM team_members WHERE phone = ?", (msg.phone,))
    row = cursor.fetchone()
    member_id = row["id"] if row else None

    cursor.execute(
        "INSERT INTO messages (member_id, phone, sender_name, content, source, message_date) VALUES (?, ?, ?, ?, 'manual', ?)",
        (member_id, msg.phone, msg.sender_name, msg.content, msg_date)
    )
    conn.commit()
    msg_id = cursor.lastrowid
    conn.close()
    return {"id": msg_id, "status": "saved"}

@router.get("/")
def get_messages(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    limit: int = Query(100)
):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT m.*, tm.name as member_name, tm.role FROM messages m LEFT JOIN team_members tm ON m.member_id = tm.id WHERE 1=1"
    params = []

    if from_date:
        query += " AND m.message_date >= ?"
        params.append(from_date)
    if to_date:
        query += " AND m.message_date <= ?"
        params.append(to_date)
    if phone:
        query += " AND m.phone = ?"
        params.append(phone)

    query += " ORDER BY m.message_date DESC, m.created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.delete("/{msg_id}")
def delete_message(msg_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE id = ?", (msg_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@router.get("/team/members")
def get_team_members():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM team_members ORDER BY name")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/team/members")
def add_team_member(member: TeamMemberCreate):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO team_members (phone, name, role) VALUES (?, ?, ?)",
            (member.phone, member.name, member.role)
        )
        conn.commit()
        member_id = cursor.lastrowid
        conn.close()
        return {"id": member_id, "status": "created"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats/summary")
def get_summary_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM messages")
    total = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as total FROM messages WHERE message_date = date('now')")
    today = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM messages WHERE message_date >= date('now', '-7 days')")
    this_week = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM team_members")
    team_count = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM query_history")
    queries_made = cursor.fetchone()["total"]

    conn.close()
    return {
        "total_messages": total,
        "today": today,
        "this_week": this_week,
        "team_members": team_count,
        "queries_made": queries_made
    }
