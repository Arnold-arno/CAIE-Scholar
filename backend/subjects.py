"""
subjects.py — Cambridge subject registry for all three exam levels.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class SubjectMeta:
    code: str
    name: str
    level: str
    components: Dict[str, str] = field(default_factory=dict)
    sessions: List[str] = field(default_factory=lambda: ["m_j", "o_n"])
    aliases: List[str] = field(default_factory=list)


# ── IGCSE ──────────────────────────────────────────────────────────────────────

IGCSE: Dict[str, SubjectMeta] = {
    "Accounting":             SubjectMeta("0452", "Accounting",             "IGCSE", {"Paper 1: MC": "11", "Paper 2: Structured": "21"}),
    "Agriculture":            SubjectMeta("0600", "Agriculture",            "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Art & Design":           SubjectMeta("0400", "Art & Design",           "IGCSE"),
    "Biology":                SubjectMeta("0610", "Biology",                "IGCSE", {"Paper 1 MC Core": "11", "Paper 2 MC Ext": "21", "Paper 3 Core": "31", "Paper 4 Ext": "41", "Paper 5 Practical": "51", "Paper 6 Alt": "61"}),
    "Business Studies":       SubjectMeta("0450", "Business Studies",       "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Chemistry":              SubjectMeta("0620", "Chemistry",              "IGCSE", {"Paper 1 MC Core": "11", "Paper 2 MC Ext": "21", "Paper 3 Core": "31", "Paper 4 Ext": "41", "Paper 5 Practical": "51", "Paper 6 Alt": "61"}),
    "Computer Science":       SubjectMeta("0478", "Computer Science",       "IGCSE", {"Paper 1: Systems": "11", "Paper 2: Algorithms": "21"}),
    "Co-ordinated Sciences":  SubjectMeta("0654", "Co-ordinated Sciences",  "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Design & Technology":    SubjectMeta("0445", "Design & Technology",    "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Economics":              SubjectMeta("0455", "Economics",              "IGCSE", {"Paper 1: MC": "11", "Paper 2: Structured": "21"}),
    "English - First Language": SubjectMeta("0500", "English - First Language", "IGCSE", {"Paper 1: Reading": "11", "Paper 2: Writing": "21"}, aliases=["First Language English", "EFL"]),
    "English - Second Language": SubjectMeta("0510", "English - Second Language", "IGCSE", {"Paper 1 Core": "11", "Paper 2 Ext": "21"}),
    "English - Literature":   SubjectMeta("0486", "English - Literature",   "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Enterprise":             SubjectMeta("0454", "Enterprise",             "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Environmental Management": SubjectMeta("0680", "Environmental Management", "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Food & Nutrition":       SubjectMeta("0648", "Food & Nutrition",       "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "French - Foreign Language": SubjectMeta("0520", "French - Foreign Language", "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Geography":              SubjectMeta("0460", "Geography",              "IGCSE", {"Paper 1: Themes": "11", "Paper 2: Skills": "21", "Paper 4": "41"}),
    "German - Foreign Language": SubjectMeta("0525", "German - Foreign Language", "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Global Perspectives":    SubjectMeta("0457", "Global Perspectives",    "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "History":                SubjectMeta("0470", "History",                "IGCSE", {"Paper 1: Core": "11", "Paper 2: Depth": "21", "Paper 4": "41"}),
    "ICT":                    SubjectMeta("0417", "ICT",                    "IGCSE", {"Paper 1: Theory": "11", "Paper 2: Practical": "21", "Paper 3": "31"}, aliases=["Information & Communication Technology"]),
    "Islamic Studies":        SubjectMeta("0493", "Islamic Studies",        "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Mathematics":            SubjectMeta("0580", "Mathematics",            "IGCSE", {"Paper 1 Core": "11", "Paper 2 Ext": "21", "Paper 3 Core": "31", "Paper 4 Ext": "41"}),
    "Mathematics - Additional": SubjectMeta("0606", "Mathematics - Additional", "IGCSE", {"Paper 1": "11", "Paper 2": "21"}, aliases=["Add Maths", "Additional Mathematics"]),
    "Mathematics - International": SubjectMeta("0607", "Mathematics - International", "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Music":                  SubjectMeta("0410", "Music",                  "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Physical Education":     SubjectMeta("0413", "Physical Education",     "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Physics":                SubjectMeta("0625", "Physics",                "IGCSE", {"Paper 1 MC Core": "11", "Paper 2 MC Ext": "21", "Paper 3 Core": "31", "Paper 4 Ext": "41", "Paper 5 Practical": "51", "Paper 6 Alt": "61"}),
    "Religious Studies":      SubjectMeta("0490", "Religious Studies",      "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Science - Combined":     SubjectMeta("0653", "Science - Combined",     "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Sociology":              SubjectMeta("0495", "Sociology",              "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "Spanish - Foreign Language": SubjectMeta("0530", "Spanish - Foreign Language", "IGCSE", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Travel & Tourism":       SubjectMeta("0471", "Travel & Tourism",       "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
    "World Literature":       SubjectMeta("0408", "World Literature",       "IGCSE", {"Paper 1": "11", "Paper 2": "21"}),
}

# ── AS & A-Level ───────────────────────────────────────────────────────────────

AS_LEVEL: Dict[str, SubjectMeta] = {
    "Accounting":      SubjectMeta("9706", "Accounting",      "AS_LEVEL", {"Paper 1: MC": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Biology":         SubjectMeta("9700", "Biology",         "AS_LEVEL", {"Paper 1 MC": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41", "Paper 5": "51"}),
    "Business":        SubjectMeta("9609", "Business",        "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Chemistry":       SubjectMeta("9701", "Chemistry",       "AS_LEVEL", {"Paper 1 MC": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41", "Paper 5": "51"}),
    "Computer Science": SubjectMeta("9618", "Computer Science", "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41"}),
    "Economics":       SubjectMeta("9708", "Economics",       "AS_LEVEL", {"Paper 1 MC": "11", "Paper 2": "21", "Paper 3": "31"}),
    "English Language": SubjectMeta("9093", "English Language", "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Geography":       SubjectMeta("9696", "Geography",       "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "History":         SubjectMeta("9489", "History",         "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Mathematics":     SubjectMeta("9709", "Mathematics",     "AS_LEVEL", {"Paper 1: Pure 1": "11", "Paper 2: Pure 2": "21", "Paper 3: Pure 3": "31", "Paper 4: Mechanics": "41", "Paper 5: Stats 1": "51", "Paper 6: Stats 2": "61"}),
    "Physics":         SubjectMeta("9702", "Physics",         "AS_LEVEL", {"Paper 1 MC": "11", "Paper 2": "21", "Paper 3": "31", "Paper 4": "41", "Paper 5": "51"}),
    "Psychology":      SubjectMeta("9990", "Psychology",      "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Sociology":       SubjectMeta("9699", "Sociology",       "AS_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
}

# ── O-Level ────────────────────────────────────────────────────────────────────

O_LEVEL: Dict[str, SubjectMeta] = {
    "Accounting":          SubjectMeta("7110", "Accounting",          "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Biology":             SubjectMeta("5090", "Biology",             "O_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Chemistry":           SubjectMeta("5070", "Chemistry",           "O_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Commerce":            SubjectMeta("7100", "Commerce",            "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Computer Science":    SubjectMeta("2210", "Computer Science",    "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Economics":           SubjectMeta("2281", "Economics",           "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "English Language":    SubjectMeta("1123", "English Language",    "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Geography":           SubjectMeta("2217", "Geography",           "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "History":             SubjectMeta("2147", "History",             "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Mathematics":         SubjectMeta("4024", "Mathematics",         "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
    "Physics":             SubjectMeta("5054", "Physics",             "O_LEVEL", {"Paper 1": "11", "Paper 2": "21", "Paper 3": "31"}),
    "Principles of Accounts": SubjectMeta("7110", "Principles of Accounts", "O_LEVEL", {"Paper 1": "11", "Paper 2": "21"}),
}

LEVEL_MAP = {"IGCSE": IGCSE, "AS_LEVEL": AS_LEVEL, "O_LEVEL": O_LEVEL}


def find_subject(name: str, level: str) -> Optional[SubjectMeta]:
    registry = LEVEL_MAP.get(level.upper(), {})
    name_lower = name.strip().lower()
    for key, meta in registry.items():
        if key.lower() == name_lower:
            return meta
        if any(a.lower() == name_lower for a in meta.aliases):
            return meta
    return None


def find_by_code(code: str) -> Optional[SubjectMeta]:
    for registry in LEVEL_MAP.values():
        for meta in registry.values():
            if meta.code == code.strip():
                return meta
    return None
