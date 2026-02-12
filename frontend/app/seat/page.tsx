"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const rows = ["A", "B", "C", "D", "E"];
const seatsPerRow = 8;

// จำลองที่นั่งที่ถูกจองแล้ว
const bookedSeats = ["A3", "B5", "C2", "D7"];

export default function SeatPage() {
  const router = useRouter(); // ✅ ต้องอยู่ใน component
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const showtimeId = searchParams.get("showtimeId");

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-2">เลือกที่นั่ง</h1>
      <p className="mb-1">Movie ID: {movieId}</p>
      <p className="mb-6">Showtime ID: {showtimeId}</p>

      {/* Screen */}
      <div className="mb-8 text-center">
        <div className="bg-gray-600 text-black py-2 rounded mb-2">
          SCREEN
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3 max-w-xl mx-auto">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-6">{row}</span>
            <div className="flex gap-2">
              {Array.from({ length: seatsPerRow }).map((_, i) => {
                const seat = `${row}${i + 1}`;
                const isBooked = bookedSeats.includes(seat);
                const isSelected = selectedSeats.includes(seat);

                let bg = "bg-green-500";
                if (isBooked) bg = "bg-red-500";
                if (isSelected) bg = "bg-yellow-400";

                return (
                  <button
                    key={seat}
                    onClick={() => toggleSeat(seat)}
                    className={`${bg} w-10 h-10 rounded text-black font-semibold`}
                    disabled={isBooked}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500" /> ว่าง
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400" /> เลือก
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500" /> ถูกจอง
        </div>
      </div>

      {/* Selected seats */}
      <div className="mt-8 text-center">
        <p className="mb-2">
          ที่นั่งที่เลือก:{" "}
          {selectedSeats.length > 0
            ? selectedSeats.join(", ")
            : "ยังไม่ได้เลือก"}
        </p>

        <button
          disabled={selectedSeats.length === 0}
          onClick={() =>
            router.push(
              `/checkout?movieId=${movieId}&showtimeId=${showtimeId}&seats=${selectedSeats.join(",")}`
            )
          }
          className="mt-4 bg-yellow-500 text-black px-6 py-3 rounded disabled:opacity-50"
        >
          ไปชำระเงิน
        </button>
      </div>
    </main>
  );
}
