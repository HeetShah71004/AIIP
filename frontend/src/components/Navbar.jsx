import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload, BarChart3, User as UserIcon, Settings as SettingsIcon, Layout, UsersRound, Network } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary/15 text-primary dark:bg-teal-500/15 dark:text-teal-200 ring-1 ring-primary/20'
        : 'text-foreground/75 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
    }`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full pointer-events-none">
      <div className="relative w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 bg-background dark:bg-[#0b1220] pointer-events-auto">
        <Link to="/" className="flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <span className="text-[1.65rem] sm:text-3xl font-black tracking-tighter text-teal-600 font-outfit">Interv</span>
          <div className="bg-primary px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-primary-foreground shadow-md transform -rotate-3 dark:bg-zinc-100 dark:text-zinc-900">
            <span className="text-base sm:text-xl font-bold font-outfit">AI</span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {user?.role === 'candidate' && (
            <>
              <Link to="/upload" className={navLinkClass('/upload')}>
                <Upload size={17} />
                <span className="hidden sm:inline">Upload Resume</span>
              </Link>
              <Link to="/analytics" className={navLinkClass('/analytics')}>
                <BarChart3 size={17} />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
              <Link to="/resume-builder" className={navLinkClass('/resume-builder')}>
                <Layout size={17} />
                <span className="hidden sm:inline">Resume Builder</span>
              </Link>
              <Link to="/learning-roadmap" className={navLinkClass('/learning-roadmap')}>
                <Network size={17} />
                <span className="hidden sm:inline">Roadmap</span>
              </Link>
            </>
          )}
          {user?.role === 'recruiter' && (
            <Link to="/recruiter-dashboard" className={navLinkClass('/recruiter-dashboard')}>
              <UsersRound size={17} />
              <span className="hidden sm:inline">Recruiter</span>
            </Link>
          )}
          <div className="hidden sm:block h-6 w-px bg-border/80 dark:bg-zinc-700 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full ring-1 ring-black/15 dark:ring-zinc-600 hover:bg-foreground/5 dark:hover:bg-zinc-800/80">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user.avatar} alt={user.name || 'User'} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(user.name || user.email)?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border border-border/60 dark:border-zinc-700 bg-background/95 dark:bg-[#111827]" align="end" forceMount>
              <DropdownMenuLabel className="font-normal border-b border-border/10 pb-3 mb-1 px-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none tracking-tight uppercase">{user.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground font-medium">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/10" />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer px-4 py-2.5 w-full flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer px-4 py-2.5 w-full flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/10" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer px-4 py-2.5"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute left-0 right-0 -bottom-px h-px bg-gradient-to-r from-transparent via-border/90 to-transparent" />
      </div>
    </nav>
  );
};

export default Navbar;
