"""scraper_gceguide.py — Parses GCE Guide listing pages for paper links."""

import re
import logging
from typing import List, Optional
from dataclasses import dataclass
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from scraper_base import BaseScraper
from subjects import SubjectMeta

logger = logging.getLogger(__name__)

BASE = "https://www.gceguide.com"
LEVEL_PATH = {"IGCSE": "IGCSE", "AS_LEVEL": "A%20Levels", "O_LEVEL": "O%20Levels"}
PDF_RE = re.compile(r"(\d{4})_([smw])(\d{2})_(qp|ms|in|er|gt|sy)_(\w+)\.pdf", re.IGNORECASE)
SEASON_MAP = {"s": "m_j", "w": "o_n", "m": "f_m"}
SEASON_LABEL = {"s": "May/June", "w": "Oct/Nov", "m": "Feb/March"}


@dataclass
class GCEPaperLink:
    url:          str
    paper_id:     str
    subject_code: str
    year:         int
    season:       str
    season_label: str
    paper_type:   str
    paper_number: str
    source:       str = "gceguide"


class GCEGuideScraper(BaseScraper):

    def _subject_url(self, subject: SubjectMeta) -> str:
        lp = LEVEL_PATH.get(subject.level, "IGCSE")
        sp = subject.name.replace(" ", "%20").replace("&", "%26")
        return f"{BASE}/{lp}/{sp}/"

    def _parse_links(self, html: str, base_url: str, code: str) -> List[GCEPaperLink]:
        soup = BeautifulSoup(html, "html.parser")
        links: List[GCEPaperLink] = []
        for a in soup.find_all("a", href=True):
            href: str = a["href"]
            if not href.lower().endswith(".pdf"):
                continue
            match = PDF_RE.match(href.split("/")[-1])
            if not match:
                continue
            c, s_char, yr2, ptype, pnum = match.groups()
            if c != code:
                continue
            year   = int("20" + yr2) if int(yr2) < 80 else int("19" + yr2)
            season = SEASON_MAP.get(s_char.lower(), "m_j")
            links.append(GCEPaperLink(
                url=urljoin(base_url, href),
                paper_id=f"{c}_{season}_{year}_{pnum}_{ptype.lower()}",
                subject_code=c,
                year=year,
                season=season,
                season_label=f"{SEASON_LABEL.get(s_char.lower(), '?')} {year}",
                paper_type=ptype.lower(),
                paper_number=pnum,
            ))
        return links

    async def get_papers(self, subject: SubjectMeta, years: Optional[List[int]] = None) -> List[GCEPaperLink]:
        url = self._subject_url(subject)
        html = await self.fetch_html(url)
        if not html:
            alt = f"{BASE}/{LEVEL_PATH.get(subject.level,'IGCSE')}/{subject.code}/"
            html = await self.fetch_html(alt)
            if not html:
                return []
            url = alt
        links = self._parse_links(html, url, subject.code)
        if years:
            links = [l for l in links if l.year in years]
        logger.info(f"GCEGuide: {len(links)} papers for {subject.name}")
        return links

    async def download_pdf(self, url: str) -> Optional[bytes]:
        return await self.fetch_bytes(url)
