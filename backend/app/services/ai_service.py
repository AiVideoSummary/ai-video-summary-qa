from google import genai
import re
# BURASI ÇOK KRİTİK: http_options ile API versiyonunu v1 olarak sabitliyoruz
client = genai.Client(
    api_key="AIzaSyDcJ5wM9FdeY4J5PoS7tgspz3X9_6bLqo0",
    http_options={'api_version': 'v1'}
)


def generate_summary(text: str):
    
    if not text or "WIZ_global_data" in text: # Çöp veri kontrolü
        return "Hata: Altyazı yerine sayfa kodu çekildi. Lütfen başka bir video deneyin."
    
    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash", # Başına 'models/' ekledik
            contents=f"Aşağıdaki ders metnini Türkçe özetle:\n\n{text[:10000]}"
        )
        return response.text
    except Exception as e:
        print(f"Gemini Hatası: {e}")
        return "Özet oluşturulamadı."

def extract_key_points(text: str):
    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash", 
            contents=f"Aşağıdaki ders metnini Türkçe özetle:\n\n{text[:10000]}"
        )
        return response.text.strip()
    except:
        return "Ders Bölümü"

def create_smart_timestamps(transcript_text, total_duration):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', transcript_text) if s.strip()]
    if not sentences or "WIZ_global_data" in transcript_text:
        return [{"time": "00:00", "label": "İçerik Bulunamadı"}]
    
    num_chunks = 6
    step = max(1, len(sentences) // num_chunks)
    video_timestamps = []
    
    for i in range(0, len(sentences), step):
        if len(video_timestamps) >= 8: break
        curr_sec = int((i / len(sentences)) * total_duration)
        ts_str = f"{curr_sec // 60:02d}:{curr_sec % 60:02d}"
        label = extract_key_points(" ".join(sentences[i:i+5]))
        video_timestamps.append({"time": ts_str, "label": label})
    
    return video_timestamps