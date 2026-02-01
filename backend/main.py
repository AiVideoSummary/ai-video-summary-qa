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
from transformers import pipeline
from sqlalchemy import text
# Veritabanı tablolarını oluşturur
models.Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        # PostgreSQL'de 'summary' sütunu var mı diye bakıyoruz, yoksa ekliyoruz
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS summary TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS key_points TEXT"))
        conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS timestamps JSON"))
        conn.commit()
        print("Bilgi: 'summary', 'key_points', ve 'timestamps' sütunları kontrol edildi/eklendi.")
    except Exception as e:
        # Hata değil, sadece bir uyarı olarak yazdırıyoruz
        print(f"Uyarı: Sütun kontrolü sırasında bir durum oluştu: {e}")

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


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

# Mevcut dilleri listele
            available_langs = list(subs.keys())

# Önce Türkçe, sonra İngilizce, yoksa bulduğun ilk dili al
            if 'tr' in available_langs:
                lang = 'tr'
            elif 'en' in available_langs:
                lang = 'en'
            elif available_langs:
                lang = available_langs[0]
            else:
                lang = None

            
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
    
def generate_summary(text: str):
    if not text or len(text) < 100:
        return "Özet oluşturmak için yeterli metin bulunamadı."

    # 1. Metni 1000 karakterlik parçalara (chunk) bölelim
    chunk_size = 1000 
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    
    summaries = []
    print(f"Toplam {len(chunks)} parça işleniyor...")

    # 2. Her parçayı tek tek özetleyelim
    for chunk in chunks:
        try:
            # max_length ve min_length değerlerini her parça için dengeliyoruz
            res = summarizer(chunk, max_length=100, min_length=30, do_sample=False)
            summaries.append(res[0]['summary_text'])
        except Exception as e:
            print(f"Bir parça özetlenirken hata oluştu: {e}")
            continue

    # 3. Tüm küçük özetleri birleştirip son bir genel özet yapalım
    combined_summary = " ".join(summaries)
    
    # Eğer birleştirilmiş özet çok uzunsa onu da bir tur kısaltabiliriz
    if len(combined_summary) > 1000:
        final_res = summarizer(combined_summary[:1024], max_length=200, min_length=100, do_sample=False)
        return final_res[0]['summary_text']
        
    return combined_summary

def extract_key_points(text: str):
    # Prompt İyileştirmesi: AI'ya sadece özetleme değil, bir "etiket/başlık" oluştur diyoruz
    # Max length'i iyice kısaltıyoruz ki başlık tadında olsun
    try:
        res = summarizer(text, max_length=40, min_length=5, do_sample=False)
        label = res[0]['summary_text'].replace("•", "").strip()
        
        # Eğer cümle çok uzun gelirse veya yarım kalırsa ilk 50 karakteri alıp "..." eklemiyoruz, 
        # çünkü summarizer zaten kısa tutacak.
        return label.capitalize()
    except:
        return "Bölüm Özeti"


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
    
    transcript_text = result["transcript"]
    total_duration = result.get("duration", 0)
    
    # --- AKILLI DİNAMİK MANTIK ---
    import re
    # Metni sadece nokta, ünlem ve soru işaretlerinden bölüyoruz (Cümle bazlı)
    sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', transcript_text) if s.strip()]
    total_sentences = len(sentences)
    video_timestamps = []

    if total_sentences > 0:
        # 8 parça oluşturmak için kaç cümlede bir bölmeliyiz?
        calculated_chunks = max(5, min(15, total_duration // 180))
        step = max(1, total_sentences // calculated_chunks)
        
        for i in range(0, total_sentences, step):
            if len(video_timestamps) >= 8: break
            
            # O anki cümleden başlayarak bir parça metin al
            current_chunk = " ".join(sentences[i : i + step])
            # Akıllı başlığı bu parçanın başından üret (AI yarım kelime görmesin)
            point_label = extract_key_points(current_chunk[:500]) 
            
            # Saniyeyi hesapla
            avg_sec_per_sentence = total_duration / total_sentences
            current_seconds = int(i * avg_sec_per_sentence)
            
            timestamp_str = f"{current_seconds // 60:02d}:{current_seconds % 60:02d}"
            video_timestamps.append({"time": timestamp_str, "label": point_label})
    else:
        # Eğer hiç cümle bulunamazsa (altyazı çok kısaysa) hata vermesin
        video_timestamps.append({"time": "00:00", "label": "Video İçeriği"})
    # -----------------------------------------------

    video_summary = generate_summary(transcript_text)
    video_key_points = extract_key_points(transcript_text[:1024])

    try:
        new_video = models.Video(
            title=result.get("actual_title", video_data.title),
            youtube_url=video_data.youtube_url,
            transcript=transcript_text, 
            summary=video_summary,
            key_points=video_key_points,
            timestamps=video_timestamps,
            processed_by_ai=True,
            course_id=video_data.course_id,
            duration_seconds=total_duration
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        return {
            "message": "Akıllı analiz tamamlandı!", 
            "video_id": new_video.video_id,
            "timestamps": video_timestamps
        }
    except Exception as e:
        db.rollback()
        print(f"VERİTABANI HATASI: {e}")
        raise HTTPException(status_code=500, detail="Kayıt sırasında hata oluştu.")
    # Buradaki @router kısmını @app yapıyoruz çünkü yukarıda app = FastAPI() dedin.
@app.get("/api/v1/videos/{video_id}")
async def get_video_detail(video_id: int, db: Session = Depends(get_db)):
    # Veritabanından video_id'ye göre veriyi çekiyoruz
    video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    
    if video is None:
        raise HTTPException(status_code=404, detail="Video bulunamadı")
        
    return {
        "video_id": video.video_id,
        "title": video.title,
        "youtube_url": video.youtube_url,
        "summary": video.summary,
        "duzgun_zamanlar": video.timestamps, # Veritabanındaki kolon adın timestamps ise
        "youtube_id": video.youtube_url.split("v=")[-1] # Video ID'sini parçalayıp gönderiyoruz
    }
