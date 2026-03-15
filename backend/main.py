from fastapi import FastAPI, HTTPException, Depends
from fastapi import UploadFile, File
import fitz # PyMuPDF kütüphanesi
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
from fastapi import Form

# Veritabanı tablolarını oluşturur
models.Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS summary TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS key_points TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_visited BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS timestamps JSON"))
        conn.execute(text("ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE courses ADD COLUMN IF NOT EXISTS author_name TEXT"))
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
            'writeautomaticsub': True,  # Otomatik altyazıları zorla çeker
            'subtitleslangs': ['tr', 'en', '.*'],  # TR, EN veya ne bulursa
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'ignore_no_formats_error': True,
            'format': None,
            'cookiesfrombrowser': ('chrome',),
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # Altyazıları ve otomatik altyazıları bir havuzda topla
            subs = info.get('subtitles', {})
            auto_subs = info.get('automatic_captions', {})
            
            # Dil önceliği: tr (manuel) -> tr (otomatik) -> en (manuel) -> en (otomatik) -> ilk bulunan
            lang = None
            if 'tr' in subs: lang = 'tr'
            elif 'tr' in auto_subs: lang = 'tr'
            elif 'en' in subs: lang = 'en'
            elif 'en' in auto_subs: lang = 'en'
            elif subs: lang = list(subs.keys())[0]
            elif auto_subs: lang = list(auto_subs.keys())[0]
            
            if lang:
                # Altyazı listesini belirle
                available_subs = subs.get(lang) or auto_subs.get(lang)
                
                # JSON3 formatını yakala (en temiz metin buradadır)
                sub_url = next((s['url'] for s in available_subs if s.get('ext') == 'json3'), available_subs[0]['url'])
                response = requests.get(sub_url)
                
                if "json" in sub_url:
                    data = response.json()
                    text_parts = []
                    # Sadece konuşma içeren (utf8) parçaları cımbızla çek
                    for event in data.get('events', []):
                        if 'segs' in event:
                            for seg in event['segs']:
                                if 'utf8' in seg:
                                    text_parts.append(seg['utf8'])
                    clean_text = "".join(text_parts)
                else:
                    # XML/VTT gelirse regex ile temizle
                    clean_text = re.sub(r'<[^>]*>', '', response.text)
                    clean_text = re.sub(r'(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})', '', clean_text)

                return {
                    "success": True, 
                    "transcript": " ".join(clean_text.split())[:10000], # Gemini için 10k karakter ideal
                    "actual_title": info.get('title', 'Yeni Video'),
                    "duration": info.get('duration', 0)
                }
            return {"success": False, "error": "Bu video için altyazı verisi bulunamadı."}
    except Exception as e:
        return {"success": False, "error": str(e)}
    
def extract_text_from_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text
# --- ENDPOINT'LER ---

@app.post("/api/auth/login")
async def login_user(login_data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email.strip()).first()
    if not user or user.password_hash.strip() != login_data.password.strip():
        raise HTTPException(status_code=401, detail="Hatalı giriş")
    return {"message": "Giriş başarılı!", "user": {"id": user.user_id, "full_name": user.full_name}}

@app.get("/api/v1/courses")
async def get_courses(db: Session = Depends(get_db)):
    # 1. Tüm kursları getir
    courses = db.query(models.Course).all()
    result = []
    
    for course in courses:
        # 2. Bu kursa bağlı videoları getir
        videos = db.query(models.Video).filter(models.Video.course_id == course.course_id).all()
        
        # 3. Videoların durumlarını bir liste yap (React burayı okuyacak)
        video_status_list = []
        for v in videos:
            video_status_list.append({
                "video_id": v.video_id,
                "is_completed": bool(v.is_completed)  # İşte o 't' harfi burada True olarak gidecek
            })
            
        # 4. Kurs objesini ve videolarını birleştir
        result.append({
            "course_id": course.course_id,
            "title": course.title,
            "description": course.description,
            "is_public": course.is_public,
            "author_name": course.author_name,
            "videos": video_status_list  # BU SATIR OLMAZSA YÜZDE HEP 0 KALIR!
        })
        
    return result

@app.post("/api/v1/courses")
async def create_course(course_data: CourseCreateSchema, db: Session = Depends(get_db)):
    new_course = models.Course(title=course_data.title, description=course_data.description)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {"course_id": new_course.course_id, "title": new_course.title}

# --- PDF EKLEME ENDPOINT ---
# --- PDF EKLEME ENDPOINT ---
@app.post("/api/v1/pdf/add")
async def add_pdf(
    course_id: int = Form(...),  # <--- BURAYI GÜNCELLEDİK (Form ekledik)
    title: str = Form(...),      # <--- BURAYI GÜNCELLEDİK (Form ekledik)
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    try:
        # 1. PDF'i Oku
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        pdf_text = ""
        for page in doc:
            pdf_text += page.get_text()
        
        # 2. Gemini ile Özetle
        pdf_summary = ai_service.generate_summary(pdf_text)
        
        # 3. Veritabanına Kaydet
        new_material = models.Video(
            title=title,
            youtube_url=f"PDF_FILE_{title}", 
            transcript=pdf_text,
            summary=pdf_summary,
            course_id=course_id,
            processed_by_ai=True,
            timestamps=[] 
        )
        
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        
        # Frontend'in beklediği 'id' bilgisini döndürüyoruz
        return {"id": new_material.video_id, "message": "PDF Başarıyla Kitapçığa Eklendi!"}
    except Exception as e:
        print(f"PDF İşleme Hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
@app.get("/api/v1/explore/courses")
async def get_public_courses(db: Session = Depends(get_db)):
    # is_public'i True olan tüm kursları getir
    return db.query(models.Course).filter(models.Course.is_public == True).all()

@app.get("/api/v1/my-courses/{user_id}")
async def get_user_courses(user_id: int, db: Session = Depends(get_db)):
    # Bu kısım ileride 'Enrollment' tablosuyla daha detaylı olacak
    # Şimdilik creator_id'si biz olanları getiriyoruz
    return db.query(models.Course).filter(models.Course.creator_id == user_id).all()

# Video bittiğinde çağrılacak endpoint
# Video bittiğinde çağrılacak endpoint
@app.post("/api/v1/videos/{video_id}/complete")
async def complete_video(video_id: int, user_id: Optional[int] = None, db: Session = Depends(get_db)): # user_id'yi opsiyonel yaptık ki hata vermesin
    video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    if video:
        video.is_completed = True
        db.commit()
        return {"status": "success", "is_completed": True}
    raise HTTPException(status_code=404, detail="Video bulunamadı")

@app.post("/api/v1/videos/{video_id}/visit")
async def mark_video_visited(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    if video:
        video.is_visited = True  # Videoya tıklandığını işaretle
        db.commit()
    return {"status": "marked as visited"}