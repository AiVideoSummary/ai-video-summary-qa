import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import BookletDetail from './pages/BookletDetail';

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
        {/* ARTIK BURASI DASHBOARD'A GİDİYOR: Login'e dönüp durmazsın */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
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

        <Route 
          path="/booklet/:id" 
          element={
            <DashboardLayout>
              <BookletDetail />
            </DashboardLayout>
          } 
        />

        {/* Bilinmeyen yollarda da Dashboard'da kalmanı sağlar */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;