# WhatsApp Intel — Business Intelligence for Small Teams

Turn your team's WhatsApp updates into queryable business intelligence using Groq AI (LLaMA 3 70B).

## Tech Stack
- **Backend**: FastAPI + SQLite + Python
- **Frontend**: React + Bootstrap 5
- **AI**: Groq API (LLaMA 3 70B)
- **WhatsApp**: Meta Cloud API webhook integration

---

## Quick Start

### 1. Clone & Set Up Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Get Your Groq API Key
Go to https://console.groq.com → Create API Key → paste in `.env`

### 3. Start Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 4. Seed Demo Data (Optional)

```bash
cd backend
python seed_demo.py
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm start
```

Visit http://localhost:3000

---

## WhatsApp Integration

### Option A: Real WhatsApp (Production)
1. Create a Meta Developer App at https://developers.facebook.com
2. Enable WhatsApp Business API
3. Set webhook URL to: `https://yourdomain.com/webhook/whatsapp`
4. Set Verify Token to match `WHATSAPP_VERIFY_TOKEN` in your `.env`
5. Add your `WHATSAPP_APP_SECRET` to `.env`

### Option B: Manual Entry / Simulate
Use the "Add Update" page to add messages manually — no WhatsApp setup needed.

---

## How It Works

```
Team sends WhatsApp → Webhook receives → Saved to SQLite → You ask a question → 
Groq reads all messages → AI gives you a smart answer
```

**Example Questions:**
- "What's pending from this week?"
- "Did anyone follow up with Rajan?"
- "Who had the most sales activity today?"
- "What deals are close to closing?"
- "Summarize this week's team performance"

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages/` | List messages (filterable) |
| POST | `/api/messages/` | Add a message manually |
| DELETE | `/api/messages/{id}` | Delete a message |
| GET | `/api/messages/team/members` | List team members |
| POST | `/api/messages/team/members` | Add team member |
| GET | `/api/messages/stats/summary` | Dashboard stats |
| POST | `/api/query/ask` | Ask AI a question |
| GET | `/api/query/history` | Past questions |
| GET | `/api/query/suggestions` | Suggested questions |
| GET | `/webhook/whatsapp` | WhatsApp verification |
| POST | `/webhook/whatsapp` | Receive WhatsApp messages |
| POST | `/webhook/simulate` | Simulate a WhatsApp message |

Interactive API docs: http://localhost:8000/docs

---

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here          # Required
WHATSAPP_VERIFY_TOKEN=my_verify_token_123     # For webhook verification
WHATSAPP_APP_SECRET=your_app_secret          # For webhook security (optional)
DB_PATH=whatsapp_intel.db                     # SQLite database path
```

---

## Project Structure

```
whatsapp-intel/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLite setup & connection
│   ├── requirements.txt
│   ├── .env.example
│   ├── seed_demo.py         # Demo data seeder
│   └── routes/
│       ├── messages.py      # Message CRUD + team management
│       ├── query.py         # Groq AI query endpoint
│       └── webhook.py       # WhatsApp webhook handler
└── frontend/
    ├── public/index.html
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── api/index.js     # Axios API client
        ├── components/
        │   └── Sidebar.js
        └── pages/
            ├── Dashboard.js
            ├── QueryPage.js
            ├── MessagesPage.js
            ├── TeamPage.js
            └── SimulatePage.js
```
