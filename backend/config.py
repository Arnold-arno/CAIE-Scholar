"""
config.py — All application settings loaded from environment variables.
Copy .env.example → .env and fill in your values before running.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ── Server ────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # ── Storage ───────────────────────────────────────────────────────────
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    PAPERS_DIR: str = os.path.join(BASE_DIR, "data", "papers")
    MARKSCHEMES_DIR: str = os.path.join(BASE_DIR, "data", "markschemes")
    CACHE_DIR: str = os.path.join(BASE_DIR, "data", "cache")

    # ── Cache TTLs (seconds) ──────────────────────────────────────────────
    CACHE_TTL_SEARCH: int = 3600
    CACHE_TTL_PDF: int = 86400

    # ── Scraper ───────────────────────────────────────────────────────────
    SCRAPER_TIMEOUT: int = 15
    SCRAPER_MAX_RETRIES: int = 3
    SCRAPER_RETRY_DELAY: float = 1.5
    SCRAPER_USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )

    # ── External paper sources ────────────────────────────────────────────
    PAPACAMBRIDGE_BASE: str = "https://pastpapers.papacambridge.com"
    GCE_GUIDE_BASE: str = "https://www.gceguide.com"

    # ── Security ──────────────────────────────────────────────────────────
    API_KEY: str = ""   # Leave empty to disable key checking

    # ── AI provider API keys ───────────────────────────────────────────────
    # At least one of the note providers is needed for AI Notes.
    # Image generation requires OPENAI_API_KEY (uses gpt-image-1).

    # Anthropic Claude — console.anthropic.com
    ANTHROPIC_API_KEY: str = ""

    # OpenAI — platform.openai.com  (notes via gpt-4o + images via gpt-image-1)
    OPENAI_API_KEY: str = ""

    # xAI Grok — console.x.ai
    GROK_API_KEY: str = ""

    # Google Gemini — aistudio.google.com
    GEMINI_API_KEY: str = ""

    # Cohere — dashboard.cohere.com
    COHERE_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
