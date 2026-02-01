import React, { useState } from 'react';

const PrivacySettings = () => {
  // Seçim durumlarını tutmak için state
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [courseVisibility, setCourseVisibility] = useState('public');

  const OptionItem = ({ id, title, description, group, currentValue, onChange }) => (
    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all mb-3 ${
      currentValue === id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
    }`}>
      <input 
        type="radio" 
        name={group}
        checked={currentValue === id}
        onChange={() => onChange(id)}
        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
      />
      <div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </label>
  );

  return (
    <div className="max-w-2xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Gizlilik Ayarları</h3>
      
      {/* Profil Görünürlüğü */}
      <div className="mb-10">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Profil Görünürlüğü</h4>
        <p className="text-xs text-slate-400 mb-4">Profilinizi kimler görebilir?</p>
        <OptionItem 
          id="everyone" 
          title="Herkes Görebilir" 
          description="Profiliniz herkese açık olacak" 
          group="profile"
          currentValue={profileVisibility}
          onChange={setProfileVisibility}
        />
        <OptionItem 
          id="registered" 
          title="Sadece Kayıtlı Kullanıcılar" 
          description="Sadece platformdaki kullanıcılar görebilir" 
          group="profile"
          currentValue={profileVisibility}
          onChange={setProfileVisibility}
        />
        <OptionItem 
          id="private" 
          title="Özel" 
          description="Sadece siz görebilirsiniz" 
          group="profile"
          currentValue={profileVisibility}
          onChange={setProfileVisibility}
        />
      </div>

      {/* Kurs Görünürlüğü Varsayılanı */}
      <div className="mb-10">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Kurs Görünürlüğü Varsayılanı</h4>
        <p className="text-xs text-slate-400 mb-4">Oluşturduğunuz kurslar varsayılan olarak nasıl görünsün?</p>
        <OptionItem 
          id="public" 
          title="Herkese Açık" 
          description="Kurslarınız herkes tarafından bulunabilir" 
          group="course"
          currentValue={courseVisibility}
          onChange={setCourseVisibility}
        />
        <OptionItem 
          id="private" 
          title="Özel" 
          description="Sadece sizin erişiminizde olacak" 
          group="course"
          currentValue={courseVisibility}
          onChange={setCourseVisibility}
        />
      </div>

      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl mt-6 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
        Değişiklikleri Kaydet
      </button>
    </div>
  );
};

export default PrivacySettings;