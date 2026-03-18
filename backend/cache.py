"""
cache.py — Two-level cache: in-memory (L1) + JSON files on disk (L2).
"""

import json
import time
import hashlib
import logging
import asyncio
from pathlib import Path
from typing import Any, Optional

from config import settings

logger = logging.getLogger(__name__)

_mem: dict[str, tuple[Any, float]] = {}
_lock = asyncio.Lock()


async def init_cache():
    Path(settings.CACHE_DIR).mkdir(parents=True, exist_ok=True)
    loaded = 0
    now = time.time()
    for f in Path(settings.CACHE_DIR).glob("*.json"):
        try:
            data = json.loads(f.read_text())
            if data.get("expires_at", 0) > now:
                _mem[data["key"]] = (data["value"], data["expires_at"])
                loaded += 1
            else:
                f.unlink(missing_ok=True)
        except Exception:
            pass
    logger.info(f"Cache warmed: {loaded} entries")


def _disk_path(key: str) -> Path:
    safe = hashlib.md5(key.encode()).hexdigest()
    return Path(settings.CACHE_DIR) / f"{safe}.json"


class Cache:
    async def get(self, key: str) -> Optional[Any]:
        async with _lock:
            entry = _mem.get(key)
            if entry:
                value, expires_at = entry
                if time.time() < expires_at:
                    return value
                del _mem[key]
                _disk_path(key).unlink(missing_ok=True)
        return None

    async def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        expires_at = time.time() + ttl
        async with _lock:
            _mem[key] = (value, expires_at)
        asyncio.create_task(self._write_disk(key, value, expires_at))

    async def _write_disk(self, key: str, value: Any, expires_at: float):
        try:
            _disk_path(key).write_text(
                json.dumps({"key": key, "value": value, "expires_at": expires_at})
            )
        except Exception as e:
            logger.warning(f"Cache disk write failed: {e}")

    async def delete(self, key: str) -> None:
        async with _lock:
            _mem.pop(key, None)
        _disk_path(key).unlink(missing_ok=True)

    def make_key(self, *parts) -> str:
        return ":".join(str(p).strip().lower() for p in parts)


cache = Cache()
