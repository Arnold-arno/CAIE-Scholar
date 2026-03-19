"""service_pdf.py — Fetch, cache, and serve paper PDFs."""

import logging
import os
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from config import settings
from local_store import store
from subjects import find_by_code

logger = logging.getLogger(__name__)

TRUSTED = {"pastpapers.papacambridge.com", "papacambridge.com", "www.gceguide.com", "gceguide.com"}


def _is_trusted(url: str) -> bool:
    return urlparse(url).netloc in TRUSTED


def _cache_path(paper_id: str, is_ms: bool) -> Path:
    root = settings.MARKSCHEMES_DIR if is_ms else settings.PAPERS_DIR
    return Path(root) / "cache" / f"{paper_id}.pdf"


async def fetch_pdf(paper_id: str, source_url: Optional[str] = None) -> Optional[bytes]:
    is_ms = paper_id.endswith("_ms")

    # Local store first
    local = store.find(paper_id)
    if local:
        try:
            return Path(local.local_path).read_bytes()
        except OSError:
            pass

    # Disk cache
    cp = _cache_path(paper_id, is_ms)
    if cp.exists():
        try:
            return cp.read_bytes()
        except OSError:
            pass

    if not source_url:
        return None
    if not _is_trusted(source_url):
        logger.warning(f"Blocked untrusted URL: {source_url}")
        return None

    from scraper_papacambridge import PapaCambridgeScraper
    from scraper_gceguide import GCEGuideScraper
    from scraper_base import BaseScraper

    if "papacambridge" in source_url:
        data = await PapaCambridgeScraper().fetch_bytes(source_url)
    elif "gceguide" in source_url:
        data = await GCEGuideScraper().fetch_bytes(source_url)
    else:
        data = await BaseScraper().fetch_bytes(source_url)

    if data:
        cp.parent.mkdir(parents=True, exist_ok=True)
        try:
            cp.write_bytes(data)
        except OSError as e:
            logger.warning(f"Cache write failed: {e}")

    return data


async def save_permanently(paper_id: str, source_url: str) -> Optional[str]:
    parts = paper_id.split("_")
    if len(parts) < 5:
        return None
    code   = parts[0]
    ptype  = parts[-1]
    is_ms  = ptype == "ms"
    subject = find_by_code(code)
    level   = subject.level if subject else "IGCSE"
    filename = source_url.split("/")[-1]
    if not filename.endswith(".pdf"):
        filename = f"{paper_id}.pdf"
    data = await fetch_pdf(paper_id, source_url)
    if not data:
        return None
    path = store.save(data, code, level, filename, is_ms=is_ms)
    store.rebuild()
    return path


def nice_filename(paper_id: str) -> str:
    parts = paper_id.split("_")
    code = parts[0] if parts else "unknown"
    subject = find_by_code(code)
    name = subject.name.replace(" ", "") if subject else code
    sm = {"m_j": "MayJune", "o_n": "OctNov", "f_m": "FebMarch"}
    if len(parts) >= 5:
        season = sm.get(f"{parts[1]}_{parts[2]}", parts[1])
        year   = parts[3] if len(parts) > 3 else ""
        paper  = parts[4] if len(parts) > 4 else ""
        ptype  = parts[5].upper() if len(parts) > 5 else "QP"
        return f"{name}_{season}{year}_Paper{paper}_{ptype}.pdf"
    return f"{paper_id}.pdf"
