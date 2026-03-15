import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Book, Trophy, Search, Bell, PlayCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TASLAKTAKİ GİBİ İSTATİSTİK KARTLARI
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-5 border border-slate-50 flex-1">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xl font-black text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// TASLAKTAKİ GİBİ KURS KARTLARI (KÜÇÜK VE ŞIK)
const CourseCard = ({ title, author, info, progress, colorClass, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-50 hover:shadow-xl transition-all group cursor-pointer">
    <div className={`h-32 ${colorClass} flex items-center justify-center relative`}>
        <PlayCircle size={40} className="text-white/70 group-hover:scale-110 transition-transform" />
    </div>
    <div className="p-6">
      <h4 className="font-bold text-slate-800 mb-1 truncate text-sm">{title}</h4>
      <p className="text-[10px] text-slate-400 mb-4 flex justify-between items-center">
        <span>{author}</span>
        <span className="bg-slate-50 px-2 py-0.5 rounded text-[9px] font-black uppercase text-slate-400">{info}</span>
      </p>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
        <div className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between items-center text-[9px] font-black uppercase">
        <span className="text-slate-600">%{progress} TAMAMLANDI</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ full_name: "Azra", id: null });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);

    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/courses");
        setAllCourses(res.data);
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Yükleniyor...</div>;

  // İSTATİSTİK HESAPLAMALARI
  const totalCompletedVideos = allCourses.reduce((acc, c) => acc + (c.videos?.filter(v => v.is_completed).length || 0), 0);
  const totalCoursesCount = allCourses.length;
  const totalScore = totalCompletedVideos * 50;

  // SADECE DEVAM EDİLENLER (En az 1 videosu bitmiş olanlar)
  const continuingCourses = allCourses.filter(c => c.videos?.some(v => v.is_completed));
  
  // TOPLULUKTAN ÖNERİLER (Keşfet kısmı için)
  const communityCourses = allCourses.filter(c => c.is_public);

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans">
      {/* ÜST BAŞLIK */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Merhaba, {user.full_name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 text-sm font-medium italic">Öğrenme yolculuğuna kaldığın yerden devam et.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 cursor-pointer">
            <Bell size={18} />
          </div>
          <div className="w-10 h-10 bg-purple-600 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-xs cursor-pointer">
            AZ
          </div>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI (TASLAKTAKİ GİBİ) */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <StatCard icon={<Video className="text-blue-500" />} label="İzlenen Video" value={totalCompletedVideos} color="bg-blue-50" />
        <StatCard icon={<Book className="text-purple-500" />} label="Toplam Kitapçık" value={totalCoursesCount} color="bg-purple-50" />
        <StatCard icon={<Trophy className="text-orange-500" />} label="Toplam Puan" value={totalScore} color="bg-orange-50" />
      </div>

      {/* DEVAM EDEN VİDEOLAR (TASLAKTAKİ BAŞLIK) */}
      <div className="mb-12">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
           <Clock size={20} className="text-purple-600" /> Devam Eden Kitapçıklar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {continuingCourses.map((course) => {
            const allVids = course.videos || [];
            const completed = allVids.filter(v => v.is_completed === true || v.is_completed === "t").length;
            const progress = allVids.length > 0 ? Math.round((completed / allVids.length) * 100) : 0;

            return (
              <CourseCard 
                key={course.course_id}
                title={course.title}
                author="Senin Kitapçığın"
                info={`${allVids.length} İçerik`}
                progress={progress}
                colorClass="bg-purple-600"
                onClick={() => navigate(`/booklet-detail/${course.course_id}`)}
              />
            );
          })}
          {continuingCourses.length === 0 && (
            <div className="col-span-full p-10 bg-white rounded-[32px] text-center border-2 border-dashed border-slate-100">
               <p className="text-slate-400 font-bold">Henüz devam ettiğin bir çalışma yok. Hadi başla! 🚀</p>
            </div>
          )}
        </div>
      </div>

      {/* TOPLULUKTAN ÖNERİLER */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-6">Topluluktan Keşfet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {communityCourses.slice(0, 4).map((course, index) => (
            <CourseCard 
              key={course.course_id}
              title={course.title}
              author={course.author_name || "NoteGenie Üyesi"}
              info={`${course.videos?.length || 0} İçerik`}
              progress={0}
              colorClass={index % 2 === 0 ? "bg-blue-600" : "bg-emerald-500"}
              onClick={() => navigate(`/booklet-detail/${course.course_id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;