from pydantic import BaseModel, HttpUrl
from typing import List, Optional

# 1. Model สำหรับข้อมูลหนัง (รองรับ UI สวยๆ)
class Movie(BaseModel):
    id: Optional[int] = None
    title: str
    poster_url: str
    duration: int           # เพิ่ม: ความยาวหนัง (นาที)
    genre: str              # เพิ่ม: แนวหนัง (เช่น Action, Drama)
    synopsis: str           # เพิ่ม: เรื่องย่อเพื่อให้ UI ดูเต็มขึ้น
    rating: float = 5.0    

# 2. Model สำหรับผังที่นั่ง (ช่วยให้หน้าบ้านวาด Grid ง่ายขึ้น)
class Seat(BaseModel):
    id: int
    showtime_id: int
    seat_code: str         
    row_name: str           
    seat_type: str         
    price: float            
    status: str            

# 3. Model สำหรับการจอง (Schema ที่ส่งมาจาก Frontend)
class BookingRequest(BaseModel):
    movie_id: int
    showtime_id: int
    seats: List[str]       
    amount: float
    user_email: Optional[str] = None # เพิ่ม: สำหรับส่งตั๋วทางอีเมล