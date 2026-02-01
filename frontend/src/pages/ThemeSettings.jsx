import React, { useState } from 'react';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';

const ThemeSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  const ThemeCard = ({ id, title, description, icon: Icon }) => (
    <button
      onClick={() => setSelectedTheme(id)}
      className={`flex-1 p-6 border-2 rounded-2xl flex flex-col items-center text-center transition-all relative ${
        selectedTheme === id 
        ? 'border-indigo-600 bg-indigo-50/30' 
        : 'border-slate-100 hover:border-slate-200 bg-white'
      }`}
    >
      {selectedTheme === id && (
        <CheckCircle2 className="absolute top-3 right-3 text-indigo-600" size={20} />
      )}
      <div className={`p-4 rounded-xl mb-4 ${
        id === 'light' ? 'bg-orange-100 text-orange-600' : 
        id === 'dark' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
      }`}>
        <Icon size={28} />
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-[11px] text-slate-400 leading-tight">{description}</p>
    </button>
  );

  return (
    <div className="max-w-4xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Tema Ayarları</h3>
      <p className="text-sm text-slate-500 mb-6">Tercih ettiğiniz görünüm temasını seçin</p>
      
      <div className="flex gap-6 mb-12">
        <ThemeCard 
          id="light" 
          title="Açık" 
          description="Klasik aydınlık tema" 
          icon={Sun} 
        />
        <ThemeCard 
          id="dark" 
          title="Koyu" 
          description="Göz yormayan koyu tema" 
          icon={Moon} 
        />
        <ThemeCard 
          id="system" 
          title="Sistem" 
          description="Cihaz ayarını takip et" 
          icon={Monitor} 
        />
      </div>

      {/* Önizleme Paneli */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Önizleme</h4>
        <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <div>
              <p className="font-bold text-slate-800">Ahmet Yılmaz</p>
              <p className="text-xs text-slate-400">İTÜ - Bilgisayar Müh.</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 italic">
            Seçtiğiniz tema tüm platformda uygulanacaktır. Değişiklikler anında yansır.
          </p>
        </div>
      </div>

      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl mt-10 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

export default ThemeSettings;