def test_collection_crud_and_tree(client, workspace_id):
    created = client.post(
        "/api/collections", json={"workspace_id": workspace_id, "name": "My API"}
    ).json()
    assert created["name"] == "My API"

    listed = client.get(f"/api/collections?workspace_id={workspace_id}").json()
    assert len(listed) == 1
    assert listed[0]["folders"] == []
    assert listed[0]["requests"] == []

    collection_id = created["id"]
    folder = client.post(
        f"/api/collections/{collection_id}/folders", json={"name": "auth"}
    ).json()
    assert folder["name"] == "auth"

    client.delete(f"/api/collections/{collection_id}")
    assert client.get(f"/api/collections?workspace_id={workspace_id}").json() == []


def test_request_secret_masked_and_revealed(client, workspace_id):
    collection_id = client.post(
        "/api/collections", json={"workspace_id": workspace_id, "name": "C"}
    ).json()["id"]
    payload = {
        "name": "Bearer call",
        "method": "GET",
        "url": "https://httpbin.org/get",
        "auth_type": "bearer",
        "auth_data": {"token": "super-secret-token"},
    }
    created = client.post(f"/api/collections/{collection_id}/requests", json=payload).json()
    assert created["auth_data"]["token"] == "••••••"

    revealed = client.get(f"/api/requests/{created['id']}/auth/reveal").json()
    assert revealed["token"] == "super-secret-token"


def test_root_requests_separated_from_folder_requests(client, workspace_id):
    collection_id = client.post(
        "/api/collections", json={"workspace_id": workspace_id, "name": "C"}
    ).json()["id"]
    folder = client.post(
        f"/api/collections/{collection_id}/folders", json={"name": "f"}
    ).json()
    client.post(
        f"/api/collections/{collection_id}/requests",
        json={"name": "root", "url": "http://x"},
    )
    client.post(
        f"/api/collections/{collection_id}/requests",
        json={"name": "nested", "url": "http://x", "folder_id": folder["id"]},
    )
    tree = client.get(f"/api/collections/{collection_id}").json()
    assert [r["name"] for r in tree["requests"]] == ["root"]
    assert [r["name"] for r in tree["folders"][0]["requests"]] == ["nested"]


def test_environment_activate_and_secret_reveal(client, workspace_id):
    env_a = client.post(
        "/api/environments",
        json={
            "workspace_id": workspace_id,
            "name": "dev",
            "variables": [{"key": "base", "value": "http://x"}],
        },
    ).json()
    env_b = client.post(
        "/api/environments",
        json={
            "workspace_id": workspace_id,
            "name": "prod",
            "variables": [{"key": "pw", "value": "hunter2", "is_secret": True}],
        },
    ).json()

    client.post(f"/api/environments/{env_a['id']}/activate")
    client.post(f"/api/environments/{env_b['id']}/activate")

    envs = {e["id"]: e for e in client.get(f"/api/environments?workspace_id={workspace_id}").json()}
    assert envs[env_a["id"]]["is_active"] is False
    assert envs[env_b["id"]]["is_active"] is True

    secret_var = envs[env_b["id"]]["variables"][0]
    assert secret_var["value"] == "••••••"
    revealed = client.get(f"/api/variables/{secret_var['id']}/reveal").json()
    assert revealed["value"] == "hunter2"


def test_missing_collection_returns_typed_error(client):
    response = client.get("/api/collections/999")
    assert response.status_code == 404
    assert response.json()["error"]["type"] == "not_found"
