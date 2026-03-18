"""routes_markschemes.py"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import Optional
from service_pdf import fetch_pdf, nice_filename
from local_store import store

router = APIRouter()


def _to_ms(paper_id: str) -> str:
    if paper_id.endswith("_qp"):
        return paper_id[:-3] + "_ms"
    parts = paper_id.rsplit("_", 1)
    return (parts[0] + "_ms") if len(parts) == 2 and parts[1] == "qp" else paper_id.replace("_qp", "_ms")


@router.get("/view/{paper_id}")
async def view_ms(paper_id: str, source_url: Optional[str] = Query(None)):
    ms_id = _to_ms(paper_id) if "_qp" in paper_id else paper_id
    data = await fetch_pdf(ms_id, source_url)
    if not data:
        raise HTTPException(404, "Mark scheme not found or not yet published")
    fname = nice_filename(ms_id).replace("_QP.", "_MS.")
    return Response(data, media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="{fname}"',
        "Cache-Control": "public, max-age=86400",
        "X-Is-Markscheme": "true",
    })


@router.get("/download/{paper_id}")
async def download_ms(paper_id: str, source_url: Optional[str] = Query(None)):
    ms_id = _to_ms(paper_id) if "_qp" in paper_id else paper_id
    data = await fetch_pdf(ms_id, source_url)
    if not data:
        raise HTTPException(404, "Mark scheme not found")
    fname = nice_filename(ms_id).replace("_QP.", "_MS.")
    return Response(data, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{fname}"',
    })


@router.get("/check/{paper_id}")
async def check_ms(paper_id: str):
    ms_id = _to_ms(paper_id) if "_qp" in paper_id else paper_id
    local = store.find(ms_id)
    return {
        "paper_id": paper_id, "ms_paper_id": ms_id,
        "available_locally": local is not None,
        "view_url": f"/api/markschemes/view/{ms_id}",
    }
