import React, { useState, useEffect } from 'react';
import { DarkModeToggle } from '@anatoliygatt/dark-mode-toggle';
import { useDarkMode } from '../hooks/useDarkMode.jsx';

const DarkModeToggleComponent = () => {
  const { theme, setTheme, getCurrentTheme } = useDarkMode();
  const [mode, setMode] = useState(() => getCurrentTheme());

  // Update local mode state when theme changes
  useEffect(() => {
    setMode(getCurrentTheme());
  }, [theme, getCurrentTheme]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    // If the new mode matches system preference, set to auto
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = systemPrefersDark ? 'dark' : 'light';
    
    if (newMode === systemTheme && theme !== 'auto') {
      setTheme('auto');
    } else {
      setTheme(newMode);
    }
  };

  return (
    <div className="dark-mode-toggle-container">
      <div className="dark-mode-toggle-wrapper">
        <DarkModeToggle
          mode={mode}
          dark="Dark"
          light="Light"
          size="sm"
          inactiveTrackColor="#e2e8f0"
          inactiveTrackColorOnHover="#f8fafc"
          inactiveTrackColorOnActive="#cbd5e1"
          activeTrackColor="#334155"
          activeTrackColorOnHover="#1e293b"
          activeTrackColorOnActive="#0f172a"
          inactiveThumbColor="#1e293b"
          activeThumbColor="#e2e8f0"
          onChange={handleModeChange}
        />
      </div>
    </div>
  );
};

export default DarkModeToggleComponent;