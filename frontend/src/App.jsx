import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // Senin Landing Page sayfan
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import BookletDetail from './pages/BookletDetail';
import AddVideo from './pages/AddVideo';
import VideoDetail from './pages/VideoDetail';

// Dashboard ve iç sayfalar için Sidebar'lı düzen
const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 font-sans">
    <Sidebar />
    <main className="flex-1 ml-64 overflow-x-hidden">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* DÜZELTME 1: Ana sayfa artık senin tasarımın (Home) olacak */}
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout>
              <Dashboard /> 
            </DashboardLayout>
          } 
        />

      <Route path="/booklet-detail/:id" element={<DashboardLayout><BookletDetail /></DashboardLayout>} />
        <Route 
  path="/video-ekle" 
  element={
    <DashboardLayout>
      <AddVideo />
    </DashboardLayout>
  } 
/>
<Route 
  path="/video-detay/:id" 
  element={
    <DashboardLayout>
      <VideoDetail />
    </DashboardLayout>
  } 
  
/>
<Route 
  path="/library" 
  element={
    <DashboardLayout>
      <Dashboard /> 
    </DashboardLayout>
  } 
/>

        {/* DÜZELTME 2: Bilinmeyen yollarda Dashboard yerine ana sayfaya (Home) döner (simdilik dashboard olsun) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;