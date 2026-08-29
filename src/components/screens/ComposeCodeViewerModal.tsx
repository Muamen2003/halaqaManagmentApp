import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KOTLIN_PROJECT_FILES, KotlinFile } from '../../data/kotlinCodeSamples';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles, 
  Terminal, 
  Smartphone 
} from 'lucide-react';

export const ComposeCodeViewerModal: React.FC = () => {
  const { isCodeInspectorOpen, setIsCodeInspectorOpen, showToast } = useApp();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isCodeInspectorOpen) return null;

  const currentFile = KOTLIN_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    showToast(`تم نسخ كود ${currentFile.name} بنجاح`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-slate-900 text-slate-100 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col max-h-[90vh] overflow-hidden overflow-x-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-emerald-950 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-800 text-amber-300 shrink-0">
              <Code2 className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold font-['Cairo',sans-serif] text-white truncate">
                  معاينة كود Android Native (Kotlin)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Compose M3
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-300/80 truncate">
                هيكل المشروع البرمجي بلغة Kotlin
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCodeInspectorOpen(false)}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar" dir="ltr">
          {KOTLIN_PROJECT_FILES.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setSelectedFileIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all shrink-0 ${
                selectedFileIndex === idx
                  ? 'bg-emerald-800 text-emerald-100 shadow-xs border border-emerald-600'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-auto p-4 bg-[#0d1117] font-mono text-xs text-slate-200 relative select-text" dir="ltr">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold border border-slate-700 transition-all active:scale-95 shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto p-2 leading-relaxed text-slate-300 selection:bg-emerald-800 selection:text-white font-mono">
            <code>{currentFile.code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>جاهز للتصدير إلى Android Studio مع دعم Compose BOM 2024+</span>
          </div>
          <button
            onClick={() => setIsCodeInspectorOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-sans font-bold text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
