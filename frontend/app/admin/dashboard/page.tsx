"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("http://127.0.0.1:8000/admin/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
        }
        return res.json();
      })
      .then(setBookings);
  }, []);

  const confirmBooking = async (id: number) => {
    const token = localStorage.getItem("admin_token");

    await fetch(`http://127.0.0.1:8000/admin/confirm/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    location.reload();
  };

  return (
    <main className="p-10 text-white">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>

      {bookings.map((b) => (
        <div key={b.id} className="border p-4 mb-2">
          <p>ID: {b.id}</p>
          <p>Seats: {b.seats}</p>
          <p>Status: {b.status}</p>

          {b.status === "WAIT_CONFIRM" && (
            <button
              onClick={() => confirmBooking(b.id)}
              className="bg-green-500 px-3 py-1 text-black mt-2"
            >
              Confirm
            </button>
          )}
        </div>
      ))}
    </main>
  );
}
