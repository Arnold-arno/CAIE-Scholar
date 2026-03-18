#!/usr/bin/env bash
# setup_local.sh — Set up and start CAIE Scholar locally.
# Usage: bash setup_local.sh
# Windows users: run in Git Bash or WSL. Use Python 3.12, NOT 3.13/3.14.
# Python 3.12 download: https://www.python.org/downloads/release/python-3123/
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  CAIE Scholar — Local Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ── 1. Backend ────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/4] Setting up Python backend...${NC}"
cd backend

# Create virtualenv if it doesn't exist
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo -e "${GREEN}  ✓ Virtualenv created${NC}"
fi

# Activate
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo -e "${GREEN}  ✓ Python dependencies installed${NC}"

# Copy .env if needed
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}  ✓ .env created from .env.example${NC}"
else
  echo -e "${GREEN}  ✓ .env already exists${NC}"
fi

# Create data directories
mkdir -p data/papers data/markschemes data/cache
echo -e "${GREEN}  ✓ Data directories ready${NC}"

# ── 2. Frontend ───────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/4] Setting up frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
  npm install -q
  echo -e "${GREEN}  ✓ npm packages installed${NC}"
else
  echo -e "${GREEN}  ✓ node_modules already present${NC}"
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}  ✓ .env created${NC}"
fi

cd ..

# ── 3. Start backend ──────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/4] Starting backend (port 8000)...${NC}"
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend started (PID $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in $(seq 1 20); do
  sleep 1
  if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e " ${GREEN}ready!${NC}"
    break
  fi
  echo -n "."
done

cd ..

# ── 4. Start frontend ─────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[4/4] Starting frontend (port 5173)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend started (PID $FRONTEND_PID)${NC}"
cd ..

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  CAIE Scholar is running!${NC}"
echo -e ""
echo -e "  Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  API docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e ""
echo -e "  Press Ctrl+C to stop both services."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Keep script running; kill children on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
