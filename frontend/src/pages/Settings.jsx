import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Monitor, Sun, Moon, Check, User, Bell, 
  Lock, Laptop, Shield, Palette, Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

  const themes = [
    {
      id: 'system',
      name: 'Sync with system',
      description: 'Match your system active settings',
      icon: <Monitor size={20} />,
      preview: (
        <div className="flex h-24 w-full overflow-hidden rounded-md border border-border">
          <div className="w-1/2 bg-white flex flex-col p-2 gap-1.5 border-r border-border">
            <div className="h-2 w-8 bg-slate-100 rounded" />
            <div className="h-2 w-12 bg-slate-50 rounded" />
            <div className="mt-auto h-4 w-full bg-[#14b8a6]/20 rounded" />
          </div>
          <div className="w-1/2 bg-[#0a0a0a] flex flex-col p-2 gap-1.5">
            <div className="h-2 w-8 bg-slate-800 rounded" />
            <div className="h-2 w-12 bg-slate-900 rounded" />
            <div className="mt-auto h-4 w-full bg-[#a8f54a]/20 rounded" />
          </div>
        </div>
      )
    },
    {
      id: 'light',
      name: 'Light theme',
      description: 'Clean and airy aesthetic',
      icon: <Sun size={20} />,
      preview: (
        <div className="h-24 w-full rounded-md border border-border bg-white p-2 flex flex-col gap-1.5">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
          <div className="h-2 w-16 bg-slate-100 rounded" />
          <div className="h-2 w-24 bg-slate-50 rounded" />
          <div className="mt-auto h-10 w-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 rounded-lg flex items-center px-2">
             <div className="h-1.5 w-1/2 bg-[#14b8a6]/40 rounded" />
          </div>
        </div>
      )
    },
    {
      id: 'dark',
      name: 'Dark theme',
      description: 'Premium night mode',
      icon: <Moon size={20} />,
      preview: (
        <div className="h-24 w-full rounded-md border border-border bg-[#0a0a0a] p-2 flex flex-col gap-1.5">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-slate-800" />
            <div className="h-2 w-2 rounded-full bg-slate-800" />
            <div className="h-2 w-2 rounded-full bg-slate-800" />
          </div>
          <div className="h-2 w-16 bg-slate-900 rounded" />
          <div className="h-2 w-24 bg-slate-900/50 rounded" />
          <div className="mt-auto h-10 w-full bg-[#a8f54a]/10 border border-[#a8f54a]/20 rounded-lg flex items-center px-2">
             <div className="h-1.5 w-1/2 bg-[#a8f54a]/40 rounded" />
          </div>
        </div>
      )
    }
  ];

  const sidebarItems = [
    { id: 'appearance', name: 'Appearance', icon: <Palette size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background font-['Outfit'] dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 group ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-300 border-l-4 border-primary shadow-sm translate-x-1'
                      : 'text-muted-foreground dark:text-zinc-400 hover:bg-muted/80 hover:text-foreground dark:hover:bg-zinc-900/40 hover:pl-6'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {activeTab === 'appearance' ? (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1 dark:text-zinc-50 dark:font-extrabold">Theme preferences</h1>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400">
                    Choose how Interv AI looks to you. Select a theme, or sync with your system and automatically switch between day and night.
                  </p>
                </div>

                <Separator />

                {/* Theme Selection */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold">Theme mode</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`group relative flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                          theme === t.id
                            ? 'border-primary ring-2 ring-primary/10 bg-primary/[0.02] dark:bg-teal-500/5 shadow-md -translate-y-1'
                            : 'border-border dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] hover:border-primary/40 dark:hover:border-teal-500/40 hover:shadow-lg hover:-translate-y-1'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-1.5 rounded-md ${theme === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-zinc-800 text-muted-foreground dark:text-zinc-400'}`}>
                            {t.icon}
                          </div>
                          {theme === t.id && (
                            <Badge variant="default" className="bg-primary text-primary-foreground h-5 text-[10px] uppercase tracking-wider">Active</Badge>
                          )}
                        </div>
                        
                        {t.preview}

                        <div>
                          <p className="text-sm font-bold dark:text-zinc-100">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground dark:text-zinc-400 line-clamp-1">{t.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                   <Button variant="outline" className="text-xs" disabled>Save preferences</Button>
                   <p className="text-[10px] text-muted-foreground dark:text-zinc-400 mt-2 italic">* Selections are applied immediately and saved automatically.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 dark:bg-zinc-900/40 border border-dashed dark:border-zinc-800/90 rounded-xl">
                <Shield size={48} className="text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-muted-foreground dark:text-zinc-300">Tab Under Construction</h2>
                <p className="text-sm text-muted-foreground dark:text-zinc-400">This settings tab will be available in the next update.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
