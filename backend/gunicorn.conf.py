"""
gunicorn.conf.py — Gunicorn configuration for production.

Usage:
  gunicorn main:app -c gunicorn.conf.py

Render / Railway: set the start command to the above in your service settings.
"""

import os
import multiprocessing

# ── Binding ───────────────────────────────────────────────────────────────────
host = os.environ.get("HOST", "0.0.0.0")
port = os.environ.get("PORT", "8000")
bind = f"{host}:{port}"

# ── Workers ───────────────────────────────────────────────────────────────────
# (2 × CPU cores) + 1 is the standard recommendation for I/O-bound work
workers     = int(os.environ.get("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"   # required for FastAPI/ASGI
threads      = 1    # UvicornWorker is single-threaded async; more threads add no benefit

# ── Timeouts ──────────────────────────────────────────────────────────────────
timeout              = 120   # PDF downloads can be slow
keepalive            = 5
graceful_timeout     = 30

# ── Logging ───────────────────────────────────────────────────────────────────
loglevel      = os.environ.get("LOG_LEVEL", "info").lower()
accesslog     = "-"   # stdout
errorlog      = "-"   # stderr
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(D)sµs'

# ── Process naming ────────────────────────────────────────────────────────────
proc_name = "caie_scholar"

# ── Reload (dev only — disable in production) ─────────────────────────────────
reload = os.environ.get("DEBUG", "false").lower() == "true"
