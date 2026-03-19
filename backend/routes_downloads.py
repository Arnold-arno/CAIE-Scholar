"""routes_downloads.py"""
import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas import DownloadRequest, DownloadListResponse, DownloadedFile
from service_pdf import save_permanently
from local_store import store
from subjects import find_by_code

router = APIRouter()


@router.post("/save")
async def save(req: DownloadRequest):
    path = await save_permanently(req.paper_id, req.source_url)
    if not path:
        raise HTTPException(502, "Failed to download and save paper")
    subject = find_by_code(req.paper_id.split("_")[0])
    return {
        "success": True, "paper_id": req.paper_id,
        "subject": subject.name if subject else "Unknown",
        "local_path": path,
        "view_url": f"/api/papers/view/{req.paper_id}",
        "file_size_kb": (os.path.getsize(path) // 1024) if os.path.exists(path) else 0,
    }


@router.get("/list", response_model=DownloadListResponse)
async def list_downloads(level: Optional[str] = Query(None), subject_code: Optional[str] = Query(None)):
    papers = store.search(subject_code=subject_code)
    files = []
    for p in papers:
        subject = find_by_code(p.subject_code)
        if level and subject and subject.level != level:
            continue
        try:
            mtime = Path(p.local_path).stat().st_mtime
            dt = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
        except Exception:
            dt = datetime.now(tz=timezone.utc).isoformat()
        files.append(DownloadedFile(
            paper_id=p.paper_id,
            subject=subject.name if subject else p.subject_code,
            level=subject.level if subject else "UNKNOWN",
            year=p.year, season_label=p.season_label, paper_number=p.paper_number,
            paper_type=p.paper_type, filename=p.filename, local_path=p.local_path,
            file_size_kb=p.file_size_bytes // 1024, downloaded_at=dt,
            pdf_url=f"/api/papers/view/{p.paper_id}",
        ))
    return DownloadListResponse(total=len(files), files=files)


@router.delete("/delete/{paper_id}")
async def delete(paper_id: str):
    local = store.find(paper_id)
    if not local:
        raise HTTPException(404, f"{paper_id} not in local store")
    try:
        os.remove(local.local_path)
        store.rebuild()
        return {"success": True, "deleted": paper_id}
    except OSError as e:
        raise HTTPException(500, str(e))


@router.get("/stats")
async def stats():
    papers = store.search()
    by_level: dict = {}
    total = 0
    for p in papers:
        sub = find_by_code(p.subject_code)
        lvl = sub.level if sub else "UNKNOWN"
        by_level[lvl] = by_level.get(lvl, 0) + 1
        total += p.file_size_bytes
    return {"total_papers": len(papers), "by_level": by_level, "total_size_mb": round(total / 1024 / 1024, 2)}
