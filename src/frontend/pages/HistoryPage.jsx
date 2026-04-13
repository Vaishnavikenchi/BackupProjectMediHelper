import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../../firebase/firestoreService';
import { Clock, Pill, Trash2, Loader, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function HistoryPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getUserHistory(currentUser.uid)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  const taken = history.filter(h => h.status === 'taken').length;
  const missed = history.filter(h => h.status === 'missed').length;

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Medication History</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Track your medication adherence
          </p>
        </div>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="premium-glass p-5 md:p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300 ring-1 ring-emerald-500/20 z-10">
              <CheckCircle className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <div className="z-10">
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{taken}</p>
              <p className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Doses Taken</p>
            </div>
          </div>
          <div className="premium-glass p-5 md:p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2"></div>
            <div className="p-4 bg-red-400/10 rounded-2xl group-hover:bg-red-500 group-hover:shadow-lg group-hover:shadow-red-500/20 transition-all duration-300 ring-1 ring-red-400/20 z-10">
              <XCircle className="w-8 h-8 text-red-500 group-hover:text-white transition-colors" />
            </div>
            <div className="z-10">
              <p className="text-3xl font-extrabold text-[var(--text-primary)]">{missed}</p>
              <p className="text-sm text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Doses Missed</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/30 blur-xl rounded-full"></div>
            <Loader className="w-10 h-10 animate-spin text-brand relative z-10" />
          </div>
          <p className="text-[var(--text-secondary)] font-medium animate-pulse">Loading history...</p>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="premium-glass rounded-3xl p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--glass-border)] hover:border-brand/30 transition-colors group">
          <div className="p-5 bg-[var(--bg-secondary)] rounded-full mb-5 ring-1 ring-[var(--border-color)] shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Clock className="w-10 h-10 text-[var(--text-secondary)] opacity-40 group-hover:text-orange-500/60 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No history yet</h3>
          <p className="text-[var(--text-secondary)] font-medium max-w-sm">Your medication logs will appear here once you start tracking your doses.</p>
        </div>
      )}

      <div className="grid gap-4 mt-6">
        {history.map((item, idx) => (
          <div 
            key={item.id} 
            className={`premium-glass p-5 rounded-2xl flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${item.status === 'taken' ? 'hover:shadow-emerald-500/10 hover:border-emerald-500/30' : 'hover:shadow-red-500/10 hover:border-red-500/30'}`}
            style={{ animationDelay: `${idx * 100}ms`, animation: 'fade-in 0.5s ease-out forwards' }}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${item.status === 'taken' ? 'bg-gradient-to-b from-emerald-400 to-teal-500' : 'bg-gradient-to-b from-red-400 to-rose-500'}`}></div>
            
            <div className={`p-3 rounded-xl ml-2 flex-shrink-0 shadow-inner ring-1 ${item.status === 'taken' ? 'bg-emerald-500/10 ring-emerald-500/20' : 'bg-red-400/10 ring-red-400/20'}`}>
              {item.status === 'taken'
                ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                : <XCircle className="w-6 h-6 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--text-primary)] text-lg truncate mb-1">{item.medicineName}</p>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--text-secondary)] font-medium">
                {item.dosage && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">{item.dosage}</span>}
                <span className={`px-2 py-0.5 rounded-md ${item.status === 'taken' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  {item.status === 'taken' ? 'Taken' : 'Missed'}
                </span>
                {item.takenAt?.seconds && (
                  <span className="flex items-center gap-1.5 ml-auto text-xs opacity-70">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.takenAt.seconds * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
