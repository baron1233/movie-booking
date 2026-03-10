"use client";

import { useRouter } from "next/navigation";

export default function CinemaPolicyPage() {
  const router = useRouter();

  const policies = [
    {
      id: 1,
      icon: "🌡️",
      titleTh: "การควบคุมสภาพแวดล้อม",
      titleEn: "Climate & Environment",
      descTh: "เราควบคุมอุณหภูมิภายในโรงภาพยนตร์ให้อยู่ที่ 21-23°C ซึ่งเป็นระดับที่เหมาะสมที่สุดสำหรับการชมภาพยนตร์ หากท่านรู้สึกไม่สบายตัวสามารถแจ้งพนักงานผ่านแอปพลิเคชันได้ทันที",
      descEn: "We maintain theater temperatures between 21-23°C for optimal comfort. If you experience any discomfort, please notify our staff via the application immediately."
    },
    {
      id: 2,
      icon: "🚨",
      titleTh: "ระบบความปลอดภัยเชิงรุก (เหตุการณ์ฉุกเฉิน เช่น ไฟดับ เครื่องฉายเสีย ระหว่างที่ฉายหนัง)",
      titleEn: "Proactive Safety System",
      descTh: "ระบบ 'ตัดไฟแต่ต้นลม' ของเราจะตรวจจับความผิดปกติล่วงหน้า ในกรณีเกิดเหตุสุดวิสัย ระบบจะส่งการแจ้งเตือนและขั้นตอนการปฏิบัติไปยังมือถือของท่านโดยตรง พร้อมระบบคืนเงินอัตโนมัติ",
      descEn: "Our 'Proactive Safety' system detects irregularities in advance. In case of emergencies, instructions and automated refund options will be sent directly to your device."
    },
    {
      id: 3,
      icon: "🍿",
      titleTh: "อาหารและเครื่องดื่ม",
      titleEn: "Food & Beverages",
      descTh: "อนุญาตเฉพาะอาหารและเครื่องดื่มที่จำหน่ายโดยทางโรงภาพยนตร์เท่านั้น เพื่อควบคุมกลิ่นและเสียงที่อาจรบกวนอรรถรสในการรับชมของผู้อื่น",
      descEn: "Only food and beverages purchased from our cinema are permitted to ensure a pleasant atmosphere and minimize disturbances for all guests."
    },
    {
      id: 4,
      icon: "📱",
      titleTh: "มารยาทในการใช้เครื่องมือสื่อสาร",
      titleEn: "Mobile Device Etiquette",
      descTh: "กรุณาปิดเสียงหรือเปิดโหมดสั่น และงดการใช้หน้าจอที่มีแสงจ้าขณะภาพยนตร์ฉาย การบันทึกภาพและเสียงถือเป็นความผิดตามกฎหมาย",
      descEn: "Please mute all devices and refrain from using bright screens during the feature. Unauthorized recording of any kind is strictly prohibited by law."
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30">
      {/* 🌑 Background Texture */}
      <div className="fixed inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* 🔙 Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-12 flex items-center gap-2 text-yellow-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all"
        >
          ← Back to Session
        </button>

        {/* 🏆 Header */}
        <div className="border-l-4 border-yellow-500 pl-6 mb-16">
          <h1 className="text-5xl font-serif font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-yellow-100 to-yellow-600 bg-clip-text text-transparent">
            Cinema Policy
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-[0.3em] font-bold">
            ข้อปฏิบัติและนโยบายของโรงภาพยนตร์
          </p>
        </div>

        {/* 📜 Policies List */}
        <div className="space-y-8">
          {policies.map((policy) => (
            <div 
              key={policy.id} 
              className="group bg-[#111] border border-white/5 rounded-[2rem] p-8 hover:border-yellow-500/30 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="text-4xl bg-black/40 w-16 h-16 flex items-center justify-center rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                  {policy.icon}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-bold text-yellow-500 mb-1">{policy.titleTh}</h3>
                    <h4 className="text-sm text-gray-400 font-serif italic tracking-wide">{policy.titleEn}</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed font-light text-sm">
                      {policy.descTh}
                    </p>
                    <p className="text-gray-500 leading-relaxed font-light text-sm italic">
                      {policy.descEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🏛️ Signature Footer */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] mb-4">
            Diamond Cineplex Excellence Standard
          </p>
          <div className="flex justify-center gap-4">
            <div className="h-[1px] w-12 bg-yellow-900 self-center"></div>
            <span className="text-yellow-700 font-serif italic text-sm">Est. 2026</span>
            <div className="h-[1px] w-12 bg-yellow-900 self-center"></div>
          </div>
        </div>
      </div>
    </main>
  );
}