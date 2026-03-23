import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-foreground transition-transform group-hover:-rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-foreground transition-transform group-hover:rotate-45" />
      )}
    </button>
  );
};

export default ThemeToggle;
