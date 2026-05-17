import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "whatsapp_intel.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'Sales',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            phone TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT DEFAULT 'manual',
            message_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES team_members(id)
        );

        CREATE TABLE IF NOT EXISTS query_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(message_date);
        CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone);
    """)

    # Seed some demo team members
    cursor.execute("SELECT COUNT(*) FROM team_members")
    if cursor.fetchone()[0] == 0:
        demo_members = [
            ("+919876543210", "Arjun Sharma", "Sales Executive"),
            ("+919876543211", "Priya Nair", "Field Agent"),
            ("+919876543212", "Rohit Mehta", "Account Manager"),
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO team_members (phone, name, role) VALUES (?, ?, ?)",
            demo_members
        )

    conn.commit()
    conn.close()
