#!/bin/bash
echo "🚀 Starting WhatsApp Intel..."

# Start backend
cd backend
pip install -r requirements.txt -q
python seed_demo.py 2>/dev/null || true
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:8000"

# Start frontend
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!
echo "✅ Frontend starting on http://localhost:3000"

echo ""
echo "📱 WhatsApp Intel is running!"
echo "   Dashboard: http://localhost:3000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
wait
