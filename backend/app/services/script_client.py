import httpx

from app.config.settings import get_settings


def run_script(mode: str, code: str, context: dict) -> dict:
    if not code or not code.strip():
        return {"mutations": {}, "tests": [], "logs": [], "error": None}

    url = f"{get_settings().script_sidecar_url}/exec"
    payload = {"mode": mode, "code": code, "context": context}
    try:
        response = httpx.post(url, json=payload, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError:
        return {
            "mutations": {},
            "tests": [],
            "logs": [],
            "error": "script engine unavailable",
        }
