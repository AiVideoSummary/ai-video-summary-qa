import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Play, FileText, HelpCircle, Download, Clock, Sparkles, PlusCircle } from "lucide-react";
import YouTube from 'react-youtube';

const BookletDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [videoData, setVideoData] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]); 
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const videoRes = await axios.get(`http://localhost:8000/api/v1/videos/${id}`);
        setVideoData(videoRes.data);

        if (videoRes.data.course_id) {
          const courseRes = await axios.get(`http://localhost:8000/api/v1/courses/${videoRes.data.course_id}/videos`);
          setCourseVideos(courseRes.data);
        }
      } catch (err) {
        console.error("Veriler yüklenemedi", err);
      }
    };
    fetchAllData();
  }, [id]);

  const onTimestampClick = (timeStr) => {
    const [m, s] = timeStr.split(':').map(Number);
    if (playerRef.current) playerRef.current.seekTo(m * 60 + s, true);
  };

  if (!videoData) return <div className="p-10 text-center font-medium">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-50">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition-all">
          <ChevronLeft size={20} /> Dashboard
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm">
          <Download size={16} /> PDF İndir
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-85px)]">
        <div className="flex-1 p-8 overflow-y-auto border-r border-slate-50">
          <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl mb-8 border-4 border-white ring-1 ring-slate-100">
            <YouTube
              videoId={videoData.youtube_id}
              className="w-full h-full"
              opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
              onReady={(e) => playerRef.current = e.target}
            />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">{videoData.title}</h1>
          <p className="text-slate-400 font-medium mb-8 flex items-center gap-2 italic text-sm">
            <Clock size={16} /> Yapay Zeka Analizi Yayında
          </p>

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

          <div className="min-h-[250px]">
            {activeTab === "summary" && <div className="bg-slate-50 p-8 rounded-3xl text-slate-700 italic border border-slate-100">"{videoData.summary || "Özet hazırlanıyor..."}"</div>}
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
            {activeTab === "notes" && <textarea className="w-full h-48 p-6 bg-slate-50 rounded-2xl border-none outline-none font-medium text-slate-600" placeholder="Bu derse dair notlarını buraya yazabilirsin..." />}
            {activeTab === "qa" && <div className="text-center py-10 text-slate-300 font-bold">Q&A yakında burada olacak.</div>}
          </div>
        </div>

        {/* SAĞ TARAF: Ders Listesi + Ekleme Butonu */}
        <div className="w-80 bg-slate-50/30 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest text-purple-600">Kitapçık Akışı</h3>
            <button 
              onClick={() => navigate(`/video-ekle?courseId=${videoData.course_id}`)}
              className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
              title="Yeni Video Ekle"
            >
              <PlusCircle size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {courseVideos.map((video, index) => (
              <div key={video.video_id} onClick={() => navigate(`/booklet-detail/${video.video_id}`)} className={`p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${parseInt(id) === video.video_id ? "bg-white shadow-md border-l-4 border-l-purple-600" : "bg-transparent border-transparent hover:bg-white"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] ${parseInt(id) === video.video_id ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"}`}>{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold truncate ${parseInt(id) === video.video_id ? "text-slate-900" : "text-slate-500"}`}>{video.title}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Ders İçeriği</p>
                </div>
                {parseInt(id) === video.video_id && <Play size={12} fill="#9333ea" className="text-purple-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookletDetail;