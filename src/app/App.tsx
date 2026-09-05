import React, { useEffect, useState } from 'react';
import { GlassSystemProvider } from 'open-glass-ui';
import { TripProvider } from '../context/TripContext';
import { MarketingLanding } from './MarketingLanding';

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
      <TripProvider>
        <MarketingLanding
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme((current) => !current)}
        />
      </TripProvider>
    </GlassSystemProvider>
  );
};

export default App;
