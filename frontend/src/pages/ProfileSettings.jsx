import React from 'react';

const ProfileSettings = () => {
  return (
    <div className="max-w-3xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Profil Bilgileri</h3>
      
      {/* Profil Fotoğrafı Alanı */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500 mb-3">Profil fotoğrafı değiştir</p>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-100">
            A
          </div>
          <div className="flex gap-3">
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
              Fotoğraf Yükle
            </button>
            <button className="bg-slate-50 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all">
              Kaldır
            </button>
          </div>
        </div>
      </div>

      {/* Form Alanları */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Ad Soyad</label>
            <input 
              type="text" 
              className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30" 
              placeholder="Ahmet Yılmaz" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email</label>
            <input 
              type="email" 
              disabled 
              className="w-full p-3.5 border border-slate-100 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed" 
              value="ahmet.yilmaz@itu.edu.tr" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Üniversite</label>
              <select className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option>İstanbul Teknik Üniversitesi</option>
                <option>Bolu Abant İzzet Baysal Üniversitesi</option>
                <option>Kocaeli Üniversitesi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Bölüm</label>
              <select className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option>Bilgisayar Mühendisliği</option>
                <option>Yazılım Mühendisliği</option>
                <option>Elektrik-Elektronik Mühendisliği</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sınıf</label>
              <input 
                type="number" 
                min="1" max="4"
                className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="4" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Bio</label>
            <textarea 
              rows="4" 
              className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/30" 
              placeholder="Kendinizden bahsedin..."
            />
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl mt-4 font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;