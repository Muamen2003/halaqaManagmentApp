import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const PwaReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('PWA Service Worker registered successfully:', registration);
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4" 
      dir="rtl"
    >
      <div className="bg-[#112015] text-white p-4 rounded-2xl border border-[#2E7D32]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B3224] border border-[#2E7D32] flex items-center justify-center text-white shrink-0 mt-0.5">
              {needRefresh ? (
                <RefreshCw className="w-4 h-4 text-[#A5D6A7] animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#66BB6A]" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold font-['Cairo',sans-serif] text-white">
                {needRefresh ? 'تحديث جديد متوفر للتطبيق' : 'التطبيق جاهز للعمل دون اتصال بالإنترنت'}
              </h4>
              <p className="text-xs text-[#A5D6A7] mt-1 leading-relaxed">
                {needRefresh
                  ? 'تم تنزيل إصدار أحدث من حلقة التحفيظ. يمكنك التحديث الآن لمتابعة الحفظ مع الحفاظ الكامل على كافة البيانات والعمليات غير المكتملة.'
                  : 'تم تخزين واجهة التطبيق محلياً لتتمكن من فتحه وتسجيل درجات الطلاب في أي وقت حتى بدون شبكة.'}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-[#A5D6A7] hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {needRefresh ? (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1B3224]">
            <button
              onClick={close}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#A5D6A7] hover:text-white hover:bg-white/5 transition-all"
            >
              لاحقاً
            </button>
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الآن</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={close}
              className="px-3.5 py-1 rounded-lg text-xs font-medium text-[#A5D6A7] hover:text-white"
            >
              حسناً
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
