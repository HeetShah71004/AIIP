import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-600 transition-transform group-hover:-rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-400 transition-transform group-hover:rotate-45" />
      )}
    </button>
  );
};

export default ThemeToggle;
