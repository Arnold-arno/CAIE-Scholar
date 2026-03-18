"""
local_store.py — Index and serve PDFs already saved on disk.

Naming convention (same as PapaCambridge):
  {code}_{season_char}{yy}_{type}_{paper}.pdf
  e.g.  0580_s23_qp_41.pdf
"""

import re
import os
import logging
from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass

from config import settings

logger = logging.getLogger(__name__)

PDF_RE = re.compile(r"(\d{4})_([smw])(\d{2})_(qp|ms|in|er|gt|sy)_(\w+)\.pdf", re.IGNORECASE)
SEASON_MAP = {"s": "m_j", "w": "o_n", "m": "f_m"}
SEASON_LABEL = {"s": "May/June", "w": "Oct/Nov", "m": "Feb/March"}


@dataclass
class LocalPaper:
    paper_id:       str
    subject_code:   str
    year:           int
    season:         str
    season_label:   str
    paper_type:     str
    paper_number:   str
    local_path:     str
    filename:       str
    file_size_bytes: int
    source:         str = "local"

    @property
    def pdf_url(self) -> str:
        rel = os.path.relpath(self.local_path, settings.PAPERS_DIR)
        return f"/static/papers/{rel.replace(os.sep, '/')}"


class LocalStore:
    def __init__(self):
        self._index: dict[str, LocalPaper] = {}
        self._indexed = False

    def _parse(self, path: Path) -> Optional[LocalPaper]:
        m = PDF_RE.match(path.name)
        if not m:
            return None
        code, s_char, yr2, ptype, pnum = m.groups()
        year = int("20" + yr2) if int(yr2) < 80 else int("19" + yr2)
        season = SEASON_MAP.get(s_char.lower(), "m_j")
        return LocalPaper(
            paper_id=f"{code}_{season}_{year}_{pnum}_{ptype.lower()}",
            subject_code=code,
            year=year,
            season=season,
            season_label=f"{SEASON_LABEL.get(s_char.lower(), '?')} {year}",
            paper_type=ptype.lower(),
            paper_number=pnum,
            local_path=str(path),
            filename=path.name,
            file_size_bytes=path.stat().st_size,
        )

    def rebuild(self):
        self._index.clear()
        for root in (settings.PAPERS_DIR, settings.MARKSCHEMES_DIR):
            for path in Path(root).rglob("*.pdf"):
                p = self._parse(path)
                if p:
                    self._index[p.paper_id] = p
        logger.info(f"Local store: {len(self._index)} PDFs indexed")
        self._indexed = True

    def ensure(self):
        if not self._indexed:
            self.rebuild()

    def find(self, paper_id: str) -> Optional[LocalPaper]:
        self.ensure()
        return self._index.get(paper_id)

    def search(
        self,
        subject_code: Optional[str] = None,
        year: Optional[int] = None,
        season: Optional[str] = None,
        paper_number: Optional[str] = None,
        paper_type: Optional[str] = None,
    ) -> List[LocalPaper]:
        self.ensure()
        results = list(self._index.values())
        if subject_code:   results = [p for p in results if p.subject_code == subject_code]
        if year:           results = [p for p in results if p.year == year]
        if season:         results = [p for p in results if p.season == season]
        if paper_number:   results = [p for p in results if p.paper_number == paper_number]
        if paper_type:     results = [p for p in results if p.paper_type == paper_type]
        return sorted(results, key=lambda p: (p.year, p.season), reverse=True)

    def save(self, data: bytes, code: str, level: str, filename: str, is_ms: bool = False) -> str:
        root = settings.MARKSCHEMES_DIR if is_ms else settings.PAPERS_DIR
        dest = Path(root) / level / code / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        self._indexed = False
        logger.info(f"Saved {filename} ({len(data)//1024} KB)")
        return str(dest)

    def count(self) -> int:
        self.ensure()
        return len(self._index)


store = LocalStore()
