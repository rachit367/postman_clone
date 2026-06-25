from app.services import crypto


def test_encrypt_decrypt_roundtrip():
    token = crypto.encrypt("super-secret")
    assert token != "super-secret"
    assert crypto.decrypt(token) == "super-secret"


def test_is_encrypted_detects_token():
    token = crypto.encrypt("abc")
    assert crypto.is_encrypted(token) is True
    assert crypto.is_encrypted("plain text") is False
