"use client";

interface Movie {
  id: string;
  title: string;
  poster: string;
  theater_id: number;
  theater_name: string;
}

interface Props {
  movie: Movie;
  onSelect: (id: string, theater_id: number, theater_name: string, title: string) => void; 
}

export default function MovieCard({ movie, onSelect }: Props) {
  return (
    <div className="flex flex-col group overflow-hidden rounded-xl border border-yellow-900/20 shadow-2xl transition-all duration-500 hover:border-yellow-600/50">
      {/* 🖼️ Poster Section with Hover Effect */}
      <div className="relative aspect-[2/3] overflow-hidden">
         <img 
           src={movie.poster} 
           alt={movie.title} 
           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
         />
         {/* Overlay ไล่เฉดสีดำจากล่างขึ้นบนเพื่อให้ชื่อหนังเด่นชัด */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
         
         {/* ป้ายโรงหนังแบบหรูหราที่มุมรูป */}
         <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-yellow-600/30 px-3 py-1 rounded-full">
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">Premium Theater</p>
         </div>
      </div>
      
      {/* ℹ️ Movie Info Section */}
      <div className="p-5 bg-[#0d0d0d]">
        <h4 className="text-xl font-bold mb-1 text-white group-hover:text-yellow-500 transition-colors duration-300">
          {movie.title}
        </h4>
        <p className="text-yellow-600 text-[10px] mb-4 uppercase tracking-[0.2em] font-medium">
          {movie.theater_name}
        </p>
        
        {/* 🎫 Luxury Button */}
        <button 
          onClick={() => onSelect(movie.id, movie.theater_id, movie.theater_name, movie.title)}
          className="w-full py-3 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 text-black font-black rounded shadow-lg hover:shadow-yellow-500/40 hover:brightness-110 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
