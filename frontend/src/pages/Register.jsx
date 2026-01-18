import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  // Form verilerini tutan state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    department: '',
    grade: ''
  });

  // Input değişimlerini yakalayan fonksiyon
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Formu backend'e gönderen fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Şifreler uyuşmuyor!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        university: formData.university,
        department: formData.department,
        grade: formData.grade
      });

      if (response.status === 201 || response.status === 200) {
        alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Hata: " + (error.response?.data?.detail || "Sunucuya bağlanılamadı."));
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* SOL TARAF: Görsel ve Mesaj Alanı */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-purple-600/80 mix-blend-multiply" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white text-center">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            NoteGenie'ye <br/> Hoş Geldiniz
          </h1>
          <p className="text-xl opacity-90 max-w-md leading-relaxed">
            Üniversite yaşamınızı daha kolay yönetmek için hemen kaydolun
          </p>
        </div>
      </div>

      {/* SAĞ TARAF: Kayıt Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Kayıt Ol</h2>
          <p className="text-slate-500 mb-8 text-sm">Hesabınızı oluşturmak için bilgilerinizi girin</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ad Soyad</label>
              <input 
                name="fullName" 
                onChange={handleChange}
                type="text" placeholder="Adınız ve soyadınız" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input 
                name="email"
                onChange={handleChange}
                type="email" placeholder="ornek@email.com" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Şifre</label>
                <input 
                  name="password"
                  onChange={handleChange}
                  type="password" placeholder="Şifre" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Şifre Tekrar</label>
                <input 
                  name="confirmPassword"
                  onChange={handleChange}
                  type="password" placeholder="Tekrar" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Üniversite</label>
              <select 
                name="university"
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                required
              >
                <option value="">Üniversite seçin</option>
                <option value="Kocaeli Üniversitesi">Kocaeli Üniversitesi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bölüm</label>
                <select 
                  name="department"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  required
                >
                  <option value="">Bölüm seçin</option>
                  <option value="Bilgisayar Mühendisliği">Bilgisayar Mühendisliği</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sınıf/Yıl</label>
                <select 
                  name="grade"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  required
                >
                  <option value="">Sınıf seçin</option>
                  <option value="4">4. Sınıf</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" required />
              <label className="text-xs text-slate-600">
                <span className="text-purple-600 font-bold hover:underline cursor-pointer">Kullanım şartlarını</span> kabul ediyorum
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
            >
              Kayıt Ol
            </button>
          </form>

          <p className="text-slate-500 text-center mt-6 text-sm">
            Zaten hesabın var mı? <span className="text-purple-600 font-bold hover:underline cursor-pointer"
            onClick={() => navigate("/login")}>Giriş Yap</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;