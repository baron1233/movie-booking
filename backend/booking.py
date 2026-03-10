import sqlite3
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

import qrcode
import io
import crcmod

router = APIRouter()


# ---------------------------------------------------------
# DATABASE CONNECTION
# ---------------------------------------------------------
def get_db_connection():
    conn = sqlite3.connect("movie.db")
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------
# 1. CREATE BOOKING
# ---------------------------------------------------------
@router.post("/booking")
def create_booking(data: dict):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        raw_seats = data.get("seats", [])
        seat_list = [s.strip() for s in raw_seats.split(",")] if isinstance(raw_seats, str) else raw_seats

        if not seat_list:
            return {"status": "error", "message": "กรุณาเลือกที่นั่ง"}

        seats_str = ",".join(seat_list)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

        cur.execute("""
            INSERT INTO bookings (movie_id, showtime_id, seats, amount, status, expires_at)
            VALUES (?, ?, ?, ?, 'WAIT_CONFIRM', ?)
        """, (
            data.get("movie_id"),
            data.get("showtime_id"),
            seats_str,
            data.get("amount"),
            expires_at
        ))

        booking_id = cur.lastrowid

        placeholders = ",".join("?" * len(seat_list))
        cur.execute(f"""
            UPDATE seats 
            SET status='LOCKED', booking_id=? 
            WHERE showtime_id=? AND seat IN ({placeholders}) AND status='AVAILABLE'
        """, [booking_id, data.get("showtime_id"), *seat_list])

        if cur.rowcount < len(seat_list):
            conn.rollback()
            return {"status": "error", "message": "ที่นั่งบางส่วนถูกจองไปแล้ว"}

        conn.commit()
        return {"status": "success", "booking_id": booking_id, "expires_at": expires_at}

    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


# ---------------------------------------------------------
# 2. ADMIN: GET BOOKINGS
# ---------------------------------------------------------
@router.get("/admin/bookings")
def get_admin_bookings():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT b.*, m.title AS movie_title
            FROM bookings b
            LEFT JOIN movies m ON b.movie_id = m.id
            ORDER BY b.id DESC
        """)
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


# ---------------------------------------------------------
# 3. ADMIN: CANCEL BOOKING
# ---------------------------------------------------------
@router.post("/admin/cancel/{booking_id}")
@router.delete("/admin/cancel/{booking_id}")
def cancel_booking(booking_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT showtime_id, seats FROM bookings WHERE id = ?", (booking_id,))
        booking = cur.fetchone()

        if not booking:
            raise HTTPException(status_code=404, detail="ไม่พบรหัสการจองนี้")

        if booking["seats"]:
            seat_list = booking["seats"].split(",")
            placeholders = ",".join("?" * len(seat_list))
            cur.execute(f"""
                UPDATE seats 
                SET status='AVAILABLE', booking_id=NULL
                WHERE showtime_id=? AND seat IN ({placeholders})
            """, [booking["showtime_id"], *seat_list])

        cur.execute("UPDATE bookings SET status='CANCELLED' WHERE id=?", (booking_id,))
        conn.commit()

        return {"status": "success", "message": "ยกเลิกเรียบร้อย"}

    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


# ---------------------------------------------------------
# 4. ADMIN: CONFIRM PAYMENT
# ---------------------------------------------------------
@router.post("/admin/confirm/{booking_id}")
def confirm_payment(booking_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE bookings SET status='PAID' WHERE id=?", (booking_id,))
        cur.execute("UPDATE seats SET status='SOLD' WHERE booking_id=?", (booking_id,))
        conn.commit()
        return {"status": "success"}
    finally:
        conn.close()


# ---------------------------------------------------------
# 5. PROMPTPAY QR
# ---------------------------------------------------------
def crc16(payload: str):
    crc16_func = crcmod.mkCrcFun(0x11021, initCrc=0xFFFF, xorOut=0)
    return format(crc16_func(payload.encode("ascii")), "04X")


def generate_promptpay_qr(promptpay_id: str, amount: int):
    payload = (
        "000201010212"
        "29370016A000000677010111"
        f"01130066{promptpay_id}"
        "5802TH"
        f"5406{amount:06d}"
        "6304"
    )
    return payload + crc16(payload)


@router.get("/promptpay/qr")
def create_promptpay_qr(booking_id: int):

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT amount FROM bookings WHERE id=?", (booking_id,))
    booking = cur.fetchone()
    conn.close()

    if not booking:
        raise HTTPException(status_code=404, detail="ไม่พบ booking")

    amount = int(booking["amount"])

    promptpay_id = "8123456789"  # ใส่เบอร์จริงของคุณ

    qr_string = generate_promptpay_qr(promptpay_id, amount)

    img = qrcode.make(qr_string)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")