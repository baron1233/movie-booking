"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PRICE_PER_SEAT = 150;

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const movieId = searchParams.get("movieId");
  const showtimeId = searchParams.get("showtimeId");
  const seatsParam = searchParams.get("seats") || "";
  const seats = seatsParam.split(",").filter(Boolean);

  const totalPrice = seats.length * PRICE_PER_SEAT;

  const [bookingId, setBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!movieId || !showtimeId || seats.length === 0) return;

    fetch("http://127.0.0.1:8000/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie_id: movieId,
        showtime_id: showtimeId,
        seats: seats.join(","),
        amount: totalPrice,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("create booking failed");
        return res.json();
      })
      .then((data) => {
        setBookingId(data.booking_id);
      })
      .catch(() => {
        setError("ไม่สามารถสร้าง booking ได้");
      });
  }, [movieId, showtimeId, seatsParam]);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">สรุปรายการจอง</h1>

      <div className="space-y-2 mb-6">
        <p>Movie ID: {movieId}</p>
        <p>Showtime ID: {showtimeId}</p>
        <p>ที่นั่ง: {seats.join(", ")}</p>
        <p className="text-xl font-semibold">
          ราคารวม: {totalPrice} บาท
        </p>
        <p>Booking ID: {bookingId ?? "กำลังสร้าง..."}</p>
      </div>

      {error && <p className="text-red-500">❌ {error}</p>}

      {bookingId && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-gray-300">
            กรุณาสแกน QR PromptPay เพื่อชำระเงิน
          </p>

          <img
            src={`http://127.0.0.1:8000/promptpay/qr?booking_id=${bookingId}`}
            className="w-64 h-64 bg-white p-2 rounded"
            alt="PromptPay QR"
          />
        </div>
      )}
    </main>
  );
}
