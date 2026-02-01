import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Globe, HelpCircle } from 'lucide-react';
// Alt bileşenleri buraya ekliyoruz
import ProfileSettings from './ProfileSettings'; 
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import ThemeSettings from './ThemeSettings';
import LanguageSettings from './LanguageSettings';
import HelpSettings from './HelpSettings';
const Settings = () => {
  const [activeTab, setActiveTab] = useState('profil');

  const menuItems = [
    { id: 'profil', label: 'Profil Bilgileri', icon: <User size={20} /> },
    { id: 'hesap', label: 'Hesap Ayarları', icon: <Shield size={20} /> },
    { id: 'bildirimler', label: 'Bildirimler', icon: <Bell size={20} /> },
    { id: 'gizlilik', label: 'Gizlilik', icon: <Shield size={20} /> },
    { id: 'tema', label: 'Tema', icon: <Palette size={20} /> },
    { id: 'dil', label: 'Dil', icon: <Globe size={20} /> },
    { id: 'yardim', label: 'Yardım & Destek', icon: <HelpCircle size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Ayarlar İç Menü (Görseldeki gibi koyu lacivert alan) */}
      <div className="w-64 bg-[#1e293b] text-slate-300 p-4 flex flex-col border-r border-slate-800">
        <h2 className="text-white text-lg font-semibold px-4 py-6">Ayarlar</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sağ Taraf - Dinamik İçerik (Beyaz Alan) */}
      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'profil' && <ProfileSettings />}
        {activeTab === 'hesap' && <AccountSettings />}
        {activeTab === 'bildirimler' && <NotificationSettings />}
        {activeTab === 'gizlilik' && <PrivacySettings />}
        {activeTab === 'tema' && <ThemeSettings />}
        {activeTab === 'dil' && <LanguageSettings />}
        {activeTab === 'yardim' && <HelpSettings />}
        {/* Diğer sekmeleri de benzer şekilde ekleyebiliriz */}
      </div>
    </div>
  );
};

export default Settings;