"""Pretty-print the ReadLog SQLite database.

Run from the host:
    docker compose exec -T backend python < backend/scripts/show_db.py
"""
import sqlite3

DB_PATH = "data/readlog.db"


def trunc(value: object, width: int) -> str:
    text = "" if value is None else str(value)
    return text[: width - 1] + "…" if len(text) > width else text


def show_books(conn: sqlite3.Connection) -> None:
    print("BOOKS")
    print(f'{"ID":<4}{"TITLE":<40}{"AUTHOR":<25}{"STATUS":<10}{"RATING"}')
    print("-" * 85)
    rows = conn.execute(
        "SELECT id, title, author, status, rating FROM books ORDER BY id"
    ).fetchall()
    for r in rows:
        print(
            f"{r[0]:<4}{trunc(r[1], 40):<40}{trunc(r[2], 25):<25}"
            f"{trunc(r[3], 10):<10}{r[4] if r[4] is not None else ''}"
        )
    print(f"\nTotal: {len(rows)} books")


def show_settings(conn: sqlite3.Connection) -> None:
    print("\nSETTINGS")
    print(f'{"KEY":<20}{"VALUE"}')
    print("-" * 40)
    for r in conn.execute("SELECT key, value FROM settings"):
        print(f"{r[0]:<20}{r[1]}")


def show_counts(conn: sqlite3.Connection) -> None:
    print("\nCOUNT BY STATUS")
    print(f'{"STATUS":<15}{"COUNT"}')
    print("-" * 25)
    for r in conn.execute(
        "SELECT status, COUNT(*) FROM books GROUP BY status ORDER BY status"
    ):
        print(f"{r[0]:<15}{r[1]}")


if __name__ == "__main__":
    conn = sqlite3.connect(DB_PATH)
    show_books(conn)
    show_settings(conn)
    show_counts(conn)
    conn.close()
