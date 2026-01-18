from youtube_transcript_api import YouTubeTranscriptApi
import re

def get_youtube_transcript(video_url: str):
    try:
        # YouTube URL'sinden Video ID'sini ayıklayalım (Regex ile)
        video_id = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url).group(1)
        
        # Altyazıları çekiyoruz (Öncelikle Türkçe, yoksa İngilizce deniyoruz)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['tr', 'en'])
        
        # Parça parça gelen metinleri tek bir paragraf yapalım
        full_text = " ".join([item['text'] for item in transcript_list])
        return {"success": True, "transcript": full_text}
        
    except Exception as e:
        # Altyazı bulunamazsa veya hata oluşursa 
        return {"success": False, "error": f"Altyazı bulunamadı veya bir hata oluştu: {str(e)}"}