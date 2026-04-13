import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin as checkIsAdmin, getUserProfile } from '../../firebase/firestoreService';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      const profile = await getUserProfile(result.user.uid);
      const isActuallyAdmin = checkIsAdmin(email) || profile?.role === 'admin';
      
      if (!isActuallyAdmin) {
        toast.error('Access Denied: Not an admin account.');
        await logout();
        setLoading(false);
        return;
      }
      
      toast.success('Admin access granted!');
      navigate('/admin');
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-glow-effect px-4 py-12">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-violet-500/5 pointer-events-none"></div>
      
      <div className="w-full max-w-md premium-glass rounded-3xl p-8 md:p-10 z-10 animate-fade-in relative border border-fuchsia-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mb-6 shadow-xl shadow-fuchsia-500/30 ring-1 ring-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Admin Portal</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-3 font-medium">Restricted access area</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-fuchsia-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-premium pl-12 focus:ring-fuchsia-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-fuchsia-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-premium pl-12 pr-12 focus:ring-fuchsia-500"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-8 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center">
             <button onClick={() => navigate('/dashboard')} type="button" className="text-sm font-bold text-[var(--text-secondary)] hover:text-fuchsia-500 transition-colors">
               &larr; Return to Dashboard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
