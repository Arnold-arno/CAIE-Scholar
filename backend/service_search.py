"""service_search.py — Orchestrates local store → PapaCambridge → GCE Guide."""

import logging
from typing import List, Optional

from cache import cache
from subjects import find_subject, find_by_code, SubjectMeta
from schemas import PaperResult, SearchResponse
from scraper_papacambridge import PapaCambridgeScraper
from scraper_gceguide import GCEGuideScraper
from local_store import store
from config import settings

logger = logging.getLogger(__name__)

_papa = PapaCambridgeScraper()
_gce  = GCEGuideScraper()


def _resolve(name: str, level: str) -> Optional[SubjectMeta]:
    meta = find_subject(name, level)
    if meta:
        return meta
    meta = find_by_code(name)
    return meta if meta and meta.level == level else None


def _result(subject: SubjectMeta, paper_id: str, year: int, season: str,
            season_label: str, paper_number: str, paper_type: str,
            source: str, source_url: Optional[str] = None,
            has_ms: bool = False, ms_url: Optional[str] = None,
            size_kb: Optional[int] = None) -> PaperResult:
    label = next((k for k, v in subject.components.items() if v == paper_number), f"Paper {paper_number}")
    return PaperResult(
        id=paper_id, subject=subject.name, subject_code=subject.code,
        level=subject.level, year=year, season=season, season_label=season_label,
        paper_number=paper_number, paper_label=label, paper_type=paper_type,
        source=source, source_url=source_url, has_markscheme=has_ms,
        markscheme_url=ms_url, file_size_kb=size_kb,
    )


async def search_papers(
    level: str, subject_str: str, topic: Optional[str] = None,
    year: Optional[int] = None, season: Optional[str] = None,
    paper_number: Optional[str] = None,
) -> SearchResponse:
    ck = cache.make_key("search", level, subject_str, topic or "", year or "", season or "", paper_number or "")
    cached = await cache.get(ck)
    if cached:
        resp = SearchResponse(**cached)
        resp.cached = True
        return resp

    subject = _resolve(subject_str, level)
    if not subject:
        return SearchResponse(query={"level": level, "subject": subject_str}, total=0, results=[], sources_checked=[])

    years        = [year]         if year         else list(range(2019, 2025))
    seasons      = [season]       if season       else subject.sessions
    paper_nums   = [paper_number] if paper_number else None
    results:    dict[str, PaperResult] = {}
    sources_used: List[str]            = []

    # 1 — Local
    for lp in store.search(subject_code=subject.code, year=year, season=season, paper_number=paper_number, paper_type="qp"):
        if lp.year not in years:
            continue
        ms = store.find(lp.paper_id.replace("_qp", "_ms"))
        results[lp.paper_id] = _result(
            subject, lp.paper_id, lp.year, lp.season, lp.season_label,
            lp.paper_number, "qp", "local", lp.pdf_url,
            ms is not None, ms.pdf_url if ms else None, lp.file_size_bytes // 1024,
        )
    if results:
        sources_used.append("local")

    # 2 — PapaCambridge
    try:
        sources_used.append("papacambridge")
        pc_papers = await _papa.get_papers(subject=subject, years=years, seasons=seasons, paper_numbers=paper_nums)
        ms_ids = {p.paper_id for p in pc_papers if p.paper_type == "ms"}
        ms_urls = {p.paper_id: p.url for p in pc_papers if p.paper_type == "ms"}
        for pp in pc_papers:
            if pp.paper_type != "qp" or pp.paper_id in results:
                continue
            ms_id = pp.paper_id.replace("_qp", "_ms")
            results[pp.paper_id] = _result(
                subject, pp.paper_id, pp.year, pp.season, pp.season_label,
                pp.paper_number, "qp", "papacambridge", pp.url,
                ms_id in ms_ids, ms_urls.get(ms_id),
            )
    except Exception as e:
        logger.error(f"PapaCambridge search error: {e}")

    # 3 — GCE Guide fallback
    if len(results) < 3:
        try:
            sources_used.append("gceguide")
            gce_papers = await _gce.get_papers(subject=subject, years=years)
            ms_ids_gce = {p.paper_id for p in gce_papers if p.paper_type == "ms"}
            ms_urls_gce = {p.paper_id: p.url for p in gce_papers if p.paper_type == "ms"}
            for gp in gce_papers:
                if gp.paper_type != "qp" or gp.paper_id in results:
                    continue
                ms_id = gp.paper_id.replace("_qp", "_ms")
                results[gp.paper_id] = _result(
                    subject, gp.paper_id, gp.year, gp.season, gp.season_label,
                    gp.paper_number, "qp", "gceguide", gp.url,
                    ms_id in ms_ids_gce, ms_urls_gce.get(ms_id),
                )
        except Exception as e:
            logger.error(f"GCE Guide search error: {e}")

    sorted_results = sorted(results.values(), key=lambda r: (r.year, r.season, r.paper_number), reverse=True)

    # Basic topic filter on paper label
    if topic:
        tl = topic.strip().lower()
        filtered = [r for r in sorted_results if tl in r.paper_label.lower() or tl in r.subject.lower()]
        if filtered:
            sorted_results = filtered

    resp = SearchResponse(
        query={"level": level, "subject": subject.name, "subject_code": subject.code, "years": years, "topic": topic},
        total=len(sorted_results), results=sorted_results,
        sources_checked=list(set(sources_used)), cached=False,
    )
    if sorted_results:
        await cache.set(ck, resp.model_dump(), ttl=settings.CACHE_TTL_SEARCH)
    return resp
