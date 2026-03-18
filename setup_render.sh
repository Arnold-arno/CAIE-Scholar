#!/usr/bin/env bash
# setup_render.sh — Validate the project is ready for Render.com deployment.
# Run this before pushing to GitHub / deploying.
# Usage: bash setup_render.sh
set -e

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
PASS=0; FAIL=0

check() {
  local label="$1"; local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $label"; PASS=$((PASS+1))
  else
    echo -e "  ${RED}✗${NC} $label"; FAIL=$((FAIL+1))
  fi
}

warn() { echo -e "  ${YELLOW}!${NC} $1"; }

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  CAIE Scholar — Render Deployment Checklist${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ── Files ─────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}Checking required files...${NC}"
check "backend/main.py exists"              "[ -f backend/main.py ]"
check "backend/requirements.txt exists"     "[ -f backend/requirements.txt ]"
check "backend/gunicorn.conf.py exists"     "[ -f backend/gunicorn.conf.py ]"
check "backend/Dockerfile exists"           "[ -f backend/Dockerfile ]"
check "frontend/Dockerfile exists"          "[ -f frontend/Dockerfile ]"
check "frontend/nginx.conf exists"          "[ -f frontend/nginx.conf ]"
check "docker-compose.yml exists"           "[ -f docker-compose.yml ]"
check "render.yaml exists"                  "[ -f render.yaml ]"

# ── Backend .env ──────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}Checking backend config...${NC}"
check "backend/.env.example exists"         "[ -f backend/.env.example ]"
if [ -f backend/.env ]; then
  warn ".env found — make sure it's in .gitignore (never commit secrets)"
else
  warn "No backend/.env — remember to set env vars on Render dashboard"
fi

# ── Frontend .env ─────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}Checking frontend config...${NC}"
check "frontend/.env.example exists"        "[ -f frontend/.env.example ]"
check "frontend/package.json exists"        "[ -f frontend/package.json ]"

# Check VITE_API_URL in render.yaml
if grep -q "VITE_API_URL" render.yaml; then
  check "render.yaml has VITE_API_URL"      "true"
  RENDER_URL=$(grep -A1 "VITE_API_URL" render.yaml | tail -1 | awk '{print $2}')
  if echo "$RENDER_URL" | grep -q "onrender.com"; then
    warn "VITE_API_URL in render.yaml is set to: $RENDER_URL"
    warn "Update this to your actual backend URL after first deploy"
  fi
fi

# ── Git ───────────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}Checking git...${NC}"
check ".gitignore exists"                   "[ -f .gitignore ]"
check ".env is gitignored"                  "grep -q '\.env' .gitignore"
check "*.pdf is gitignored"                 "grep -q '\.pdf' .gitignore"
check "data/ is gitignored"                 "grep -q 'data/' .gitignore"

if git rev-parse --git-dir > /dev/null 2>&1; then
  check "Git repo initialised"              "true"
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  warn "Current branch: $BRANCH"
else
  warn "Not a git repo yet — run: git init && git remote add origin <your-repo-url>"
fi

# ── Python syntax check ───────────────────────────────────────────────────────
echo -e "\n${YELLOW}Checking Python syntax...${NC}"
for f in backend/*.py; do
  check "$(basename $f) parses OK" "python3 -c 'import ast; ast.parse(open(\"$f\").read())'"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}"
if [ $FAIL -eq 0 ]; then
  echo -e "\n  ${GREEN}All checks passed — ready to deploy!${NC}"
  echo -e ""
  echo -e "  Deploy steps:"
  echo -e "    1. git add . && git commit -m 'ready for deploy'"
  echo -e "    2. git push origin main"
  echo -e "    3. Render.com → New → Blueprint → connect repo"
  echo -e "    4. After backend deploys, copy its URL into render.yaml VITE_API_URL"
  echo -e "    5. Trigger frontend redeploy"
else
  echo -e "\n  ${RED}Fix the failed checks before deploying.${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
