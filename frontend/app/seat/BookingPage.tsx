"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// สร้าง Component ย่อยเพื่อใช้ useSearchParams ภายใน Suspense
function SeatBookingContent() {
  const searchParams = useSearchParams();
  
  // ดึงค่าจาก URL ที่ส่งมาจากหน้าหลัก
  const movieData = {
    id: searchParams.get('movie_id') || 'ST001',
    title: searchParams.get('title') || 'ไม่ระบุชื่อหนัง',
    theater_id: searchParams.get('theater_id') || '1',
    theater_name: searchParams.get('theater_name') || 'โรงที่ 1'
  };

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงที่นั่งตามโรงที่หนังเรื่องนี้ฉายอยู่
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/seats/${movieData.id}?theater_id=${movieData.theater_id}`)
      .then(res => res.json())
      .then(data => {
        setSeats(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching seats:", err));
  }, [movieData.id, movieData.theater_id]);

  const toggleSeat = (seatCode: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatCode) ? prev.filter(s => s !== seatCode) : [...prev, seatCode]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      {/* ส่วนหัว: แสดงข้อมูลหนังและหมายเลขโรงชัดเจนตามที่คุณต้องการ */}
      <div className="max-w-4xl mx-auto mb-10 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
              กำลังเปิดรับจอง
            </span>
            <h1 className="text-5xl font-black mt-2">{movieData.title}</h1>
          </div>
          
          {/* ป้ายแสดงหมายเลขโรง (Highlight จุดนี้ตามโจทย์) */}
          <div className="bg-blue-600/20 border border-blue-500/50 p-4 rounded-2xl text-right">
            <p className="text-blue-400 text-xs uppercase font-bold tracking-widest">สถานที่ฉาย</p>
            <p className="text-3xl font-black text-white">{movieData.theater_name}</p>
          </div>
        </div>
      </div>

      {/* ส่วนผังที่นั่ง */}
      <div className="max-w-xl mx-auto bg-slate-900/50 p-8 rounded-[3rem] shadow-2xl border border-slate-800 backdrop-blur-sm">
        <div className="mb-12">
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-center text-xs text-slate-500 tracking-[0.5em] uppercase font-bold">จอหนัง (SCREEN)</p>
        </div>

        {loading ? (
          <div className="text-center py-10 animate-pulse text-slate-500">กำลังโหลดผังที่นั่ง...</div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {seats.map((s: any) => (
              <button
                key={s.seat}
                disabled={s.status !== 'AVAILABLE'}
                onClick={() => toggleSeat(s.seat)}
                className={`
                  h-14 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group
                  ${s.status !== 'AVAILABLE' ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-20' : 
                    selectedSeats.includes(s.seat) ? 'bg-blue-600 text-white scale-110 shadow-[0_0_20px_rgba(37,99,235,0.6)]' : 
                    'bg-slate-700 hover:bg-slate-600 hover:scale-105 border border-slate-600'}
                `}
              >
                {s.seat}
                {s.status === 'AVAILABLE' && !selectedSeats.includes(s.seat) && (
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* สรุปราคาและปุ่มดำเนินการ */}
        <div className={`mt-10 p-6 bg-slate-950 rounded-3xl border border-slate-800 transition-all duration-500 ${selectedSeats.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold mb-1">ที่นั่ง: <span className="text-blue-400">{selectedSeats.join(', ')}</span></p>
              <p className="text-3xl font-black text-white">{selectedSeats.length * 100} <span className="text-sm font-normal text-slate-400">บาท</span></p>
            </div>
            <button 
               className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
               onClick={() => window.location.href = `/checkout?booking_id=...`} // เชื่อมไปหน้าจ่ายเงิน
            >
              จองตั๋วทันที
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ไฟล์หลักที่ Export ออกไป (ต้องหุ้มด้วย Suspense เพราะใช้ useSearchParams)
export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold">กำลังเตรียมข้อมูล...</div>}>
      <SeatBookingContent />
    </Suspense>
  );
}