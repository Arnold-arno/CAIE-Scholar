"""
routes_share.py — Share AI notes via public short link.
POST /api/share/notes     → store session, return { share_id, url }
GET  /api/share/{id}      → retrieve session (public, no auth)
"""
import json, os, time, hashlib
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from config import settings

router = APIRouter()

SHARES_DIR = Path(getattr(settings, 'DATA_DIR', './data')) / 'shares'
SHARES_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 512_000
SHARE_TTL = 30 * 86_400   # 30 days

def _path(sid: str) -> Path:
    sub = SHARES_DIR / sid[:2]
    sub.mkdir(exist_ok=True)
    return sub / f'{sid}.json'

def _make_id(payload: str) -> str:
    return hashlib.sha256((payload[:200] + str(time.time_ns())).encode()).hexdigest()[:12]

@router.post('/notes')
async def share_notes(body: dict):
    raw = json.dumps(body, ensure_ascii=False)
    if len(raw.encode()) > MAX_BYTES:
        raise HTTPException(413, 'Session too large (max 500 KB)')
    sid = _make_id(raw)
    record = {'share_id': sid, 'created_at': time.time(),
              'expires_at': time.time() + SHARE_TTL, 'data': body}
    _path(sid).write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
    base = os.getenv('PUBLIC_URL', 'https://caiescholar-frontend.onrender.com')
    return JSONResponse({'share_id': sid, 'url': f'{base}/shared/notes/{sid}',
                         'expires_at': record['expires_at']})

@router.get('/{share_id}')
async def get_shared(share_id: str):
    if not share_id.isalnum() or len(share_id) > 24:
        raise HTTPException(400, 'Invalid share ID')
    p = _path(share_id)
    if not p.exists():
        raise HTTPException(404, 'Shared session not found or expired')
    record = json.loads(p.read_text(encoding='utf-8'))
    if time.time() > record.get('expires_at', 0):
        p.unlink(missing_ok=True)
        raise HTTPException(410, 'This shared session has expired')
    return JSONResponse(record['data'])
