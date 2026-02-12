"use client";

import { useRouter } from "next/navigation";
import MovieCard from "./components/MovieCard";

const movies = [
  { id: 1, title: "Avengers", poster: "https://via.placeholder.com/300x450" },
  { id: 2, title: "Batman", poster: "https://via.placeholder.com/300x450" },
  { id: 3, title: "Spiderman", poster: "https://via.placeholder.com/300x450" },
];

export default function Home() {
  const router = useRouter();

  const handleSelect = (movieId: number) => {
    router.push(`/showtime?movieId=${movieId}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">เลือกภาพยนตร์</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </main>
  );
}
