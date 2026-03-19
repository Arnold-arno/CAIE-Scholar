# CAIE Scholar — Complete Setup Guide

This guide walks you through setting up CAIE Scholar on your computer from scratch, including Windows-specific instructions and explanations of every dependency.

---

## Prerequisites

### Node.js (for the frontend)
Download and install Node.js **v18 or newer** from [nodejs.org](https://nodejs.org).  
Check your version: `node --version`

### Python (for the backend)
**Use Python 3.12.** Not 3.13, not 3.14 — specifically **3.12**.

> **Why 3.12?** Two of the backend packages (`pydantic-core` and `lxml`) are compiled extensions. On Python 3.14, no pre-built `.whl` files exist yet, so pip tries to compile them from source — which requires Microsoft C++ Build Tools (for `lxml`) and the Rust toolchain (for `pydantic-core`). Python 3.12 has pre-built wheels for both, so nothing needs compiling.

Download Python 3.12: [python.org/downloads/release/python-3123](https://www.python.org/downloads/release/python-3123/)

During installation on Windows, tick **"Add Python to PATH"**.  
Check your version: `python --version`

---

## Quick start (all platforms)

```
Buddy/
├── backend/    ← Python FastAPI server
├── frontend/   ← React app
└── SETUP.md    ← this file
```

### Option A — One command (Mac/Linux)

```bash
bash setup_local.sh
```

### Option B — Manual setup (Windows recommended)

**Terminal 1 — Backend**

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend** (open a new terminal window)

```cmd
cd frontend
npm install
copy .env.example .env
npm run dev
```

Once both are running:

| What | URL |
|------|-----|
| App (frontend) | http://localhost:5173 |
| API (backend)  | http://localhost:8000 |
| API docs       | http://localhost:8000/docs |

---

## Windows-specific notes

### lxml fails to install
`lxml` is a C extension. On Python 3.14 or without Build Tools installed, it will fail.

**Fix — comment out lxml in requirements.txt:**

Open `backend/requirements.txt` and change:
```
lxml==5.3.0
```
to:
```
# lxml==5.3.0
```

The app uses `html.parser` (built into Python) as its HTML parser. `lxml` is only
a speed optimisation. Removing it has no visible effect on functionality.

### gunicorn fails to install or run
`gunicorn` does not support Windows. It is the production server used on Linux (Render, Docker).

For local development on Windows, **you don't need gunicorn at all.** Use `uvicorn` instead:

```cmd
uvicorn main:app --reload --port 8000
```

If `pip install -r requirements.txt` fails because of gunicorn, comment it out:
```
# gunicorn==23.0.0
```

### pydantic-core fails (Rust linker error)
This happens on Python 3.13 or 3.14 and means you need to downgrade Python.

**Fix:** Uninstall Python 3.14, install Python 3.12, delete `.venv`, and run setup again.

---

## What each dependency does

### Backend (`backend/requirements.txt`)

| Package | Used in | Role | Can I remove it? |
|---------|---------|------|------------------|
| `fastapi` | `main.py`, all routes | The web framework — handles HTTP requests, routing, validation | **No — core** |
| `uvicorn[standard]` | Started from command line | The ASGI server that actually runs FastAPI | **No — core** |
| `gunicorn` | `gunicorn.conf.py` | Production process manager — spawns multiple uvicorn workers for performance | Windows: yes. Linux/Mac prod: no |
| `python-multipart` | FastAPI internals | Lets FastAPI parse file uploads and HTML form data. Required if any route uses `Form()` or `UploadFile` | Safe to keep — tiny, pure Python |
| `pydantic` | `schemas.py` | Defines all data models (PaperResult, SearchResponse, etc.) with automatic validation and type checking | **No — core** |
| `pydantic-settings` | `config.py` | Reads your `.env` file into a typed `Settings` object | **No — used** |
| `httpx` | `scraper_base.py` | Async HTTP client — makes requests to PapaCambridge and GCE Guide to fetch paper PDFs and listings | **No — core** |
| `beautifulsoup4` | `scraper_gceguide.py` | Parses the HTML pages from GCE Guide to extract paper download links | **No — used for GCE Guide fallback** |
| `lxml` | Not directly called | A faster C-based HTML parser that BeautifulSoup can use. The app already specifies `html.parser` (stdlib), so lxml is never actually invoked | **Yes — safe to remove** |
| `python-dotenv` | via `pydantic-settings` | Loads your `.env` file into `os.environ` at startup | **No — needed to read config** |
| `pytest` | Test runner (not yet used) | Runs test files (`test_*.py`). No tests exist yet | **Yes — comment out if not testing** |
| `pytest-asyncio` | Test runner (not yet used) | Extends pytest to run `async def` test functions (needed for testing FastAPI async routes) | **Yes — comment out if not testing** |

### Removed dependencies (and why they were removed)

**`pypdf==5.1.0` — removed because it is not used**

`pypdf` is a pure-Python library for reading and manipulating PDF files. It was listed in `requirements.txt` but is not imported in any `.py` file in the backend. Its intended use was reading PDF metadata — page count, title, author — from cached papers, but that feature was never implemented. It has been commented out to avoid an unnecessary install. If you later want to show "12 pages" alongside each paper result, add `from pypdf import PdfReader` to `service_pdf.py` and uncomment `pypdf` in requirements.

**`lxml==5.3.0` — conditionally removed (safe to comment out)**

`lxml` is an XML/HTML parser written in C — extremely fast, but requires compilation. BeautifulSoup (which parses GCE Guide pages) can use three parsers: `lxml`, `html5lib`, or Python's built-in `html.parser`. The scraper explicitly passes `"html.parser"` as the parser, so `lxml` is never invoked even when installed. On Windows and newer Python versions where lxml fails to compile, simply comment it out in `requirements.txt` — the app works identically without it.

---

## Frontend dependencies

The frontend uses [npm](https://npmjs.com). All packages are listed in `frontend/package.json` and install automatically with `npm install`. No manual action needed. Key packages:

| Package | Role |
|---------|------|
| `react` + `react-dom` | UI library |
| `vite` | Dev server and build tool |
| `tailwindcss` | Utility CSS framework |
| `@radix-ui/*` | Accessible UI components (shadcn/ui) |
| `framer-motion` | Animations |
| `@tanstack/react-query` | Data fetching and caching |
| `react-router-dom` | Client-side routing |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |

---

## Environment variables

Copy `.env.example` to `.env` in the `backend/` folder before running the backend.

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | IP to bind the server to |
| `PORT` | `8000` | Port the backend listens on |
| `DEBUG` | `false` | Enable debug mode (more logging) |
| `ALLOWED_ORIGINS` | `["http://localhost:5173"]` | Allowed frontend URLs (CORS) |
| `CACHE_TTL_SEARCH` | `3600` | How long to cache search results (seconds) |
| `CACHE_TTL_PDF` | `86400` | How long to cache downloaded PDFs (seconds) |
| `SCRAPER_TIMEOUT` | `15` | Max seconds to wait for a paper source to respond |
| `SCRAPER_MAX_RETRIES` | `3` | How many times to retry a failed request |
| `API_KEY` | *(empty)* | Optional secret key — leave blank to disable |

The frontend only needs one variable, in `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

---

## Docker (optional)

If you have Docker Desktop installed you can run everything with one command and skip Python/Node setup entirely:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend  | http://localhost:8000 |

---

## Deploy to Render.com (free tier)

1. Push the project to a GitHub repository
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render detects `render.yaml` automatically
4. After the backend deploys, copy its URL into `render.yaml` as `VITE_API_URL`
5. Trigger a frontend redeploy

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'fastapi'`**  
You forgot to activate the virtual environment. Run `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Mac/Linux) first.

**`lxml` build error / `pydantic-core` Rust error**  
You're using Python 3.13 or 3.14. Switch to Python 3.12 and recreate the `.venv`.

**`gunicorn` fails on Windows**  
Expected — gunicorn doesn't support Windows. Use `uvicorn main:app --reload --port 8000` instead and comment out `gunicorn` in `requirements.txt`.

**Frontend shows "API offline"**  
The backend isn't running. Make sure `uvicorn main:app --reload --port 8000` is running in a separate terminal.

**`npm install` hangs or fails**  
Make sure Node.js is version 18 or newer (`node --version`). Delete the `node_modules` folder if it exists and try again.

**CORS error in browser console**  
Make sure `VITE_API_URL` in `frontend/.env` matches the port your backend is running on, and that the same URL is in `ALLOWED_ORIGINS` in `backend/.env`.

---

## Render.com — Python version fix

Render defaults to the latest Python (currently 3.14) which breaks `pydantic-core`. The fix is already applied in the repo — three files pin Python 3.12:

| File | Purpose |
|------|---------|
| `backend/.python-version` | Primary signal — Render reads this first |
| `backend/runtime.txt` | Fallback for older Render behaviour |
| `render.yaml` → `pythonVersion: "3.12.3"` | Blueprint-level override |

If your deploy still shows Python 3.14 after pushing these files, go to your backend service in the Render dashboard → **Settings → Environment** and add a variable manually:

```
Key:   PYTHON_VERSION
Value: 3.12.3
```

Then click **Manual Deploy → Clear build cache & deploy**.

### What the error means

```
error: failed to create directory `.../cargo/registry/cache/...`
Caused by: Read-only file system (os error 30)
```

This means Render's build container tried to compile `pydantic-core` from Rust source because there was no pre-built wheel for Python 3.14. On Python 3.12 the wheel downloads instantly — no compilation, no Rust, no error.

---

## Enabling AI Notes (requires Anthropic API key)

AI Notes are powered by Claude. To enable them:

1. Get a free API key from [console.anthropic.com](https://console.anthropic.com)
2. Open `backend/.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   ```
3. Restart the backend (`uvicorn main:app --reload --port 8000`)

The key never leaves your backend server — the frontend calls `/api/ai/notes` on your own backend, which adds the key before forwarding to Anthropic.

**Without the key:** AI Notes shows a 503 error. All other features (search, PDF viewer, timer, mark schemes) continue to work normally.
