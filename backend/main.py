from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.infrastructure.database import engine, get_db
from app.domain import models
from pydantic import BaseModel
from typing import Optional # Yeni eklendi
import re
import yt_dlp
import requests
from youtube_transcript_api import YouTubeTranscriptApi

# Veritabanı tablolarını oluşturur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoteGenie API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
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

# Video eklemek için gerekli şema güncellendi
class VideoAddSchema(BaseModel):
    youtube_url: str
    title: str = "Yeni Ders Videosu"
    course_id: Optional[int] = None # Arayüzden seçilen koleksiyon ID'si gelecek

# --- YOUTUBE MODÜLÜ ---
def get_youtube_transcript(video_url: str):
    try:
        video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url)
        if not video_id_match:
            return {"success": False, "error": "Geçersiz YouTube URL'si"}
        
        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['tr', 'en'],
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            # KRİTİK AYARLAR: Format hatasını bu üç satır engeller
            'ignore_no_formats_error': True,
            'format': None, 
            'outtmpl': '%(id)s.%(ext)s',
            'cookiesfrombrowser': ('chrome',),
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Sadece metadata çekiyoruz, format araması yaptırmıyoruz
            info = ydl.extract_info(video_url, download=False, process=False)
            # Bilgileri almak için tekrar çağırıyoruz ama 'process=True' ile format hatasını yutuyoruz
            try:
                actual_info = ydl.extract_info(video_url, download=False)
            except Exception:
                actual_info = info # Eğer hata verirse ham info ile devam et

            subs = actual_info.get('subtitles') or actual_info.get('automatic_captions') or {}
            lang = 'tr' if 'tr' in subs else ('en' if 'en' in subs else None)
            
            if lang and subs[lang]:
                # Altyazı URL'sini JSON3 formatında bulmaya çalış
                sub_url = next((s['url'] for s in subs[lang] if s.get('ext') == 'json3'), subs[lang][0]['url'])
                
                response = requests.get(sub_url)
                if "json" in sub_url:
                    data = response.json()
                    clean_text = " ".join([
                        "".join([s['utf8'] for s in event['segs'] if 'utf8' in s])
                        for event in data.get('events', []) if 'segs' in event
                    ])
                else:
                    clean_text = re.sub(r'<[^>]*>', '', response.text)
                    clean_text = re.sub(r'(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})', '', clean_text)
                
                return {
                    "success": True, 
                    "transcript": " ".join(clean_text.split())[:8000], 
                    "actual_title": actual_info.get('title', 'Yeni Video'),
                    "duration": actual_info.get('duration', 0)
                }
            
            return {"success": False, "error": "Altyazı dosyası bulunamadı."}

    except Exception as e:
        return {"success": False, "error": f"yt-dlp Hatası: {str(e)}"}
# --- ENDPOINT'LER ---
# --- KAYIT OL ENDPOINT ---

@app.post("/api/auth/register")
async def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı!")

    try:
        # DİKKAT: Senin modelinde university_id ve department_id var.
        # Şimdilik hata almamak için isimleri senin modelindeki sütunlara eşliyoruz.
        new_user = models.User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=user_data.password,
            # Modelindeki sütun isimleri class_year iken şemada grade geliyor
            class_year=int(user_data.grade.split('.')[0]) if user_data.grade else None
            # university_id ve department_id için şimdilik null bırakıyoruz 
            # veya üniversite tablosundan ID bulman gerekecek.
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "Kayıt başarıyla tamamlandı!", "user_id": new_user.user_id}
    
    except Exception as e:
        db.rollback()
        print(f"KAYIT HATASI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sistemsel Hata: {str(e)}")
      
@app.post("/api/auth/login")
async def login_user(login_data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email.strip()).first()
    if not user or user.password_hash.strip() != login_data.password.strip():
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı!")
    return {"message": "Giriş başarılı!", "user": {"id": user.user_id, "full_name": user.full_name}}

# KOLEKSİYONLARI LİSTELEMEK İÇİN (Frontend'de Select kutusu için gerekecek)
@app.get("/api/v1/courses")
async def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    return courses

# GÜNCELLENMİŞ VİDEO EKLEME (Koleksiyon Bağlantılı)
@app.post("/api/v1/videos/add")
async def add_video(video_data: VideoAddSchema, db: Session = Depends(get_db)):
    result = get_youtube_transcript(video_data.youtube_url)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    try:
        new_video = models.Video(
            title=result.get("actual_title", video_data.title),
            youtube_url=video_data.youtube_url,
            transcript=result["transcript"], 
            processed_by_ai=False,
            course_id=video_data.course_id, # Seçilen koleksiyona bağladık
            duration_seconds=result.get("duration")
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        return {
            "message": "Video seçilen koleksiyona başarıyla eklendi!", 
            "video_id": new_video.video_id,
            "course_id": new_video.course_id
        }
    except Exception as e:
        db.rollback()
        print(f"HATA: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Veritabanı kayıt hatası: {str(e)}")
