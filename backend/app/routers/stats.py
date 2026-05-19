from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Book, Setting
from app.schemas import GoalIn, GoalOut

router = APIRouter(tags=["stats"])

DEFAULT_GOAL = 12


def _goal_key(year: int) -> str:
    return f"goal_{year}"


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    year = datetime.now(timezone.utc).year

    counts = dict(
        db.query(Book.status, func.count(Book.id)).group_by(Book.status).all()
    )

    finished_this_year = (
        db.query(func.count(Book.id))
        .filter(Book.status == "read")
        .filter(func.strftime("%Y", Book.finished_at) == str(year))
        .scalar()
        or 0
    )

    top_authors_rows = (
        db.query(Book.author, func.count(Book.id).label("n"))
        .filter(Book.status == "read")
        .filter(Book.author.isnot(None))
        .filter(Book.author != "")
        .group_by(Book.author)
        .order_by(func.count(Book.id).desc())
        .limit(5)
        .all()
    )
    top_authors = [{"author": author, "count": count} for author, count in top_authors_rows]

    average_rating_row = (
        db.query(func.avg(Book.rating))
        .filter(Book.status == "read")
        .filter(Book.rating.isnot(None))
        .scalar()
    )
    average_rating = round(float(average_rating_row), 2) if average_rating_row else None

    setting = db.get(Setting, _goal_key(year))
    goal = int(setting.value) if setting else DEFAULT_GOAL

    return {
        "year": year,
        "counts": {
            "to_read": counts.get("to_read", 0),
            "reading": counts.get("reading", 0),
            "read": counts.get("read", 0),
        },
        "finished_this_year": finished_this_year,
        "goal": goal,
        "progress": round((finished_this_year / goal) * 100, 1) if goal else 0,
        "top_authors": top_authors,
        "average_rating": average_rating,
    }


@router.get("/settings/goal", response_model=GoalOut)
def get_goal(db: Session = Depends(get_db)):
    year = datetime.now(timezone.utc).year
    setting = db.get(Setting, _goal_key(year))
    return GoalOut(year=year, goal=int(setting.value) if setting else DEFAULT_GOAL)


@router.put("/settings/goal", response_model=GoalOut)
def set_goal(payload: GoalIn, db: Session = Depends(get_db)):
    year = datetime.now(timezone.utc).year
    key = _goal_key(year)
    setting = db.get(Setting, key)
    if setting:
        setting.value = str(payload.goal)
    else:
        db.add(Setting(key=key, value=str(payload.goal)))
    db.commit()
    return GoalOut(year=year, goal=payload.goal)
