import React, { useState } from 'react';

const NotificationSettings = () => {
  // Toggle durumlarını tutmak için state
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    newCourses: true,
    quizReminders: true,
    comments: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NotificationItem = ({ id, title, description }) => (
    <div className="flex items-center justify-between py-6 border-b border-slate-50 last:border-0">
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button 
        onClick={() => toggleSetting(id)}
        className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
          settings[id] ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
          settings[id] ? 'left-7' : 'left-1'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Bildirim Tercihleri</h3>
      
      <div className="bg-white rounded-2xl">
        <NotificationItem 
          id="email" 
          title="Email Bildirimleri" 
          description="Önemli güncellemeler email ile gönderilsin" 
        />
        <NotificationItem 
          id="push" 
          title="Push Bildirimleri" 
          description="Tarayıcı bildirimleri aktif olsun" 
        />
        <NotificationItem 
          id="newCourses" 
          title="Yeni Kurs Önerileri" 
          description="İlgi alanlarınıza göre kurs önerileri alın" 
        />
        <NotificationItem 
          id="quizReminders" 
          title="Quiz Hatırlatmaları" 
          description="Yaklaşan quiz'ler için hatırlatma alın" 
        />
        <NotificationItem 
          id="comments" 
          title="Yorum Bildirimleri" 
          description="Yorumlarınıza gelen yanıtlar bildirilsin" 
        />
      </div>

      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl mt-10 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

export default NotificationSettings;