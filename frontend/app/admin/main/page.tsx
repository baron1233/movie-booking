"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- 1. ย้าย MovieCard มาไว้ตรงนี้ (ไม่ต้อง Import แล้ว) ---
function MovieCard({ movie, onSelect }: { 
  movie: Movie, 
  onSelect: (id: string, tid: number, tname: string, title: string) => void 
}) {
  return (
    <div 
      onClick={() => onSelect(movie.id, movie.theater_id, movie.theater_name, movie.title)}
      className="cursor-pointer group relative"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] bg-zinc-900">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>
      <div className="mt-6 px-2">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-yellow-500 transition-colors">
          {movie.title}
        </h3>
        <p className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
          {movie.theater_name}
        </p>
      </div>
    </div>
  );
}

// --- 2. Interface ข้อมูล ---
interface Movie {
  id: string;
  title: string;
  theater_id: number;
  theater_name: string;
  poster: string;
  genre: string;
}

interface Emergency {
  caseType: "MAINTENANCE" | "INCIDENT";
  location: string;
  details: string;
  resolution: string;
}

const movies: Movie[] = [
  { id: "1", title: "Avengers", theater_id: 1, theater_name: "IMAX WITH LASER", poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_FMjpg_UX1000_.jpg", genre: "Action" },
  { id: "2", title: "Interstellar", theater_id: 2, theater_name: "ULTRA SCREEN", poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", genre: "Sci-Fi" },
  { id: "3", title: "Spiderman", theater_id: 3, theater_name: "4DX EXPERIENCE", poster: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_FMjpg_UX1000_.jpg", genre: "Action" },
  { id: "5", title: "The Dark Knight", theater_id: 4, theater_name: "GOLD CLASS SUITE", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg", genre: "Drama" },
];

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [emergencyList, setEmergencyList] = useState<Emergency[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEmergencyList([
      {
        caseType: "MAINTENANCE",
        location: "Theater 4 (Gold Class)",
        details: "ตรวจพบการปิดปรับปรุงระบบไฟฟ้ากะทันหัน",
        resolution: "คืนเงินอัตโนมัติ 100%"
      }
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const filteredMovies = movies.filter(m =>
    (selectedGenre === "All" || m.genre === selectedGenre) &&
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden font-sans">
      
      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[2.5rem] text-center">
            <h2 className="text-xl font-bold mb-6">ต้องการออกจากระบบ?</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="px-10 py-4 bg-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="px-10 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="relative pt-32 pb-20 px-10 text-center">
        <div className="absolute top-8 right-8 flex gap-3">
          <button onClick={() => router.push('/admin/main')} className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all">
            ⚙️ Console
          </button>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-12 h-12 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
            ⏻
          </button>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-12 bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100 bg-clip-text text-transparent uppercase tracking-tighter">
          EXCLUSIVE CINEMA
        </h1>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 px-6">
          <input 
            type="text" 
            placeholder="Search our masterpiece..." 
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-5 focus:outline-none focus:border-yellow-500/50 text-center" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <select 
            className="bg-[#111] border border-white/10 rounded-3xl px-10 py-5 font-bold text-sm text-gray-400" 
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Drama">Drama</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="pt-20 pb-40 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {filteredMovies.map((movie) => {
            const emergency = emergencyList.find(e => e.location.includes(`Theater ${movie.theater_id}`));
            const isClosed = emergency?.caseType === "MAINTENANCE";

            return (
              <div key={movie.id} className="relative">
                <div className={`absolute -inset-1 rounded-[3rem] opacity-20 blur-2xl ${isClosed ? "bg-red-500" : "bg-yellow-500"}`} />
                <div className={`relative rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${isClosed ? "border-red-900/40 grayscale" : "border-white/5 hover:-translate-y-4"}`}>
                  
                  {/* เรียกใช้ MovieCard ที่เขียนไว้ข้างบน */}
                  <MovieCard 
                    movie={movie} 
                    onSelect={(id, tid, tname, title) => {
                      if (isClosed) {
                        alert("ขออภัย: โรงภาพยนตร์นี้ปิดปรับปรุงระบบไฟฟ้ากะทันหัน");
                        return;
                      }
                      const query = new URLSearchParams({
                        movieId: id,
                        theater_id: tid.toString(),
                        theater_name: tname,
                        title: title
                      }).toString();
                      router.push(`/showtime?${query}`);
                    }} 
                  />

                  {isClosed && (
                    <div className="absolute bottom-0 left-0 w-full bg-red-600 py-4 text-center">
                      <p className="text-[10px] text-white font-black uppercase tracking-widest">Maintenance</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}