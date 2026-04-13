import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Camera, Bell, Clock, Pill, Activity, ChevronRight, Sparkles, UploadCloud } from 'lucide-react';

const quickLinks = [
  { to: '/upload-prescription', icon: UploadCloud, label: 'Upload Prescription', color: 'from-fuchsia-500 to-rose-500', shadow: 'shadow-fuchsia-500/30', desc: 'Extract medicines from image' },
  { to: '/search', icon: Search, label: 'Search Medicine', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30', desc: 'Find drug information' },
  { to: '/scanner', icon: Camera, label: 'Scan Medicine', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/30', desc: 'Scan a barcode or label' },
  { to: '/reminders', icon: Bell, label: 'Reminders', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30', desc: 'Manage your medication schedule' },
  { to: '/history', icon: Clock, label: 'History', color: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-500/30', desc: 'View past searches' },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-10 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-brand blur-xl opacity-40 animate-pulse-slow rounded-full"></div>
            <div className="relative p-4 bg-gradient-to-br from-brand-light to-brand-dark rounded-2xl shadow-xl shadow-brand/30 ring-1 ring-white/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {greeting}, <span className="text-gradient leading-normal">{currentUser?.displayName?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-[var(--text-secondary)] text-lg mt-1 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Here's your quick access dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {quickLinks.map(({ to, icon: Icon, label, color, shadow, desc }, index) => (
            <Link
              key={to}
              to={to}
              className={`premium-glass p-6 group cursor-pointer border-[var(--border-color)]`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg ${shadow} group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-brand transition-colors">{label}</h3>
                  <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="relative overflow-hidden premium-glass rounded-3xl p-8 md:p-10 border-0 shadow-2xl shadow-brand/20 bg-gradient-to-br from-brand-dark/90 via-brand/90 to-brand-light/90">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 shadow-xl">
            <Pill className="w-12 h-12 text-white" />
          </div>
          <div className="text-center md:text-left">
             <h3 className="font-bold text-3xl text-white mb-3 tracking-tight">MediHelper Premium</h3>
             <p className="text-white/80 text-lg max-w-2xl leading-relaxed font-medium">
               Your intelligent personal medication assistant. Seamlessly search for medicines, manage schedules, and track your health journey with an elegant, smart interface.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
