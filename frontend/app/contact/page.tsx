"use client";
import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-20">
          
          {/* Header Section */}
          <div className="md:w-1/3">
            <h1 className="text-7xl font-serif font-black uppercase tracking-tighter leading-none mb-10">
              Get In <br/> <span className="text-yellow-600">Touch</span>
            </h1>
            <div className="space-y-6">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Location</p>
                <p className="text-white text-sm">999 Diamond Tower, 88th Floor<br/>Siam, Bangkok, TH</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Hotline</p>
                <p className="text-white text-xl font-bold">+66 95 942 2602</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full bg-white/5 p-12 rounded-[3rem] border border-white/10 backdrop-blur-xl">
            <form className="space-y-8">
              <div className="group relative">
                <input 
                  type="text" 
                  placeholder="WHAT'S YOUR NAME?" 
                  className="w-full bg-transparent border-b border-zinc-800 py-4 focus:outline-none focus:border-yellow-500 transition-all font-serif text-2xl placeholder:text-zinc-700"
                />
              </div>
              <div className="group relative">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="w-full bg-transparent border-b border-zinc-800 py-4 focus:outline-none focus:border-yellow-500 transition-all font-serif text-2xl placeholder:text-zinc-700"
                />
              </div>
              <div className="group relative">
                <textarea 
                  rows={4} 
                  placeholder="TELL US SOMETHING..." 
                  className="w-full bg-transparent border-b border-zinc-800 py-4 focus:outline-none focus:border-yellow-500 transition-all font-serif text-2xl placeholder:text-zinc-700 resize-none"
                ></textarea>
              </div>
              
              <button className="relative overflow-hidden group px-12 py-5 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-full transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10">Send Message</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Map Link */}
        <div className="mt-32 text-center border-t border-white/5 pt-10">
            <a href="#" className="text-zinc-800 text-8xl font-black uppercase tracking-tighter hover:text-yellow-600/20 transition duration-700">
                Google Maps
            </a>
        </div>
      </div>
    </main>
  );
}