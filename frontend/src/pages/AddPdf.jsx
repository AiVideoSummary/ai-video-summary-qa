import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FileText, CheckCircle, Clock, LayoutGrid, Globe, Lock, Plus, X, UploadCloud } from "lucide-react";
import PdfDetail from "./PdfDetail"; // Dosya adın neyse o

const AddPdf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null); // URL yerine File tutuyoruz
  const [pdfTitle, setPdfTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/courses");
      setCourses(response.data);
      const params = new URLSearchParams(location.search);
      const courseIdFromUrl = params.get('courseId');
      if (courseIdFromUrl) setSelectedCourse(courseIdFromUrl);
    } catch (error) {
      console.error("Koleksiyonlar yüklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [location]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPdfTitle(file.name.replace(".pdf", "")); // Dosya adını başlık yap
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;
    setAddCourseLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/courses", {
        title: newCourseTitle,
        description: "Yeni oluşturulan koleksiyon"
      });
      await fetchCourses();
      setSelectedCourse(response.data.course_id);
      setIsAddingCourse(false);
      setNewCourseTitle("");
    } catch (error) {
      alert("Hata: " + error.response?.data?.detail);
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleAddPdf = async () => {
    if (!selectedFile || !selectedCourse) {
      alert("Lütfen önce bir PDF dosyası seçin ve kitapçık belirleyin!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", pdfTitle || selectedFile.name);
    formData.append("course_id", Number(selectedCourse));

    try {
      // Backend'deki yeni endpoint'imize gönderiyoruz
      const response = await axios.post("http://localhost:8000/api/v1/pdf/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.data.id) {
        navigate(`/booklet-detail/${response.data.id}`);
      }
    } catch (error) {
      console.error("PDF yükleme hatası:", error);
      alert("Hata: " + (error.response?.data?.detail || "Sunucu hatası"));
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <PdfDetail 
        tasks={[
          "PDF metinleri analiz ediliyor...",
          "Akademik özet oluşturuluyor...",
          "Anahtar terimler belirleniyor...",
          "Ders notu kitapçığa işleniyor..."
        ]} 
        onComplete={() => {
          // Bu kısım animasyon bitince detay sayfasına gitmemizi sağlayacak (isteğe bağlı)
        }} 
      />
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 font-sans">
        <h1 className="text-3xl font-black text-slate-900">PDF Notu Ekle</h1>
        <p className="text-slate-500 font-medium">Ders notlarınızı veya kitaplarınızı akıllı özetlere dönüştürün.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        <div className="space-y-6">
          {/* PDF Dosya Seçimi */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> PDF Dosyası
            </h3>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500">
                        {selectedFile ? selectedFile.name : "Tıkla veya PDF sürükle"}
                    </p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
            {selectedFile && (
                <input 
                    type="text" 
                    className="w-full mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Not Başlığı"
                />
            )}
          </div>

          {/* Kitapçık Seçimi (Video ile aynı) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={20} className="text-blue-600" />
                Kitapçık Seçin
              </h3>
              <button onClick={() => setIsAddingCourse(!isAddingCourse)} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                {isAddingCourse ? <X size={18} /> : <Plus size={18} />}
              </button>
            </div>

            {isAddingCourse && (
              <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" placeholder="Kitapçık adı..." className="flex-1 p-3 bg-white border border-blue-200 rounded-xl outline-none text-sm font-bold" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} />
                <button onClick={handleCreateCourse} disabled={addCourseLoading} className="px-6 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100">
                  {addCourseLoading ? "..." : "OLUŞTUR"}
                </button>
              </div>
            )}

            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-slate-600 font-bold appearance-none cursor-pointer" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Bir kitapçık seçin...</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>{course.title}</option>
              ))}
            </select>
          </div>

          {/* Gizlilik (Aynı) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <h3 className="font-bold text-slate-800 mb-4">Kitapçık Görünürlüğü</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isPublic ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <input type="radio" className="hidden" checked={!isPublic} onChange={() => setIsPublic(false)} />
                <span className={`text-sm font-bold flex items-center gap-1.5 ${!isPublic ? 'text-blue-600' : 'text-slate-500'}`}><Lock size={16} /> Sadece Ben</span>
              </label>
            </div>
          </div>
        </div>

        {/* AI İşleme Özeti (PDF İçin Revize Edildi) */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 ring-1 ring-slate-50 relative overflow-hidden">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><CheckCircle size={24} /></div>
            AI PDF Analiz
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              "PDF metinlerini analiz et ve çıkar",
              "İçeriğin akademik özetini oluştur",
              "Anahtar terimleri ve kavramları belirle",
              "Önemli bölümler için başlıklar üret"
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <span className="text-sm font-bold text-slate-600">{task}</span>
                <div className="text-blue-600 bg-blue-50 p-1 rounded-full"><CheckCircle size={16} /></div>
              </div>
            ))}
            <button 
              onClick={handleAddPdf} 
              disabled={loading} 
              className={`w-full mt-6 py-5 rounded-[24px] font-black text-white shadow-2xl transition-all relative overflow-hidden group ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200'
              }`}
            >
              {loading ? "ANALİZ EDİLİYOR..." : "NOTU ÇÖZÜMLE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPdf;