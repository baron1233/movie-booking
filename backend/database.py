import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "booking.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # ⭐ สำคัญมาก
    return conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ================= BOOKINGS =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id TEXT,
        showtime_id TEXT,
        seats TEXT,
        amount INTEGER,
        status TEXT,
        slip TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
    )
    """)

    # ================= SEATS =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS seats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        showtime_id TEXT,
        seat TEXT,
        status TEXT,
        booking_id INTEGER,
        locked_at DATETIME
    )
    """)

    conn.commit()
    conn.close()
