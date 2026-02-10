from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.infrastructure.database import engine, get_db
from app.domain import models
from pydantic import BaseModel
from typing import Optional
import re
import yt_dlp
import requests
from sqlalchemy import text
from app.services import ai_service  # Yeni oluşturduğun servis

# Veritabanı tablolarını oluşturur
models.Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS summary TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS key_points TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS timestamps JSON"))
        conn.commit()
    except Exception as e:
        print(f"Uyarı: Veritabanı sütun kontrolü: {e}")

app = FastAPI(title="NoteGenie API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ŞEMALAR ---
class RegisterSchema(BaseModel):
    full_name: str
    email: str
    password: str
    university: str
    department: str
    grade: str

class LoginSchema(BaseModel):
    email: str
    password: str

class VideoAddSchema(BaseModel):
    youtube_url: str
    title: str = "Yeni Ders Videosu"
    course_id: Optional[int] = None

class CourseCreateSchema(BaseModel):
    title: str
    description: Optional[str] = "Yeni oluşturulan koleksiyon"

# --- YOUTUBE MODÜLÜ ---
def get_youtube_transcript(video_url: str):
    try:
        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['tr', 'en'],
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'ignore_no_formats_error': True,
            'format': None,
            'cookiesfrombrowser': ('chrome',),
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            subs = info.get('subtitles') or info.get('automatic_captions') or {}
            
            lang = 'tr' if 'tr' in subs else ('en' if 'en' in subs else (list(subs.keys())[0] if subs else None))
            
            if lang:
                # Altyazı URL'sini bul
                sub_url = next((s['url'] for s in subs[lang] if s.get('ext') == 'json3'), subs[lang][0]['url'])
                response = requests.get(sub_url)
                
                # --- AYIKLAMA MANTIĞI BURADA ---
                if "json" in sub_url:
                    data = response.json()
                    # Sadece konuşma olan (utf8) parçaları cımbızla çekiyoruz
                    text_parts = []
                    for event in data.get('events', []):
                        if 'segs' in event:
                            for seg in event['segs']:
                                if 'utf8' in seg:
                                    text_parts.append(seg['utf8'])
                    clean_text = "".join(text_parts)
                else:
                    # Eğer eski usul XML/VTT gelirse regex ile temizle
                    clean_text = re.sub(r'<[^>]*>', '', response.text)
                    clean_text = re.sub(r'(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})', '', clean_text)

                return {
                    "success": True, 
                    "transcript": " ".join(clean_text.split())[:8000], 
                    "actual_title": info.get('title', 'Yeni Video'),
                    "duration": info.get('duration', 0)
                }
            return {"success": False, "error": "Altyazı bulunamadı."}
    except Exception as e:
        return {"success": False, "error": str(e)}
# --- ENDPOINT'LER ---

@app.post("/api/auth/login")
async def login_user(login_data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email.strip()).first()
    if not user or user.password_hash.strip() != login_data.password.strip():
        raise HTTPException(status_code=401, detail="Hatalı giriş")
    return {"message": "Giriş başarılı!", "user": {"id": user.user_id, "full_name": user.full_name}}

@app.get("/api/v1/courses")
async def get_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@app.post("/api/v1/courses")
async def create_course(course_data: CourseCreateSchema, db: Session = Depends(get_db)):
    new_course = models.Course(title=course_data.title, description=course_data.description)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {"course_id": new_course.course_id, "title": new_course.title}

@app.post("/api/v1/videos/add")
async def add_video(video_data: VideoAddSchema, db: Session = Depends(get_db)):
    result = get_youtube_transcript(video_data.youtube_url)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    transcript_text = result["transcript"]
    print("\n" + "="*50)
    print("YOUTUBE'DAN ÇEKİLEN HAM METİN (İLK 500 KARAKTER):")
    print(transcript_text[:500])
    print("="*50 + "\n")
    total_duration = result.get("duration", 0)
    
    # AI işlemlerini servisten çağırıyoruz
    video_timestamps = ai_service.create_smart_timestamps(transcript_text, total_duration)
    video_summary = ai_service.generate_summary(transcript_text)

    try:
        new_video = models.Video(
            title=result.get("actual_title", video_data.title),
            youtube_url=video_data.youtube_url,
            transcript=transcript_text, 
            summary=video_summary,
            course_id=video_data.course_id,
            processed_by_ai=True,
            timestamps=video_timestamps
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        return {
            "video_id": new_video.video_id,
            "course_id": video_data.course_id,
            "message": "Analiz tamamlandı!"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Kayıt Hatası: {str(e)}")

@app.get("/api/v1/courses/{course_id}/videos")
async def get_course_videos(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Video)\
        .filter(models.Video.course_id == course_id)\
        .order_by(models.Video.video_id.asc())\
        .all()

@app.get("/api/v1/videos/{video_id}")
async def get_video_detail(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    if not video: raise HTTPException(status_code=404, detail="Bulunamadı")
    
    return {
        "video_id": video.video_id,
        "title": video.title,
        "youtube_url": video.youtube_url,
        "summary": video.summary,
        "duzgun_zamanlar": video.timestamps or [],
        "youtube_id": video.youtube_url.split("v=")[-1] if "v=" in video.youtube_url else video.youtube_url.split("/")[-1],
        "course_id": video.course_id
    }