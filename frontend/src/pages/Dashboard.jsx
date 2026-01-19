import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom"; 
import { Search, Bell, Grid, PlayCircle, PlusCircle, ArrowRight } from "lucide-react";

const Dashboard = () => {

  const navigate = useNavigate(); 
  const [userName, setUserName] = useState("Kullanıcı");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const firstName = userData.full_name.split(" ")[0];
      setUserName(firstName);
    }
  }, []);

  const booklets = [
    { id: 1, title: "Fizik 101", author: "Prof. Dr. Can Yılmaz", progress: "87%", color: "bg-blue-500" },
    { id: 2, title: "Yazılım Geliştirme", author: "22 Video | 454 Bölüm", progress: "43%", color: "bg-emerald-500" },
    { id: 3, title: "Algoritmalar", author: "Asist. Ayşe Kaya", progress: "10%", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      {/* Üst Bar */}
      <div className="flex justify-between items-center mb-10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Kitapçık veya video ara..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-purple-600 border border-slate-100 transition-all">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Merhaba, {userName}! 👋</h1>
        <p className="text-slate-500 mb-10">Yapay zeka asistanın NoteGenie'ye tekrar hoş geldin.</p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Devam Eden Videolar</h2>
          <button className="text-sm font-semibold text-purple-600 hover:underline">Tümünü Gör &gt;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {booklets.map((book) => (
            <div 
              key={book.id} 
              //  Kartın kendisine tıklama özelliği eklenmeli
              onClick={() => navigate(`/booklet/${book.id}`)} 
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className={`${book.color} h-40 flex items-center justify-center text-white/90 relative`}>
                <Grid size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                   {book.progress} Tamamlandı
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{book.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{book.author}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <PlayCircle size={18} />
                    <span>İncele</span>
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