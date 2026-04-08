import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LoadingSpinner from './LoadingSpinner';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const { login, googleLogin } = useAuth();

  React.useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setLoadingMessage('Waking up server...');
      }, 4000);
    } else {
      setLoadingMessage(null);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password, role);
      toast.success('Login successful!');
      if (onSuccess) onSuccess(res.data);
      else {
        // Use the role from the response if available, otherwise fallback to selected role
        const userRole = res.data?.role || role;
        window.location.href = userRole === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
      }
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
      const res = await googleLogin(credentialResponse.credential, role);
      toast.success('Google Login successful!');
      if (onSuccess) onSuccess(res.data);
      else {
        const userRole = res.data?.role || role;
        window.location.href = userRole === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
      }
    } catch (err) {
      toast.error('Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto py-1">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground font-light">Access your Interv AI dashboard</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] font-semibold text-red-400 text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Login as</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                role === 'candidate' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-foreground/[0.03] border-border text-muted-foreground hover:bg-foreground/[0.06]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'candidate' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {role === 'candidate' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-xs font-bold">Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                role === 'recruiter' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-foreground/[0.03] border-border text-muted-foreground hover:bg-foreground/[0.06]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'recruiter' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {role === 'recruiter' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <span className="text-xs font-bold">Recruiter</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modal-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
          <Input
            id="modal-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-foreground/[0.05] border-border text-foreground placeholder:text-muted-foreground/30 h-13 rounded-xl focus:ring-primary/30 focus:border-primary transition-all duration-300"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <Label htmlFor="modal-password" name="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
            <button type="button" className="text-[10px] font-bold text-primary hover:opacity-80 transition-colors">Forgot password?</button>
          </div>
          <div className="relative">
            <Input
              id="modal-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {loading ? <LoadingSpinner size={20} message={loadingMessage} /> : 'Sign In'}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px w-full bg-border"></div>
        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em] whitespace-nowrap">Secure Login</span>
        <div className="h-px w-full bg-border"></div>
      </div>

      <div className="flex justify-center group">
        <div className="w-full max-w-[280px] transform transition-transform group-hover:scale-[1.01]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Login Failed')}
            theme="filled_black"
            shape="pill"
            size="large"
            width="280"
            text="signin_with"
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground leading-normal">
        New to Interv AI?{" "}
        <button 
          onClick={onSwitchToSignup}
          className="text-foreground font-bold hover:text-primary transition-all border-b border-border hover:border-primary pb-0.5 ml-1"
        >
          Create an account
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
