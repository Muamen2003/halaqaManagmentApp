import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wifi, 
  BatteryMedium, 
  Signal, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Code2, 
  Layers
} from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { 
    deviceViewMode, 
    setDeviceViewMode, 
    isCodeInspectorOpen, 
    setIsCodeInspectorOpen,
    toasts 
  } = useApp();

  const currentTime = new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-[#112015] text-[#1B1C17] flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Top Banner with Platform & Tools info */}
      <header className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center shadow-md shadow-[#2E7D32]/30 border border-[#A5D6A7]/40">
            <span className="font-['Amiri',serif] font-bold text-2xl">ق</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white font-['Cairo',sans-serif]">
                إدارة حلقة التحفيظ
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
                Professional Polish
              </span>
            </div>
            <p className="text-xs text-[#A5D6A7]">
              نظام متكامل لتسجيل الحفظ والمراجعة اليومية والشهرية لحلقات القرآن الكريم
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCodeInspectorOpen(!isCodeInspectorOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#2E7D32] text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Code2 className="w-4 h-4" />
            <span>معاينة كود Jetpack Compose</span>
          </button>

          <div className="flex items-center bg-[#1B3224] p-1 rounded-full border border-[#2E7D32]/60">
            <button
              onClick={() => setDeviceViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                deviceViewMode === 'mobile'
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-[#A5D6A7] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>جوال Android</span>
            </button>
            <button
              onClick={() => setDeviceViewMode('fullscreen')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                deviceViewMode === 'fullscreen'
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-[#A5D6A7] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>كامل الشاشة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Mobile Bezel OR Fullscreen Display */}
      <main className="w-full flex items-center justify-center transition-all duration-300 overflow-x-hidden">
        {deviceViewMode === 'mobile' ? (
          <div className="relative w-full max-w-[420px] min-h-[640px] h-[calc(100vh-120px)] sm:h-[840px] max-h-[92vh] bg-[#0E1710] rounded-[36px] sm:rounded-[48px] p-2 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] border-[3px] sm:border-[4px] border-[#2E7D32]/40 ring-1 ring-[#A5D6A7]/30 flex flex-col overflow-hidden">
            
            {/* Camera Punch-hole / Dynamic Island */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-4 sm:h-5 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 pointer-events-none">
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#1B3224] border border-[#2E7D32]/50 flex items-center justify-center">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#66BB6A]"></div>
              </div>
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#1B3224]"></div>
            </div>

            {/* Inner Phone Screen */}
            <div className="w-full h-full bg-[#F8FAF8] rounded-[28px] sm:rounded-[38px] overflow-hidden flex flex-col relative shadow-inner">
              
              {/* Android Status Bar (RTL) */}
              <div className="w-full h-7 sm:h-8 bg-[#2E7D32] text-white text-[10px] sm:text-[11px] px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 font-medium select-none" dir="ltr">
                <span className="font-semibold tracking-wider">{currentTime}</span>
                <div className="flex items-center gap-1 sm:gap-1.5 opacity-90">
                  <Signal className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <Wifi className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <BatteryMedium className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[#F8FAF8] relative text-[#1B1C17] w-full min-w-0">
                {children}
              </div>

              {/* Android Gesture Bar */}
              <div className="w-full h-3.5 sm:h-4 bg-white/90 flex items-center justify-center z-40 shrink-0 border-t border-[#E0E4E0]">
                <div className="w-28 sm:w-32 h-1 bg-[#E0E4E0] rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl min-h-[640px] sm:min-h-[780px] bg-[#F8FAF8] rounded-[24px] sm:rounded-[28px] shadow-2xl overflow-hidden border border-[#E0E4E0] flex flex-col text-[#1B1C17]">
            {children}
          </div>
        )}
      </main>

      {/* Global Toast / Snackbar Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" dir="rtl">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2 transform transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-[#2E7D32] text-white border-[#1B5E20]'
                : toast.type === 'warning'
                ? 'bg-[#827717] text-white border-[#FFF9C4]'
                : toast.type === 'error'
                ? 'bg-[#C62828] text-white border-[#FFEBEE]'
                : 'bg-[#1B1C17] text-white border-[#5C615C]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FFF9C4] shrink-0" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
