"""routes_search.py"""
from fastapi import APIRouter, Query
from typing import Optional
from schemas import SearchResponse, ExamLevel, Season
from service_search import search_papers

router = APIRouter()

@router.get("", response_model=SearchResponse)
async def search(
    level:   ExamLevel         = Query(...),
    subject: str               = Query(...),
    topic:   Optional[str]     = Query(None),
    year:    Optional[int]     = Query(None, ge=2000, le=2030),
    season:  Optional[Season]  = Query(None),
    paper:   Optional[str]     = Query(None),
):
    return await search_papers(
        level=level.value, subject_str=subject, topic=topic,
        year=year, season=season.value if season else None, paper_number=paper,
    )

@router.get("/subjects")
async def list_subjects(level: Optional[ExamLevel] = Query(None)):
    from subjects import LEVEL_MAP
    if level:
        reg = LEVEL_MAP.get(level.value, {})
        return {"level": level.value, "subjects": [{"name": n, "code": m.code, "components": m.components} for n, m in sorted(reg.items())]}
    return {lvl: [{"name": n, "code": m.code} for n, m in sorted(reg.items())] for lvl, reg in LEVEL_MAP.items()}
