import React, { useState, useRef } from 'react';
import { Camera, Zap, UploadCloud, CheckCircle, Loader, Search, Info, AlertTriangle, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';
import { getAllMedicines } from '../../firebase/firestoreService';
import { useLanguage } from '../context/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';

export default function UploadPrescription() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState(null);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [fetchingMed, setFetchingMed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { language, setLanguage, LANGUAGES } = useLanguage();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsScanning(true);
      setExtractedText(null);
      setMatchedMedicines([]);
      setNotFound(false);
      setFetchingMed(false);

      // Run OCR
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      const cleanText = text.replace(/\s+/g, ' ').trim();
      setExtractedText(cleanText);

      // Fetch all medicines
      setFetchingMed(true);
      const allMeds = await getAllMedicines();
      
      const foundMeds = [];
      const lowerText = cleanText.toLowerCase();

      for (const med of allMeds) {
        if (med.name && lowerText.includes(med.name.toLowerCase())) {
          foundMeds.push(med);
        }
      }

      if (foundMeds.length > 0) {
        setMatchedMedicines(foundMeds);
        toast.success(`Found ${foundMeds.length} medicine(s) in prescription!`, { icon: '💊' });
      } else {
        setNotFound(true);
        toast('No matching medicines found in database for this prescription.', { icon: '🔍' });
      }
    } catch (err) {
      toast.error('Could not extract text from image. Please try a clearer image.');
      setExtractedText(null);
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

  function getExplanation(med) {
    return getField(med, 'simpleExplanation');
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-rose-500 rounded-2xl shadow-lg shadow-fuchsia-500/20">
            <UploadCloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Upload Prescription</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Scan image → Extract medicine details
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*,.pdf"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Upload area */}
      <div className="premium-glass rounded-3xl overflow-hidden relative group border-2 border-dashed border-[var(--border-color)] hover:border-brand/50 transition-colors">
        <div className="w-full bg-[var(--bg-secondary)] flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] cursor-pointer" onClick={startUpload}>
          {previewUrl && !isScanning && !fetchingMed ? (
            <img src={previewUrl} alt="Prescription Preview" className="w-full h-full object-cover absolute inset-0 opacity-40 blur-[2px]" />
          ) : null}

          <div className="flex flex-col items-center justify-center h-full w-full py-16 relative z-10 gap-4">
            <div className="w-48 h-36 border-4 border-fuchsia-500/60 rounded-3xl relative bg-[var(--bg-primary)] shadow-lg flex items-center justify-center">
              {isScanning ? (
                <Loader className="w-10 h-10 text-fuchsia-500 animate-spin" />
              ) : (
                <Camera className="w-10 h-10 text-fuchsia-500/50" />
              )}
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg mt-2 drop-shadow-xl border-white">
              {isScanning ? 'Extracting text...' : 'Click to Upload Prescription'}
            </p>
            <p className="text-[var(--text-primary)] font-bold text-sm px-4 text-center max-w-sm drop-shadow-lg">
              Upload an image of your doctor's prescription. We will automatically extract and identify your medicines.
            </p>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader className="w-6 h-6 animate-spin text-brand" />
          <span className="text-[var(--text-secondary)] font-medium">Scanning text from image using OCR…</span>
        </div>
      )}

      {/* Not Found */}
      {notFound && !isScanning && (
        <div className="premium-glass p-6 rounded-2xl border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-primary)] text-lg mb-1">No recognized medicines found</p>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-3">
              We couldn't match any text from the prescription to our immediate medicine database. It might be handwritten or not currently in our records.
            </p>
            <p className="text-xs font-mono bg-[var(--bg-primary)] p-2 rounded max-h-32 overflow-y-auto text-[var(--text-secondary)]">Extracted: {extractedText}</p>
          </div>
        </div>
      )}

      {/* Medicine Results */}
      {matchedMedicines.length > 0 && !isScanning && (
        <div className="space-y-6 animate-fade-in">
           <h2 className="text-2xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">Identified Medicines</h2>
           
           <div className="flex justify-end">
               {/* Language selector */}
               <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex-shrink-0">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === l.code ? 'bg-fuchsia-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-fuchsia-500'}`}
                  >
                    {l.full}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
             {matchedMedicines.map(medicine => (
                 <div key={medicine.id} className="premium-glass rounded-3xl overflow-hidden relative border border-fuchsia-500/20 shadow-md">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                   
                   <div className="p-6 md:p-8 space-y-6 relative z-10">
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-500">
                           <Pill className="w-8 h-8" />
                         </div>
                         <div>
                           <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{medicine.name}</h2>
                           {medicine.dosage && (
                             <span className="inline-block mt-2 px-3 py-1 bg-fuchsia-500/10 text-fuchsia-600 font-bold text-xs rounded-full uppercase tracking-wider">{medicine.dosage}</span>
                           )}
                         </div>
                       </div>
                     </div>

                     {/* Simple Explanation */}
                     {getExplanation(medicine) && (
                       <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-inner">
                         <p className="text-sm font-bold text-fuchsia-600 mb-2 uppercase tracking-wider flex items-center gap-2">💡 Usage Summary</p>
                         <p className="text-[var(--text-primary)] text-lg font-medium leading-relaxed">{getExplanation(medicine)}</p>
                       </div>
                     )}

                     {/* Detail Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {getField(medicine, 'usageInstructions') && (
                         <DetailSection icon="📋" title="Usage Instructions" text={getField(medicine, 'usageInstructions')} color="blue" />
                       )}
                       {getField(medicine, 'precautions') && (
                         <DetailSection icon="⚠️" title="Precautions" text={getField(medicine, 'precautions')} color="amber" />
                       )}
                       {getField(medicine, 'sideEffects') && (
                         <DetailSection icon="🩺" title="Side Effects" text={getField(medicine, 'sideEffects')} color="red" />
                       )}
                     </div>

                     <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
                         <VoiceAssistant medicine={medicine} />
                     </div>
                   </div>
                 </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ icon, title, text, color }) {
  const colors = {
    blue: 'bg-blue-500/5 border-blue-500/20 text-blue-600',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    red: 'bg-red-500/5 border-red-500/20 text-red-600',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color].split(' text-')[0]} transition-all duration-300 hover:shadow-md`}>
      <p className={`font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2 text-sm uppercase tracking-wider ${colors[color].split(' ')[2]}`}>{icon} {title}</p>
      <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">{text}</p>
    </div>
  );
}
