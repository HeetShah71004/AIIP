import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/client';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
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

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to sign up';
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
      toast.success('Google Signup successful!');
      window.location.href = '/';
    } catch (err) {
      toast.error('Google Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 md:p-6 overflow-hidden font-inter">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 -z-20 bg-[#e8eaf6] animate-mesh overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f3e5f5] blur-[80px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#e3f2fd] blur-[80px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes mesh {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        .animate-mesh {
          background: linear-gradient(-45deg, #e8eaf6, #f3e5f5, #e3f2fd, #e8eaf6);
          background-size: 400% 400%;
          animation: mesh 15s ease infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}} />

      <div className="flex flex-col md:flex-row w-full max-w-[1100px] min-h-[720px] rounded-[24px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-white/60 bg-white animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out relative">
        
        {/* Left Branding Side - Hidden on Mobile */}
        <div className="hidden md:block relative w-[45%] overflow-hidden group">
          <div 
            className="absolute inset-0 bg-[url('/bg2.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          ></div>
          {/* Cyan/Teal Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,150,136,0.45)] to-[rgba(30,30,60,0.65)]"></div>
          
          {/* Logo in Corner */}
          <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter text-white">Interv<span className="text-primary">AI</span></span>
          </div>

          <div className="absolute bottom-12 left-12 right-12 z-20 space-y-6">
            <div className="h-1.5 w-20 bg-[#4dd0e1] rounded-full shadow-[0_0_15px_rgba(77,208,225,0.5)]"></div>
            <div className="space-y-4">
              <h2 className="text-5xl font-extrabold text-white leading-tight tracking-[-0.02em]">
                Elevate Your <br />
                <span className="text-[#4dd0e1] italic">Career Path.</span>
              </h2>
              <p className="text-white/80 text-lg font-medium max-w-sm">
                Our AI analyzes your performance to give you the edge in your next big interview.
              </p>
            </div>
            
            {/* Feature Pill Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              <div className="px-3 py-1.5 bg-white shadow-sm rounded-lg flex items-center gap-1.5">
                <span className="text-[10px]">🎯</span>
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">AI Feedback</span>
              </div>
              <div className="px-3 py-1.5 bg-white shadow-sm rounded-lg flex items-center gap-1.5">
                <span className="text-[10px]">📊</span>
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Performance Insights</span>
              </div>
              <div className="px-3 py-1.5 bg-white shadow-sm rounded-lg flex items-center gap-1.5">
                <span className="text-[10px]">🚀</span>
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Interview Ready</span>
              </div>
            </div>
          </div>

          {/* Decorative radial highlight */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-[55%] flex flex-col justify-center p-8 md:p-16 relative bg-[#fafbff]">
          {/* Gradient Top Border Pseudo-element */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hidden md:block"></div>
          


          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-[800] tracking-tight text-slate-900">Create Account</h1>
              <p className="text-slate-500 font-medium tracking-tight">Step into the future of interview preparation.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-sm font-semibold text-destructive text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-2 text-left">
                <Label htmlFor="name" className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-[1.5px] ml-1">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-14 bg-[#f4f6fb] border-[#e2e8f0] focus:border-[#4dd0e1] focus:ring-[3px] focus:ring-[rgba(77,208,225,0.2)] text-slate-900 rounded-[10px] transition-all duration-300 placeholder:text-slate-300/80 border-[1.5px]"
                />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="email" className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-[1.5px] ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-14 bg-[#f4f6fb] border-[#e2e8f0] focus:border-[#4dd0e1] focus:ring-[3px] focus:ring-[rgba(77,208,225,0.2)] text-slate-900 rounded-[10px] transition-all duration-300 placeholder:text-slate-300/80 border-[1.5px]"
                />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="password" name="password" className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-[1.5px] ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-14 pr-12 bg-[#f4f6fb] border-[#e2e8f0] focus:border-[#4dd0e1] focus:ring-[3px] focus:ring-[rgba(77,208,225,0.2)] text-slate-900 rounded-[10px] transition-all duration-300 placeholder:text-slate-300/80 border-[1.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-xl shadow-slate-200/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-[10px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white mt-4 border-none" disabled={loading}>
                {loading ? <LoadingSpinner size={24} message={null} /> : 'Sign Up'}
              </Button>
            </form>

            <div className="relative flex items-center gap-4 py-2">
              <div className="h-px w-full bg-slate-100"></div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">OR JOIN WITH</span>
              <div className="h-px w-full bg-slate-100"></div>
            </div>

            <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign Up Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>

            <p className="text-center text-slate-500 font-medium pt-4">
              Already a member?{" "}
              <Link to="/login" className="text-[#4dd0e1] font-bold hover:text-[#4dd0e1]/80 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
