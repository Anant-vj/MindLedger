import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Habits = lazy(() => import('./pages/Habits'));
const Insights = lazy(() => import('./pages/Insights'));
const Planner = lazy(() => import('./pages/Planner'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

function Layout({ children, isSidebarOpen, setIsSidebarOpen, isDarkMode, setIsDarkMode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isDark={isDarkMode} 
        setIsDark={setIsDarkMode} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8 max-w-full overflow-hidden`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  const layoutProps = { isSidebarOpen, setIsSidebarOpen, isDarkMode, setIsDarkMode };

  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout {...layoutProps}><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout {...layoutProps}><Tasks /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/habits" element={
                <ProtectedRoute>
                  <Layout {...layoutProps}><Habits /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/planner" element={
                <ProtectedRoute>
                  <Layout {...layoutProps}><Planner /></Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/insights" element={
                <ProtectedRoute>
                  <Layout {...layoutProps}><Insights /></Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
