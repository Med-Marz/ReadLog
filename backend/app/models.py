from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    ol_key = Column(String, index=True)
    title = Column(String, nullable=False)
    author = Column(String)
    cover_url = Column(String)
    status = Column(String, nullable=False, default="to_read", index=True)
    rating = Column(Integer)
    review = Column(Text)
    added_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    finished_at = Column(DateTime)


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
