def test_stats_default_goal_and_empty_counts(client):
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["counts"] == {"to_read": 0, "reading": 0, "read": 0}
    assert data["finished_this_year"] == 0
    assert data["goal"] >= 1
    assert data["top_authors"] == []
    assert data["average_rating"] is None


def test_stats_reflects_finished_book(client):
    created = client.post(
        "/books",
        json={"title": "Foundation", "author": "Isaac Asimov", "status": "to_read"},
    ).json()
    book_id = created["id"]

    client.patch(f"/books/{book_id}", json={"status": "read", "rating": 4})

    data = client.get("/stats").json()
    assert data["counts"]["read"] >= 1
    assert data["finished_this_year"] >= 1
    assert any(author["author"] == "Isaac Asimov" for author in data["top_authors"])
    assert data["average_rating"] is not None

    client.delete(f"/books/{book_id}")


def test_goal_can_be_updated(client):
    response = client.put("/settings/goal", json={"goal": 24})
    assert response.status_code == 200
    assert response.json()["goal"] == 24

    response = client.get("/settings/goal")
    assert response.json()["goal"] == 24


def test_goal_rejects_invalid_values(client):
    response = client.put("/settings/goal", json={"goal": 0})
    assert response.status_code == 422
