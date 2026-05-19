from typing import List

import httpx

from app.config import settings


async def search_books(query: str, limit: int = 12) -> List[dict]:
    url = f"{settings.openlibrary_base_url}/search.json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params={"q": query, "limit": limit})
        response.raise_for_status()
        data = response.json()

    results: List[dict] = []
    for doc in data.get("docs", []):
        cover_id = doc.get("cover_i")
        authors = doc.get("author_name") or []
        results.append(
            {
                "ol_key": doc.get("key"),
                "title": doc.get("title", "Untitled"),
                "author": ", ".join(authors) if authors else None,
                "cover_url": (
                    f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg"
                    if cover_id
                    else None
                ),
                "first_publish_year": doc.get("first_publish_year"),
            }
        )
    return results
