"""routes_papers.py"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import Optional
from service_pdf import fetch_pdf, nice_filename
from local_store import store

router = APIRouter()

@router.get("/view/{paper_id}")
async def view(paper_id: str, source_url: Optional[str] = Query(None)):
    data = await fetch_pdf(paper_id, source_url)
    if not data:
        raise HTTPException(404, f"Paper {paper_id} not found")
    return Response(data, media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="{nice_filename(paper_id)}"',
        "Cache-Control": "public, max-age=86400",
    })

@router.get("/download/{paper_id}")
async def download(paper_id: str, source_url: Optional[str] = Query(None)):
    data = await fetch_pdf(paper_id, source_url)
    if not data:
        raise HTTPException(404, f"Paper {paper_id} not found")
    return Response(data, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{nice_filename(paper_id)}"',
    })

@router.get("/local")
async def local_papers(subject_code: Optional[str] = Query(None), year: Optional[int] = Query(None)):
    papers = store.search(subject_code=subject_code, year=year, paper_type="qp")
    return {"total": len(papers), "papers": [{
        "paper_id": p.paper_id, "subject_code": p.subject_code,
        "year": p.year, "season_label": p.season_label, "paper_number": p.paper_number,
        "filename": p.filename, "file_size_kb": p.file_size_bytes // 1024,
        "view_url": f"/api/papers/view/{p.paper_id}",
        "download_url": f"/api/papers/download/{p.paper_id}",
    } for p in papers]}
