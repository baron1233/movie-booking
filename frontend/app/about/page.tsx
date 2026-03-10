"use client";
import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Artistic Visual */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-yellow-600 to-transparent opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[4rem] border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070" 
                alt="Cinema Interior" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700 scale-110 group-hover:scale-100"
              />
            </div>
            {/* Floating Text */}
            <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-full hidden md:block">
              <p className="text-black font-black text-4xl uppercase leading-none tracking-tighter">EST.<br/>2026</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-10">
            <h2 className="text-yellow-500 font-black uppercase tracking-[0.4em] text-sm">Our Philosophy</h2>
            <h1 className="text-6xl md:text-8xl font-serif font-black leading-none uppercase tracking-tighter">
              Not Just a <span className="text-zinc-700 italic">Movie</span>.
            </h1>
            <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-md">
              Diamond Cineplex ถูกสร้างขึ้นเพื่อลบภาพจำของโรงภาพยนตร์แบบเดิมๆ เรานำเสนอความหรูหราที่มาพร้อมกับเทคโนโลยีที่ล้ำสมัยที่สุด เพื่อเปลี่ยนการดูหนังให้เป็น "ประสบการณ์ทางจิตวิญญาณ"
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold italic text-white">4K+</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2">Ultra Resolution</p>
              </div>
              <div>
                <p className="text-3xl font-bold italic text-white">32.2</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2">Surround System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}