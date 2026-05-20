import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Components & Pages
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Recommendations from './pages/Recommendations';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App() {
  const { token, loading } = useAuth();
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">EcoTrace Booting...</span>
        </div>
      </div>
    );
  }

  // Determine if we should show the dashboard shell layout (sidebar, navbar, floating chatbot)
  const isAuthPage = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-55 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-250 flex" style={{ backgroundColor: darkMode ? '#0b0f19' : '#f8fafc' }}>
        
        {/* Dashboard Shell Layout */}
        {!isAuthPage && token && (
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <div className={`flex-1 flex flex-col min-w-0 ${!isAuthPage && token ? 'lg:pl-64' : ''}`}>
          {/* Top Navbar */}
          {!isAuthPage && token && (
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          )}

          {/* Main View Area */}
          <main className={!isAuthPage && token ? 'p-6 md:p-8 flex-1 overflow-y-auto' : 'flex-1'}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Private Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculator" 
                element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
            </Routes>
          </main>
        </div>

        {/* Floating AI Helper widget */}
        {!isAuthPage && token && <ChatBot />}
      </div>
    </div>
  );
}

export default App;
