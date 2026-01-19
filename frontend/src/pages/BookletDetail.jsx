import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, FileText, MessageSquare, HelpCircle, Download } from "lucide-react";

const BookletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes"); // notes, qa, summary

  // Şimdilik örnek veri (İleride backend'den gelecek)
  const videoData = {
    title: "Fizik 101 - Newton Kanunları",
    instructor: "Prof. Dr. Can Yılmaz",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Örnek video
    notes: "Bu derste Newton'un hareket yasaları ele alınmıştır. 1. Eylemsizlik prensibi, 2. Dinamiğin temel prensibi...",
    qa: [
      { q: "Eylemsizlik nedir?", a: "Bir cismin hareket durumunu koruma isteğidir." },
      { q: "F=ma ne anlama gelir?", a: "Kuvvet, kütle ve ivmenin çarpımına eşittir." }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Üst Navigasyon */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Dashboard'a Dön</span>
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm">
            <Download size={16} /> PDF İndir
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* SOL TARAF: Video Oynatıcı ve İçerik */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8">
            <iframe 
              className="w-full h-full"
              src={videoData.videoUrl}
              title="Video player"
              allowFullScreen
            ></iframe>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">{videoData.title}</h1>
          <p className="text-slate-400 font-medium mb-8">{videoData.instructor}</p>

          {/* Tab Menüsü */}
          <div className="flex gap-8 border-b border-slate-100 mb-8">
            {["notes", "qa", "summary"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  activeTab === tab ? "text-purple-600" : "text-slate-400"
                }`}
              >
                {tab === "notes" && "Ders Notları"}
                {tab === "qa" && "Soru & Cevap"}
                {tab === "summary" && "Özet"}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab İçeriği */}
          <div className="prose prose-slate max-w-none">
            {activeTab === "notes" && (
              <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 leading-relaxed">
                {videoData.notes}
              </div>
            )}
            {activeTab === "qa" && (
              <div className="space-y-4">
                {videoData.qa.map((item, index) => (
                  <div key={index} className="border border-slate-100 p-6 rounded-2xl">
                    <p className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <HelpCircle size={18} className="text-purple-500" /> {item.q}
                    </p>
                    <p className="text-slate-600 pl-7">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ TARAF: Video Listesi / Müfredat */}
        <div className="w-80 border-l border-slate-100 p-6 overflow-y-auto bg-slate-50/30">
          <h3 className="font-bold text-slate-800 mb-6">Kitapçık İçeriği</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div 
                key={item}
                className={`p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  item === 1 ? "bg-white shadow-md border-l-4 border-purple-600" : "hover:bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item === 1 ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"}`}>
                  <Play size={14} fill={item === 1 ? "currentColor" : "none"} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Ders #{item}</p>
                  <p className="text-[10px] text-slate-400">12:45 Dakika</p>
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