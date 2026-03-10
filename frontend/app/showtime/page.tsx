"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

/* =========================================================
   🎬 ULTRA CINEMA ENTERPRISE EXPERIENCE – CONNECT POLICY
   ========================================================= */

/* -------------------- UTILITIES -------------------- */
const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const generateNextDays = (days = 7) => {
  const arr: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    arr.push(d);
  }
  return arr;
};

/* -------------------- PERSONALITY -------------------- */

const personalityTypes = [
  "Quiet Seeker",
  "Social Viewer",
  "Night Owl",
  "Premium Experience"
] as const;

type Personality = typeof personalityTypes[number];

const getStoredPersonality = (): Personality => {
  if (typeof window === "undefined") return "Premium Experience";
  return (localStorage.getItem("cine_personality") as Personality) || "Experience";
};

const savePersonality = (p: Personality) => {
  localStorage.setItem("cine_personality", p);
};

/* -------------------- DEMAND FORECAST -------------------- */

const forecastDemand = (date: Date) => {
  const day = date.getDay();
  const volatility = 0.9 + Math.random() * 0.2;

  if (day === 5 || day === 6 || day === 0)
    return { label: "High Demand Weekend", multiplier: 1.35 * volatility };

  if (day === 3)
    return { label: "Midweek Surge", multiplier: 1.18 * volatility };

  return { label: "Normal Demand", multiplier: 1.0 * volatility };
};

/* -------------------- CROWD -------------------- */

const getCrowdLevel = (occupancy: number) => {
  if (occupancy < 40) return { label: "Low", color: "bg-green-500" };
  if (occupancy < 75) return { label: "Medium", color: "bg-yellow-500" };
  return { label: "High", color: "bg-red-500" };
};

/* -------------------- LATE NIGHT RULES -------------------- */

const lateNightRules = {
  th: {
    title: "ข้อปฏิบัติรอบดึก",
    items: [
      "🌙 วางแผนเดินทางกลับ",
      "🔕 ลดเสียงรบกวน",
      "👕 แต่งกายสุภาพ",
      "💼 ระวังทรัพย์สิน",
      "📱 หลีกเลี่ยงหน้าจอสว่าง",
      "🚫 ไม่ออกระหว่างฉาย",
      "🕒 เช็คเวลาปิดห้าง",
      "👨‍👩‍👧 ผู้เยาว์มีผู้ปกครอง",
      "🤫 ไม่ก่อความรำคาญ",
      "🎟 เคารพผู้ชมอื่น"
    ]
  },
  en: {
    title: "Late Night Guidelines",
    items: [
      "🌙 Plan transport",
      "🔕 Keep noise low",
      "👕 Dress properly",
      "💼 Protect belongings",
      "📱 Avoid bright screens",
      "🚫 Stay during screening",
      "🕒 Respect mall hours",
      "👨‍👩‍👧 Minors supervised",
      "🤫 No disturbance",
      "🎟 Respect others"
    ]
  }
};

/* ========================================================= */

export default function ShowtimePage() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get("movieId") || "";
  const movieTitle = searchParams.get("title") || "Select Movie";
  const movieGenre = searchParams.get("genre") || "Action";
  

  const nextDays = useMemo(() => generateNextDays(7), []);
  const [selectedDate, setSelectedDate] = useState<Date>(nextDays[0]);
  const [customDate, setCustomDate] = useState("");

  const [language, setLanguage] = useState<"th" | "en">("th");
  const [personality, setPersonality] = useState<Personality>(getStoredPersonality());
  const [aiSeed, setAiSeed] = useState(Math.random());

  const [readinessOpen, setReadinessOpen] = useState(false);
  const [lateOpen, setLateOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [hoveredShowtime, setHoveredShowtime] = useState<string | null>(null);
  /* -------- Real-time Temperature -------- */

  const [theaterTemp, setTheaterTemp] = useState(22);

  useEffect(() => {
    const interval = setInterval(() => {
      setTheaterTemp(prev => {
        const drift = (Math.random() - 0.5) * 0.8;
        return Math.round((prev + drift) * 10) / 10;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => savePersonality(personality), [personality]);

  const demand = forecastDemand(selectedDate);

  /* -------- THEATER TIMES -------- */

  const theaters = {
    "Theater 1": ["10:00", "13:00", "16:00", "19:00"],
    "Theater 2": ["11:00", "14:30", "18:00", "21:30"],
    "IMAX Hall": ["12:45" , "13:00", "16:30", "21:00"]
  };
  /* -------- FIXED FULL SHOWTIMES -------- */

  const fullShowtimeMap: Record<string, string[]> = {
    "Theater 1": ["16:00"],
    "Theater 2": ["18:00"],
    "IMAX Hall": ["12:45"]
  };

  const showtimes = useMemo(() => {

    const arr: any[] = [];

    Object.entries(theaters).forEach(([theater, times]) => {
      times.forEach(time => {

        // ✅ ตรวจว่ารอบนี้ถูกกำหนดให้เต็มหรือไม่
        const isForcedFull =
          fullShowtimeMap[theater]?.includes(time) || false;

        // ✅ คำนวณ occupancy ปกติ
        let baseOcc = Math.floor(Math.random() * 80);

        let adjusted = Math.min(
          100,
          Math.floor(baseOcc * demand.multiplier)
        );

        // ✅ ถ้าถูกบังคับให้เต็ม → 100%
        if (isForcedFull) {
          adjusted = 100;
        }

        arr.push({
          theater,
          time,
          occupancy: adjusted,
          isFull: isForcedFull || adjusted > 95
        });

      });
    });

    return arr;

  }, [selectedDate, aiSeed]);
  /* -------- AI ENGINE -------- */

  const recommended = useMemo(() => {

    return showtimes
      .map(s => {

        let score = Math.random() * 2;

        if (!s.isFull) score += 4;
        if (personality === "Quiet Seeker" && s.occupancy < 50) score += 4;
        if (personality === "Social Viewer" && s.occupancy > 70) score += 4;
        if (personality === "Night Owl" && s.time >= "18:00") score += 4;
        if (personality === "Premium Experience" && s.theater === "IMAX Hall") score += 5;

        return { ...s, score };

      })
      .sort((a, b) => b.score - a.score)[0];

  }, [showtimes, personality, aiSeed]);

  

  /* ========================================================= */

  return (
    <main className="relative min-h-screen text-white p-10 overflow-hidden
  bg-[radial-gradient(circle_at_20%_0%,#3b2a0a_0%,#1a1a1a_40%,#0f0f0f_75%)]
">
      {/* ✨ GOLD AMBIENT LIGHT */}
      <div className="absolute inset-0
  bg-[radial-gradient(circle_at_30%_20%,rgba(50, 45, 18, 0.71),transparent_60%)]
  pointer-events-none"
      />


      <div className="absolute inset-0 pointer-events-none
  bg-[radial-gradient(circle_at_30%_80%,rgba(84, 76, 45, 0.52),transparent_60%)]
" />
      {/* 💎 EXCLUSIVE DIAMOND SHINE */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 bg-repeat animate-pulse"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <defs>
          <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='gold'/>
            <stop offset='100%' stop-color='#fff8dc'/>
          </linearGradient>
        </defs>
        <polygon points='50,5 95,50 50,95 5,50' fill='url(%23g)'/>
      </svg>
    ")`,
          backgroundSize: "140px 140px"
        }}
      />
      {/* TOP RIGHT CONTROLS */}
      <div className="absolute top-5 right-5 flex gap-3">

        <button
          onClick={() => setLanguage(language === "th" ? "en" : "th")}
          className="border border-yellow-500 px-3 py-2 rounded-lg"
        >
          🌐 {language === "th" ? "EN" : "TH"}
        </button>

        <button
          onClick={() => setAiSeed(Math.random())}
          className="border border-cyan-500 px-3 py-2 rounded-lg"
        >
          🔁 Refresh AI
        </button>

        <button
          onClick={() => window.location.reload()}
          className="border border-red-500 px-3 py-2 rounded-lg"
        >
          ♻ Refresh System
        </button>

      </div>

      <h1 className="text-5xl font-bold text-yellow-400">{movieTitle}</h1>
      <p className="text-yellow-300">{movieGenre}</p>

      <div className="mt-3 text-cyan-400">
        📊 {demand.label}
        <div className="mt-2 text-lg text-yellow-200">
          📅 Booking Date: {formatDisplayDate(selectedDate)}
        </div>
      </div>

      <div className="mt-3">
        🌡 {theaterTemp}°C
      </div>

      {/* Personality Control */}
      <div className="mt-4 flex gap-3">
        {personalityTypes.map(p => (
          <button
            key={p}
            onClick={() => setPersonality(p)}
            className={`px-3 py-2 border rounded ${personality === p
              ? "bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] text-black shadow-[0_0_20px_rgba(212,175,55,0.8)]"
              : "bg-black text-white hover:bg-[#D4AF37]/20"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* DATE PICKER */}
      <div className="mt-6 flex gap-4 items-center">
        {nextDays.map(d => (
          <button
            key={d.toDateString()}
            onClick={() => setSelectedDate(d)}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300
border-[#B8860B]

${formatDate(d) === formatDate(selectedDate)
  ? "bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] text-black shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-105"
  : "bg-black text-white hover:bg-[#D4AF37]/20"
}`}
          >
            {formatDate(d)}
          </button>
        ))}
      </div>
      <input
        type="date"
        value={customDate}
        onChange={(e) => {
          setCustomDate(e.target.value);
          setSelectedDate(new Date(e.target.value));
        }}
        className="bg-black border border-yellow-500 px-3 py-2 rounded
             transition-all duration-300
             hover:shadow-[0_0_15px_rgba(234,179,8,0.7)]
             hover:border-yellow-400
             focus:outline-none
             focus:shadow-[0_0_20px_rgba(234,179,8,0.9)]
             focus:border-yellow-300"
      />

      {/* POLICY BUTTON CONNECTED TO PAGE */}
      <div className="mt-6 flex gap-4">

        <button
          onClick={() => router.push("/cinema_policy")}
          className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold"
        >
          📜 Cinema Policy
        </button>

        <button
          onClick={() => setLateOpen(true)}
          className="bg-purple-500 px-4 py-2 rounded-xl font-bold"
        >
          🌙 Late Night
        </button>

      </div>

      {/* SHOWTIMES */}
      {/* SHOWTIMES */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">

        {showtimes.map((s, i) => {

          const crowd = getCrowdLevel(s.occupancy);

          const isRecommended =
            recommended?.time === s.time &&
            recommended?.theater === s.theater;

          const isSelected =
            selectedShowtime === `${s.theater}-${s.time}`;

          const isHovered =
            hoveredShowtime === `${s.theater}-${s.time}`;

          return (
            <div
              key={i}
              onClick={() =>
                setSelectedShowtime(`${s.theater}-${s.time}`)
              }
              onMouseEnter={() =>
                setHoveredShowtime(`${s.theater}-${s.time}`)
              }
              onMouseLeave={() =>
                setHoveredShowtime(null)
              }
              className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300

          ${isSelected
                  ? "border-cyan-400 ring-4 ring-cyan-400 scale-105"
                  : ""
                }

          ${isHovered && !isSelected
                  ? "border-yellow-400 ring-2 ring-yellow-400 scale-102"
                  : ""
                }

          ${!isSelected && !isHovered
                  ? "border-gray-600"
                  : ""
                }

          ${isRecommended
                  ? "ring-4 ring-yellow-400"
                  : ""
                }
        `}
            >
              <h3 className="text-xl font-bold text-yellow-300">
                {s.theater}
              </h3>

              <div className="text-3xl font-bold">{s.time}</div>

              {isRecommended && (
                <div className="text-yellow-400 font-bold">
                  ⭐ AI Recommend
                </div>
              )}

              <div className="mt-2 text-xs">
                Crowd: {crowd.label} ({s.occupancy}%)
              </div>

    

              <button
                disabled={s.isFull}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/seat?movieId=${movieId}&showtimeId=${s.time}&theater=${s.theater}`
                  );
                }}
                className="mt-4 w-full py-2 rounded-xl bg-yellow-500 text-black font-bold disabled:bg-gray-500"
              >
                {s.isFull ? "Fully Booked" : "Select Showtime"}
              </button>

            </div>
          );
        })}
      </div>

      {/* LATE NIGHT POPUP */}
      {lateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-[#111] w-[800px] p-8 rounded-2xl border border-purple-500">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              {lateNightRules[language].title}
            </h2>
            <ul className="space-y-2 text-sm">
              {lateNightRules[language].items.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <button
              onClick={() => setLateOpen(false)}
              className="mt-6 bg-red-500 px-4 py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
}