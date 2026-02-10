import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Search, Bell, Grid, PlayCircle, ArrowRight } from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate(); 
  const [userName, setUserName] = useState("Kullanıcı");
  const [booklets, setBooklets] = useState([]); 
  const [loading, setLoading] = useState(true);

  const cardColors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserName(userData.full_name.split(" ")[0]);
    }

    const fetchBooklets = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/courses");
        setBooklets(response.data);
      } catch (error) {
        console.error("Kitapçıklar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooklets();
  }, []);

  // --- KRİTİK FONKSİYON: TIKLAYINCA İLK VİDEOYU BULUR ---
  const handleBookletClick = async (courseId) => {
    try {
      // Önce bu kitapçığın içindeki videoları soruyoruz
      const response = await axios.get(`http://localhost:8000/api/v1/courses/${courseId}/videos`);
      const videos = response.data;

      if (videos && videos.length > 0) {
        // Eğer içinde ders varsa, ilk dersin ID'si ile Booklet Detail'e git
        navigate(`/booklet-detail/${videos[0].video_id}`);
      } else {
        // Boşsa uyarı ver
        alert("Bu kitapçıkta henüz ders yok. Lütfen video ekleyin!");
      }
    } catch (error) {
      console.error("Ders listesi alınamadı:", error);
      alert("Hata: Kitapçık içeriğine ulaşılamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="flex justify-between items-center mb-10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Kitapçık veya video ara..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm"/>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white rounded-xl text-slate-400 border border-slate-100"><Bell size={20} /></button>
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Merhaba, {userName}! 👋</h1>
        <p className="text-slate-500 mb-10">Yapay zeka asistanın NoteGenie'ye tekrar hoş geldin.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-10">Yükleniyor...</div>
          ) : booklets.map((book, index) => (
            <div 
              key={book.course_id} 
              // GÜNCELLENEN KISIM: Direkt navigate değil, fonksiyonu çağırıyoruz
              onClick={() => handleBookletClick(book.course_id)} 
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className={`${cardColors[index % cardColors.length]} h-40 flex items-center justify-center text-white/90 relative`}>
                <Grid size={48} strokeWidth={1.5} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{book.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-1">{book.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <PlayCircle size={18} /><span>İncele</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;