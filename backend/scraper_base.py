"""scraper_base.py — Shared async HTTP client with retry and polite delays."""

import asyncio
import logging
import time
from typing import Optional
import httpx

from config import settings

logger = logging.getLogger(__name__)

_last_request: dict[str, float] = {}
_MIN_DELAY = 1.2


class BaseScraper:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def headers(self) -> dict:
        return {
            "User-Agent": settings.SCRAPER_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9",
            "Connection": "keep-alive",
        }

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers=self.headers,
                timeout=settings.SCRAPER_TIMEOUT,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
            )
        return self._client

    async def _polite_delay(self, url: str):
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        wait = _MIN_DELAY - (time.time() - _last_request.get(domain, 0))
        if wait > 0:
            await asyncio.sleep(wait)
        _last_request[domain] = time.time()

    async def fetch_html(self, url: str) -> Optional[str]:
        client = await self._get_client()
        for attempt in range(1, settings.SCRAPER_MAX_RETRIES + 1):
            try:
                await self._polite_delay(url)
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.text
                if resp.status_code == 404:
                    return None
                if resp.status_code == 429:
                    await asyncio.sleep(2 ** attempt)
            except (httpx.TimeoutException, httpx.RequestError) as e:
                logger.warning(f"Request error ({attempt}/{settings.SCRAPER_MAX_RETRIES}): {e}")
            if attempt < settings.SCRAPER_MAX_RETRIES:
                await asyncio.sleep(settings.SCRAPER_RETRY_DELAY * attempt)
        return None

    async def fetch_bytes(self, url: str) -> Optional[bytes]:
        client = await self._get_client()
        for attempt in range(1, settings.SCRAPER_MAX_RETRIES + 1):
            try:
                await self._polite_delay(url)
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.content
                if resp.status_code == 404:
                    return None
                if resp.status_code == 429:
                    await asyncio.sleep(2 ** attempt)
            except (httpx.TimeoutException, httpx.RequestError) as e:
                logger.warning(f"Bytes fetch error ({attempt}): {e}")
            if attempt < settings.SCRAPER_MAX_RETRIES:
                await asyncio.sleep(settings.SCRAPER_RETRY_DELAY * attempt)
        return None

    async def head_check(self, url: str) -> bool:
        client = await self._get_client()
        try:
            await self._polite_delay(url)
            resp = await client.head(url, follow_redirects=True)
            return resp.status_code == 200
        except Exception:
            return False

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
