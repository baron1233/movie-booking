"use client";

import React from "react";

interface WarningProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
}

export default function Warning({ 
  isOpen, 
  onClose, 
  title = "ระบบขัดข้องชั่วคราว", 
  message, 
  confirmText = "รับทราบ" 
}: WarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0f0f0f] border border-red-900/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        
        {/* แถบสีแดงด้านบน */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

        <div className="p-8 text-center">
          {/* Icon Warning */}
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="text-3xl animate-pulse">⚠️</span>
          </div>

          <h3 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-3">
            {title}
          </h3>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-transparent border border-red-500/50 text-red-500 rounded-xl font-bold uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
          >
            {confirmText}
          </button>
        </div>

        {/* ตกแต่งมุมขอบ */}
        <div className="absolute top-2 right-2 opacity-10 text-red-500 text-4xl select-none">⚠️</div>
      </div>
    </div>
  );
}