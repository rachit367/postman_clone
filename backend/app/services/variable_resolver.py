import re

_PATTERN = re.compile(r"\{\{\s*([^}\s]+)\s*\}\}")


def resolve(text: str, variables: dict) -> str:
    if not isinstance(text, str):
        return text

    def replace(match):
        key = match.group(1)
        return str(variables[key]) if key in variables else match.group(0)

    return _PATTERN.sub(replace, text)


def resolve_obj(obj, variables: dict):
    if isinstance(obj, str):
        return resolve(obj, variables)
    if isinstance(obj, list):
        return [resolve_obj(item, variables) for item in obj]
    if isinstance(obj, dict):
        return {key: resolve_obj(value, variables) for key, value in obj.items()}
    return obj
