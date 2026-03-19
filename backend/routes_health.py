"""routes_health.py"""
from fastapi import APIRouter
from schemas import HealthResponse
from local_store import store
from cache import _mem

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health():
    store.ensure()
    return HealthResponse(
        status="ok", version="1.0.0",
        cache_entries=len(_mem),
        local_papers=len(store.search(paper_type="qp")),
        local_markschemes=len(store.search(paper_type="ms")),
    )
