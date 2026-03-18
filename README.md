# CAIE Scholar

Cambridge IGCSE, AS & A-Level, and O-Level past paper companion.

Search real Cambridge past papers from PapaCambridge and GCE Guide, view question papers and mark schemes side by side, generate AI study notes with diagrams, and track study time with a Pomodoro timer — all in one app.

**→ See [SETUP.md](./SETUP.md) for full installation instructions, dependency explanations, and troubleshooting.**

---

## What's inside

```
Buddy/
├── backend/                     Python 3.12 · FastAPI · Uvicorn
│   ├── main.py                  App entry point
│   ├── config.py                Settings loaded from .env
│   ├── schemas.py               Pydantic request/response models
│   ├── subjects.py              Cambridge subject registry (IGCSE / AS / O)
│   ├── cache.py                 Two-level cache (memory + disk JSON)
│   ├── scraper_base.py          Shared async HTTP client with retry logic
│   ├── scraper_papacambridge.py Primary source — direct URL construction
│   ├── scraper_gceguide.py      Fallback source — HTML page parser
│   ├── local_store.py           Local PDF file index and I/O
│   ├── service_search.py        Search orchestration across all sources
│   ├── service_pdf.py           PDF fetch, cache, and stream
│   ├── routes_health.py         GET /api/health
│   ├── routes_search.py         GET /api/search, /api/search/subjects
│   ├── routes_papers.py         GET /api/papers/view, /download
│   ├── routes_markschemes.py    GET /api/markschemes/view, /download
│   ├── routes_downloads.py      POST/GET/DELETE /api/downloads
│   ├── gunicorn.conf.py         Production server config (Linux/Mac only)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                    React 18 · Vite · Tailwind · shadcn/ui
│   ├── src/
│   │   ├── context/AppContext.jsx      All state — subjects, history, favourites
│   │   ├── components/academic/
│   │   │   ├── QuestionSearch.jsx      Paper search + last 8 recent searches
│   │   │   ├── PaperViewer.jsx         Split QP/MS viewer with Download+View
│   │   │   ├── AINotesGenerator.jsx    Claude AI notes + diagrams + PDF export
│   │   │   ├── StudyTimer.jsx          Pomodoro timer + weekly goal + streak
│   │   │   ├── MySubjects.jsx          Per-level subject management
│   │   │   └── Onboarding.jsx          First-run welcome flow (post-signup)
│   │   ├── components/ui/
│   │   │   ├── avatar.jsx              Profile photo / initials component
│   │   │   └── avatar-picker.jsx       Photo upload / URL / built-in avatars
│   │   ├── pages/
│   │   │   ├── Home.jsx                Landing page + personalised dashboard
│   │   │   ├── Login.jsx               Sign-in page
│   │   │   ├── Signup.jsx              3-step signup with avatar upload
│   │   │   ├── AcademicSuite.jsx       IGCSE — blue theme
│   │   │   ├── ASLevelSuite.jsx        AS & A-Level — amber/red theme
│   │   │   └── OLevelSuite.jsx         O-Level — emerald/teal theme
│   │   └── layouts/Layout.jsx          Navbar with ⌘K palette + profile menu
│   ├── public/logo.png
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── render.yaml
├── setup_local.sh
├── setup_render.sh
├── SETUP.md                     ← Full setup guide — start here
└── README.md                    ← This file
```

---

## Quick start

**Windows** — open Command Prompt or PowerShell:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Open a second terminal:

```cmd
cd frontend
npm install
copy .env.example .env
npm run dev
```

**Mac / Linux:**

```bash
bash setup_local.sh
```

Open http://localhost:5173 in your browser.

> **Windows Python version:** Use Python 3.12. Python 3.14 will fail.  
> See [SETUP.md](./SETUP.md) for the full explanation.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server status + local paper count |
| GET | `/api/search?level=IGCSE&subject=Mathematics` | Search papers |
| GET | `/api/search/subjects?level=IGCSE` | List all subjects for a level |
| GET | `/api/papers/view/{paper_id}` | Stream question paper PDF inline |
| GET | `/api/papers/download/{paper_id}` | Download question paper |
| GET | `/api/markschemes/view/{paper_id}` | Stream mark scheme inline |
| GET | `/api/markschemes/download/{paper_id}` | Download mark scheme |
| POST | `/api/downloads/save` | Cache a paper to local disk |
| GET | `/api/downloads/list` | List locally cached papers |
| DELETE | `/api/downloads/delete/{paper_id}` | Remove a cached paper |

Paper ID format: `{code}_{season}_{year}_{paper}_{type}`  
Example: `0580_m_j_2023_41_qp` = IGCSE Maths · May/June 2023 · Paper 41 · QP

Interactive docs at http://localhost:8000/docs when the backend is running.

---

## Deploy

Docker: `docker compose up --build`  
Render.com: push to GitHub, create a Blueprint from `render.yaml`.

See [SETUP.md → Deploy to Render](./SETUP.md#deploy-to-rendercom-free-tier) for step-by-step instructions.
