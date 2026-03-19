import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Login successful!');
      window.location.href = '/';
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to login';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      toast.success('Google Login successful!');
      window.location.href = '/';
    } catch (err) {
      toast.error('Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-[420px] glass border-none relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
        <CardHeader className="space-y-4 pt-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-primary-foreground font-bold text-xl">AI</span>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-border focus:bg-background transition-all duration-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" name="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-background/50 border-border focus:bg-background transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
              {loading ? <LoadingSpinner size={20} message={null} /> : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="w-full transform transition-transform hover:scale-[1.01]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pb-8">
          <p className="text-sm text-center w-full text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
