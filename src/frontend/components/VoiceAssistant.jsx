import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Square } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

/**
 * VoiceAssistant component — reads medicine info aloud using SpeechSynthesis.
 * @param {Object} medicine - Firestore medicine object
 */
export default function VoiceAssistant({ medicine }) {
  const { language, currentLang } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop voice if language changes mid-speech
  useEffect(() => {
    if (speaking) stopSpeaking();
  }, [language]);

  function buildScript() {
    if (!medicine) return '';
    const name = medicine.name || 'Unknown Medicine';
    const dosage = medicine.dosage || '';
    function getField(field) {
      return medicine[`${field}_${language}`] || medicine[`${field}_en`] || medicine[field] || '';
    }

    const usage = getField('usageInstructions');
    const precautions = getField('precautions');
    const explanation = getField('simpleExplanation');

    if (language === 'hi') {
      return `दवाई का नाम: ${name}. ` +
        (dosage ? `खुराक: ${dosage}. ` : '') +
        (usage ? `उपयोग: ${usage}. ` : '') +
        (precautions ? `सावधानियाँ: ${precautions}. ` : '') +
        (explanation ? `सरल जानकारी: ${explanation}.` : '');
    }
    if (language === 'mr') {
      return `औषधाचे नाव: ${name}. ` +
        (dosage ? `डोस: ${dosage}. ` : '') +
        (usage ? `वापर: ${usage}. ` : '') +
        (precautions ? `खबरदारी: ${precautions}. ` : '') +
        (explanation ? `सोपी माहिती: ${explanation}.` : '');
    }
    // English
    return `Medicine name: ${name}. ` +
      (dosage ? `Dosage: ${dosage}. ` : '') +
      (usage ? `Usage instructions: ${usage}. ` : '') +
      (precautions ? `Precautions: ${precautions}. ` : '') +
      (explanation ? `Simple explanation: ${explanation}.` : '');
  }

  function startSpeaking() {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support voice assistant.');
      return;
    }
    window.speechSynthesis.cancel();
    const script = buildScript();
    if (!script.trim()) return;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = currentLang.bcp47;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(currentLang.bcp47.split('-')[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (!medicine) return null;

  return (
    <div className="flex items-center gap-3">
      {speaking ? (
        <button
          onClick={stopSpeaking}
          className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-300 text-base"
        >
          <Square className="w-5 h-5" />
          Stop Voice
        </button>
      ) : (
        <button
          onClick={startSpeaking}
          className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-300 text-base hover:scale-105 active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          🔊 Listen
        </button>
      )}
      {speaking && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-1.5 bg-emerald-500 rounded-full animate-bounce"
              style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium ml-1">Speaking…</span>
        </div>
      )}
    </div>
  );
}
