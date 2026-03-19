import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar className="h-32 w-32 border-2 border-primary ring-4 ring-primary/10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl">
                {user.name?.charAt(0).toUpperCase() || <User size={48} />}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">{user.name}</CardTitle>
          <CardDescription className="text-lg">User Profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined On</p>
                <p className="text-lg font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full h-12 text-lg gap-2 shadow-sm"
            onClick={logout}
          >
            <LogOut size={20} /> Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
