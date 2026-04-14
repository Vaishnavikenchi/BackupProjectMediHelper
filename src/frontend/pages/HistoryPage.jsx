import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../../firebase/firestoreService';
import { Clock, Pill, Trash2, Loader, CheckCircle, XCircle, Activity, Search, UploadCloud, MapPin, SearchSlash } from 'lucide-react';

export default function HistoryPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medication'); // medication | search | prescription | nearby

  useEffect(() => {
    if (!currentUser) return;
    getUserHistory(currentUser.uid)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Filter out data points that match the active tab
  // Fallback: if category is missing, treat as 'medication'
  const tabHistory = history.filter(h => (h.category || 'medication') === activeTab);

  const taken = history.filter(h => (h.category || 'medication') === 'medication' && h.status === 'taken').length;
  const missed = history.filter(h => (h.category || 'medication') === 'medication' && h.status === 'missed').length;

  const tabs = [
    { id: 'medication', label: 'Medications', icon: Pill },
    { id: 'search', label: 'Searches', icon: Search },
    { id: 'prescription', label: 'Prescriptions', icon: UploadCloud },
    { id: 'nearby', label: 'Nearby Shops', icon: MapPin },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Your History</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Track all your past activities and doses
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)] pb-2 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-md' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--glass-border)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Stats Area (Only for Medication tab) */}
      {activeTab === 'medication' && tabHistory.length > 0 && (
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader className="w-10 h-10 animate-spin text-brand" />
          <p className="text-[var(--text-secondary)] font-medium animate-pulse">Loading {activeTab} history...</p>
        </div>
      ) : tabHistory.length === 0 ? (
        <div className="premium-glass rounded-3xl p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--glass-border)]">
          <div className="p-5 bg-[var(--bg-secondary)] rounded-full mb-5 ring-1 ring-[var(--border-color)] shadow-inner">
            <SearchSlash className="w-10 h-10 text-[var(--text-secondary)] opacity-40" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No history yet</h3>
          <p className="text-[var(--text-secondary)] font-medium max-w-sm">No recorded activity found for the <strong>{tabHistory[0]?.category || activeTab}</strong> category.</p>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {tabHistory.map((item, idx) => (
            <div 
              key={item.id} 
              className={`premium-glass p-5 rounded-2xl flex items-center gap-5 transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
              style={{ animationDelay: `${idx * 50}ms`, animation: 'fade-in 0.3s ease-out forwards' }}
            >
              {activeTab === 'medication' && (
                <>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${item.status === 'taken' ? 'bg-gradient-to-b from-emerald-400 to-teal-500' : 'bg-gradient-to-b from-red-400 to-rose-500'}`}></div>
                  <div className={`p-3 rounded-xl ml-2 flex-shrink-0 shadow-inner ring-1 ${item.status === 'taken' ? 'bg-emerald-500/10 ring-emerald-500/20' : 'bg-red-400/10 ring-red-400/20'}`}>
                    {item.status === 'taken' ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-lg truncate mb-1">{item.medicineName}</p>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--text-secondary)] font-medium">
                      {item.dosage && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">{item.dosage}</span>}
                      <span className={`px-2 py-0.5 rounded-md ${item.status === 'taken' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        {item.status === 'taken' ? 'Taken' : 'Missed'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'search' && (
                <>
                  <div className="p-3 bg-brand/10 rounded-xl text-brand">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-lg truncate flex items-center gap-2">
                       Searched for: <span className="text-brand">"{item.searchQuery}"</span>
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'prescription' && (
                <>
                  <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-500">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-lg truncate mb-1">OCR Upload</p>
                    <p className="text-[var(--text-secondary)] font-medium text-sm">Recognized: <span className="text-[var(--text-primary)]">{item.medicineName}</span></p>
                    <p className="text-xs text-[var(--text-secondary)] opacity-50 truncate mt-1">Extracted Text Preview: {item.details}</p>
                  </div>
                </>
              )}

              {activeTab === 'nearby' && (
                <>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-lg truncate mb-1">Maps Location Query</p>
                    <p className="text-[var(--text-secondary)] font-medium text-sm flex gap-4">
                        <span>Searched near: <span className="text-[var(--text-primary)] capitalize">{item.locationQuery}</span></span>
                        <span>Medicine filter: <span className="text-[var(--text-primary)]">{item.medicineName || 'None'}</span></span>
                    </p>
                  </div>
                </>
              )}
              
              {item.takenAt?.seconds && (
                <div className="flex flex-col items-end flex-shrink-0 opacity-70 ml-4">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">{new Date(item.takenAt.seconds * 1000).toLocaleDateString()}</span>
                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/> {new Date(item.takenAt.seconds * 1000).toLocaleTimeString([], {timeStyle: 'short'})}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
