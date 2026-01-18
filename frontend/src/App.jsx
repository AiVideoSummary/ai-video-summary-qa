import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login'; // Yeni oluşturduğun dosya

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfaya girince direkt Login'e yönlendirsin */}
        <Route path="/" element={<Home />} />
        
        {/* Sayfa rotalarımız */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Girişten sonra gideceği yer (Şimdilik boş kalabilir) */}
        <Route path="/dashboard" element={<div className="p-10 text-2xl">Dashboard Çok Yakında!</div>} />
      </Routes>
    </Router>
  );
}

export default App;