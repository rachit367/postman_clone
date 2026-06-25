def test_workspace_crud(client):
    created = client.post("/api/workspaces", json={"name": "WS One"}).json()
    assert created["name"] == "WS One"

    listed = client.get("/api/workspaces").json()
    assert [w["name"] for w in listed] == ["WS One"]

    renamed = client.patch(f"/api/workspaces/{created['id']}", json={"name": "WS Renamed"}).json()
    assert renamed["name"] == "WS Renamed"


def test_cannot_delete_last_workspace(client):
    ws = client.post("/api/workspaces", json={"name": "Only"}).json()
    response = client.delete(f"/api/workspaces/{ws['id']}")
    assert response.status_code == 400
    assert response.json()["error"]["type"] == "last_workspace"


def test_delete_workspace_cascades_data(client):
    keep = client.post("/api/workspaces", json={"name": "Keep"}).json()
    drop = client.post("/api/workspaces", json={"name": "Drop"}).json()

    client.post("/api/collections", json={"workspace_id": drop["id"], "name": "C"})
    client.post(
        "/api/environments",
        json={"workspace_id": drop["id"], "name": "E", "variables": []},
    )

    response = client.delete(f"/api/workspaces/{drop['id']}")
    assert response.status_code == 204

    assert client.get(f"/api/collections?workspace_id={drop['id']}").json() == []
    assert client.get(f"/api/environments?workspace_id={drop['id']}").json() == []
    assert [w["id"] for w in client.get("/api/workspaces").json()] == [keep["id"]]


def test_cross_workspace_isolation(client):
    ws_a = client.post("/api/workspaces", json={"name": "A"}).json()
    ws_b = client.post("/api/workspaces", json={"name": "B"}).json()

    client.post("/api/collections", json={"workspace_id": ws_a["id"], "name": "A-col"})
    client.post("/api/collections", json={"workspace_id": ws_b["id"], "name": "B-col"})

    a_cols = client.get(f"/api/collections?workspace_id={ws_a['id']}").json()
    b_cols = client.get(f"/api/collections?workspace_id={ws_b['id']}").json()
    assert [c["name"] for c in a_cols] == ["A-col"]
    assert [c["name"] for c in b_cols] == ["B-col"]
