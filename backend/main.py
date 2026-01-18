from fastapi import FastAPI, HTTPException
from app.infrastructure.database import engine
from app.domain import models
import re
import yt_dlp  # Yeni ve güçlü kütüphanemiz 

# Veritabanı tablolarını otomatik oluşturur [cite: 16]
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoteGenie API")

# --- 3. GÜN: YOUTUBE VERİ ÇEKME MODÜLÜ (yt-dlp Versiyonu) --- [cite: 17, 18]

def get_youtube_transcript(video_url: str):
    try:
        # 1. Video ID'sini ayıkla
        video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url)
        if not video_id_match:
            return {"success": False, "error": "Geçersiz YouTube URL'si"}
        
        # 2. yt-dlp Ayarları: Sadece altyazı bilgilerini indir, videoyu indirme
        ydl_opts = {
            'skip_download': True,
            'writeautomaticsub': True,  # Otomatik altyazıları çekmesini söyler
            'subtitleslangs': ['tr', 'en'], # Önce Türkçe sonra İngilizce bak
            'quiet': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # Altyazıları kontrol et (Otomatik veya Manuel fark etmez)
            subtitles = info.get('requested_subtitles')
            
            if subtitles:
                # Altyazı verisi bulundu mesajı (Core Function temel taşı) [cite: 20]
                return {"success": True, "transcript": "Altyazı verisi başarıyla yakalandı. İşlemeye hazır!"}
            else:
                return {"success": False, "error": "Bu video için altyazı desteği bulunamadı."} [cite: 21]

    except Exception as e:
        # 3. Gün: Hata Yönetimi [cite: 21]
        return {"success": False, "error": f"Sistem hatası: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "NoteGenie Backend Çalışıyor!"}

# Test için oluşturduğumuz yeni kapı (Endpoint) [cite: 18]
@app.get("/get-transcript/")
async def fetch_transcript(url: str):
    result = get_youtube_transcript(url)
    if not result["success"]:
        # Hata durumunda 400 döner [cite: 21]
        raise HTTPException(status_code=400, detail=result["error"])
    return result