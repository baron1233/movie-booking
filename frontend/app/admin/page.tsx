"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  movie_id: string;
  showtime_id: string;
  seats: string;
  amount: number;
  status: string;
  slip?: string;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const res = await fetch("http://127.0.0.1:8000/admin/bookings");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  const confirmBooking = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/admin/confirm/${id}`, {
      method: "POST",
    });
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return <p className="p-10 text-white">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🎬 Admin Dashboard</h1>

      <table className="w-full border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">ID</th>
            <th>Movie</th>
            <th>Showtime</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Slip</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-gray-700 text-center">
              <td className="p-2">{b.id}</td>
              <td>{b.movie_id}</td>
              <td>{b.showtime_id}</td>
              <td>{b.seats}</td>
              <td>{b.amount}</td>
              <td
                className={
                  b.status === "PAID"
                    ? "text-green-400"
                    : b.status === "WAIT_CONFIRM"
                    ? "text-yellow-400"
                    : "text-gray-400"
                }
              >
                {b.status}
              </td>

              <td>
                {b.slip ? (
                  <a
                    href={`http://127.0.0.1:8000/${b.slip}`}
                    target="_blank"
                    className="text-blue-400 underline"
                  >
                    ดูสลิป
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td>
                {b.status === "WAIT_CONFIRM" && (
                  <button
                    onClick={() => confirmBooking(b.id)}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                  >
                    Confirm
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
