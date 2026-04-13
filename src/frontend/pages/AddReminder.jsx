import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addReminder } from '../../firebase/firestoreService';
import { Bell, ArrowLeft, Loader, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Weekly', 'As needed'];

const Field = ({ label, children, required }) => (
  <div className="relative group">
    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default function AddReminder() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: frequencies[0],
    time: '08:00',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.medicineName.trim()) return toast.error('Please enter a medicine name');
    setLoading(true);
    try {
      await addReminder(currentUser.uid, form);
      toast.success('Reminder saved successfully!', { icon: '✨' });
      navigate('/reminders');
    } catch {
      toast.error('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-colors text-sm font-bold group bg-[var(--bg-secondary)] py-2 px-4 rounded-full hover:shadow-md border border-[var(--border-color)]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20">
          <PlusCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Add Reminder</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Create a new medication schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="premium-glass rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="space-y-6 relative z-10">
          <Field label="Medicine Name" required>
            <input 
              type="text" 
              value={form.medicineName} 
              onChange={set('medicineName')} 
              required 
              placeholder="e.g. Paracetamol 500mg" 
              className="input-premium w-full" 
            />
          </Field>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Dosage">
              <input 
                type="text" 
                value={form.dosage} 
                onChange={set('dosage')} 
                placeholder="e.g. 1 tablet" 
                className="input-premium w-full" 
              />
            </Field>
            
            <Field label="Frequency">
              <div className="relative">
                <select 
                  value={form.frequency} 
                  onChange={set('frequency')} 
                  className="input-premium w-full appearance-none pr-10 cursor-pointer bg-[var(--bg-primary)]"
                >
                  {frequencies.map(f => <option key={f} value={f} className="bg-[var(--bg-primary)]">{f}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </Field>
          </div>
          
          <Field label="Time">
            <input 
              type="time" 
              value={form.time} 
              onChange={set('time')} 
              className="input-premium w-full md:w-1/2 cursor-text file:hidden pr-4" 
            />
          </Field>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
            <Field label="Start Date">
              <input 
                type="date" 
                value={form.startDate} 
                onChange={set('startDate')} 
                className="input-premium w-full cursor-text" 
              />
            </Field>
            <Field label="End Date (Optional)">
              <input 
                type="date" 
                value={form.endDate} 
                onChange={set('endDate')} 
                className="input-premium w-full cursor-text" 
              />
            </Field>
          </div>

          <div className="pt-6 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full py-4 text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? <Loader className="w-6 h-6 animate-spin relative z-10" /> : <Bell className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />}
              <span className="relative z-10 font-bold">{loading ? 'Saving Schedule...' : 'Save Reminder Schedule'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
