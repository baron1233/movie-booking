"use client";

// เพิ่ม parameter 'delay' เพื่อหน่วงเวลา (หน่วยเป็นมิลลิวินาที)
export const handleNotification = (title: string, message: string, delay: number = 3000) => {
  
  // สร้าง Promise เพื่อให้ฝั่ง UI รอการทำงานได้
  return new Promise((resolve) => {
    
    // 1. จำลองการรอ (เช่น รอเวลาหนังใกล้ฉาย)
    setTimeout(() => {
      
      // 2. พยายามเรียก Browser Notification
      if (typeof window !== "undefined" && "Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body: message,
              icon: "https://cdn-icons-png.flaticon.com/512/2503/2503508.png",
              silent: false,
            });
          }
        });
      }

      // ส่งค่ากลับไปบอก UI ว่า "แจ้งเตือนแล้วนะ" (เพื่อให้ UI แสดงแถบสวยๆ)
      resolve("sent");
      
    }, delay); // หน่วงเวลาตามที่กำหนด (default 3 วินาที)
  });
};