from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from pathlib import Path
from dotenv import load_dotenv

from database import init_db
from routes import messages, query, webhook

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(
    title="WhatsApp Business Intel API",
    description="Turn WhatsApp team updates into queryable business intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()
    logger.info("Database initialized")

app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(query.router, prefix="/api/query", tags=["Query"])
app.include_router(webhook.router, prefix="/webhook", tags=["Webhook"])

@app.get("/")
def root():
    return {"status": "ok", "message": "WhatsApp Intel API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
