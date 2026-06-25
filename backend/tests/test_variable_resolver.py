from app.services.variable_resolver import resolve, resolve_obj


def test_resolves_known_variable():
    assert resolve("{{base}}/users", {"base": "http://x"}) == "http://x/users"


def test_leaves_unknown_variable():
    assert resolve("{{missing}}/x", {"base": "y"}) == "{{missing}}/x"


def test_resolves_with_spaces_in_braces():
    assert resolve("{{ base }}/u", {"base": "http://x"}) == "http://x/u"


def test_resolve_obj_recurses_lists_and_dicts():
    obj = [{"key": "Authorization", "value": "Bearer {{token}}"}]
    out = resolve_obj(obj, {"token": "abc"})
    assert out == [{"key": "Authorization", "value": "Bearer abc"}]
