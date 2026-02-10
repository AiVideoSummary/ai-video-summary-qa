import re
from transformers import pipeline

# Modeli bellekte tutmak için global değişken
summarizer_instance = None

def get_ai_summarizer():
    global summarizer_instance
    if summarizer_instance is None:
        # BURASI DEĞİŞTİ: SAMSum modeli eklendi
        print("SAMSum Modeli yükleniyor, lütfen bekleyin...")
        try:
            summarizer_instance = pipeline("summarization", model="philschmid/bart-large-cnn-samsum")
        except:
            # Eğer bir sorun olursa yedek olarak diğeri kalsın
            summarizer_instance = pipeline("summarization", model="facebook/bart-large-cnn")
    return summarizer_instance

def generate_summary(text: str):
    if not text or len(text) < 100:
        return "Özet için yeterli içerik yok."
    
    summarizer = get_ai_summarizer()
    chunk_size = 1000 
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    summaries = []
    
    for chunk in chunks[:3]:
        try:
            # SAMSum daha özetleyici olduğu için max_length'i biraz artırabiliriz
            res = summarizer(chunk, max_length=120, min_length=40, do_sample=False)
            summaries.append(res[0]['summary_text'])
        except:
            continue
            
    return " ".join(summaries) if summaries else "Özet oluşturulamadı."

def extract_key_points(text: str):
    try:
        summarizer = get_ai_summarizer()
        # Başlık üretirken de SAMSum'ın "ana fikri yakalama" gücünü kullanıyoruz
        res = summarizer(text[:500], max_length=40, min_length=10, do_sample=False)
        label = res[0]['summary_text'].replace("•", "").strip()
        return label.capitalize()
    except:
        return "Ders Bölümü"

def create_smart_timestamps(transcript_text, total_duration):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', transcript_text) if s.strip()]
    video_timestamps = []
    
    if len(sentences) > 0:
        num_chunks = 6 
        step = max(1, len(sentences) // num_chunks)
        
        for i in range(0, len(sentences), step):
            if len(video_timestamps) >= 8: break
            current_seconds = int((i / len(sentences)) * total_duration)
            timestamp_str = f"{current_seconds // 60:02d}:{current_seconds % 60:02d}"
            chunk_text = " ".join(sentences[i : i + 5])
            label = extract_key_points(chunk_text)
            video_timestamps.append({"time": timestamp_str, "label": label})
    else:
        video_timestamps = [{"time": "00:00", "label": "Giriş"}]
        
    return video_timestamps