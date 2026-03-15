import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const PdfDetail = ({ tasks, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < tasks.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500); // Her adım 1.5 saniye sürsün
      return () => clearTimeout(timer);
    } else {
      onComplete(); // Tüm adımlar bitince detay sayfasına yönlendir
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 font-sans">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-md">
        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Loader2 className="animate-spin text-purple-600" /> Akıllı Analiz Yapılıyor...
        </h2>
        
        <div className="space-y-6">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`font-bold transition-all ${index <= currentStep ? 'text-slate-700' : 'text-slate-300'}`}>
                {task}
              </span>
              {index < currentStep ? (
                <CheckCircle className="text-green-500 animate-in zoom-in duration-300" size={20} />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-100" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PdfDetail;