"use client";

import { useEffect, useState } from "react";

type ReadinessStatus = {
  visual: string;
  hygiene: string;
  audio: string;
};

type Props = {
  theaterId: string;
};

export default function CinemaReadiness({ theaterId }: Props) {
  const [status, setStatus] = useState<ReadinessStatus>({
    visual: "Waiting...",
    hygiene: "Waiting...",
    audio: "Waiting..."
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจาก API Real-time
    const fetchReadinessFromDB = async () => {
      try {
        setLoading(true);
        setError(false);

        // 🌐 เชื่อมต่อ API Endpoint (เปลี่ยน URL เป็นของจริงของคุณ)
        // เช่น /api/cinema/status?theaterId=01
        const response = await fetch(`/api/cinema/readiness?theaterId=${theaterId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // แนะนำให้ตั้ง cache: 'no-store' เพื่อให้ได้สถานะอุปกรณ์ที่สดใหม่เสมอ
          cache: 'no-store' 
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data: ReadinessStatus = await response.json();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch theater readiness:", err);
        setError(true);
        // ค่า fallback กรณีเชื่อมต่อฐานข้อมูลไม่ได้
        setStatus({
          visual: "System Offline",
          hygiene: "Manual Check Required",
          audio: "System Offline"
        });
      } finally {
        setLoading(false);
      }
    };

    if (theaterId) {
      fetchReadinessFromDB();
    }
  }, [theaterId]);

  return (
    <div className="flex gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md transition-all duration-500">
      {/* Visual System */}
      <StatusItem 
        label="Visual" 
        value={status.visual} 
        loading={loading} 
        error={error} 
      />

      {/* Hygiene System */}
      <StatusItem 
        label="Hygiene" 
        value={status.hygiene} 
        loading={loading} 
        error={error} 
      />

      {/* Audio System */}
      <StatusItem 
        label="Audio" 
        value={status.audio} 
        loading={loading} 
        error={error} 
        isLast 
      />
    </div>
  );
}

// แยกส่วน UI ย่อยเพื่อให้โค้ดสะอาดขึ้น
function StatusItem({ label, value, loading, error, isLast = false }: { 
  label: string; 
  value: string; 
  loading: boolean; 
  error: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`px-4 ${!isLast ? "border-r border-white/10" : ""} text-left`}>
      <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 font-medium">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] animate-pulse ${
          loading ? "text-gray-500" : error ? "text-red-500" : "text-green-500"
        }`}>
          ●
        </span>
        <p className={`text-[10px] font-bold tracking-tight ${
          loading ? "text-gray-400" : error ? "text-red-400" : "text-white"
        }`}>
          {loading ? "Syncing..." : value}
        </p>
      </div>
    </div>
  );
}