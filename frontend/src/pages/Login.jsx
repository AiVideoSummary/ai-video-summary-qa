import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/auth/login", {
        email: email,
        password: password,
      });

    if (response.data.message === "Giriş başarılı!") {
  // Kullanıcı bilgisini kaydediyoruz
  localStorage.setItem("user", JSON.stringify({
    full_name: response.data.user.full_name,
    department: "Bilgisayar Mühendisliği" // Şimdilik statik, ileride veritabanından çekilebilir
  }));
  
  alert("Hoş geldin " + response.data.user.full_name);
  navigate("/dashboard");
}
    } catch (error) {
      alert("Hata: " + (error.response?.data?.detail || "Giriş yapılamadı"));
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* SOL TARAF: Görsel ve Mesaj Alanı */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-purple-600/80 mix-blend-multiply" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white text-center">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            NoteGenie'ye <br/> Hoş Geldin
          </h1>
          <p className="text-xl opacity-90 max-w-md leading-relaxed">
            Yapay zeka ile derslerini daha verimli hale getir.
          </p>

          <div className="flex gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
                <span className="block font-bold text-lg">10,000+</span>
                <span className="text-xs opacity-80">Öğrenci</span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
                <span className="block font-bold text-lg">5,000+</span>
                <span className="text-xs opacity-80">Video Özeti</span>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF: Login Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Giriş Yap</h2>
          <p className="text-slate-500 mb-8 text-sm">Devam etmek için hesabınıza giriş yapın</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input 
                onChange={(e) => setEmail(e.target.value)}
                type="email" 
                placeholder="ornek@email.com" 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">Şifre</label>
                {/* TIKLAMA OLAYI EKLENDİ */}
                <span 
                  className="text-xs text-purple-600 font-bold cursor-pointer hover:underline"
                  onClick={() => setShowModal(true)}
                >
                  Şifremi Unuttum?
                </span>
              </div>
              <input 
                onChange={(e) => setPassword(e.target.value)}
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-200 active:scale-[0.98] mt-4"
            >
              Giriş Yap
            </button>
            
            <button 
              type="button"
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5" />
              Google ile Giriş Yap
            </button>
          </form>

          <p className="text-slate-500 text-center mt-8 text-sm">
            Hesabın yok mu? <span 
              className="text-purple-600 font-bold hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Hemen Kaydol
            </span>
          </p>
        </div>
      </div>

      {/* ŞİFREMİ UNUTTUM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-sm bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-100">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Şifreni mi Unuttun?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Şifre sıfırlama sistemi şu an geliştirme aşamasındadır. Lütfen yeni bir hesap oluşturun veya sistem yöneticisi ile iletişime geçin.
            </p>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;