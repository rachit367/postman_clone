import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.config.settings import get_settings


def _build_fernet() -> Fernet:
    secret = get_settings().app_secret_key.encode("utf-8")
    digest = hashlib.sha256(secret).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt(plaintext: str) -> str:
    return _build_fernet().encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt(token: str) -> str:
    return _build_fernet().decrypt(token.encode("utf-8")).decode("utf-8")


def is_encrypted(value: str) -> bool:
    try:
        _build_fernet().decrypt(value.encode("utf-8"))
        return True
    except (InvalidToken, ValueError):
        return False
