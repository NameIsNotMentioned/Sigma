import React, { useEffect, useState } from 'react';
import { GlassSystemProvider } from 'open-glass-ui';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TripProvider } from '../context/TripContext';
import { MarketingLanding } from './MarketingLanding';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';

export const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => localStorage.getItem('triptide-theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('triptide-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <GlassSystemProvider
      renderer="auto"
      theme={{
        appearance: isDarkTheme ? 'dark' : 'light',
        theme: { preset: 'cobalt', radius: 'balanced' },
      }}
    >
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<TripProvider><MarketingLanding isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme((current) => !current)} /></TripProvider>} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme((current) => !current)} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </GlassSystemProvider>
  );
};

export default App;
