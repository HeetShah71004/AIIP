import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/client';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
      toast.success('Account created successfully!');
      if (onSuccess) onSuccess(res.data.data);
      else if (onSwitchToLogin) onSwitchToLogin();
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
      const res = await googleLogin(credentialResponse.credential, formData.role);
      toast.success('Google Signup successful!');
      if (onSuccess) onSuccess(res.data);
      else window.location.href = formData.role === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
    } catch (err) {
      toast.error('Google Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto py-1">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create account</h2>
        <p className="text-sm text-muted-foreground font-light">Join 10k+ users preparing today</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] font-semibold text-red-400 text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'candidate' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                formData.role === 'candidate' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-foreground/[0.03] border-border text-muted-foreground hover:bg-foreground/[0.06]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.role === 'candidate' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {formData.role === 'candidate' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-xs font-bold">Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                formData.role === 'recruiter' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-foreground/[0.03] border-border text-muted-foreground hover:bg-foreground/[0.06]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.role === 'recruiter' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {formData.role === 'recruiter' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-xs font-bold">Recruiter</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modal-signup-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
          <Input
            id="modal-signup-name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-foreground/[0.05] border-border text-foreground placeholder:text-muted-foreground/30 h-13 rounded-xl focus:ring-primary/30 focus:border-primary transition-all duration-300"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modal-signup-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
          <Input
            id="modal-signup-email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-foreground/[0.05] border-border text-foreground placeholder:text-muted-foreground/30 h-13 rounded-xl focus:ring-primary/30 focus:border-primary transition-all duration-300"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modal-signup-password" name="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
          <div className="relative">
            <Input
              id="modal-signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-foreground/[0.05] border-border text-foreground placeholder:text-muted-foreground/30 h-13 rounded-xl pr-12 focus:ring-primary/30 focus:border-primary transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/10 hover:text-foreground/30 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
          <Button 
            type="submit" 
            className="w-full h-13 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 rounded-xl mt-4 active:scale-[0.98]" 
            disabled={loading}
          >
          {loading ? <LoadingSpinner size={20} message={null} /> : 'Get Started'}
        </Button>
      </form>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px w-full bg-border"></div>
        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em] whitespace-nowrap">Join with</span>
        <div className="h-px w-full bg-border"></div>
      </div>

      <div className="flex justify-center group">
        <div className="w-full max-w-[280px] transform transition-transform group-hover:scale-[1.01]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Sign Up Failed')}
            theme="filled_black"
            shape="pill"
            size="large"
            width="280"
            text="signup_with"
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground leading-normal">
        Already a member?{" "}
        <button 
          onClick={onSwitchToLogin}
          className="text-foreground font-bold hover:text-primary transition-all border-b border-border hover:border-primary pb-0.5 ml-1"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
