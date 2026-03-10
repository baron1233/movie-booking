from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

# โครงสร้างข้อมูลให้ตรงกับที่ Frontend ต้องการ
class UpcomingMovie(BaseModel):
    id: str
    title: str
    release_date: str
    poster: str
    genre: str
    description: str

# Mock Data (ในอนาคตเปลี่ยนเป็นดึงจาก Database)
UPCOMING_MOVIES = [
    {
        "id": "101",
        "title": "Avatar 3",
        "release_date": "2026-12-18",
        "poster": "https://example.com/poster1.jpg",
        "genre": "Sci-Fi",
        "description": "The journey continues in the world of Pandora."
    },
    {
        "id": "102",
        "title": "Batman: Part II",
        "release_date": "2026-10-02",
        "poster": "https://example.com/poster2.jpg",
        "genre": "Action",
        "description": "The Dark Knight returns to face new threats."
    }
]

@router.get("/api/movies/upcoming", response_model=List[UpcomingMovie])
async def get_upcoming_movies():
    return UPCOMING_MOVIES