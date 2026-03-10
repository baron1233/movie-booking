"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

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
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

  }, [router]);

  /* ======================
     Confirm Booking
  ====================== */

  const confirmBooking = async (id: number) => {

    if (!confirm("ยืนยันว่าได้รับเงินแล้วใช่หรือไม่?")) return;

    const token = localStorage.getItem("admin_token");

    setProcessingId(id);

    try {

      const res = await fetch(`http://127.0.0.1:8000/admin/confirm/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {

        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? { ...b, status: "PAID" }
              : b
          )
        );

      } else {
        alert("Confirm Error");
      }

    } catch {
      alert("Server Error");
    }

    setProcessingId(null);
  };

  /* ======================
     Cancel Booking
  ====================== */

  const cancelBooking = async (id: number) => {

    if (!confirm("ต้องการยกเลิกการจองใช่หรือไม่?")) return;

    const token = localStorage.getItem("admin_token");

    setProcessingId(id);

    try {

      const res = await fetch(`http://127.0.0.1:8000/admin/cancel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {

        setBookings((prev) =>
          prev.filter((b) => b.id !== id)
        );

      } else {
        alert("Cancel Error");
      }

    } catch {
      alert("Server Error");
    }

    setProcessingId(null);
  };

  /* ======================
     Search Filter
  ====================== */

  const filteredBookings = bookings.filter((b) => {

    const movie = b.movie_title || "";
    const customer = b.customer_name || "";
    const txn = String(b.id);

    return (
      movie.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase()) ||
      txn.includes(search)
    );
  });

  return (

    <main className="min-h-screen bg-[#0a0a0a] p-10 text-white font-sans">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-4xl font-serif font-black uppercase tracking-tighter">
              Admin Console
            </h1>

            <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Management Terminal
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Back to Home
          </button>

        </div>

        {/* SEARCH */}

        <div className="mb-10">

          <input
            type="text"
            placeholder="Search movie / customer / txn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 px-6 py-4 rounded-2xl text-sm focus:outline-none"
          />

        </div>

        {/* LOADING */}

        {isLoading ? (

          <div className="text-center py-20 text-gray-500 animate-pulse font-black uppercase tracking-widest">
            Accessing Database...
          </div>

        ) : (

          <div className="grid gap-6">

            {filteredBookings.length === 0 && (

              <div className="text-center py-20 border border-white/5 rounded-[3rem] text-gray-600 uppercase tracking-[0.5em] text-[10px]">
                No bookings found
              </div>

            )}

            {filteredBookings.map((b) => (

              <div
                key={b.id}
                className={`bg-[#0f0f0f] border ${
                  b.status === "PAID"
                    ? "border-green-500/30"
                    : "border-white/5"
                } p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between gap-8`}
              >

                <div className="flex-1">

                  {/* STATUS */}

                  <div className="flex items-center gap-3 mb-6">

                    <span className="text-[9px] font-black bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-full uppercase tracking-widest">
                      TXN: {b.id}
                    </span>

                    <span
                      className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        b.status === "PAID"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : b.status === "WAIT_CONFIRM"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {b.status}
                    </span>

                  </div>

                  {/* MOVIE */}

                  <h3 className="text-2xl font-serif font-black mb-6 uppercase">
                    {b.movie_title}
                  </h3>

                  {/* DETAILS */}

                  <div className="space-y-3 border-l-2 border-white/5 pl-6">

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Genre
                      </span>
                      <div className="text-purple-400 font-bold">
                        {b.genre}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Theater
                      </span>
                      <div className="text-cyan-400 font-bold">
                        {b.theater}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Showtime
                      </span>
                      <div className="text-orange-400 font-bold">
                        {b.showtime}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Customer
                      </span>
                      <div className="text-white font-bold">
                        {b.customer_name}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Seats
                      </span>
                      <div className="text-yellow-500 font-bold">
                        {b.seats}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Total
                      </span>
                      <div className="text-lg font-black">
                        {Number(b.amount).toLocaleString()} THB
                      </div>
                    </div>

                  </div>

                </div>

                {/* ACTION BUTTONS */}

                <div className="flex flex-col gap-3 w-full md:w-auto">

                  {b.status === "WAIT_CONFIRM" && (

                    <button
                      disabled={processingId === b.id}
                      onClick={() => confirmBooking(b.id)}
                      className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {processingId === b.id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                  )}

                  {b.status !== "PAID" && (

                    <button
                      disabled={processingId === b.id}
                      onClick={() => cancelBooking(b.id)}
                      className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {processingId === b.id
                        ? "Processing..."
                        : "Cancel Order"}
                    </button>

                  )}

                  {b.status === "PAID" && (

                    <div className="px-6 py-3 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">
                      Ready for Ticket
                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );
}