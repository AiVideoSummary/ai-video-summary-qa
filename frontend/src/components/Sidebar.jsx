import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, PlusCircle, Bookmark, Settings, LogOut, Sparkles } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ full_name: "Kullanıcı", department: "Öğrenci" });

  useEffect(() => {
    // Login sırasında kaydedilen kullanıcı bilgilerini çekiyoruz
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const menuItems = [
    { name: "Ana Sayfa", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Kütüphanem", path: "/library", icon: <BookOpen size={20} /> },
    { name: "Video Ekle", path: "/video-ekle", icon: <PlusCircle size={20} /> },
    { name: "Kaydettiklerim", path: "/saved", icon: <Bookmark size={20} /> },
    { name: "Ayarlar", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 shadow-sm">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-200">
          <Sparkles className="text-white" size={22} />
        </div>
        <span className="text-2xl font-bold text-slate-800 tracking-tight">NoteGenie</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-purple-600 text-white shadow-md shadow-purple-100 font-medium"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {item.icon}
            <span className="text-[15px]">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-50">
        <div className="flex items-center gap-3 mb-6 p-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{user.full_name}</span>
            <span className="text-[11px] text-slate-400">{user.department || "Öğrenci"}</span>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("user"); // Çıkış yaparken veriyi sil
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Sidebar;