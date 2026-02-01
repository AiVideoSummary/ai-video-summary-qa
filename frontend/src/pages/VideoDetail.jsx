import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Clock, BookOpen, PlayCircle, ChevronRight } from 'lucide-react';
import YouTube from 'react-youtube';

const VideoDetail = () => {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/videos/${id}`);
        setVideoData(response.data);
      } catch (err) {
        console.error("Video detayları yüklenemedi", err);
      }
    };
    fetchVideoDetails();
  }, [id]);

  // Zaman damgasına tıklandığında videoyu o saniyeye sardırma fonksiyonu
  const onTimestampClick = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    if (playerRef.current) {
      playerRef.current.seekTo(totalSeconds, true);
    }
  };

  if (!videoData) return <div className="p-10 text-center font-medium">Yükleniyor...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Üst Başlık Alanı */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{videoData.title}</h1>
        <div className="flex items-center gap-4 text-slate-500 text-sm">
          <span className="flex items-center gap-1"><Clock size={16}/> 10+ Saatlik Çalışma Metodu</span>
          <span className="flex items-center gap-1"><BookOpen size={16}/> Kişisel Gelişim</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL KOLON: Video Player ve Özet */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl aspect-video border-8 border-white">
            <YouTube
              videoId={videoData.youtube_id}
              className="w-full h-full"
              opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
              onReady={(event) => { playerRef.current = event.target; }}
            />
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="text-purple-600" /> AI Video Özeti
            </h3>
            <p className="text-slate-600 leading-relaxed italic">
              "{videoData.summary}"
            </p>
          </div>
        </div>

        {/* SAĞ KOLON: Akıllı Zaman Damgaları (Timeline) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-full max-h-[750px] overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-6 sticky top-0 bg-white pb-2 border-b">
              Video İçerik Haritası
            </h3>
            <div className="space-y-3">
              {videoData.duzgun_zamanlar?.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => onTimestampClick(item.time)}
                  className="group flex gap-4 p-4 rounded-2xl hover:bg-purple-50 border border-transparent hover:border-purple-100 cursor-pointer transition-all"
                >
                  <div className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-lg h-fit text-xs mt-1">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-purple-900 leading-snug">
                      {item.label}
                    </p>
                    <div className="mt-2 flex items-center text-[10px] text-purple-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Hemen İzle <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;