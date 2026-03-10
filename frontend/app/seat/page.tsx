"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

/* -------------------- Theater Config -------------------- */

const theaterConfigs: Record<
  string,
  { rows: string[]; seatsPerRow: number; seatSize: number }
> = {

  "IMAX ": {
    rows: ["N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"],
    seatsPerRow: 24,
    seatSize: 34
  },

  "GOLD CLASS SUITE": {
    rows: ["E", "D", "C", "B", "A"],
    seatsPerRow: 10,
    seatSize: 70
  },

  "ULTRA SCREEN": {
    rows: ["H", "G", "F", "E", "D", "C", "B", "A"],
    seatsPerRow: 12,
    seatSize: 48
  },

  "4DX EXPERIENCE": {
    rows: ["J", "I", "H", "G", "F", "E", "D", "C", "B", "A"],
    seatsPerRow: 10,
    seatSize: 55
  }

};

const initialBookedSeats = ["A3", "B5", "C2", "D7", "B10", "F5", "G8", "L1"];

export default function SeatPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const movieTitle = searchParams.get("title") || "Please select a seating plan.";
  const theaterName = searchParams.get("theater") || "IMAX ";
  const movieId = searchParams.get("movieId");
  const showtimeId = searchParams.get("showtimeId");
  const duration = searchParams.get("duration") || "0";

  const config = theaterConfigs[theaterName] || theaterConfigs["IMAX "];

  const rows = config?.rows ?? [];
  const seatsPerRow = config?.seatsPerRow ?? 0;
  const seatSize = config?.seatSize ?? 48;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats] = useState<string[]>(initialBookedSeats);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const [recommendedSeats, setRecommendedSeats] = useState<string[]>([]);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isColorLegendOpen, setIsColorLegendOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  /* -------------------- CLOCK -------------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------- SINGLE WebSocket -------------------- */

  useEffect(() => {
    const ws = new WebSocket("wss://echo.websocket.events");

    ws.onmessage = (event) => {
      const seat = event.data;
      if (!seat) return;
      setLockedSeats(prev =>
        prev.includes(seat) ? prev : [...prev, seat]
      );
    };

    return () => ws.close();
  }, []);

  /* -------------------- ML Memory -------------------- */

  const getSeatHistory = () =>
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("seatHistory") || "[]")
      : [];

  const saveBehavior = (seat: string) => {
    const history = getSeatHistory();
    history.push(seat);
    localStorage.setItem("seatHistory", JSON.stringify(history));
  };

  const getFavoriteZone = () => {
    const history = getSeatHistory();
    if (history.length === 0) return null;

    const count: Record<string, number> = {};
    history.forEach((seat: string) => {
      const row = seat.charAt(0);
      count[row] = (count[row] || 0) + 1;
    });

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  };

  /* -------------------- ZONE -------------------- */

  const getZoneType = (row: string) => {
    if (row === "A") return "PREMIUM";
    if (row === "B") return "EXCLUSIVE";
    if (["C", "D", "E"].includes(row)) return "VIP";
    return "NORMAL";
  };

  const getSeatLevel = (row: string) => {
    if (row === "A") return { label: "Premium", icon: "💎", price: 450 };
    if (row === "B") return { label: "Exclusive", icon: "👑", price: 320 };
    if (["C", "D", "E"].includes(row)) return { label: "VIP", icon: "🌟", price: 240 };
    return { label: "Normal", icon: "🎬", price: 180 };
  };

  const getZoneStyle = (zone: string) => {
    switch (zone) {
      case "PREMIUM": return "bg-gradient-to-r from-purple-900/30 to-transparent";
      case "EXCLUSIVE": return "bg-gradient-to-r from-yellow-700/30 to-transparent";
      case "VIP": return "bg-gradient-to-r from-blue-800/20 to-transparent";
      default: return "bg-gradient-to-r from-gray-800/20 to-transparent";
    }
  };

  /* -------------------- SOUND / ANGLE -------------------- */

  const centerIndex = Math.floor(rows.length / 2);

  const getDB = (index: number) =>
    85 - Math.abs(index - centerIndex) * 3;

  const getAngle = (index: number) => {
    const distance = 2.5 + index * 0.9;
    return (Math.atan(12 / distance) * (180 / Math.PI)).toFixed(1);
  };

  /* -------------------- HEATMAP -------------------- */

  const popularityMap = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((row, rowIndex) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seat = `${row}${i}`;
        const score =
          100
          - Math.abs(rowIndex - centerIndex) * 10
          - Math.abs(i - (seatsPerRow / 2)) * 4
          + Math.random() * 15;
        map[seat] = Math.max(5, Math.min(100, score));
      }
    });
    return map;
  }, [rows, seatsPerRow]);

  const getHeatColor = (score: number) => {
    if (score > 80) return "linear-gradient(180deg,#ff4d4d,#8b0000)";
    if (score > 60) return "linear-gradient(180deg,#ff9900,#b34700)";
    if (score > 40) return "linear-gradient(180deg,#ffd633,#b38600)";
    return "linear-gradient(180deg,#333,#111)";
  };

  /* -------------------- AI -------------------- */

  const generateAI = () => {
    const favoriteRow = getFavoriteZone();

    const pool = Object.entries(popularityMap)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .filter(seat =>
        !bookedSeats.includes(seat) &&
        !lockedSeats.includes(seat)
      );

    let result: string[] = [];
    if (favoriteRow) {
      result = pool.filter(seat => seat.startsWith(favoriteRow));
    }
    if (result.length < 3) result = pool;

    const shuffled = result.sort(() => 0.5 - Math.random());
    setRecommendedSeats(shuffled.slice(0, 3));
  };

  useEffect(() => { generateAI(); }, [popularityMap, lockedSeats]);

  /* -------------------- TOGGLE -------------------- */

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat) || lockedSeats.includes(seat)) return;

    setSelectedSeats(prev => {
      const updated = prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat];
      saveBehavior(seat);
      return updated;
    });
  };

  const total = selectedSeats.reduce(
    (sum, seat) => sum + getSeatLevel(seat.charAt(0)).price,
    0
  );

  /* -------------------- UI -------------------- */

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-white p-8">

      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-yellow-400 tracking-widest">
          {movieTitle}
        </h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
          {theaterName} • Showtime {showtimeId}
        </p>
        <p className="text-green-400 text-sm mt-2">
          ⏰ Real-Time: {currentTime}
        </p>
      </div>
      <p className="text-gray-400 text-xs">
  ⏱ Duration: {duration} min
</p>

      {/* AI Banner */}
      <div className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black p-4 rounded-2xl text-center font-bold shadow-lg">
        🧠 AI Recommended Seats → {recommendedSeats.join(" , ")}
        <div className="mt-3">
          <button
            onClick={generateAI}
            className="px-4 py-1 bg-black text-yellow-400 rounded-lg text-xs font-bold"
          >
            🔄 Refresh AI
          </button>
        </div>
      </div>
      {/* ======================= LEGEND TOGGLE BUTTONS ======================= */}

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold"
        >
          🎖 คำอธิบายระดับที่นั่ง
        </button>

        <button
          onClick={() => setIsColorLegendOpen(!isColorLegendOpen)}
          className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold"
        >
          🎨 คำอธิบายสีที่นั่ง
        </button>
      </div>

      {/* ======================= LEGEND SECTION ======================= */}

      <div className="max-w-5xl mx-auto space-y-8 mb-10">

        {isLegendOpen && (
          <div className="bg-black border border-yellow-500/30 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-yellow-400 text-center mb-6">
              🎖 รายละเอียดระดับที่นั่งโรงภาพยนตร์
            </h2>

            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">

              <div className="bg-black/60 p-6 rounded-2xl border border-yellow-500/20">
                💎 Premium
                <p className="mb-2">
                  แถวหน้าสุด ใกล้จอมากที่สุด ราคา 450 บาท / ที่นั่ง
                </p>
              </div>

              <div className="bg-black/60 p-6 rounded-2xl border border-yellow-500/20">
                👑 Exclusive
                <p className="mb-2">
                  ระยะสมดุล ภาพเสียงดีที่สุด ราคา 320 บาท / ที่นั่ง
                </p>
              </div>

              <div className="bg-black/60 p-6 rounded-2xl border border-yellow-500/20">
                🌟 VIP
                <p className="mb-2">
                  กลางโรง มุมพอดี ไม่ล้าคอ ราคา 240 บาท / ที่นั่ง
                </p>
              </div>

              <div className="bg-black/60 p-6 rounded-2xl border border-yellow-500/20">
                🎬 Normal
                <p className="mb-2">
                  โซนมาตรฐาน ราคาประหยัด ราคา 180 บาท / ที่นั่ง
                </p>
              </div>

            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
              * ระดับที่นั่งอาจแตกต่างกันตามประเภทโรง (IMAX / 4DX / Gold Class)
            </div>
          </div>
        )}

        {isColorLegendOpen && (
          <div className="bg-black/70 border border-yellow-500/20 rounded-2xl p-6 text-center text-sm text-gray-300 shadow-xl">
            🔴 แดง = ยอดนิยมสูงสุด <br />
            🟠 ส้ม = ยอดนิยมสูง <br />
            🟡 เหลือง = ปานกลาง <br />
            ⚫ ดำ = ปกติ <br />
            ⚪ ขาว = เลือกแล้ว <br />
            ❌ กากบาท = จองแล้ว <br />
            🔒 ม่วง = กำลังถูกเลือก
          </div>
        )}

      </div>
      {/* SCREEN */}
      <div className="mt-10 mb-4 text-center">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
        <p className="text-xs text-gray-400 mt-2 tracking-widest">SCREEN</p>
      </div>

      {/* SEATING */}
      <div className="overflow-x-auto bg-black rounded-3xl p-10 border border-yellow-500/20">
        <div className="flex flex-col items-center space-y-6 min-w-max">

          {rows.map((row, rowIndex) => {

            const db = getDB(rowIndex);
            const angle = getAngle(rowIndex);
            const zone = getZoneType(row);
            const prevZone = rowIndex > 0 ? getZoneType(rows[rowIndex - 1]) : null;
            const showDivider = prevZone && prevZone !== zone;

            return (
              <div key={row} className="w-full flex flex-col items-center">

                {showDivider && (
                  <>
                    {/* เว้นช่องว่าง */}
                    <div className="h-6"></div>

                    {/* เส้นแบ่งโซน */}
                    <div className="w-full max-w-6xl flex items-center gap-4">
                      <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
                      <span className="text-xs text-yellow-400 font-bold tracking-widest">
                        {zone} ZONE
                      </span>
                      <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
                    </div>

                    <div className="h-6"></div>
                  </>
                )}

                <div className="flex items-center gap-6">

                  <span className={`flex items-center gap-6 rounded-xl px-4 py-2 ${getZoneStyle(zone)}`}>
                    {row}
                  </span>

                  <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${seatsPerRow},1fr)` }}
                  >
                    {Array.from({ length: seatsPerRow }).map((_, i) => {
                      const seat = `${row}${i + 1}`;
                      const isBooked = bookedSeats.includes(seat);
                      const isLocked = lockedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);
                      const isRecommended = recommendedSeats.includes(seat);

                      const heat = getHeatColor(popularityMap[seat]);

                      return (
                        <button
                          key={seat}
                          onClick={() => toggleSeat(seat)}
                          disabled={isBooked || isLocked}
                          className="flex flex-col items-center"
                        >
                          <div
                            style={{
                              width: seatSize,
                              height: seatSize,
                              background: isBooked
                                ? "#111"
                                : isLocked
                                  ? "#4c1d95"
                                  : isSelected
                                    ? "white"
                                    : heat,
                              border: isRecommended
                                ? "2px solid gold"
                                : "1px solid #222"
                            }}
                            className="relative rounded-t-2xl rounded-b-md shadow-xl flex items-center justify-center"
                          >

                            {isBooked && <span className="text-red-500 font-black text-lg">❌</span>}
                            {isLocked && <span className="text-white text-lg">🔒</span>}
                            {isSelected && <span className="text-black font-bold">✔</span>}
                            {!isBooked && !isLocked && !isSelected &&
                              <span className="text-xs">{getSeatLevel(row).icon}</span>
                            }
                          </div>

                          <span className="text-[10px] mt-1 text-gray-400">
                            {seat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-400 w-32">
                    🔊 {getDB(rowIndex)}dB <br />
                    🎯 {getAngle(rowIndex)}°
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* SUMMARY */}
      <div className="max-w-md mx-auto mt-12 bg-black p-6 rounded-2xl border border-yellow-500/20">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Total Payment
        </p>
        <p className="text-3xl font-black text-yellow-400">
          ฿{total}
        </p>

        <button
          disabled={selectedSeats.length === 0}
          onClick={() => router.push(
            `/checkout?movieId=${movieId}&showtimeId=${showtimeId}&theater=${theaterName}&seats=${selectedSeats.join(",")}&total=${total}&title=${movieTitle}`
          )}
          className="w-full mt-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black py-3 rounded-xl font-black uppercase disabled:opacity-30"
        >
          Confirm & Pay
        </button>
      </div>

    </main>
  );
}