import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  User, 
  MessageSquare, 
  Palette, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  LogOut, 
  Save, 
  Cloud,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { 
    teacher, 
    settings, 
    updateSettings, 
    resetAllData, 
    logout,
    exportBackupData,
    importBackupData,
    syncStatus,
    syncStatusLabel,
    currentUser,
    isAdmin,
    setCurrentScreen,
    showToast
  } = useApp();

  const [circleName, setCircleName] = useState(settings.circleName);
  const [mosqueName, setMosqueName] = useState(settings.mosqueName);
  const [city, setCity] = useState(settings.city);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState(settings.whatsAppTemplate);
  const [mushafType, setMushafType] = useState(settings.mushafType);
  const [themeMode, setThemeMode] = useState(settings.themeMode);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      circleName,
      mosqueName,
      city,
      whatsAppTemplate,
      mushafType,
      themeMode
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halaqah_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير نسخة احتياطية من بيانات الحلقة بنجاح 📁');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importBackupData(text);
        if (!result.success) {
          showToast(result.message, 'error');
        }
      } catch (err: any) {
        showToast('خطأ أثناء قراءة ملف النسخة الاحتياطية', 'error');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 pb-24 max-w-2xl mx-auto w-full overflow-x-hidden" dir="rtl">
      
      {/* Admin Halaqa Control Center Card */}
      {isAdmin && (
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#FFE082] bg-gradient-to-r from-[#FFFDE7]/80 to-[#FFF8E1]/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] flex items-center justify-center text-[#F57F17] shadow-inner">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1B1C17] font-['Cairo',sans-serif]">
                  لوحة تحكم المشرف العام (إدارة الحلقات)
                </h3>
                <p className="text-[11px] text-[#5C615C]">
                  إدارة وتعيين الحلقات المتعددة، المعلمين، وأداة الترقية السحابية
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('admin_halaqas')}
              className="px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs transition-all"
            >
              فتح لوحة الحلقات
            </button>
          </div>
        </div>
      )}

      {/* Cloud Account & Synchronization Status */}

      <div className="bg-[#E8F5E9]/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#A5D6A7] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1B5E20] font-['Cairo',sans-serif]">
              حالة الاتصال السحابي (Firebase)
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white text-[#1B5E20] font-bold text-[11px] border border-[#A5D6A7] flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{syncStatusLabel}</span>
          </span>
        </div>

        <div className="text-xs text-[#2E7D32] space-y-1">
          <p className="flex items-center gap-1 font-medium">
            <span>البريد الإلكتروني المعتمد:</span>
            <span className="font-mono font-bold text-[#1B1C17]" dir="ltr">{currentUser?.email || teacher.email || 'غير مسجل'}</span>
          </p>
          <p className="flex items-center gap-1 font-medium text-[11px] opacity-80">
            <span>معرف المعلم:</span>
            <span className="font-mono" dir="ltr">{currentUser?.uid || 'guest'}</span>
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-3.5 sm:space-y-4">
        
        {/* Circle & Mosque Details */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm space-y-3 sm:space-y-3.5">
          <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
            <Building2 className="w-4 h-4 text-[#2E7D32]" />
            <span>بيانات حلقة التحفيظ والمسجد</span>
          </h3>

          <div>
            <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
              اسم الحلقة
            </label>
            <input
              type="text"
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
                اسم المسجد / المركز القرآني
              </label>
              <input
                type="text"
                value={mosqueName}
                onChange={(e) => setMosqueName(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
                المدينة / المنطقة
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        {/* Mushaf & Appearance */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm space-y-3 sm:space-y-3.5">
          <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
            <Palette className="w-4 h-4 text-[#2E7D32]" />
            <span>المظهر والمصحف المعتمد</span>
          </h3>

          <div>
            <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
              نوع المصحف المعتمد في الحلقة
            </label>
            <select
              value={mushafType}
              onChange={(e) => setMushafType(e.target.value as typeof mushafType)}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <option value="مصحف المدينة (حفص عن عاصم)">مصحف مجمع الملك فهد (حفص عن عاصم)</option>
              <option value="مصحف التجويد الملون">مصحف التجويد الملون (أحكام ملونة)</option>
              <option value="مصحف الشمرلي">مصحف الشمرلي (15 سطراً)</option>
              <option value="مصحف قالون">مصحف برواية قالون عن نافع</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Message Template */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
            <MessageSquare className="w-4 h-4 text-[#2E7D32]" />
            <span>صيغة رسالة التسميع اليومية للواتساب</span>
          </h3>
          <textarea
            rows={4}
            value={whatsAppTemplate}
            onChange={(e) => setWhatsAppTemplate(e.target.value)}
            className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs text-[#1B1C17] leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
          ></textarea>
          <span className="text-[10px] text-[#5C615C] block">
            المتغيرات المتاحة: {'{student_name}'}، {'{new_surah}'}، {'{grade}'}، {'{attendance}'}
          </span>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all font-['Cairo',sans-serif]"
        >
          <Save className="w-4 h-4" />
          <span>حفظ جميع التغييرات في السحابة</span>
        </button>
      </form>

      {/* Data Backup & Maintenance */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm space-y-3 sm:space-y-3.5">
        <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
          <Database className="w-4 h-4 text-[#2E7D32]" />
          <span>إدارة البيانات والنسخ الاحتياطي السحابي</span>
        </h3>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExportBackup}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#E8F5E9]/50 border border-[#E0E4E0] text-xs font-bold text-[#1B1C17] flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#2E7D32]" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#E8F5E9]/50 border border-[#E0E4E0] text-xs font-bold text-[#1B1C17] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#2E7D32]" />
            <span>{isImporting ? 'جاري الاستيراد...' : 'استيراد نسخة (JSON)'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('هل تريد استعادة وتهيئة البيانات الافتراضية في قاعدة البيانات السحابية؟')) {
              resetAllData();
            }
          }}
          className="w-full p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#FFF9C4]/50 border border-[#E0E4E0] text-xs font-bold text-[#827717] flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>تهيئة البيانات التجريبية الأولية</span>
        </button>

        <button
          onClick={logout}
          className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#FFCDD2] text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>

    </div>
  );
};
