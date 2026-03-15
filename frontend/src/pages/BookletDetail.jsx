import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Play, FileText, HelpCircle, Download, Clock, Sparkles, PlusCircle, CheckCircle } from "lucide-react";
import YouTube from 'react-youtube';

const BookletDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [videoData, setVideoData] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]); 
  const playerRef = useRef(null);

  // 1. ADIM: Kitapçık ve Video Verilerini Çekme
  useEffect(() => {
    const fetchBookletData = async () => {
      try {
        const courseVideosRes = await axios.get(`http://localhost:8000/api/v1/courses/${id}/videos`);
        setCourseVideos(courseVideosRes.data);

        if (courseVideosRes.data.length > 0) {
          setVideoData(courseVideosRes.data[0]);
        }
      } catch (err) {
        console.error("Kitapçık verileri yüklenemedi", err);
      }
    };
    fetchBookletData();
  }, [id]);

  // Zaman damgasına tıklayınca videoyu o saniyeye sar
  const onTimestampClick = (timeStr) => {
    const [m, s] = timeStr.split(':').map(Number);
    if (playerRef.current) playerRef.current.seekTo(m * 60 + s, true);
  };

  // Manuel "Dersi Bitir" butonu için fonksiyon
  const handleComplete = async () => {
    if (!videoData) return;
    try {
      await axios.post(`http://localhost:8000/api/v1/videos/${videoData.video_id}/complete?user_id=1`);
      setCourseVideos(prev => prev.map(v => 
        v.video_id === videoData.video_id ? {...v, is_completed: true} : v
      ));
      setVideoData(prev => ({...prev, is_completed: true}));
      alert("Harika! Bu dersi tamamladın. ✨");
    } catch (err) {
      console.error("Tamamlama hatası:", err);
    }
  };

  if (!videoData) return <div className="p-10 text-center font-medium">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ÜST NAVİGASYON */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-50">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition-all">
          <ChevronLeft size={20} /> Dashboard
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm">
          <Download size={16} /> PDF İndir
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-85px)]">
        {/* SOL TARAF: İÇERİK VE ANALİZ */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-slate-50">
          
          {/* VİDEO / PDF EKRANI */}
          <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl mb-8 border-4 border-white ring-1 ring-slate-100 relative">
            {videoData.youtube_url?.includes("PDF_FILE") ? (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-12 text-center">
                <div className="bg-blue-600/20 p-6 rounded-full mb-4 animate-pulse">
                  <FileText size={64} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-black mb-2">{videoData.title}</h2>
                <p className="text-slate-400 font-medium max-w-md">Bu bir PDF dokümanıdır. Akademik özet aşağıdadır.</p>
              </div>
            ) : (
              <YouTube
                videoId={videoData.youtube_id || videoData.youtube_url.split('v=')[1]}
                className="w-full h-full"
                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
                onReady={(e) => playerRef.current = e.target}
              />
            )}
          </div>

          {/* BAŞLIK VE TAMAMLA BUTONU */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">{videoData.title}</h1>
              <p className="text-slate-400 font-medium flex items-center gap-2 italic text-sm">
                <Clock size={16} /> Yapay Zeka Analizi Yayında
              </p>
            </div>
            <button 
              onClick={handleComplete}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${
                videoData.is_completed 
                ? "bg-green-100 text-green-600 shadow-green-50" 
                : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100"
              }`}
            >
              {videoData.is_completed ? "✓ TAMAMLANDI" : "DERSI BİTİR"}
            </button>
          </div>

          {/* TABLAR (SEKMELER) */}
          <div className="flex gap-8 border-b border-slate-100 mb-8 font-bold text-sm">
            {[
              { id: "summary", label: "AI Özet", icon: <Sparkles size={16}/> },
              { id: "timestamps", label: "Önemli Noktalar", icon: <Clock size={16}/> },
              { id: "notes", label: "Notlarım", icon: <FileText size={16}/> },
              { id: "qa", label: "Soru & Cevap", icon: <HelpCircle size={16}/> }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 transition-all relative flex items-center gap-2 ${activeTab === tab.id ? "text-purple-600" : "text-slate-400"}`}>
                {tab.icon} {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 rounded-full" />}
              </button>
            ))}
          </div>

          {/* TAB İÇERİKLERİ */}
          <div className="min-h-[250px]">
            {activeTab === "summary" && (
              <div className="bg-slate-50 p-8 rounded-3xl text-slate-700 leading-relaxed border border-slate-100">
                {videoData.summary || "Özet hazırlanıyor..."}
              </div>
            )}
            {activeTab === "timestamps" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {videoData.duzgun_zamanlar?.map((item, idx) => (
                  <div key={idx} onClick={() => onTimestampClick(item.time)} className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 cursor-pointer flex items-center gap-3 transition-all group">
                    <span className="bg-purple-100 text-purple-600 font-black px-2.5 py-1 rounded-lg text-[10px] group-hover:bg-purple-600 group-hover:text-white">{item.time}</span>
                    <span className="text-[13px] font-bold text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "notes" && <textarea className="w-full h-48 p-6 bg-slate-50 rounded-3xl border-none outline-none font-medium text-slate-600" placeholder="Bu derse dair notlarını buraya yazabilirsin..." />}
            {activeTab === "qa" && <div className="text-center py-10 text-slate-300 font-bold">Q&A yakında burada olacak.</div>}
          </div>
        </div>

        {/* SAĞ TARAF: KİTAPÇIK AKIŞI */}
        <div className="w-80 bg-slate-50/30 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest text-purple-600">Kitapçık Akışı</h3>
            <button 
              onClick={() => navigate(`/video-ekle?courseId=${id}`)}
              className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
            >
              <PlusCircle size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {courseVideos.map((video, index) => (
              <div 
                key={video.video_id} 
                onClick={async () => {
                  setVideoData(video);
                  // Tıklanınca otomatik tamamlama (istediğin özellik)
                  if (!video.is_completed) {
                    try {
                      await axios.post(`http://localhost:8000/api/v1/videos/${video.video_id}/complete?user_id=1`);
                      setCourseVideos(prev => prev.map(v => 
                        v.video_id === video.video_id ? {...v, is_completed: true} : v
                      ));
                    } catch (err) { console.error(err); }
                  }
                }} 
                className={`p-4 rounded-[24px] flex items-center gap-3 cursor-pointer transition-all border ${
                  videoData?.video_id === video.video_id 
                    ? "bg-white shadow-xl border-purple-100 scale-[1.02]" 
                    : "bg-transparent border-transparent hover:bg-white/50"
                }`}
              >
                {/* Sol Sayı / Tik Alanı */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] flex-shrink-0 ${
                  video.is_completed ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {video.is_completed ? <CheckCircle size={14} /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold truncate mb-0.5 ${
                    videoData?.video_id === video.video_id ? "text-purple-600" : "text-slate-700"
                  }`}>
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter flex items-center gap-1">
                        {video.youtube_url?.includes("PDF_FILE") ? <FileText size={10} /> : <Play size={10} />}
                        {video.youtube_url?.includes("PDF_FILE") ? "Döküman" : "Video"}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookletDetail;