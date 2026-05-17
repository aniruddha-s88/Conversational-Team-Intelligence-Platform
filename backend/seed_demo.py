"""Run this to populate your DB with demo data for testing"""
import sqlite3
from datetime import date, timedelta
import random
import os

DB_PATH = os.getenv("DB_PATH", "whatsapp_intel.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Demo messages
demo_messages = [
    # Arjun
    ("+919876543210", "Arjun Sharma", "Met Rajan from TechCorp today. He's interested in the 50-unit order. Said he'll confirm by Friday. Pending pricing approval from his side.", -6),
    ("+919876543210", "Arjun Sharma", "Closed deal with Mehta Enterprises - 20 units at ₹45,000 each. Payment terms NET30. Will send invoice tomorrow.", -5),
    ("+919876543210", "Arjun Sharma", "Called Rajan, no response. Will try again tomorrow morning.", -4),
    ("+919876543210", "Arjun Sharma", "Visited Sunrise Traders. They want a demo next week. Scheduled for Tuesday 11am.", -3),
    ("+919876543210", "Arjun Sharma", "Rajan finally replied - needs a revised quote with 5% discount. Sent revised quote. Waiting for approval.", -2),
    ("+919876543210", "Arjun Sharma", "Follow up pending with Sunrise Traders for demo confirmation. Also need to collect payment from Mehta Enterprises.", -1),
    # Priya
    ("+919876543211", "Priya Nair", "Attended trade fair in Koramangala. Collected 12 new leads. Will qualify them this week.", -6),
    ("+919876543211", "Priya Nair", "Called 8 leads from trade fair. 3 interested, 5 not relevant. Meeting set with GlobalPrint on Thursday.", -5),
    ("+919876543211", "Priya Nair", "GlobalPrint meeting went well. They need 100 units. But budget approval is with their HQ in Mumbai. Following up.", -4),
    ("+919876543211", "Priya Nair", "Spoke to GlobalPrint HQ. Budget approved for Q3. Will sign contract next month. Big deal!", -3),
    ("+919876543211", "Priya Nair", "Visited 3 existing clients for relationship management. All happy. Kapoor & Sons might expand order by 30 units.", -2),
    ("+919876543211", "Priya Nair", "Pending: GlobalPrint contract to be sent. Follow up with Kapoor & Sons on expanded order.", -1),
    # Rohit
    ("+919876543212", "Rohit Mehta", "Account review with Sterling Industries. They raised a complaint about delayed delivery last month. Escalated to operations team.", -6),
    ("+919876543212", "Rohit Mehta", "Operations resolved Sterling issue. Gave them 2% discount on next order as goodwill. Client satisfied now.", -5),
    ("+919876543212", "Rohit Mehta", "Renewal discussion with Patel Group - contract expires next month. They want 10% better rate. Discussing internally.", -4),
    ("+919876543212", "Rohit Mehta", "Patel Group renewal: proposed 7% discount, they accepted. Contract renewal worth ₹12 lakhs. Sending paperwork.", -3),
    ("+919876543212", "Rohit Mehta", "New inbound inquiry from Bharat Logistics - 200 units. Very promising. Meeting scheduled for Monday.", -2),
    ("+919876543212", "Rohit Mehta", "Today: Pending items - Bharat Logistics meeting prep, Patel Group paperwork signing, monthly report for management.", 0),
]

for phone, name, content, days_offset in demo_messages:
    msg_date = (date.today() + timedelta(days=days_offset)).isoformat()
    cursor.execute("SELECT id FROM team_members WHERE phone = ?", (phone,))
    row = cursor.fetchone()
    member_id = row[0] if row else None
    cursor.execute(
        "INSERT INTO messages (member_id, phone, sender_name, content, source, message_date) VALUES (?, ?, ?, ?, 'demo', ?)",
        (member_id, phone, name, content, msg_date)
    )

conn.commit()
conn.close()
print(f"✅ Inserted {len(demo_messages)} demo messages into {DB_PATH}")
