"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 600;
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const movieId = searchParams.get("movieId");
  const showtimeId = searchParams.get("showtimeId");
  const seatsParam = searchParams.get("seats") || "";
  const seats = seatsParam.split(",").filter(Boolean);
  const totalParam = searchParams.get("total");
  const totalPrice = totalParam ? Number(totalParam) : 0;

  const [bookingId, setBookingId] = useState<number | null>(null);
  const [movie, setMovie] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);

  const progress = timeLeft / COUNTDOWN_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  useEffect(() => {
    if (!movieId) return;
    fetch(`http://127.0.0.1:8000/movies/${movieId}`)
      .then(res => res.json())
      .then(data => setMovie(data));
  }, [movieId]);

  useEffect(() => {
    if (!movieId || !showtimeId || seats.length === 0) return;

    fetch("http://127.0.0.1:8000/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: movieId,
        showtime_id: showtimeId,
        seats: seats.join(","),
        amount: totalPrice,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setBookingId(data.booking_id);
        setLoading(false);
      })
      .catch(() => {
        setError("ไม่สามารถสร้าง booking ได้");
        setLoading(false);
      });
  }, [movieId, showtimeId, seatsParam]);

  useEffect(() => {
    if (!bookingId) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          autoCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;

    const interval = setInterval(() => {
      fetch(`http://127.0.0.1:8000/payment-status/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "paid") {
            setPaymentStatus("paid");
            clearInterval(interval);
          }
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const cancelBooking = () => {
    if (bookingId) {
      fetch(`http://127.0.0.1:8000/admin/cancel/${bookingId}`, {
        method: "POST",
      });
    }
    router.push("/");
  };

  const autoCancel = () => {
    cancelBooking();
    alert("หมดเวลาชำระเงิน ระบบยกเลิกอัตโนมัติ");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white p-10 flex justify-center">
      <div className="max-w-4xl w-full">

        {/* Top Buttons */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setShowBackModal(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl"
          >
            ← ย้อนกลับ
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow-lg"
          >
            ✖ ยกเลิกการจอง
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center mt-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">กำลังสร้างรายการจอง...</p>
          </div>
        )}

        {!loading && movie && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

            <h1 className="text-4xl font-bold mb-8 text-yellow-400">
              Luxury Checkout
            </h1>

            <div className="flex gap-8">
              <img
                src={movie.poster_url}
                className="w-52 rounded-xl shadow-2xl"
                alt="poster"
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold">{movie.title}</h2>
                <p>รอบฉาย: {showtimeId}</p>
                <p>ที่นั่ง: {seats.join(", ")}</p>
                <p className="text-xl font-semibold mt-3 text-yellow-400">
                  {totalPrice} บาท
                </p>

                {/* Countdown Circle */}
                <div className="flex items-center gap-6 mt-6">
                  <svg width="180" height="180">
                    <circle
                      stroke="#333"
                      fill="transparent"
                      strokeWidth="12"
                      r={RADIUS}
                      cx="90"
                      cy="90"
                    />
                    <circle
                      stroke="#facc15"
                      fill="transparent"
                      strokeWidth="12"
                      r={RADIUS}
                      cx="90"
                      cy="90"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="white"
                      fontSize="22"
                    >
                      {formatTime(timeLeft)}
                    </text>
                  </svg>

                  <p className="text-gray-400">
                    เวลาที่เหลือในการชำระเงิน
                  </p>
                </div>
              </div>
            </div>

            {bookingId && (
              <div className="flex flex-col items-center mt-10 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-xl">
                  <img
                    src={`http://127.0.0.1:8000/promptpay/qr?booking_id=${bookingId}`}
                    className="w-64 h-64"
                    alt="QR"
                  />
                </div>

                <button
                  disabled={paymentStatus !== "paid"}
                  onClick={() => router.push(`/success?booking=${bookingId}`)}
                  className={`px-8 py-3 rounded-xl font-bold ${
                    paymentStatus === "paid"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  {paymentStatus === "paid"
                    ? "ไปหน้าสำเร็จ"
                    : "รอการชำระเงิน..."}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <Modal
            title="ยืนยันการยกเลิก"
            message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจอง?"
            onConfirm={cancelBooking}
            onClose={() => setShowCancelModal(false)}
          />
        )}

        {/* Back Modal */}
        {showBackModal && (
          <Modal
            title="ย้อนกลับ"
            message="หากย้อนกลับ ระบบจะยกเลิกการจอง"
            onConfirm={cancelBooking}
            onClose={() => setShowBackModal(false)}
          />
        )}
      </div>
    </main>
  );
}

function Modal({ title, message, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-white/10 w-96 text-center">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">{title}</h2>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-xl"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded-xl"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}