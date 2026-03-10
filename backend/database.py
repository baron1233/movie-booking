import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "booking.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # ================= 🎬 MOVIES =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS movies (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        poster TEXT,
        genre TEXT,
        theater_id INTEGER,
        theater_name TEXT
    )
    """)
    # ================= 🎫 BOOKINGS =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id TEXT,
        movie_title TEXT,
        theater_name TEXT,
        showtime_id TEXT,
        seats TEXT,
        amount INTEGER,
        status TEXT,
        slip TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
    )
    """)
    # ================= 💺 SEATS =================
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
    # ================= ⚠️ EMERGENCIES =================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS emergencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caseType TEXT,
        location TEXT,
        details TEXT,
        resolution TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)
    conn.commit()
    conn.close()