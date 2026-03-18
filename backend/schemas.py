"""schemas.py — Pydantic request/response models."""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from enum import Enum


class ExamLevel(str, Enum):
    IGCSE    = "IGCSE"
    AS_LEVEL = "AS_LEVEL"
    O_LEVEL  = "O_LEVEL"


class Season(str, Enum):
    MAY_JUNE   = "m_j"
    OCT_NOV    = "o_n"
    FEB_MARCH  = "f_m"


class PaperResult(BaseModel):
    id:             str
    subject:        str
    subject_code:   str
    level:          str
    year:           int
    season:         str
    season_label:   str
    paper_number:   str
    paper_label:    str
    paper_type:     str
    source:         str
    source_url:     Optional[str] = None
    has_markscheme: bool = False
    markscheme_url: Optional[str] = None
    file_size_kb:   Optional[int] = None


class SearchResponse(BaseModel):
    query:           dict
    total:           int
    results:         List[PaperResult]
    sources_checked: List[str]
    cached:          bool = False


class DownloadRequest(BaseModel):
    paper_id:   str
    source_url: str
    paper_type: Literal["qp", "ms"] = "qp"


class DownloadedFile(BaseModel):
    paper_id:     str
    subject:      str
    level:        str
    year:         int
    season_label: str
    paper_number: str
    paper_type:   str
    filename:     str
    local_path:   str
    file_size_kb: int
    downloaded_at: str
    pdf_url:      str


class DownloadListResponse(BaseModel):
    total: int
    files: List[DownloadedFile]


class HealthResponse(BaseModel):
    status:            str
    version:           str
    cache_entries:     int
    local_papers:      int
    local_markschemes: int
