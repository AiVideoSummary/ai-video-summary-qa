import React, { useState } from 'react';
import { Check } from 'lucide-react';

const LanguageSettings = () => {
  const [selectedLang, setSelectedLang] = useState('tr');

  const languages = [
    { id: 'tr', name: 'Türkçe', native: 'Türkçe', flag: 'TR' },
    { id: 'en', name: 'English', native: 'English', flag: 'EN' },
    { id: 'de', name: 'Deutsch', native: 'German', flag: 'DE' },
    { id: 'fr', name: 'Français', native: 'French', flag: 'FR' },
    { id: 'es', name: 'Español', native: 'Spanish', flag: 'ES' },
    { id: 'ar', name: 'العربية', native: 'Arabic', flag: 'AR' },
  ];

  return (
    <div className="max-w-4xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Dil Ayarları</h3>
      <p className="text-sm text-slate-500 mb-6">Platform dilini seçin</p>
      
      <div className="space-y-3 mb-10">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLang(lang.id)}
            className={`w-full flex items-center justify-between p-5 border rounded-2xl transition-all ${
              selectedLang === lang.id 
              ? 'border-indigo-600 bg-indigo-50/30' 
              : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                {lang.flag}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">{lang.name}</p>
                <p className="text-xs text-slate-400">{lang.native}</p>
              </div>
            </div>
            {selectedLang === lang.id && <Check className="text-indigo-600" size={20} />}
          </button>
        ))}
      </div>

      {/* Görseldeki Not Kutusu */}
      <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-10">
        <p className="text-sm text-indigo-900 leading-relaxed">
          <span className="font-bold">Not:</span> Dil değişikliği tüm platformda geçerli olacaktır. Bazı içerikler henüz tercih ettiğiniz dile çevrilmemiş olabilir.
        </p>
      </div>

      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

export default LanguageSettings;