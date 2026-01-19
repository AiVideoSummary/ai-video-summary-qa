import React, { useState, useEffect } from "react";
import axios from "axios";
import { Play, CheckCircle, Clock, LayoutGrid, Globe, Lock } from "lucide-react";

const AddVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isPublic, setIsPublic] = useState(false); // Görünürlük ayarı için state

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Koleksiyonlar yüklenemedi:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleAddVideo = async () => {
    if (!selectedCourse) {
      alert("Lütfen bir koleksiyon seçin!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/videos/add", {
        youtube_url: videoUrl,
        title: "Yeni Ders Videosu",
        course_id: parseInt(selectedCourse),
        is_public: isPublic // Backend'e görünürlük bilgisini de gönderiyoruz
      });
      alert(response.data.message);
    } catch (error) {
      alert("Hata: " + error.response?.data?.detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Yeni Video Ekle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Taraf: URL, Koleksiyon ve Görünürlük */}
        <div className="space-y-6">
          {/* YouTube URL Girişi */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">YouTube URL</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Koleksiyon Seçimi */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LayoutGrid size={20} className="text-purple-600" />
              Koleksiyon Seçin
            </h3>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 text-slate-600 font-medium"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Bir kitapçık/ders seçin...</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Görünürlük Ayarı (Geri Geldi!) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Görünürlük Ayarı</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={!isPublic} 
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm font-medium text-slate-600 flex items-center gap-1 group-hover:text-purple-600">
                  <Lock size={14} /> Sadece Ben
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm font-medium text-slate-600 flex items-center gap-1 group-hover:text-purple-600">
                  <Globe size={14} /> Herkese Açık
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: AI İşleme Seçenekleri */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><CheckCircle size={20} /></div>
            AI Otomatik İşleme
          </h3>
          
          <div className="space-y-4">
            {["Videodan altyazı çek ve özet oluştur", "Önemli noktaları vurgula ve listele", "Test soruları üret (5-10 soru)"].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{task}</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-600" />
              </div>
            ))}
            
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={14} /> Tahmini işlem süresi: 2-3 dakika
              </div>
            </div>

            <button 
              onClick={handleAddVideo}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}
            >
              {loading ? "İşleniyor..." : "Video Ekle ve İşle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideo;