"use client";

import { useSearchParams, useRouter } from "next/navigation";

const showtimes = [
  { id: 1, time: "10:00" },
  { id: 2, time: "13:00" },
  { id: 3, time: "16:00" },
  { id: 4, time: "19:00" },
];

export default function ShowtimePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieId = searchParams.get("movieId");

  const handleSelect = (showtimeId: number) => {
    router.push(`/seat?movieId=${movieId}&showtimeId=${showtimeId}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">เลือกรอบฉาย</h1>
      <p className="mb-6">Movie ID ที่เลือก: {movieId}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
        {showtimes.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className="bg-gray-800 hover:bg-yellow-500 hover:text-black py-4 rounded text-lg font-semibold"
          >
            {s.time}
          </button>
        ))}
      </div>
    </main>
  );
}
