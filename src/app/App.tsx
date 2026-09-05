import React, { useEffect, useState } from 'react';
import { GlassSystemProvider } from 'open-glass-ui';
import { TripProvider, useTrip } from '../context/TripContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { DemoGuideBar } from '../components/layout/DemoGuideBar';
import { Overview } from './routes/Overview';
import { Itinerary } from './routes/Itinerary';
import { Expenses } from './routes/Expenses';
import { People } from './routes/People';
import { Settlements } from './routes/Settlements';

const MainContent: React.FC = () => {
  const { activeTab } = useTrip();

  return (
    <main className="flex-1 min-w-0 p-4 lg:p-8 max-w-7xl mx-auto w-full">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'itinerary' && <Itinerary />}
      {activeTab === 'expenses' && <Expenses />}
      {activeTab === 'people' && <People />}
      {activeTab === 'settlements' && <Settlements />}
    </main>
  );
};

const MobileMenu: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { activeTab, setActiveTab } = useTrip();
  const items = [
    ['overview', 'Overview'],
    ['itinerary', 'Itinerary'],
    ['expenses', 'Expenses'],
    ['people', 'People'],
    ['settlements', 'Settlements'],
  ] as const;

  if (!open) return null;

  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <span className="eyebrow">TRIPTIDE MENU</span>
          <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">×</button>
        </div>
        <nav className="space-y-2">
          {items.map(([id, label]) => (
            <button
              key={id}
              className={`mobile-menu-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id);
                onClose();
              }}
            >
              <span>{label}</span>
              <span>↗</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('triptide-theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('triptide-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <GlassSystemProvider
      renderer="auto"
      theme={{
        appearance: 'dark',
        theme: {
          preset: 'cobalt',
          radius: 'balanced',
        },
      }}
    >
      <TripProvider>
        <div className={`app-shell min-h-screen text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 ${isDarkTheme ? 'theme-dark' : ''}`}>
          {/* Hackathon Demo Assistant Banner */}
          <DemoGuideBar />

          {/* Main App Container */}
          <div className="app-layout flex-1 flex flex-col md:flex-row">
            {/* Persistent Glass Sidebar */}
            <Sidebar />

            {/* Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar
                onMenuToggle={() => setMobileMenuOpen(true)}
                isDarkTheme={isDarkTheme}
                onThemeToggle={() => setIsDarkTheme((current) => !current)}
              />
              <MainContent />
            </div>
          </div>
            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </div>
      </TripProvider>
    </GlassSystemProvider>
  );
};

export default App;
