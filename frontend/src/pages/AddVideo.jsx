import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation eklendi
import axios from "axios";
import { Play, CheckCircle, Clock, LayoutGrid, Globe, Lock, Plus, X } from "lucide-react";

const AddVideo = () => {
  const navigate = useNavigate();
  const location = useLocation(); // URL parametrelerini okumak için
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);

  // Mevcut koleksiyonları çek
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/courses");
      setCourses(response.data);
      
      // KRİTİK NOKTA: URL'den gelen bir courseId varsa, kurslar yüklendikten sonra onu seç
      const params = new URLSearchParams(location.search);
      const courseIdFromUrl = params.get('courseId');
      if (courseIdFromUrl) {
        setSelectedCourse(courseIdFromUrl);
      }
    } catch (error) {
      console.error("Koleksiyonlar yüklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [location]); // location değiştiğinde tekrar kontrol et

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;
    setAddCourseLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/courses", {
        title: newCourseTitle,
        description: "Yeni oluşturulan koleksiyon"
      });
      
      await fetchCourses();
      setSelectedCourse(response.data.course_id);
      setIsAddingCourse(false);
      setNewCourseTitle("");
    } catch (error) {
      alert("Koleksiyon oluşturulurken hata: " + error.response?.data?.detail);
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleAddVideo = async () => {
    if (!selectedCourse) {
      alert("Lütfen önce bir kitapçık (koleksiyon) seçin!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/videos/add", {
        youtube_url: videoUrl,
        title: "Yeni Ders Videosu",
        course_id: parseInt(selectedCourse),
        is_public: isPublic
      });
      
      const newVideoId = response.data.video_id; 
      if (newVideoId) {
        navigate(`/booklet-detail/${newVideoId}`);
      }
    } catch (error) {
      console.error("Video ekleme hatası:", error);
      alert("Hata: " + (error.response?.data?.detail || "Sunucuya ulaşılamadı."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 font-sans">
        <h1 className="text-3xl font-black text-slate-900">Yeni Ders Ekle</h1>
        <p className="text-slate-500 font-medium">YouTube videosunu akıllı bir kitapçığa dönüştürün.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        <div className="space-y-6">
          {/* YouTube URL Girişi */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Play size={18} className="text-red-500" /> YouTube URL
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Kitapçık (Koleksiyon) Seçimi */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={20} className="text-purple-600" />
                Kitapçık Seçin
              </h3>
              
              <button 
                onClick={() => setIsAddingCourse(!isAddingCourse)}
                className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                title="Yeni Kitapçık Oluştur"
              >
                {isAddingCourse ? <X size={18} /> : <Plus size={18} />}
              </button>
            </div>

            {isAddingCourse && (
              <div className="mb-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  placeholder="Kitapçık adı... (Örn: Veri Yapıları)"
                  className="flex-1 p-3 bg-white border border-purple-200 rounded-xl outline-none text-sm font-bold"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
                <button 
                  onClick={handleCreateCourse}
                  disabled={addCourseLoading}
                  className="px-6 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-100"
                >
                  {addCourseLoading ? "..." : "OLUŞTUR"}
                </button>
              </div>
            )}

            <select 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-400 text-slate-600 font-bold appearance-none cursor-pointer"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Bir kitapçık seçin...</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Gizlilik */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <h3 className="font-bold text-slate-800 mb-4">Kitapçık Görünürlüğü</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isPublic ? 'border-purple-600 bg-purple-600' : 'border-slate-300'}`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <input type="radio" name="privacy" className="hidden" checked={!isPublic} onChange={() => setIsPublic(false)} />
                <span className={`text-sm font-bold flex items-center gap-1.5 ${!isPublic ? 'text-purple-600' : 'text-slate-500'}`}>
                  <Lock size={16} /> Sadece Ben
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isPublic ? 'border-purple-600 bg-purple-600' : 'border-slate-300'}`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <input type="radio" name="privacy" className="hidden" checked={isPublic} onChange={() => setIsPublic(true)} />
                <span className={`text-sm font-bold flex items-center gap-1.5 ${isPublic ? 'text-purple-600' : 'text-slate-500'}`}>
                  <Globe size={16} /> Herkese Açık
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* AI İşleme Özeti Kartı */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 ring-1 ring-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock size={120} />
          </div>
          
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600"><CheckCircle size={24} /></div>
            AI Akıllı Analiz
          </h3>
          
          <div className="space-y-4 relative z-10">
            {[
              "Altyazıları çek ve metne dönüştür",
              "Dersin kapsamlı özetini çıkart",
              "Önemli anlar için zaman damgası üret",
              "Soru-Cevap (Q&A) seti oluştur"
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <span className="text-sm font-bold text-slate-600">{task}</span>
                <div className="text-purple-600 bg-purple-50 p-1 rounded-full"><CheckCircle size={16} /></div>
              </div>
            ))}
            
            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider italic text-xs">
                <Clock size={14} /> Tahmini Süre: ~45 Saniye
              </div>
            </div>

            <button 
              onClick={handleAddVideo} 
              disabled={loading} 
              className={`w-full py-5 rounded-[24px] font-black text-white shadow-2xl transition-all relative overflow-hidden group ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] shadow-purple-200'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ANALİZ EDİLİYOR...
                </div>
              ) : (
                "KİTAPÇIĞI OLUŞTUR"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideo;