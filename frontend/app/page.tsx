"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "./components/MovieCard";

const movies = [
  { id: "1", title: "Avengers", theater_id: 1, theater_name: "IMAX WITH LASER", poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_FMjpg_UX1000_.jpg", genre: "Action" },
  { id: "2", title: "Interstellar", theater_id: 2, theater_name: "ULTRA SCREEN", poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", genre: "Sci-Fi" },
  { id: "3", title: "Spiderman", theater_id: 3, theater_name: "4DX EXPERIENCE", poster: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_FMjpg_UX1000_.jpg", genre: "Action" },
  { id: "4", title: "The Dark Knight", theater_id: 4, theater_name: "GOLD CLASS SUITE", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg", genre: "Drama" },
  { id: "5", title: "Dune", theater_id: 2, theater_name: "ULTRA SCREEN", poster: "https://image.tmdb.org/t/p/original/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", genre: "Sci-Fi" },
  { id: "6", title: "Joker", theater_id: 4, theater_name: "GOLD CLASS SUITE", poster: "https://image.tmdb.org/t/p/original/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", genre: "Drama" }
];
const branchMovies: Record<string, string[]> = {
  "Siam Paragon (Iconic)": ["1", "2", "3"],
  "EmQuartier (CineArt)": ["2", "3", "4"],
  "Central World": ["1", "3", "4"],
  "Central Festival": ["1", "2"],
  "Maya Lifestyle": ["2", "3"],
  "Central Floresta": ["3", "4"],
  "Central Plaza": ["1", "4"]
};

// --- 📍 ข้อมูลจังหวัดและสาขา Exclusive Cinema ---
const locations = [
  { province: "Bangkok", branches: ["Siam Paragon (Iconic)", "EmQuartier (CineArt)", "Central World"] },
  { province: "Chiang Mai", branches: ["Central Festival", "Maya Lifestyle"] },
  { province: "Phuket", branches: ["Central Floresta"] },
  { province: "Khon Kaen", branches: ["Central Plaza"] }
];

export default function Home() {
  const router = useRouter();

  // --- 🎨 UI States ---
  const [showMarquee, setShowMarquee] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);

  // --- 📍 Location States ---
  const [selectedProvince, setSelectedProvince] = useState(locations[0].province);
  const [selectedBranch, setSelectedBranch] = useState(locations[0].branches[0]);

  // --- 🧠 ChatBot States ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<null | "policy" | "emergency" | "system">(null);

  const [emergencyList, setEmergencyList] = useState<{
    branch: string;
    theater_id: number;
    caseType: "MAINTENANCE" | "INCIDENT" |"electrical";
    details: string;
    resolution: string;
  }[]>([]);

  // --- 🚨 Emergency Helper Logic ---
  const affectedTheaterCount = useMemo(() =>
    emergencyList.filter(e => e.branch === selectedBranch).length,
    [emergencyList, selectedBranch]); const affectedTheaterNames = useMemo(() =>
      emergencyList

        .filter(e => e.branch === selectedBranch)
        .map(e => `Theater ${e.theater_id}`)
        .join(", "),
      [emergencyList, selectedBranch]);
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  useEffect(() => {

    const mockData: {
      branch: string;
      theater_id: number;
      caseType: "MAINTENANCE" | "INCIDENT" |"electrical";
      details: string;
      resolution: string;
    }[] = [
        {
          branch: "Siam Paragon (Iconic)",
          theater_id: 4,
          caseType: "MAINTENANCE",
          details: "ตรวจพบการปิดปรับปรุงระบบไฟฟ้า",
          resolution: "คืนเงินอัตโนมัติ"
        },
        {
          branch: "Central Festival",
          theater_id: 2,
          caseType: "INCIDENT",
          details: "ระบบเสียงมีปัญหา",
          resolution: "กำลังตรวจสอบแก้ไข ประมาณ 30 นาที "
        },
        {
          branch: "Central World",
          theater_id:  3,
          caseType:"electrical",
          details: "Electrical leakage detected",
          resolution: "shutdown_theater",
        }

      ];
    setEmergencyList(mockData);
    const fetchUpcomingMovies = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/movies/upcoming");
        const data = await res.json();
        setUpcomingMovies(data);
      } catch (err) {
        console.error("Failed to fetch upcoming movies:", err);
      }
    };

    fetchUpcomingMovies();

  }, []);


  const filteredMovies = movies.filter(m => {
    const branchList = branchMovies[selectedBranch] || [];

    return (
      branchList.includes(m.id) &&
      (selectedGenre === "All" || m.genre === selectedGenre) &&
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden font-sans text-left">

      {/* 🚀 CENTRAL DETAIL MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[3rem] max-w-lg w-full shadow-[0_0_50px_rgba(79,70,229,0.2)] relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >✕</button>

            {activeModal === "policy" && (
              <div className="text-left">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h2 className="text-2xl font-serif font-black uppercase tracking-tighter mb-4">นโยบายการเข้าชม</h2>
                <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                  <p className="flex items-start gap-3"><span className="text-indigo-500 font-bold">01.</span> ตั๋วที่ชำระเงินแล้วไม่สามารถคืนเงินได้ทุกกรณี ยกเว้นมีการยกเลิกจากทางโรงภาพยนตร์</p>
                  <p className="flex items-start gap-3"><span className="text-indigo-500 font-bold">02.</span> การสะสมแต้มพรีเมียมจะถูกคำนวณและเข้าบัญชีหลังจากภาพยนตร์จบเรื่องภายใน 1 ชม.</p>
                  <p className="flex items-start gap-3"><span className="text-indigo-500 font-bold">03.</span> ขอความร่วมมืองดนำอาหารและเครื่องดื่มที่มีกลิ่นแรง หรือแอลกอฮอล์เข้าสู่ห้องโถง</p>
                  <p className="flex items-start gap-3"><span className="text-indigo-500 font-bold">04.</span> กรณีมาช้ากว่าเวลาเริ่มฉาย 30 นาที ทางโรงภาพยนตร์ขอสงวนสิทธิ์ในการระงับการเข้าชม</p>
                </div>
              </div>
            )}

            {activeModal === "emergency" && (
              <div className="text-left">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                  <span className="text-2xl">🚨</span>
                </div>
                <h2 className="text-2xl font-serif font-black uppercase tracking-tighter mb-2 text-red-500">Safety & Emergency </h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">ระเบียบปฏิบัติเพื่อความปลอดภัยสูงสุดของคุณ</p>

                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-yellow space-y-6">
                  {emergencyList.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl border-l-4 border-l-red-500">
                      <p className="text-[9px] font-black text-red-500 uppercase mb-1">Live Alert</p>
                      <p className="text-xs text-white leading-relaxed">{emergencyList[0].details}</p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <section>
                      <h4 className="text-[11px] font-black text-white uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span> กรณีเกิดเหตุเพลิงไหม้
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed pl-3.5 border-l border-white/10">
                        หยุดกิจกรรมทุกอย่างทันที **ห้ามใช้ลิฟต์** ให้สังเกตป้ายทางออกฉุกเฉินที่มีไฟสว่าง หมอบต่ำหากมีควัน และรวมตัวกันที่จุดรวมพลด้านหน้าอาคาร
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[11px] font-black text-white uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> เจ็บป่วยกะทันหัน / AED
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed pl-3.5 border-l border-white/10">
                        หากพบผู้หมดสติหรือต้องการความช่วยเหลือทางการแพทย์ แจ้งพนักงานที่ใกล้ที่สุดทันที เรามีเครื่อง **AED อัตโนมัติ** และพนักงานที่ผ่านการฝึก First Aid พร้อมสแตนด์บายตลอดเวลา
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[11px] font-black text-white uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> ทรัพย์สินสูญหาย
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed pl-3.5 border-l border-white/10">
                        หากลืมของไว้ในโรงหรือถูกโจรกรรม โปรดอย่าพยายามค้นหาด้วยตนเองในความมืด ให้แจ้งเจ้าหน้าที่เพื่อขอความช่วยเหลือในการเปิดไฟและตรวจสอบกล้องวงจรปิด (CCTV) ในจุดที่เกี่ยวข้อง
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[11px] font-black text-white uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> ความขัดแย้ง / บุคคลต้องสงสัย
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed pl-3.5 border-l border-white/10">
                        หากพบเห็นบุคคลที่มีพฤติกรรมไม่น่าไว้วางใจ หรือเกิดการทะเลาะวิวาท โปรดปลีกตัวออกห่างและแจ้งเจ้าหน้าที่ผ่านช่องทางแชทนี้ หรือแจ้งพนักงานหน้าโรงภาพยนตร์โดยเร็วที่สุด
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[11px] font-black text-white uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> ไฟฟ้าดับหรือระบบขัดข้อง
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed pl-3.5 border-l border-white/10">
                        ในกรณีระบบไฟขัดข้อง ไฟสำรองจะทำงานภายใน 5 วินาที โปรดนั่งอยู่กับที่เพื่อฟังประกาศ หากระบบไม่สามารถกู้คืนได้ พนักงานจะนำทางท่านออกจากโรงและดำเนินการชดเชยตั๋วให้ภายหลัง
                      </p>
                    </section>
                  </div>

                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 mt-4">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xl">📞</span>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">สายด่วนฉุกเฉินภายใน: 02-XXX-XXXX</p>
                    </div>
                    <p className="text-[9px] text-gray-500 italic leading-relaxed">
                      "เรามีการซ้อมแผนอพยพ เพื่อให้แน่ใจว่าคุณจะได้รับการดูแลที่ดีที่สุดในทุกเสี้ยววินาที"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "system" && (
              <div className="text-left">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
                  <span className="text-2xl">🧠</span>
                </div>
                <h2 className="text-2xl font-serif font-black uppercase tracking-tighter mb-4 text-cyan-400">Intelligent Booking Flow</h2>
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                    <p className="text-[11px] font-black text-white uppercase mb-3 flex items-center gap-2">
                      <span className="text-purple-400">🎯</span> Personalized Recommendation
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed border-l border-purple-500/30 pl-4">
                      ระบบ AI จะวิเคราะห์พฤติกรรมการชมย้อนหลัง เพื่อนำเสนออันดับภาพยนตร์ที่ตรงใจคุณที่สุดในหน้าแรกโดยอัตโนมัติ
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                    <p className="text-[11px] font-black text-white uppercase mb-3 flex items-center gap-2">
                      <span className="text-cyan-400">💺</span> ระบบแนะนำที่นั่งอัจฉริยะ
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed border-l border-cyan-500/30 pl-4">
                      ไม่ต้องเสียเวลาเลือกที่นั่งเอง AI จะคำนวณตำแหน่ง **"Sweet Spot"** (จุดที่มุมมองและเสียงสมบูรณ์ที่สุด) ในโรงแต่ละประเภทให้ทันที
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                    <p className="text-[11px] font-black text-white uppercase mb-3 flex items-center gap-2">
                      <span className="text-emerald-400">⚡</span> การเลือกรอบ / จองความเร็วสูง
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed border-l border-emerald-500/30 pl-4">
                      รวมขั้นตอนการเลือกรอบฉายและยืนยันการชำระเงินไว้ในคลิกเดียว (Quantum Flow) เพื่อให้คุณไม่พลาดตั๋วในรอบยอดฮิต
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all border border-white/10"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* 🚪 LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[2.5rem] max-sm w-full shadow-2xl text-center relative overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-0 left-0 w-full"></div>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <span className="text-2xl">⏻</span>
            </div>
            <h2 className="text-xl font-serif font-black text-white uppercase tracking-tighter mb-2">Terminate Session?</h2>
            <p className="text-gray-500 text-sm mb-8">คุณต้องการออกจากบัญชีหรือไม่?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg">Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 📣 UPCOMING REMINDER */}
      <div className={`fixed bottom-10 right-10 z-[150] w-[90%] max-w-[320px] transition-all duration-500 ease-out transform ${showMarquee ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90 pointer-events-none"}`}>
        <div className="relative flex flex-col bg-[#111] border border-yellow-500/40 rounded-[2.5rem] shadow-2xl overflow-hidden text-left">
          <div className="h-1.5 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <span className="text-sm animate-pulse">⏳</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Upcoming</span>
              </div>
              <button onClick={() => setShowMarquee(false)} className="text-gray-600 hover:text-white">✕</button>
            </div>
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar-yellow">
              <h3 className="text-lg font-serif font-bold text-white mb-1 leading-tight">AVENGERS: ENDGAME</h3>
              <p className="text-yellow-600 text-[10px] font-black uppercase tracking-widest mb-3">Starts in 15 Minutes</p>
              <div className="space-y-3 text-sm text-gray-400 font-light leading-relaxed">
                <p className="border-l-2 border-yellow-600/30 pl-3">📍 <span className="text-gray-200">Theater 1 (IMAX)</span></p>
                <p className="border-l-2 border-yellow-600/30 pl-3">💺 <span className="text-gray-200">Seats: A10, A11</span></p>
              </div>
            </div>
            <button onClick={() => router.push('/history')} className="mt-5 w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-lg">View My Ticket</button>
          </div>
        </div>
      </div>

      {/* 🧠 INTELLIGENT SYSTEM CHATBOT */}
      <div className="fixed bottom-8 right-8 z-[200]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border ${isChatOpen ? 'bg-white border-black rotate-90' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-white/20 hover:scale-110'}`}
        >
          {isChatOpen ? <span className="text-black text-xl font-bold">✕</span> : <span className="text-2xl animate-pulse">🧠</span>}
          {!isChatOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-bounce"></div>}
        </button>

        <div className={`absolute bottom-20 right-0 w-[380px] bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] shadow-2xl transition-all duration-500 transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Intelligent Assistant</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Premium Support</p>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto custom-scrollbar-indigo pr-2 mb-6 text-left">
              <div className="animate-in slide-in-from-bottom-2 duration-500">
                <p className="text-sm text-gray-300 mb-6 leading-relaxed font-light">
                  ต้องการทราบข้อมูลเชิงลึกส่วนใดครับ? เลือกหัวข้อเพื่อดูรายละเอียดแบบเต็มจอ
                </p>
                <div className="grid gap-3">
                  <button onClick={() => setActiveModal("policy")} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all border border-white/5">🛡️ Full Policy Guide</button>
                  <button onClick={() => setActiveModal("emergency")} className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all border border-red-500/20 text-red-400">🚨 Emergency Response</button>

                  <button
                    onClick={() => setActiveModal("system")}
                    className="w-full p-5 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent hover:from-indigo-600/30 rounded-[2rem] border border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    <div className="relative flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                            <span className="text-xl">🎬</span>
                          </div>
                          <div className="text-left">
                            <p className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Recommmand Booking </p>
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Powered by Oracle AI</p>
                          </div>
                        </div>
                        <span className="text-indigo-500 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                      <div className="grid gap-2 text-[10px] text-left">
                        <div className="flex items-center gap-3 py-2 border-t border-white/5">
                          <span className="text-purple-400">✨</span>
                          <p className="text-gray-400 font-medium">
                            <b className="text-gray-200">Personalized:</b> แนะนำภาพยนตร์ที่ตรงใจคุณที่สุด
                          </p>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-t border-white/5">
                          <span className="text-cyan-400">🎯</span>
                          <p className="text-gray-400 font-medium">
                            <b className="text-gray-200">Smart Seats:</b> ค้นหาที่นั่ง <span className="text-cyan-400 italic">Sweet Spot</span> อัตโนมัติ
                          </p>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-t border-white/5">
                          <span className="text-emerald-400">⚡</span>
                          <p className="text-gray-400 font-medium">
                            <b className="text-gray-200">Quantum Path:</b> เลือกรอบและจองในคลิกเดียว
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] text-center italic">Ready to Serve v2.5</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🎩 LUXURY HEADER */}
      <div className="relative pt-32 pb-20 px-10 text-center bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="absolute top-8 left-8 md:left-12 flex flex-col gap-2 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModal("emergency")}
              className="relative flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-600 transition-all duration-300 group shadow-lg"
            >
              <span className="text-red-500 group-hover:text-white text-lg">⚠️</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 group-hover:text-white hidden sm:block">Emergency</span>
              {affectedTheaterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                  {affectedTheaterCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowMarquee(!showMarquee)} className="flex items-center gap-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl hover:bg-yellow-500 transition-all duration-300 group shadow-lg">
              <span className="text-yellow-500 group-hover:text-black text-lg">🔔</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 group-hover:text-black hidden sm:block">Reminders</span>
            </button>
          </div>

          {affectedTheaterCount > 0 && (
            <div className="animate-in slide-in-from-left duration-700 bg-red-500/5 px-4 py-1.5 rounded-full border border-red-500/10 max-w-[200px] overflow-hidden">
              <p className="text-[8px] text-red-500 font-black uppercase tracking-tighter whitespace-nowrap animate-pulse">
                INCIDENT: {affectedTheaterNames}
              </p>
            </div>
          )}
        </div>

        <div className="absolute top-8 right-8 md:right-12 flex items-center gap-3 z-20">
          <button onClick={() => router.push('/about')} className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all font-black text-[9px] uppercase tracking-[0.2em]"><span>📍</span> About</button>
          <button onClick={() => router.push('/contact')} className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all font-black text-[9px] uppercase tracking-[0.2em]"><span>📞</span> Contact</button>
          <button onClick={() => { setToastMessage("CODE: LUX50 APPLIED!"); setShowToast(true); }} className="hidden lg:flex px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl hover:bg-cyan-500 hover:text-white text-cyan-500 transition-all font-black text-[10px] uppercase tracking-widest">Offers</button>

          <button onClick={() => router.push('/history')} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"><span>🎞️</span> My Bookings</button>
          <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl hover:bg-yellow-500 hover:text-black text-yellow-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"><span>💳</span> Payment</button>
          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-center w-12 h-12 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-600 hover:text-white text-red-500 transition-all duration-300 shadow-lg group"><span className="text-lg group-hover:scale-110">⏻</span></button>
        </div>

        <h2 className="text-yellow-600 text-xs font-bold tracking-[0.5em] uppercase mb-4 opacity-70">WELCOME TO </h2>
        <h1 className="text-6xl md:text-8xl font-serif font-black mb-12 bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100 bg-clip-text text-transparent uppercase tracking-tighter">EXCLUSIVE CINEMA</h1>

        <div className="max-w-6xl mx-auto mt-12 flex flex-col items-center gap-10">
          {/* 📍 LOCATION & BRANCH SELECTOR */}
          <div className="max-w-5xl mt-10 px-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">

              <div className="flex items-center gap-4 md:gap-12">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg">📍</span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500">
                    Select Cinema Branch
                  </h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                    Choose your premium location
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">

                {/* Province Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Province
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      const province = e.target.value;
                      setSelectedProvince(province);
                      const found = locations.find(l => l.province === province);
                      if (found) {
                        setSelectedBranch(found.branches[0]);
                      }
                    }}
                    className="bg-black/40 border border-yellow-500/20 rounded-2xl px-6 py-4 text-sm font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 transition-all"
                  >
                    {locations.map((loc) => (
                      <option key={loc.province} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="bg-black/40 border border-purple-500/20 rounded-2xl px-6 py-4 text-sm font-bold text-purple-400 focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {locations
                      .find(l => l.province === selectedProvince)
                      ?.branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                  </select>
                </div>

              </div>

              {/* Selected Display */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-transparent border border-white/5 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  🎬 Now Viewing At:
                </p>
                <p className="text-sm text-yellow-400 font-bold mt-1">
                  {selectedBranch}
                </p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                  {selectedProvince}
                </p>
              </div>

            </div>
          </div>

          <input type="text" placeholder=" 🔎Search the movies..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl px-24 py-12 focus:outline-none focus:border-yellow-500/50 transition-all text-lg font-light text-center" onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="bg-white/[0.03] border border-white/10 rounded-3xl px-10 py-5 outline-none font-bold text-sm text-gray-400 text-center appearance-none" onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Drama">Drama</option>
          </select>
        </div>
      </div>
      {/* 🎁 PROMOTION SECTION */}
      <section className="pt-20 pb-20 px-10 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          <h2 className="text-3xl font-serif font-black text-yellow-500 uppercase tracking-tighter">
            🎁 Exclusive Promotions
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="p-8 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-[2rem] hover:scale-105 transition-all">
            <h3 className="text-lg font-black text-yellow-400 mb-3">LUX50</h3>
            <p className="text-sm text-gray-400">
              รับส่วนลด 50% สำหรับ Gold Class ทุกวันจันทร์
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-[2rem] hover:scale-105 transition-all">
            <h3 className="text-lg font-black text-purple-400 mb-3">Student Night</h3>
            <p className="text-sm text-gray-400">
              แสดงบัตรนักศึกษา รับป๊อปคอร์นฟรี 1 ชุด
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-[2rem] hover:scale-105 transition-all">
            <h3 className="text-lg font-black text-cyan-400 mb-3">Premium Member</h3>
            <p className="text-sm text-gray-400">
              สะสมครบ 10 รอบ รับตั๋วฟรี 1 ที่นั่ง
            </p>
          </div>

        </div>
      </section>
      {/* 🎬 NOW SHOWING SECTION (เพิ่มคำว่า Now Showing ตรงนี้) */}
      <div className="pt-20 pb-20 px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          <h2 className="text-3xl font-serif font-black text-yellow-500 uppercase tracking-tighter">🍿 Now Showing</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {filteredMovies.map((movie) => {

            const emergency = emergencyList.find(
              e => e.branch === selectedBranch && e.theater_id === movie.theater_id
            );

            const isClosed = !!emergency;
            return (
              <div key={movie.id} className="group relative">
                <div className={`absolute -inset-1 rounded-[3rem] opacity-0 group-hover:opacity-100 transition duration-700 blur-2xl ${isClosed ? "bg-red-900/20" : "bg-yellow-500/20"}`}></div>
                <div className={`relative bg-[#0d0d0d] rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${isClosed ? "border-red-900/40" : "border-white/5 group-hover:border-yellow-500/40 group-hover:-translate-y-6"}`}>
                  <MovieCard movie={movie} onSelect={(id, tid, tname, title) => {
                    if (isClosed) {
                      setActiveModal("emergency");
                      return;
                    }
                    const query = new URLSearchParams({ movieId: id, theater_id: tid.toString(), theater_name: tname, title: title }).toString();
                    router.push(`/showtime?${query}`);
                  }} />
                  {isClosed && (
                    <div className="absolute bottom-0 left-0 w-full bg-red-600/90 backdrop-blur-md py-4 px-4 flex items-center justify-center gap-3 z-50 text-white">
                      <span className="animate-pulse">⚠️</span>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                        {emergency?.caseType}: {emergency?.details}
                      </p>
                    </div>
                  )}
                </div>
                {isClosed && <p className="mt-6 text-red-500 text-[10px] font-black text-center uppercase tracking-[0.3em] animate-pulse">Booking Suspended</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📅 COMING SOON SECTION */}
      <section id="coming-soon-section" className="pt-20 pb-40 px-10 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <h2 className="text-3xl font-serif font-black text-purple-500 uppercase tracking-tighter">📅 Coming Soon</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {upcomingMovies.length > 0 ? (
            upcomingMovies.map((movie) => (
              <div key={movie.id} className="group relative">
                <div className="absolute -inset-1 bg-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white/[0.03] border border-white/10 p-5 rounded-[2.5rem] hover:bg-white/[0.05] transition-all">
                  <div className="relative aspect-[2/3] rounded-3xl overflow-hidden mb-6">
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{movie.release_date}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight line-clamp-1">{movie.title}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">{movie.genre}</p>
                  <button className="w-full py-3 bg-white/5 hover:bg-purple-500 hover:text-white text-gray-400 font-black uppercase text-[9px] tracking-[0.2em] rounded-xl transition-all border border-white/10">Remind Me</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600 text-xs uppercase tracking-widest">No upcoming masterpieces scheduled</p>
          )}
        </div>
      </section>

      {/* Global Style */}
      <style jsx global>{`
        .custom-scrollbar-yellow::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-yellow::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar-yellow::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.5); border-radius: 10px; }
        .custom-scrollbar-indigo::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-indigo::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar-indigo::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 10px; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <footer className="py-20 text-center text-gray-700 border-t border-white/5 text-[9px] tracking-[0.5em] uppercase">
        © 2026 EXCLUSIVE CINEMA • Designed for Exclusive and VIP
      </footer>
    </main>
  );
}