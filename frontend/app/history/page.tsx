"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Booking {
  id: string | number;
  movie_title?: string;
  theater_name?: string;
  seats: string;
  amount: number;
  booking_date: string;
  showtime?: string;
  status: string; // PAID, WAIT_CONFIRM, CANCELLED
  slip?: string;  // เก็บ path ของรูปหลักฐานการโอน
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ดึง Token มาใช้ (เผื่อกรณี API ต้องการสิทธิ์การเข้าถึง)
        const token = localStorage.getItem("admin_token");
        
        const response = await fetch("http://127.0.0.1:8000/history", {
          headers: {
            // ถ้า Backend ใช้ระบบ User ปกติ อาจจะไม่ต้องใช้ Token ของ Admin 
            // แต่ถ้าใช้ API เดียวกันต้องส่งไปด้วยครับ
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto flex justify-between items-end mb-12">
        <div>
          <button
            onClick={() => router.push('/')}
            className="text-yellow-600 text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2 hover:text-yellow-400 transition-colors"
          >
            <span>←</span> Back to Movies
          </button>
          <h1 className="text-4xl md:text-5xl font-serif font-black bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-100 bg-clip-text text-transparent uppercase tracking-tighter">
            My Transactions
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest">Database Record</p>
          <p className="text-2xl font-serif text-white">{history.length} Bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-yellow-600 tracking-widest uppercase text-xs">
            ⌛ Loading Database Records...
          </div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="group relative bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/30 transition-all duration-500">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/5 text-gray-400 text-[9px] font-black px-3 py-1 rounded-full border border-white/10 tracking-widest">
                      ID: {item.id}
                    </span>
                    
                    {/* ✅ ปรับการแสดงผลสถานะให้เหมือนหน้า Admin */}
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      item.status === 'PAID' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      item.status === 'WAIT_CONFIRM' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      ● {item.status || "PENDING"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {item.movie_title || "Untitled Masterpiece"}
                  </h3>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest mb-1">Cinema & Schedule</p>
                      <p className="text-sm text-gray-300">{item.theater_name || "Exclusive Theater"}</p>
                      <p className="text-sm text-yellow-600 font-bold mt-1">
                        {item.booking_date?.split('T')[0]} | {item.showtime || "Standard Time"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest mb-1">Seats Selection</p>
                      <p className="text-sm text-white font-bold tracking-[0.2em]">{item.seats}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end md:min-w-[180px] border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                  <div className="text-right">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-1">Grand Total</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">
                      ฿{(item.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-4">
                    {/* ✅ เพิ่มปุ่มดู Slip ถ้ามีรูป */}
                    {item.slip && (
                      <a 
                        href={`http://127.0.0.1:8000/${item.slip}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full text-center py-2 text-[9px] font-black uppercase text-cyan-500 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/10 transition-all"
                      >
                        View Transfer Slip
                      </a>
                    )}
                    
                    <button className="w-full bg-white/5 hover:bg-yellow-500 text-white hover:text-black py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border border-white/10 hover:border-yellow-500">
                      {item.status === 'PAID' ? 'View E-Ticket' : 'Check Status'}
                    </button>
                  </div>
                </div>

              </div>
              {/* ตกแต่งลายเส้นด้านล่าง */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 border border-dashed border-white/5 rounded-[3rem]">
            <div className="text-4xl mb-4 opacity-20">🎞️</div>
            <p className="text-gray-600 uppercase tracking-[0.3em] text-[10px]">No transaction history found.</p>
          </div>
        )}
      </div>
    </main>
  );
}