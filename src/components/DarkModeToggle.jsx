import React, { useEffect, useRef } from 'react';
import { useDarkMode } from '../hooks/useDarkMode.jsx';

const DarkModeToggle = () => {
  const toggleRef = useRef(null);
  const { theme, setTheme, getCurrentTheme } = useDarkMode();

  useEffect(() => {
    // Import the dark-mode-toggle component
    import('@anatoliygatt/dark-mode-toggle');
  }, []);

  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;

    // Set the initial mode based on current theme
    const currentTheme = getCurrentTheme();
    toggle.mode = currentTheme;

    const handleToggle = (event) => {
      const newMode = event.detail.mode;
      
      // If the new mode matches system preference, set to auto
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = systemPrefersDark ? 'dark' : 'light';
      
      if (newMode === systemTheme && theme !== 'auto') {
        setTheme('auto');
      } else {
        setTheme(newMode);
      }
    };

    toggle.addEventListener('colorschemechange', handleToggle);

    return () => {
      toggle.removeEventListener('colorschemechange', handleToggle);
    };
  }, [theme, setTheme, getCurrentTheme]);

  // Update toggle when theme changes externally
  useEffect(() => {
    const toggle = toggleRef.current;
    if (toggle) {
      toggle.mode = getCurrentTheme();
    }
  }, [theme, getCurrentTheme]);

  return (
    <div className="dark-mode-toggle-container">
      <dark-mode-toggle
        ref={toggleRef}
        appearance="toggle"
        permanent
      />
    </div>
  );
};

export default DarkModeToggle; 