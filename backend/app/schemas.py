from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

BookStatus = Literal["to_read", "reading", "read"]


class BookBase(BaseModel):
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    ol_key: Optional[str] = None


class BookCreate(BookBase):
    status: BookStatus = "to_read"


class BookUpdate(BaseModel):
    status: Optional[BookStatus] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review: Optional[str] = None


class BookOut(BookBase):
    id: int
    status: BookStatus
    rating: Optional[int] = None
    review: Optional[str] = None
    added_at: datetime
    finished_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SearchResult(BaseModel):
    ol_key: Optional[str] = None
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None


class GoalIn(BaseModel):
    goal: int = Field(ge=1, le=1000)


class GoalOut(BaseModel):
    year: int
    goal: int
