"use client";

import { useEffect, useState } from "react";

interface UpcomingMovie {
  id: string;
  title: string;
  release_date: string;
  poster: string;
  genre: string;
  description: string;
}

export default function ComingSoon() {
  const [upcomingMovies, setUpcomingMovies] = useState<UpcomingMovie[]>([]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/movies/upcoming");
        const data = await response.json();
        setUpcomingMovies(data);
      } catch (error) {
        console.error("Failed to fetch upcoming movies:", error);
      }
    };
    fetchUpcoming();
  }, []);

  if (upcomingMovies.length === 0) return null;

  return (
    <section id="coming-soon-section" className="relative pt-32 pb-60 px-10 max-w-7xl mx-auto overflow-hidden">
      {/* 🔮 Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full -z-10"></div>

      {/* 🏷️ Header Section */}
      <div className="flex flex-col items-center mb-24">
        <div className="flex items-center gap-4 mb-4">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-purple-500"></span>
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] animate-pulse">
            Upcoming Masterpieces
          </span>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-purple-500"></span>
        </div>
        <h2 className="text-5xl md:text-6xl font-serif font-black text-white uppercase tracking-tighter text-center">
          NEXT <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-purple-600">SEASON</span>
        </h2>
      </div>

      {/* 🎬 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {upcomingMovies.map((movie) => (
          <div key={movie.id} className="group relative flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            
            {/* 🖼️ Poster Side */}
            <div className="relative w-full lg:w-[280px] aspect-[2/3] shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-600/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-1">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
              
              {/* Release Badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#111] border border-purple-500/40 px-6 py-3 rounded-2xl shadow-2xl transform group-hover:translate-y-[-10px] transition-transform">
                 <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Expected In</p>
                 <p className="text-sm font-bold text-white tracking-tighter">{movie.release_date}</p>
              </div>
            </div>

            {/* 📝 Content Side */}
            <div className="flex-1 py-4 text-center lg:text-left">
              <p className="text-[10px] font-black text-purple-500/80 uppercase tracking-[0.3em] mb-3">
                {movie.genre}
              </p>
              <h3 className="text-3xl font-serif font-black text-white mb-6 leading-none group-hover:text-purple-300 transition-colors">
                {movie.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light mb-8 max-w-md italic">
                "{movie.description}"
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white hover:text-black transition-all">
                  View Trailer
                </button>
                <button className="px-6 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                  Get Notified
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}