import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Zap, UploadCloud, CheckCircle, Loader, Search, Info, AlertTriangle, Pill, ChevronRight, Database, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';
import { getAllMedicines, addSearchHistory } from '../../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState(null);
  const [localMatches, setLocalMatches] = useState([]);
  const [fdaMatches, setFdaMatches] = useState([]);
  const [fetchingMed, setFetchingMed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchWord, setSearchWord] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { language, setLanguage, LANGUAGES } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsScanning(true);
      setExtractedText(null);
      setLocalMatches([]);
      setFdaMatches([]);
      setNotFound(false);
      setSearchWord('');

      // 1. Text Extraction via OCR
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      const rawText = text.replace(/\s+/g, ' ').trim();
      setExtractedText(rawText);

      // 2. Text Cleaning
      const stopWords = ['tablets', 'capsules', 'tablet', 'capsule', 'i.p.', 'i.p', 'b.p.', 'b.p', 'u.s.p.', 'mg', 'ml', 'g', 'mcg', 'syrup', 'suspension', 'drops', 'injection', 'cream', 'ointment', 'gel', 'lotion', 'mfg', 'lic', 'exp', 'date', 'price', 'rx', 'schedule', 'batch', 'manufactured', 'marketed', 'private', 'limited', 'company', 'companies', 'india', 'pvt', 'ltd', 'dosage', 'store', 'dry', 'place', 'children', 'keep', 'out', 'reach', 'protect', 'light', 'moisture', 'directed', 'physician', 'cool', 'warning', 'caution', 'red', 'line', 'pharmaceuticals', 'pharmaceutical', 'healthcare', 'pharma', 'laboratories', 'laboratory', 'formulation', 'registered', 'medical', 'practitioner', 'retail', 'prescription', 'drug', 'strip', 'pack', 'dose', 'doses', 'directions'];
      
      const words = rawText.toLowerCase().replace(/[^a-z\s]/g, ' ').split(' ').filter(w => w.trim() !== '');
      const validWords = words.filter(w => !stopWords.includes(w) && w.length > 4);
      
      setFetchingMed(true);
      
      // 3. Local Search - Highest Priority
      const lowerRawText = rawText.toLowerCase();
      const allMeds = await getAllMedicines();
      // Match if the local medicine name is directly inside the OCR text
      const exactLocalMatches = allMeds.filter(m => m.name && m.name.length > 3 && lowerRawText.includes(m.name.toLowerCase()));
      
      if (exactLocalMatches.length > 0) {
        setLocalMatches([exactLocalMatches[0]]);
        setSearchWord(exactLocalMatches[0].name);
        
        if (currentUser) {
          addSearchHistory(currentUser.uid, `OCR Strip: ${exactLocalMatches[0].name}`, `Raw Extract: ${rawText.substring(0, 50)}`).catch(console.warn);
        }
        
        toast.success('Found in local database!', { icon: '💊' });
        setIsScanning(false);
        setFetchingMed(false);
        return;
      }

      if (validWords.length === 0) {
        setNotFound(true);
        toast.error('No valid medicine name could be recognized.');
        setIsScanning(false);
        setFetchingMed(false);
        return;
      }

      // 4. Fallback using OpenFDA
      // Sort words by length descending (longest words are usually the chemical/brand names)
      const sortedByLength = [...validWords].sort((a, b) => b.length - a.length);
      const candidates = sortedByLength.slice(0, 5); // Test top 5 longest words
      
      setSearchWord(candidates[0]); // initially set display to the first candidate
      toast('Searching Global FDA Database...', { icon: '🌐' });
      
      let fdaFound = false;
      for (const candidate of candidates) {
        try {
          // Search OpenFDA by brand name first
          let res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(candidate)}"&limit=1`);
          let data = await res.json();
          
          // If no brand name found, fallback to generic name search
          if (!data.results || data.results.length === 0) {
              res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(candidate)}"&limit=1`);
              data = await res.json();
          }

          if (data.results && data.results.length > 0) {
            setFdaMatches(data.results);
            setSearchWord(candidate);
            
            if (currentUser) {
              addSearchHistory(currentUser.uid, `OCR FDA Match: ${candidate}`, `Raw Extract: ${rawText.substring(0, 50)}`).catch(console.warn);
            }
            
            toast.success(`Found details for ${candidate} via OpenFDA!`, { icon: '🌐' });
            fdaFound = true;
            break; // Stop querying if we find a match
          }
        } catch (err) {
          // Ignore API errors and let it try the next candidate
        }
      }
      
      if (!fdaFound) {
        setNotFound(true);
        if (currentUser) {
           addSearchHistory(currentUser.uid, `OCR Missed: ${candidates[0]}`, `Raw Extract: ${rawText.substring(0, 50)}`).catch(console.warn);
        }
      }

    } catch (err) {
      toast.error('Could not extract text from image. Please try a clearer picture.');
      console.error(err);
    } finally {
      setIsScanning(false);
      setFetchingMed(false);
    }
  };

  const startUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  function getField(med, field) {
    return med[`${field}_${language}`] || med[`${field}_en`] || med[field] || '';
  }

  function getFDAField(med, fieldKeys) {
      for (const key of fieldKeys) {
          if (med[key] && med[key][0]) return med[key][0];
      }
      return 'Information not available in FDA records.';
  }

  function handleManualAdd() {
      if (isAdmin) {
          navigate('/admin');
      } else {
          toast('Please ask an administrator to add this medicine manually.', { icon: 'ℹ️', duration: 5000 });
      }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
             <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Upload Medicine Strip</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> AI Text Recognition + Database Search
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Upload area */}
      <div className="premium-glass rounded-3xl overflow-hidden relative group border-2 border-dashed border-[var(--border-color)] hover:border-indigo-500/50 transition-colors">
        <div className="w-full bg-[var(--bg-secondary)] flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] cursor-pointer" onClick={startUpload}>
          {previewUrl && !isScanning && !fetchingMed ? (
            <img src={previewUrl} alt="Medicine Strip Preview" className="w-full h-full object-cover absolute inset-0 opacity-40 blur-[2px]" />
          ) : null}

          <div className="flex flex-col items-center justify-center h-full w-full py-16 relative z-10 gap-4">
            <div className="w-48 h-36 border-4 border-indigo-500/60 rounded-3xl relative bg-[var(--bg-primary)] shadow-lg flex items-center justify-center">
              {isScanning ? (
                <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
              ) : (
                <UploadCloud className="w-10 h-10 text-indigo-500/50 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg mt-2 drop-shadow-xl border-white">
              {isScanning ? 'Extracting text...' : 'Click to Upload Medicine Image'}
            </p>
            <p className="text-[var(--text-primary)] font-bold text-sm px-4 text-center max-w-sm drop-shadow-lg">
              Upload a clear photo of the medicine strip or packaging to instantly retrieve its details.
            </p>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="flex items-center justify-center gap-3 py-6 premium-glass rounded-2xl mx-auto w-fit px-8 border border-indigo-500/20">
          <Loader className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-indigo-600 font-bold">Scanning text from image using OCR…</span>
        </div>
      )}

      {fetchingMed && searchWord && (
        <div className="flex items-center justify-center gap-3 py-6 premium-glass rounded-2xl mx-auto w-fit px-8 border border-orange-500/20">
          <Search className="w-5 h-5 animate-pulse text-orange-500" />
          <span className="text-orange-600 font-bold">Searching database for "{searchWord}"...</span>
        </div>
      )}

      {/* Not Found */}
      {notFound && !isScanning && !fetchingMed && (
        <div className="premium-glass p-8 rounded-3xl border-amber-500/30 bg-amber-500/5 flex flex-col items-center text-center gap-4 animate-fade-in">
          <div className="p-4 bg-amber-500/10 rounded-full">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)] text-xl mb-2">Medicine details not available</p>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-6 max-w-md mx-auto">
              We couldn't match the extracted word <span className="font-bold text-[var(--text-primary)] capitalize">"{searchWord}"</span> to our local database or the global OpenFDA records.
            </p>
            <button 
                onClick={handleManualAdd}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 mx-auto"
            >
                <Plus className="w-5 h-5"/>
                Add Medicine Manually
            </button>
            {extractedText && (
               <div className="mt-8 text-left border-t border-amber-500/20 pt-4">
                 <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Extracted Text Preview</p>
                 <p className="text-xs font-mono bg-[var(--bg-primary)] p-3 rounded-lg max-h-32 overflow-y-auto text-[var(--text-secondary)] border border-[var(--border-color)]">
                    {extractedText}
                 </p>
               </div>
            )}
          </div>
        </div>
      )}

      {/* --- LOCAL DB MATCH --- */}
      {localMatches.length > 0 && !isScanning && !fetchingMed && (
        <div className="space-y-6 animate-fade-in relative z-20">
           <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
              <Database className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Local Match Found</h2>
           </div>
           
           <div className="flex justify-end pr-2">
               <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLanguage(l.code)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === l.code ? 'bg-emerald-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-emerald-500'}`}>
                    {l.full}
                  </button>
                ))}
              </div>
           </div>

           {localMatches.map(medicine => (
               <div key={medicine.id} className="premium-glass rounded-3xl overflow-hidden relative border border-emerald-500/20 shadow-md">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                 <div className="p-6 md:p-8 space-y-6 relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                       <Pill className="w-8 h-8" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{medicine.name}</h2>
                       {medicine.dosage && (
                         <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-full uppercase tracking-wider">{medicine.dosage}</span>
                       )}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                     {getField(medicine, 'usageInstructions') && (
                       <DetailSection icon="📋" title="Uses / Instructions" text={getField(medicine, 'usageInstructions')} color="blue" />
                     )}
                     {getField(medicine, 'sideEffects') && (
                       <DetailSection icon="🩺" title="Side Effects" text={getField(medicine, 'sideEffects')} color="red" />
                     )}
                   </div>

                   <div className="pt-4 border-t border-[var(--border-color)]">
                       <VoiceAssistant medicine={medicine} />
                   </div>
                 </div>
               </div>
           ))}
        </div>
      )}

      {/* --- OPENFDA MATCH --- */}
      {fdaMatches.length > 0 && !isScanning && !fetchingMed && (
        <div className="space-y-6 animate-fade-in relative z-20">
           <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
              <Search className="w-6 h-6 text-brand" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Global OpenFDA Match</h2>
              <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ml-auto">External Data</span>
           </div>
           
           {fdaMatches.map((medicine, idx) => {
               const brand = medicine?.openfda?.brand_name?.[0] || 'Unknown';
               const generic = medicine?.openfda?.generic_name?.[0] || 'Unknown';
               
               return (
               <div key={idx} className="premium-glass rounded-3xl overflow-hidden relative border border-brand/20 shadow-md">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                 <div className="p-6 md:p-8 space-y-6 relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                       <Pill className="w-8 h-8" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{brand}</h2>
                       <p className="text-[var(--text-secondary)] text-sm font-semibold mt-1">Generic: {generic}</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                     <DetailSection icon="💡" title="Purpose" text={getFDAField(medicine, ['purpose', 'indications_and_usage'])} color="blue" />
                     <DetailSection icon="⚖️" title="Dosage" text={getFDAField(medicine, ['dosage_and_administration'])} color="indigo" />
                     <DetailSection icon="⚠️" title="Warnings" text={getFDAField(medicine, ['warnings', 'boxed_warning'])} color="amber" />
                     <DetailSection icon="🩺" title="Side Effects" text={getFDAField(medicine, ['adverse_reactions'])} color="red" />
                   </div>
                 </div>
               </div>
               )
           })}
        </div>
      )}
    </div>
  );
}

function DetailSection({ icon, title, text, color }) {
  const colors = {
    blue: 'bg-blue-500/5 border-blue-500/20 text-blue-600',
    indigo: 'bg-indigo-500/5 border-indigo-500/20 text-indigo-600',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    red: 'bg-red-500/5 border-red-500/20 text-red-600',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color].split(' text-')[0]} transition-all duration-300 hover:shadow-md h-full`}>
      <p className={`font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2 text-sm uppercase tracking-wider ${colors[color].split(' ')[2]}`}>{icon} {title}</p>
      <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed max-h-48 overflow-y-auto custom-scrollbar pr-2">{text}</p>
    </div>
  );
}
