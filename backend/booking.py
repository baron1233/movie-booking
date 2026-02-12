@app.post("/booking")
def create_booking(data: dict):
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("""
      INSERT INTO bookings (movie_id, showtime_id, seats, amount, status, created_at)
      VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))
    """, (
      data["movie_id"],
      data["showtime_id"],
      ",".join(data["seats"]),
      data["amount"]
    ))

    booking_id = cur.lastrowid
    conn.commit()
    conn.close()

    return {"booking_id": booking_id}
