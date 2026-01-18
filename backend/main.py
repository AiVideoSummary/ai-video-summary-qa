from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.infrastructure.database import engine, get_db # get_db'yi buradan çekiyoruz
from app.domain import models
from pydantic import BaseModel
import re
import yt_dlp

# Veritabanı tablolarını oluşturur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoteGenie API")

# --- 1. ÖNEMLİ: CORS AYARI ---
# Frontend'in (localhost:5173) Backend'e erişmesine izin verir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kayıt verisi için şema
class RegisterSchema(BaseModel):
    full_name: str
    email: str
    password: str
    university: str
    department: str
    grade: str

# --- 2. KAYIT OL ENDPOINT'I ---
@app.post("/api/auth/register")
async def register_user(user_data: RegisterSchema, db: Session = Depends(get_db)):
    try:
        # User modelindeki sütun isimleriyle birebir eşleştiriyoruz
        new_user = models.User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=user_data.password, # 'password' yerine 'password_hash'
            class_year=int(user_data.grade),   # 'grade' yerine 'class_year'
            # Not: Şu an üniversite ve bölüm ID bekliyor, geçici olarak None bırakabiliriz
            university_id=None, 
            department_id=None
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "Kayıt başarılı!", "user": new_user.full_name}
    except Exception as e:
        db.rollback()
        print(f"Veritabanı Hatası: {str(e)}")
        raise HTTPException(status_code=400, detail="Veritabanına kayıt yapılamadı.")
# --- 3. GÜN: YOUTUBE VERİ ÇEKME MODÜLÜ ---
def get_youtube_transcript(video_url: str):
    try:
        video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url)
        if not video_id_match:
            return {"success": False, "error": "Geçersiz YouTube URL'si"}
        
        ydl_opts = {
            'skip_download': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['tr', 'en'],
            'quiet': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            subtitles = info.get('requested_subtitles')
            if subtitles:
                return {"success": True, "transcript": "Altyazı verisi başarıyla yakalandı."}
            else:
                return {"success": False, "error": "Altyazı desteği bulunamadı."}
    except Exception as e:
        return {"success": False, "error": f"Sistem hatası: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "NoteGenie Backend Çalışıyor!"}

@app.get("/get-transcript/")
async def fetch_transcript(url: str):
    result = get_youtube_transcript(url)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

# 1. Login verisi için şema (RegisterSchema'nın altına ekle)
class LoginSchema(BaseModel):
    email: str
    password: str

# 2. Login Endpoint'i (Register endpoint'inin altına ekle)
@app.post("/api/auth/login")
async def login_user(login_data: LoginSchema, db: Session = Depends(get_db)):
    # Veritabanında kullanıcıyı ara
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    # Kullanıcı yoksa veya şifre yanlışsa hata döndür
    if not user or user.password_hash != login_data.password:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı!")
    
    # Başarılı ise kullanıcı bilgilerini döndür
    return {
        "message": "Giriş başarılı!",
        "user": {
            "id": user.user_id,
            "full_name": user.full_name
        }
    }