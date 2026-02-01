import React from 'react';
import { HelpCircle, MessageCircle, Mail, FileText, ExternalLink } from 'lucide-react';

const HelpSettings = () => {
  const SupportCard = ({ title, description, linkText, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-4">{description}</p>
      <button className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
        {linkText} <ExternalLink size={14} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl animate-fade-in pb-20">
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Yardım & Destek</h3>
      <p className="text-sm text-slate-500 mb-8">Size nasıl yardımcı olabiliriz?</p>
      
      {/* Üst Kartlar */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <SupportCard 
          title="Yardım Merkezi" 
          description="Sıkça sorulan sorular ve kullanım kılavuzları" 
          linkText="Yardım Merkezine Git" 
          icon={HelpCircle}
          colorClass="bg-blue-100 text-blue-600"
        />
        <SupportCard 
          title="Canlı Destek" 
          description="Destek ekibimizle anlık sohbet edin" 
          linkText="Sohbet Başlat" 
          icon={MessageCircle}
          colorClass="bg-green-100 text-green-600"
        />
        <SupportCard 
          title="Email Desteği" 
          description="Sorularınızı email ile iletin" 
          linkText="Email Gönder" 
          icon={Mail}
          colorClass="bg-purple-100 text-purple-600"
        />
        <SupportCard 
          title="Dokümantasyon" 
          description="Detaylı teknik dokümantasyon" 
          linkText="Dokümanlara Git" 
          icon={FileText}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Bize Ulaşın Formu */}
      <div className="bg-slate-50/50 p-8 border border-slate-100 rounded-3xl mb-10">
        <h4 className="font-bold text-slate-800 mb-1">Bize Ulaşın</h4>
        <p className="text-xs text-slate-400 mb-6">Sorununuzu aşağıdaki formu doldurarak bize iletebilirsiniz.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Konu</label>
            <select className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option>Teknik Sorun</option>
              <option>Öneri / Geri Bildirim</option>
              <option>Hesap Sorunları</option>
              <option>Diğer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mesajınız</label>
            <textarea 
              rows="4" 
              placeholder="Sorununuzu detaylı olarak açıklayın..." 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Mesaj Gönder
          </button>
        </div>
      </div>

      {/* Sistem Bilgisi */}
      <div className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center">
        <div>
          <h5 className="text-sm font-bold text-slate-800">Sistem Bilgisi</h5>
          <p className="text-[11px] text-slate-400">Platform Versiyonu: v2.4.1</p>
        </div>
        <p className="text-[11px] text-slate-400 italic">Son Güncelleme: 15 Kasım 2024</p>
      </div>
    </div>
  );
};

export default HelpSettings;