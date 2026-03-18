"""
scraper_papacambridge.py — Fetches papers from PapaCambridge.

URL format: {BASE}/{level_folder}/{subject_folder}/{code}_{season}{yy}_{type}_{paper}.pdf
e.g. https://pastpapers.papacambridge.com/Cambridge%20IGCSE/Mathematics/0580_s23_qp_41.pdf
"""

import asyncio
import logging
from typing import List, Optional
from dataclasses import dataclass

from scraper_base import BaseScraper
from cache import cache
from subjects import SubjectMeta

logger = logging.getLogger(__name__)

BASE = "https://pastpapers.papacambridge.com"

SEASON_CODE = {"m_j": "s", "o_n": "w", "f_m": "m"}

LEVEL_FOLDER = {
    "IGCSE":    "Cambridge%20IGCSE",
    "AS_LEVEL": "Cambridge%20International%20A%20and%20AS%20Level",
    "O_LEVEL":  "Cambridge%20O%20Level",
}

# Subjects whose folder name on PapaCambridge differs from the official name
FOLDER_OVERRIDES: dict[str, str] = {
    "0417": "Information%20and%20Communication%20Technology%20(ICT)",
    "0606": "Additional%20Mathematics",
    "0607": "Cambridge%20International%20Mathematics",
    "0654": "Co-ordinated%20Sciences%20(Double)",
    "0500": "First%20Language%20English",
    "0510": "English%20as%20a%20Second%20Language%20(Count-in%20Speaking)",
    "9093": "English%20Language",
    "9609": "Business%20Studies",
}


@dataclass
class PaperURL:
    url:          str
    paper_id:     str
    paper_type:   str
    year:         int
    season:       str
    season_label: str
    paper_number: str
    source:       str = "papacambridge"


class PapaCambridgeScraper(BaseScraper):

    def _season_label(self, season: str, year: int) -> str:
        return {
            "m_j": f"May/June {year}",
            "o_n": f"Oct/Nov {year}",
            "f_m": f"Feb/March {year}",
        }.get(season, f"{season} {year}")

    def _candidate_folders(self, subject: SubjectMeta) -> List[str]:
        lf = LEVEL_FOLDER.get(subject.level, "Cambridge%20IGCSE")
        folders = []
        override = FOLDER_OVERRIDES.get(subject.code)
        if override:
            folders.append(f"{BASE}/{lf}/{override}")
        # Standard name variants
        for name in [
            subject.name.replace(" ", "%20").replace("&", "%26"),
            subject.name.replace(" - ", "%20").replace(" ", "%20"),
            subject.name.replace(" ", "%20"),
        ]:
            url = f"{BASE}/{lf}/{name}"
            if url not in folders:
                folders.append(url)
        return folders

    def _filename(self, code: str, year: int, season: str, paper: str, ptype: str) -> str:
        sc = SEASON_CODE.get(season, "s")
        yr2 = str(year)[-2:]
        return f"{code}_{sc}{yr2}_{ptype}_{paper}.pdf"

    def _paper_id(self, code: str, year: int, season: str, paper: str, ptype: str) -> str:
        return f"{code}_{season}_{year}_{paper}_{ptype}"

    async def _working_folder(self, subject: SubjectMeta) -> Optional[str]:
        ck = cache.make_key("papa_folder", subject.code)
        cached = await cache.get(ck)
        if cached:
            return cached
        for folder in self._candidate_folders(subject):
            for yr, s, p in [(2023, "m_j", "11"), (2022, "m_j", "21"), (2022, "o_n", "41")]:
                test = f"{folder}/{self._filename(subject.code, yr, s, p, 'qp')}"
                if await self.head_check(test):
                    await cache.set(ck, folder, ttl=86400)
                    return folder
        # Fall back to first candidate regardless
        first = self._candidate_folders(subject)[0] if self._candidate_folders(subject) else None
        return first

    async def get_papers(
        self,
        subject: SubjectMeta,
        years: Optional[List[int]] = None,
        seasons: Optional[List[str]] = None,
        paper_numbers: Optional[List[str]] = None,
    ) -> List[PaperURL]:
        years         = years         or list(range(2019, 2025))
        seasons       = seasons       or subject.sessions
        paper_numbers = paper_numbers or list(subject.components.values()) or ["11", "21", "31", "41", "51", "61"]

        folder = await self._working_folder(subject)
        if not folder:
            logger.warning(f"No working folder for {subject.name}")
            return []

        candidates: List[PaperURL] = []
        for year in years:
            for season in seasons:
                for pnum in paper_numbers:
                    for ptype in ("qp", "ms"):
                        fname = self._filename(subject.code, year, season, pnum, ptype)
                        candidates.append(PaperURL(
                            url=f"{folder}/{fname}",
                            paper_id=self._paper_id(subject.code, year, season, pnum, ptype),
                            paper_type=ptype,
                            year=year,
                            season=season,
                            season_label=self._season_label(season, year),
                            paper_number=pnum,
                        ))

        sem = asyncio.Semaphore(8)

        async def check(p: PaperURL) -> Optional[PaperURL]:
            async with sem:
                return p if await self.head_check(p.url) else None

        results = await asyncio.gather(*[check(p) for p in candidates])
        found = [p for p in results if p]
        logger.info(f"PapaCambridge: {len(found)}/{len(candidates)} verified for {subject.name}")
        return found

    async def download_pdf(self, url: str) -> Optional[bytes]:
        return await self.fetch_bytes(url)
