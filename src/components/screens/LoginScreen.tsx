import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  ArrowLeft,
  Sparkles,
  Building2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Info
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithEmail, authError, setAuthError, isAuthLoading, settings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white min-h-[600px] relative overflow-hidden overflow-x-hidden" dir="rtl">
      
      {/* Background Decorative Geometry Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#A5D6A7_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Top Header & App Branding */}
      <div className="flex flex-col items-center text-center mt-4 sm:mt-6 z-10">
        <div className="relative mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg ring-4 ring-white/10">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8E6C9] drop-shadow-sm" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#827717] border-2 border-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Cairo',sans-serif] tracking-tight">
          إدارة حلقة التحفيظ
        </h1>
        <p className="text-xs text-[#E8F5E9] mt-1 max-w-xs leading-relaxed font-medium truncate">
          {settings.circleName || 'حلقة الإمام الشاطبي لتحفيظ القرآن الكريم'}
        </p>
        <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-black/20 border border-white/15 text-[10px] sm:text-[11px] text-[#C8E6C9] max-w-full">
          <Building2 className="w-3.5 h-3.5 text-[#A5D6A7] shrink-0" />
          <span className="truncate">{settings.mosqueName || 'جامع الهدى الكبير'} - {settings.city || 'الرياض'}</span>
        </div>
      </div>

      {/* Firebase Auth Login Card */}
      <div className="w-full max-w-sm mx-auto bg-white text-[#1B1C17] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xl border border-[#E0E4E0] z-10 mt-4 sm:mt-6">
        
        <div className="text-center mb-5">
          <h2 className="text-base font-bold text-[#1B5E20] font-['Cairo',sans-serif]">
            تسجيل دخول المعلم والمشرف
          </h2>
          <p className="text-xs text-[#5C615C] mt-0.5 font-medium">
            سجل دخولك بواسطة البريد الإلكتروني المعتمد في Firebase
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
            <div className="flex-1 leading-relaxed">
              {authError}
            </div>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1B1C17] mb-1.5 font-['Cairo',sans-serif]">
              البريد الإلكتروني للمعلم
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError(null);
                }}
                placeholder="teacher@halaqah.org"
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-[#1B1C17] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] font-sans"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-[#5C615C] absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B1C17] mb-1.5 font-['Cairo',sans-serif]">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-[#1B1C17] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] font-mono tracking-wider"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-[#5C615C] absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isAuthLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 font-['Cairo',sans-serif] disabled:opacity-60 disabled:pointer-events-none mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول للنظام</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-4 pt-3.5 border-t border-[#E0E4E0] flex items-start gap-2 text-[11px] text-[#5C615C] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
          <span>
            يتم إنشاء حسابات المعلمين وإدارتها من خلال لوحة تحكم Firebase Console لضمان أمان بيانات الحلقة وخصوصية الطلاب.
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-[#C8E6C9] mt-4 z-10 font-medium">
        <p>تطبيق إدارة حلقات تحفيظ القرآن الكريم • متصل بقاعدة بيانات Firebase</p>
        <p className="opacity-80 mt-0.5">مزامنة سحابية متقدمة مع دعم العمل بدون اتصال</p>
      </div>
    </div>
  );
};
