import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Sayfa geçişleri için eklendi
import { Sparkles, Brain, Zap, Clock, Play, ChevronRight, Video, FileText, MessageSquare, Award } from 'lucide-react';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate(); // Yönlendirme fonksiyonu

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Akıllı Video Analizi",
      description: "YouTube videolarını otomatik olarak analiz edip özet çıkarır"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Otomatik Not Oluşturma",
      description: "Videolardan zaman damgalı notlar ve özetler oluşturur"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Asistan",
      description: "İçerik hakkında sorular sorun, anında yanıt alın"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quiz & Flashcard",
      description: "Otomatik test soruları ve öğrenme kartları"
    }
  ];

  const stats = [
    { number: "10dk", label: "Ortalama İşleme Süresi", icon: <Clock className="w-5 h-5" /> },
    { number: "%70+", label: "Doğruluk Oranı", icon: <Zap className="w-5 h-5" /> },
    { number: "∞", label: "Sınırsız Video", icon: <Video className="w-5 h-5" /> },
    { number: "AI", label: "Destekli Öğrenme", icon: <Brain className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NoteGenie
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition font-medium">Özellikler</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition font-medium">Nasıl Çalışır?</a>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-semibold"
            >
              Giriş Yap
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 font-semibold"
            >
              Hemen Başla
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Yapay Zeka Destekli Öğrenme</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Eğitim Videolarını{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Akıllı Notlara
              </span>{' '}
              Dönüştür
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              YouTube videolarını saniyeler içinde analiz edin, otomatik özet çıkarın ve 
              yapay zeka asistanınızla öğrenin[cite: 6, 7]. Artık saatlerce video izlemeye gerek yok.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>Hemen Dene</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition">
                Demo İzle
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition shadow-sm">
                  <div className="flex justify-center mb-2 text-indigo-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                <Play className="w-16 h-16 text-indigo-600 relative z-10" />
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="h-8 bg-indigo-100 rounded-lg"></div>
                  <div className="h-8 bg-purple-100 rounded-lg"></div>
                  <div className="h-8 bg-pink-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-xl text-gray-600">
              Öğrenme deneyiminizi dönüştüren AI teknolojileri [cite: 9]
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveFeature(idx)}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  activeFeature === idx
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg transform -translate-y-1'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  activeFeature === idx ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600">
              3 basit adımda öğrenmeye başlayın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Video Ekle",
                description: "YouTube URL'sini yapıştırın ve saniyeler içinde analiz edin [cite: 14]",
                color: "indigo"
              },
              {
                step: "2",
                title: "AI Analiz Etsin",
                description: "Yapay zeka videoyu analiz edip otomatik özetler oluştursun [cite: 15]",
                color: "purple"
              },
              {
                step: "3",
                title: "Öğren & Test Et",
                description: "Quiz çözün ve AI asistanla derslerinize hakim olun [cite: 18, 20]",
                color: "pink"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition h-full border border-gray-100">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-400 text-white text-2xl font-bold flex items-center justify-center mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 NoteGenie - Azra Çopur & Ceren Mertoğlu Bitirme Projesi [cite: 42]</p>
          </div>
        </div>
      </footer>
    </div>
  );
}