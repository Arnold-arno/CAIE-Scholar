"""
CAIE Scholar — FastAPI application entry point
Run locally:  uvicorn main:app --reload --port 8000
Run prod:     gunicorn main:app -c gunicorn.conf.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from config import settings
from cache import init_cache
from routes_search import router as search_router
from routes_papers import router as papers_router
from routes_markschemes import router as ms_router
from routes_downloads import router as downloads_router
from routes_health import router as health_router
from routes_ai import router as ai_router
from routes_share import router as share_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CAIE Scholar backend starting...")
    await init_cache()
    os.makedirs(settings.PAPERS_DIR, exist_ok=True)
    os.makedirs(settings.MARKSCHEMES_DIR, exist_ok=True)
    os.makedirs(settings.CACHE_DIR, exist_ok=True)
    logger.info(f"Paper store: {settings.PAPERS_DIR}")
    yield
    logger.info("CAIE Scholar backend shutting down.")


app = FastAPI(
    title="CAIE Scholar API",
    description="CAIE Scholar — Cambridge IGCSE / AS & A-Level / O-Level past paper search and PDF serving",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Serve locally cached PDFs as static files
if os.path.isdir(settings.PAPERS_DIR):
    app.mount("/static/papers", StaticFiles(directory=settings.PAPERS_DIR), name="papers")
if os.path.isdir(settings.MARKSCHEMES_DIR):
    app.mount("/static/markschemes", StaticFiles(directory=settings.MARKSCHEMES_DIR), name="markschemes")

app.include_router(health_router,    prefix="/api",             tags=["health"])
app.include_router(search_router,    prefix="/api/search",      tags=["search"])
app.include_router(papers_router,    prefix="/api/papers",      tags=["papers"])
app.include_router(ms_router,        prefix="/api/markschemes", tags=["markschemes"])
app.include_router(downloads_router, prefix="/api/downloads",   tags=["downloads"])
app.include_router(ai_router,        prefix="/api/ai",         tags=["ai"])
app.include_router(share_router,     prefix="/api/share",      tags=["share"])


@app.get("/", tags=["root"])
async def root():
    return {"service": "CAIE Scholar API", "version": "1.0.0", "docs": "/docs"}
