import time

import httpx
from sqlalchemy.orm import Session

from app.repositories import environment as env_repo
from app.repositories import history as history_repo
from app.schemas.run import RunRequest, RunResponse, TestResult
from app.services import script_client
from app.services.variable_resolver import resolve, resolve_obj


def _enabled_pairs(items: list) -> list[tuple[str, str]]:
    pairs = []
    for item in items:
        if item.enabled and item.key:
            pairs.append((item.key, item.value))
    return pairs


def _build_auth_headers(auth_type: str, auth_data: dict) -> dict:
    if auth_type == "bearer":
        token = auth_data.get("token", "")
        return {"Authorization": f"Bearer {token}"} if token else {}
    if auth_type == "basic":
        import base64

        username = auth_data.get("username", "")
        password = auth_data.get("password", "")
        raw = f"{username}:{password}".encode("utf-8")
        return {"Authorization": "Basic " + base64.b64encode(raw).decode("utf-8")}
    return {}


def _prepare_body(payload: RunRequest, variables: dict):
    if payload.body_mode == "raw":
        return resolve(payload.body_raw or "", variables), None, None
    if payload.body_mode == "urlencoded":
        data = dict(resolve_obj(_enabled_pairs(payload.body_form), variables))
        return None, data, None
    if payload.body_mode == "form-data":
        data = dict(resolve_obj(_enabled_pairs(payload.body_form), variables))
        return None, None, data
    return None, None, None


def _error_envelope(error_type: str, message: str) -> dict:
    return {"error": {"type": error_type, "message": message}}


def execute(payload: RunRequest, db: Session) -> dict:
    variables = env_repo.active_variables(db, payload.environment_id)

    pre = script_client.run_script(
        "pre_request",
        payload.scripts.pre_request,
        {"environment": variables, "request": payload.model_dump()},
    )
    variables.update(pre.get("mutations", {}).get("env", {}))

    url = resolve(payload.url, variables)
    params = resolve_obj(_enabled_pairs(payload.query_params), variables)
    headers = dict(resolve_obj(_enabled_pairs(payload.headers), variables))
    headers.update(_build_auth_headers(payload.auth_type, resolve_obj(payload.auth_data, variables)))
    headers.update(pre.get("mutations", {}).get("headers", {}))

    content, urlencoded_data, form_data = _prepare_body(payload, variables)

    settings = payload.settings
    transport = httpx.HTTPTransport(retries=0)
    client_kwargs = {
        "verify": settings.ssl_verification,
        "follow_redirects": settings.follow_redirects,
        "max_redirects": settings.max_redirects,
        "timeout": 30.0,
        "transport": transport,
    }
    if settings.http_version == "http2":
        client_kwargs["http2"] = True

    started = time.perf_counter()
    try:
        with httpx.Client(**client_kwargs) as client:
            response = client.request(
                payload.method.upper(),
                url,
                params=params,
                headers=headers,
                content=content,
                data=urlencoded_data,
                files=form_data if form_data else None,
            )
    except httpx.TimeoutException:
        return _error_envelope("timeout", "Request timed out")
    except httpx.ConnectError:
        return _error_envelope("connection_error", "Could not connect to host")
    except httpx.InvalidURL:
        return _error_envelope("invalid_url", "The URL is invalid")
    except httpx.RequestError as error:
        return _error_envelope("request_error", str(error))

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    body_text = response.text
    size_bytes = len(response.content)
    response_headers = [
        {"key": key, "value": value, "enabled": True}
        for key, value in response.headers.items()
    ]

    test = script_client.run_script(
        "test",
        payload.scripts.test,
        {
            "environment": variables,
            "response": {
                "code": response.status_code,
                "body": body_text,
                "responseTime": elapsed_ms,
            },
        },
    )
    tests = [TestResult(**item).model_dump() for item in test.get("tests", [])]
    logs = pre.get("logs", []) + test.get("logs", [])

    result = RunResponse(
        status_code=response.status_code,
        status_text=response.reason_phrase,
        headers=response_headers,
        body=body_text,
        time_ms=elapsed_ms,
        size_bytes=size_bytes,
        tests=tests,
        logs=logs,
    )

    history_repo.create_history(
        db,
        method=payload.method.upper(),
        url=url,
        request_snapshot=payload.model_dump(),
        status_code=response.status_code,
        response_time_ms=elapsed_ms,
        response_size_bytes=size_bytes,
        response_snapshot=result.model_dump(),
    )

    return result.model_dump()
