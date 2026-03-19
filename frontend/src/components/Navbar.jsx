import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload, BarChart3, User as UserIcon } from 'lucide-react';
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-6 z-50 mx-auto max-w-7xl px-4 pointer-events-none">
      <div className="flex items-center justify-between rounded-2xl glass border-none px-6 py-3 shadow-xl pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-primary transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div className="bg-primary px-2.5 py-1 rounded-xl text-primary-foreground shadow-md transform -rotate-3">
            <span className="text-lg">AI</span>
          </div>
          <span className="font-outfit text-2xl tracking-tight">Interview Platform</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/upload" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <Upload size={18} />
            <span className="hidden sm:inline">Upload Resume</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <BarChart3 size={18} />
            <span className="hidden sm:inline">Analytics</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(user.name || user.email)?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal border-b pb-2 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer w-full flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
