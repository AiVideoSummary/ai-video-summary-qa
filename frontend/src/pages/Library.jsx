import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, PlusCircle, Edit3, Share2 } from 'lucide-react';

const Library = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("mine"); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/courses");
        setAllCourses(res.data);
      } catch (err) {
        console.error("Kütüphane yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = allCourses.filter(c => 
    activeTab === "mine" ? !c.is_public : c.is_public
  );

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Yükleniyor...</div>;

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans">
      {/* ÜST BAŞLIK */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-[28px]">Kütüphanem</h1>
          <p className="text-slate-400 text-sm font-medium">Tüm içeriklerini buradan yönetebilirsin.</p>
        </div>
        <button 
          onClick={() => navigate("/yeni-ekle")} 
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
        >
          <PlusCircle size={18} /> Yeni Kitapçık Oluştur
        </button>
      </div>

      {/* SEKMELER (TASLAKTAKİ GİBİ) */}
      <div className="flex gap-4 mb-10 bg-white p-2 rounded-2xl shadow-sm w-fit border border-slate-50">
        <button 
          onClick={() => setActiveTab("mine")}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === "mine" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          🔥 Oluşturduklarım
        </button>
        <button 
          onClick={() => setActiveTab("saved")}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === "saved" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          🔥 Kaydettiklerim
        </button>
      </div>

      {/* KARTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredCourses.map((course, index) => (
          <div key={course.course_id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 group hover:shadow-xl transition-all">
            
            {/* Görsel Alanı */}
            <div 
              onClick={() => navigate(`/booklet-detail/${course.course_id}`)}
              className={`h-40 rounded-[24px] mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer bg-gradient-to-br ${
              index % 2 === 0 ? "from-purple-500 to-indigo-600" : "from-pink-500 to-rose-600"
            }`}>
              <PlayCircle size={48} className="text-white/40 group-hover:scale-110 transition-transform" />
            </div>

            {/* Bilgiler */}
            <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{course.title}</h3>
            <p className="text-[11px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
              {course.videos?.length || 0} Video İçeriği
            </p>

            {/* BUTONLAR (DÜZENLE & PAYLAŞ) */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-purple-600 hover:text-white transition-all">
                <Edit3 size={14} /> Düzenle
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-800 hover:text-white transition-all">
                <Share2 size={14} /> Paylaş
              </button>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <p className="text-slate-400 font-bold">Burada henüz bir şey yok. ✨</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;