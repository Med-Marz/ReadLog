from typing import List

from fastapi import APIRouter, HTTPException, Query

from app.schemas import SearchResult
from app.services.openlibrary import search_books

router = APIRouter(tags=["search"])


@router.get("/search", response_model=List[SearchResult])
async def search(q: str = Query(..., min_length=1, max_length=200)):
    try:
        return await search_books(q)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenLibrary error: {exc}")
