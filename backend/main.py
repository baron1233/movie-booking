from fastapi import (
    FastAPI, UploadFile, File,
    Depends, Header, HTTPException
)
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List # เพิ่มสำหรับการระบุ List ใน Type Hint

import qrcode, io, os, asyncio
from datetime import datetime, timedelta

# มั่นใจว่าไฟล์เหล่านี้มีอยู่จริงตามโครงสร้างเดิมของคุณ
from database import init_db, get_db
from promptpay import generate_promptpay_qr

# =====================================================
# APP
# =====================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# CONFIG & MODELS (ส่วนเดิม)
# =====================================================
PROMPTPAY_ID = "0959422602"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ADMIN_TOKEN = "SECRET_ADMIN_TOKEN_123"

init_db()

class BookingCreate(BaseModel):
    movie_id: str
    showtime_id: str
    seats: str
    amount: int

class AdminLogin(BaseModel):
    username: str
    password: str

# --- เพิ่ม Model สำหรับ Coming Soon ---
class UpcomingMovie(BaseModel):
    id: str
    title: str
    release_date: str
    poster: str
    genre: str
    description: str

# =====================================================
# MOCK DATA: COMING SOON
# =====================================================
# ข้อมูลจำลองสำหรับปุ่ม Coming Soon
UPCOMING_MOVIES_DATA = [
    {
        "id": "u1",
        "title": "AVATAR 3: FIRE AND ASH",
        "release_date": "DEC 2026",
        "poster": "https://m.media-amazon.com/images/M/MV5BMjA3NTY3MTY5Nl5BMl5BanBnXkFtZTgwNjkyNGRjNjM@._V1_.jpg", # ลิงก์รูปตัวอย่าง
        "genre": "SCI-FI / ACTION",
        "description": "The journey continues into the volcanic regions of Pandora."
    },
    {
        "id": "u2",
        "title": "THE BATMAN: PART II",
        "release_date": "OCT 2026",
        "poster": "https://m.media-amazon.com/images/M/MV5BM2MyNWVmOTAtYzhjZi00NWU1LTgzNzYtZTk2ZTQyYWJhZGYwXkEyXkFqcGdeQXVyMTM1NjM2ODg1._V1_.jpg",
        "genre": "CRIME / DRAMA",
        "description": "Gotham's detective descends deeper into the city's corrupt heart."
    }
]

# =====================================================
# ✅ NEW ENDPOINT: GET COMING SOON
# =====================================================
@app.get("/api/movies/upcoming", response_model=List[UpcomingMovie])
async def get_upcoming_movies():
    """ สำหรับดึงรายชื่อหนังที่กำลังจะมาถึง เพื่อไปโชว์ใน Frontend """
    return UPCOMING_MOVIES_DATA

# =====================================================
# ADMIN AUTH (Bearer Token) - ส่วนเดิมของคุณ
# =====================================================
def admin_auth(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")

    return True

# =====================================================
# AUTO CANCEL & ADMIN ROUTES (ส่วนเดิมของคุณ)
# =====================================================

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(auto_cancel_worker())

async def auto_cancel_worker():
    while True:
        await asyncio.sleep(60)
        conn = get_db()
        cur = conn.cursor()
        now = datetime.utcnow().isoformat()
        rows = cur.execute("SELECT id, showtime_id, seats FROM bookings WHERE status='PENDING' AND expires_at < ?", (now,)).fetchall()
        for booking_id, showtime_id, seats in rows:
            cur.execute("UPDATE bookings SET status='CANCELLED' WHERE id=?", (booking_id,))
            for seat in seats.split(","):
                cur.execute("UPDATE seats SET status='AVAILABLE', booking_id=NULL, locked_at=NULL WHERE showtime_id=? AND seat=?", (showtime_id, seat))
        conn.commit()
        conn.close()

@app.post("/admin/login")
def admin_login(data: AdminLogin):
    if data.username != ADMIN_USERNAME or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": ADMIN_TOKEN}

@app.post("/booking")
def create_booking(data: BookingCreate):
    conn = get_db()
    cur = conn.cursor()
    seat_list = [s.strip() for s in data.seats.split(",")]
    placeholders = ",".join("?" * len(seat_list))
    try:
        conn.execute("BEGIN")
        rows = cur.execute(f"SELECT seat FROM seats WHERE showtime_id=? AND seat IN ({placeholders}) AND status!='AVAILABLE'", [data.showtime_id, *seat_list]).fetchall()
        if rows:
            conn.rollback()
            return {"error": "Seats already locked", "seats": [r[0] for r in rows]}
        expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
        cur.execute("INSERT INTO bookings (movie_id, showtime_id, seats, amount, status, expires_at) VALUES (?, ?, ?, ?, 'PENDING', ?)", (data.movie_id, data.showtime_id, data.seats, data.amount, expires_at))
        booking_id = cur.lastrowid
        now = datetime.utcnow().isoformat()
        cur.execute(f"UPDATE seats SET status='LOCKED', booking_id=?, locked_at=? WHERE showtime_id=? AND seat IN ({placeholders})", [booking_id, now, data.showtime_id, *seat_list])
        conn.commit()
        return {"booking_id": booking_id, "expires_at": expires_at}
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        conn.close()

@app.get("/promptpay/qr")
def promptpay_qr(booking_id: int):
    conn = get_db()
    row = conn.execute("SELECT amount FROM bookings WHERE id=?", (booking_id,)).fetchone()
    conn.close()
    if not row: raise HTTPException(status_code=404, detail="Booking not found")
    payload = generate_promptpay_qr(PROMPTPAY_ID, row[0])
    img = qrcode.make(payload)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.post("/upload-slip/{booking_id}")
def upload_slip(booking_id: int, file: UploadFile = File(...)):
    os.makedirs("slips", exist_ok=True)
    path = f"slips/{booking_id}.png"
    with open(path, "wb") as f:
        f.write(file.file.read())
    conn = get_db()
    conn.execute("UPDATE bookings SET slip=?, status='WAIT_CONFIRM' WHERE id=?", (path, booking_id))
    conn.commit()
    conn.close()
    return {"status": "WAIT_CONFIRM"}

@app.post("/admin/confirm/{booking_id}")
def admin_confirm(booking_id: int, auth=Depends(admin_auth)):
    conn = get_db()
    cur = conn.cursor()
    row = cur.execute("SELECT showtime_id, seats FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Booking not found")
    showtime_id, seats = row
    cur.execute("UPDATE bookings SET status='PAID' WHERE id=?", (booking_id,))
    for seat in seats.split(","):
        cur.execute("UPDATE seats SET status='PAID' WHERE showtime_id=? AND seat=?", (showtime_id, seat))
    conn.commit()
    conn.close()
    return {"status": "PAID"}

@app.delete("/admin/cancel/{booking_id}")
@app.post("/admin/cancel/{booking_id}")
def admin_cancel(booking_id: int, auth=Depends(admin_auth)):
    conn = get_db()
    cur = conn.cursor()
    row = cur.execute("SELECT showtime_id, seats FROM bookings WHERE id=?", (booking_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Booking not found")
    showtime_id, seats = row
    for seat in seats.split(","):
        cur.execute("UPDATE seats SET status='AVAILABLE', booking_id=NULL, locked_at=NULL WHERE showtime_id=? AND seat=?", (showtime_id, seat))
    cur.execute("DELETE FROM bookings WHERE id=?", (booking_id,))
    conn.commit()
    conn.close()
    return {"status": "CANCELLED", "message": f"Booking {booking_id} has been removed"}

@app.get("/admin/bookings")
def admin_list_bookings(auth=Depends(admin_auth)):
    conn = get_db()
    rows = conn.execute("""
        SELECT b.id, b.movie_id, b.showtime_id, b.seats, b.amount, b.status, b.slip, m.title
        FROM bookings b
        LEFT JOIN movies m ON b.movie_id = m.id
        ORDER BY b.id DESC
    """).fetchall()
    conn.close()
    return [
        {
            "id": r[0], "movie_id": r[1], "showtime_id": r[2], "seats": r[3],
            "amount": r[4], "status": r[5], "slip": r[6],
            "movie_title": r[7] if r[7] else f"Movie ID: {r[1]}"
        } for r in rows
    ]

@app.post("/admin/init-seats")
def init_seats(showtime_id: str, auth=Depends(admin_auth)):
    conn = get_db()
    cur = conn.cursor()
    for r in ["A", "B", "C", "D" ,"E" ,"F" ,"G" , "H" ,"I" , "J" , "K" , "L" , "M" ,"N"]:
        for c in range(1, 24):
            cur.execute("INSERT INTO seats (showtime_id, seat, status) VALUES (?, ?, 'AVAILABLE')", (showtime_id, f"{r}{c}"))
    conn.commit()
    conn.close()
    return {"status": "seats initialized"}