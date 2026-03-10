"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function TicketPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = searchParams.get("title");
  const seats = searchParams.get("seats");
  const theater = searchParams.get("theater");

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="bg-white text-black p-8 rounded-[2rem] w-full max-w-xs text-center shadow-[0_0_50px_rgba(234,179,8,0.3)]">
        <h2 className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Exclusive Ticket</h2>
        <h1 className="text-2xl font-serif font-black mb-6 uppercase border-b pb-4">{title}</h1>
        
        {/* QR Code Placeholder */}
        <div className="bg-gray-100 p-4 rounded-xl mb-6 inline-block border-2 border-black">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${title}-${seats}`} 
            alt="QR Code" 
          />
        </div>
        
        <div className="flex justify-between text-left mb-6">
          <div>
            <p className="text-[8px] uppercase text-gray-400">Theater</p>
            <p className="font-bold text-sm">{theater}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase text-gray-400">Seats</p>
            <p className="font-bold text-sm">{seats}</p>
          </div>
        </div>
        
        <div className="border-t border-dashed pt-4">
          <p className="text-[10px] font-black tracking-widest">SCAN TO ENTER</p>
        </div>
      </div>
      
      <button onClick={() => router.back()} className="mt-8 text-gray-500 hover:text-white uppercase text-[10px] tracking-widest">Close</button>
    </main>
  );
}