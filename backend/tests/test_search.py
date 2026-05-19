from app.routers import search as search_router


async def _fake_search(query: str, limit: int = 12):
    return [
        {
            "ol_key": "/works/OL45804W",
            "title": f"Result for {query}",
            "author": "Frank Herbert",
            "cover_url": "https://covers.openlibrary.org/b/id/1-M.jpg",
            "first_publish_year": 1965,
        }
    ]


def test_search_returns_results(client, monkeypatch):
    monkeypatch.setattr(search_router, "search_books", _fake_search)

    response = client.get("/search", params={"q": "dune"})

    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Result for dune"
    assert results[0]["author"] == "Frank Herbert"


def test_search_requires_query(client):
    response = client.get("/search")
    assert response.status_code == 422


async def _broken_search(query: str, limit: int = 12):
    raise RuntimeError("upstream down")


def test_search_handles_upstream_failure(client, monkeypatch):
    monkeypatch.setattr(search_router, "search_books", _broken_search)

    response = client.get("/search", params={"q": "dune"})

    assert response.status_code == 502
