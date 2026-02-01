import React, { useState } from 'react';
import axios from 'axios';

const AccountSettings = () => {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  
  // Fonksiyonun başında localStorage'ı taze çekiyoruz
  const handleUpdatePassword = async () => {
  const savedUser = localStorage.getItem("user");
  const userData = JSON.parse(savedUser);

  // ID'yi bul ve ne olursa olsun SAYIYA çevir
  const rawId = userData?.user_id || userData?.id || userData?.user?.id;
  const userId = Number(rawId); 

  if (!userId || isNaN(userId)) {
    alert("Kullanıcı ID'si geçersiz! Lütfen tekrar giriş yapın.");
    return;
  }

  try {
    const response = await axios.put("http://127.0.0.1:8000/api/auth/update-password", {
      user_id: userId, // Artık kesinlikle bir sayı (integer)
      current_password: passwords.current,
      new_password: passwords.new
    });
    
    alert(response.data.message);
    setPasswords({ current: "", new: "", confirm: "" });
  } catch (error) {
    // 422 hatası aldığımızda detayları konsola yazdır ki neyin eksik olduğunu görelim
    console.log("Hata Detayı:", error.response?.data);
    const errorMsg = error.response?.data?.detail;
    alert(Array.isArray(errorMsg) ? errorMsg[0].msg : errorMsg || "Veri formatı hatası (422)");
  }
};

  return (
    <div className="max-w-2xl animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-8">Hesap Ayarları</h3>
      
      <div className="space-y-6 mb-12">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Şifre Değiştir</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Mevcut Şifre</label>
            <input 
              type="password" 
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Yeni Şifre</label>
              <input 
                type="password" 
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Yeni Şifre Tekrar</label>
              <input 
                type="password" 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleUpdatePassword}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Şifreyi Güncelle
          </button>
        </div>
      </div>

      <div className="p-8 border border-red-100 bg-red-50/50 rounded-2xl border-dashed">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <span className="text-xl">⚠️</span>
          <h4 className="font-bold">Tehlikeli Alan</h4>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-red-800 text-sm">Hesabı Sil</p>
            <p className="text-xs text-red-600/70">Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir.</p>
          </div>
          <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;