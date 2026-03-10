"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // บังคับให้เริ่มจากค่าว่างเสมอเมื่อโหลดหน้านี้
  useEffect(() => {
    setUsername("");
    setPassword("");
    localStorage.removeItem("admin_token"); // ล้าง token เก่าออกเพื่อความปลอดภัย
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        // ✅ Login สำเร็จ ดีดไปหน้า Dashboard
        router.push("/admin/dashboard");
      } else {
        setError(data.detail || "Identity or Security Code is incorrect");
        // ล้างรหัสผ่านถ้ากรอกผิด
        setPassword("");
      }
    } catch (err) {
      setError("Connection Error: Backend Offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* เอฟเฟกต์แสงไฟตกแต่งพื้นหลัง (Ambient Light) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 shadow-2xl relative z-10 transition-all duration-500">
        
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-yellow-600/10 border border-yellow-600/20 rounded-full text-yellow-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            WELCOME TO 
          </div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tighter">
            EXCLUSIVE <span className="text-yellow-500">CINEMA</span>
          </h1>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest font-light">
            Please enter your username and password
          </p>
        </div>

        <form onSubmit={login} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-4">
              Identity
            </label>
            <input
              required
              type="text"
              value={username}
              placeholder="Username"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 transition-all text-sm font-light placeholder:text-gray-700"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-4">
              Security Code
            </label>
            <input
              required
              type="password"
              value={password}
              placeholder=""
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 transition-all text-sm font-light placeholder:text-gray-700"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-1">
              <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-black uppercase text-[12px] tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Authorizing..." : "Login to System"}
          </button>
        </form>

        <p className="mt-10 text-center text-gray-800 text-[8px] uppercase tracking-[0.5em]">
          Secure Terminal Access • 2026
        </p>
      </div>

      {/* ลายน้ำตกแต่งขอบจอ */}
      <div className="absolute bottom-10 right-10 opacity-5 text-white text-6xl font-serif italic">
        Diamond
      </div>
    </main>
  );
}