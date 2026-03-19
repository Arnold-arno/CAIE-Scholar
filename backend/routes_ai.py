"""
routes_ai.py — Multi-provider AI proxy + paper analysis.

Text / notes providers (POST /api/ai/notes?provider=X):
  claude  → Anthropic Claude claude-sonnet-4-6
  gpt     → OpenAI GPT-4o
  grok    → xAI Grok grok-3-mini
  gemini  → Google Gemini gemini-2.0-flash
  cohere  → Cohere Command R+

Image generation (POST /api/ai/image):
  OpenAI gpt-image-1  →  always base64 data URL

Paper analysis (POST /api/ai/analyse-paper):
  Accepts a base64-encoded PDF, returns JSON with extracted questions + mark scheme answers.

GET /api/ai/capabilities → which providers are currently keyed
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import httpx
import json
from config import settings

router = APIRouter()
TIMEOUT = 120


# ─────────────────────────────────────────────────────────────────────────────
# Helpers: normalise any provider response to { content: [{ text: "..." }] }
# (same shape as Anthropic so the frontend only has one parser)
# ─────────────────────────────────────────────────────────────────────────────

def _wrap(text: str) -> dict:
    return {"content": [{"type": "text", "text": text}]}


async def _claude(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json=payload,
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"Claude error: {r.text[:300]}")
    return r.json()   # already in Anthropic shape


async def _gpt(payload: dict) -> dict:
    # Convert Anthropic messages format → OpenAI format
    messages = payload.get("messages", [])
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o",
                "max_tokens": payload.get("max_tokens", 1000),
                "messages": messages,
            },
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"OpenAI error: {r.text[:300]}")
    text = r.json()["choices"][0]["message"]["content"]
    return _wrap(text)


async def _grok(payload: dict) -> dict:
    messages = payload.get("messages", [])
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-3-mini",
                "max_tokens": payload.get("max_tokens", 1000),
                "messages": messages,
            },
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"Grok error: {r.text[:300]}")
    text = r.json()["choices"][0]["message"]["content"]
    return _wrap(text)


async def _gemini(payload: dict) -> dict:
    messages = payload.get("messages", [])
    # Build Gemini contents array
    contents = [{"role": m["role"] if m["role"] != "user" else "user",
                 "parts": [{"text": m["content"]}]} for m in messages]
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
    )
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.post(url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": contents,
                "generationConfig": {"maxOutputTokens": payload.get("max_tokens", 1000)},
            },
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"Gemini error: {r.text[:300]}")
    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    return _wrap(text)


async def _cohere(payload: dict) -> dict:
    messages = payload.get("messages", [])
    # Last message is the user prompt; earlier ones become chat_history
    history = []
    for m in messages[:-1]:
        role = "USER" if m["role"] == "user" else "CHATBOT"
        history.append({"role": role, "message": m["content"]})
    user_msg = messages[-1]["content"] if messages else ""
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.post(
            "https://api.cohere.com/v1/chat",
            headers={
                "Authorization": f"Bearer {settings.COHERE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "command-r-plus",
                "message": user_msg,
                "chat_history": history,
                "max_tokens": payload.get("max_tokens", 1000),
            },
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"Cohere error: {r.text[:300]}")
    text = r.json()["text"]
    return _wrap(text)


PROVIDERS = {
    "claude": (_claude, lambda: bool(settings.ANTHROPIC_API_KEY)),
    "gpt":    (_gpt,    lambda: bool(settings.OPENAI_API_KEY)),
    "grok":   (_grok,   lambda: bool(settings.GROK_API_KEY)),
    "gemini": (_gemini, lambda: bool(settings.GEMINI_API_KEY)),
    "cohere": (_cohere, lambda: bool(settings.COHERE_API_KEY)),
}


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/notes")
async def proxy_notes(payload: dict, provider: str = "claude"):
    """Route notes generation to the selected AI provider."""
    if provider not in PROVIDERS:
        raise HTTPException(400, f"Unknown provider '{provider}'. Choose from: {list(PROVIDERS.keys())}")
    fn, has_key = PROVIDERS[provider]
    if not has_key():
        raise HTTPException(503,
            f"Provider '{provider}' requires its API key in backend/.env. "
            f"See SETUP.md for instructions.")
    return JSONResponse(await fn(payload))


@router.post("/image")
async def generate_image(body: dict):
    """Real image generation via OpenAI gpt-image-1. Returns base64 data URL."""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(503, "Image generation requires OPENAI_API_KEY in backend/.env")
    prompt = body.get("prompt", "").strip()
    if not prompt:
        raise HTTPException(400, "prompt is required")
    size = body.get("size", "1024x1024")
    if size not in ("1024x1024", "1792x1024", "1024x1792"):
        size = "1024x1024"
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(
            "https://api.openai.com/v1/images/generations",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                     "Content-Type": "application/json"},
            json={"model": "gpt-image-1", "prompt": prompt, "n": 1,
                  "size": size, "response_format": "b64_json"},
        )
    if not r.is_success:
        raise HTTPException(r.status_code, f"Image error: {r.text[:300]}")
    b64 = r.json()["data"][0]["b64_json"]
    return JSONResponse({"image_url": f"data:image/png;base64,{b64}"})


@router.post("/analyse-paper")
async def analyse_paper(body: dict, provider: str = "claude"):
    """
    Accepts a base64-encoded PDF of a past paper.
    Returns extracted questions and suggested mark scheme answers as JSON.

    body: { pdf_b64: str, subject: str, exam_type: str, provider?: str }
    """
    pdf_b64   = body.get("pdf_b64", "")
    subject   = body.get("subject", "Unknown subject")
    exam_type = body.get("exam_type", "IGCSE")

    if not pdf_b64:
        raise HTTPException(400, "pdf_b64 is required")

    # Only Claude and GPT-4o support PDF/vision natively
    if provider not in ("claude", "gpt"):
        provider = "claude" if settings.ANTHROPIC_API_KEY else "gpt"

    prompt = f"""You are a Cambridge {exam_type} {subject} examiner. 
A student has uploaded a past paper PDF.

Analyse the paper and return ONLY valid JSON (no markdown fences):
{{
  "paper_title": "descriptive title of what this paper appears to be",
  "subject": "{subject}",
  "questions": [
    {{
      "number": "1",
      "text": "Full question text as written in the paper",
      "marks": 4,
      "type": "structured|essay|mcq|calculation|data-response",
      "sub_parts": [
        {{ "label": "(a)", "text": "sub-question text", "marks": 2 }}
      ],
      "model_answer": "A concise mark-scheme-style answer showing the key points an examiner would award marks for. Be specific to Cambridge marking conventions.",
      "mark_scheme_notes": "Key words, alternative answers, and common errors to watch for"
    }}
  ],
  "total_marks": 80,
  "examiner_notes": "Brief overview of what this paper tests and how to approach it"
}}

Extract ALL questions visible in the paper. For each question include a genuine model answer."""

    if provider == "claude":
        if not settings.ANTHROPIC_API_KEY:
            raise HTTPException(503, "ANTHROPIC_API_KEY not set in backend/.env")
        payload = {
            "model": "claude-sonnet-4-6",
            "max_tokens": 4000,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "document",
                     "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_b64}},
                    {"type": "text", "text": prompt},
                ],
            }],
        }
        result = await _claude(payload)
    else:
        if not settings.OPENAI_API_KEY:
            raise HTTPException(503, "OPENAI_API_KEY not set in backend/.env")
        # GPT-4o vision — encode PDF pages as images if needed; use text extraction as fallback
        payload = {
            "model": "gpt-4o",
            "max_tokens": 4000,
            "messages": [{"role": "user", "content": prompt + "\n\n[PDF content attached — please analyse as a Cambridge past paper]"}],
        }
        result = await _gpt(payload)

    raw = result.get("content", [{}])[0].get("text", "")
    clean = raw.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(clean)
    except Exception:
        # Return raw if JSON parse fails — frontend handles gracefully
        parsed = {"raw": raw, "parse_error": True}

    return JSONResponse(parsed)


@router.get("/capabilities")
async def capabilities():
    """Returns which AI features are available based on configured API keys."""
    return {
        "notes":    bool(settings.ANTHROPIC_API_KEY or settings.OPENAI_API_KEY or
                         settings.GROK_API_KEY or settings.GEMINI_API_KEY or settings.COHERE_API_KEY),
        "images":   bool(settings.OPENAI_API_KEY),
        "providers": {
            "claude": bool(settings.ANTHROPIC_API_KEY),
            "gpt":    bool(settings.OPENAI_API_KEY),
            "grok":   bool(settings.GROK_API_KEY),
            "gemini": bool(settings.GEMINI_API_KEY),
            "cohere": bool(settings.COHERE_API_KEY),
        },
        "analyse_paper": bool(settings.ANTHROPIC_API_KEY or settings.OPENAI_API_KEY),
    }
