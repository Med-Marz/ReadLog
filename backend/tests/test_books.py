def test_create_and_list_book(client):
    payload = {"title": "Dune", "author": "Frank Herbert", "status": "to_read"}
    response = client.post("/books", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Dune"
    assert created["status"] == "to_read"
    book_id = created["id"]

    response = client.get("/books")
    assert response.status_code == 200
    titles = [b["title"] for b in response.json()]
    assert "Dune" in titles

    response = client.patch(f"/books/{book_id}", json={"status": "read", "rating": 5})
    assert response.status_code == 200
    updated = response.json()
    assert updated["status"] == "read"
    assert updated["rating"] == 5
    assert updated["finished_at"] is not None

    response = client.delete(f"/books/{book_id}")
    assert response.status_code == 204


def test_update_missing_book_returns_404(client):
    response = client.patch("/books/999999", json={"status": "read"})
    assert response.status_code == 404
