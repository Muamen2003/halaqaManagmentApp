import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  ArrowRight, 
  Code2, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  Calendar,
  Cloud,
  CloudUpload,
  HardDrive,
  AlertTriangle,
  Building2,
  ChevronDown,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MaterialAppBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const MaterialAppBar: React.FC<MaterialAppBarProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions
}) => {
  const { 
    currentScreen, 
    setCurrentScreen, 
    previousScreen, 
    settings, 
    isCodeInspectorOpen, 
    setIsCodeInspectorOpen,
    deviceViewMode,
    setDeviceViewMode,
    students,
    getTodayRecordForStudent,
    syncStatus,
    syncStatusLabel,
    halaqas,
    selectedHalaqaId,
    selectedHalaqa,
    setSelectedHalaqaId,
    teacher,
    isAdmin,
    showToast
  } = useApp();

  const [isHalaqaDropdownOpen, setIsHalaqaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Filter available halaqas:
  // Admin users see all active halaqas
  // Regular teachers see only halaqas included in teacher.halaqaIds
  const availableHalaqas = halaqas.filter(h => {
    if (isAdmin) {
      return h.isActive !== false;
    }
    const assigned = teacher.halaqaIds || [];
    return assigned.includes(h.id) && h.isActive !== false;
  });

  // Calculate dropdown position anchored to button
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(280, Math.max(220, window.innerWidth - 24));
    
    // In RTL layout, align right edge of dropdown with right edge of button
    let left = rect.right - dropdownWidth;
    
    // Ensure dropdown stays inside viewport boundaries (min 12px from left, max 12px from right)
    if (left < 12) {
      left = 12;
    }
    if (left + dropdownWidth > window.innerWidth - 12) {
      left = window.innerWidth - dropdownWidth - 12;
    }

    const top = rect.bottom + 6;

    setDropdownPosition({
      top,
      left,
      width: dropdownWidth
    });
  }, []);

  // Handle outside click, escape key, and scroll/resize updates
  useEffect(() => {
    if (!isHalaqaDropdownOpen) return;

    updatePosition();

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        dropdownMenuRef.current && !dropdownMenuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsHalaqaDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHalaqaDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isHalaqaDropdownOpen, updatePosition]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentScreen(previousScreen === 'login' ? 'home' : previousScreen);
    }
  };

  const todayCompletedCount = students.filter(s => !!getTodayRecordForStudent(s.id)).length;
  const todayArabicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const screenTitles: Record<string, { title: string; subtitle?: string }> = {
    home: { 
      title: selectedHalaqa?.name || settings.circleName || 'إدارة حلقة التحفيظ', 
      subtitle: selectedHalaqa ? `${selectedHalaqa.mosqueName} • ${selectedHalaqa.city}` : settings.mosqueName 
    },
    students: { title: 'قائمة طلاب الحلقة', subtitle: `${students.length} طالباً مسجلاً` },
    record: { title: 'تسجيل التسميع اليومي', subtitle: 'متابعة الحفظ الجديد والمراجعة' },
    reports: { title: 'التقارير والإحصائيات', subtitle: 'أداء الطلاب والملخص الشهري' },
    settings: { title: 'إعدادات الحلقة', subtitle: 'بيانات الحلقة والتنبيهات والمظهر' },
    admin_halaqas: { title: 'إدارة الحلقات القرآنية', subtitle: 'لوحة تحكم المشرف العام والترقية السحابية' },
    login: { title: 'تسجيل الدخول', subtitle: 'حلقة تحفيظ القرآن الكريم' }
  };

  const isDetailScreen = currentScreen === 'admin_halaqas' || showBackButton;
  const displayTitle = title || screenTitles[currentScreen]?.title || 'إدارة حلقة التحفيظ';
  const displaySubtitle = subtitle || screenTitles[currentScreen]?.subtitle;

  // Sync icon and color badge
  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'pending':
        return (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#E65100] text-[10px] font-bold border border-[#FFE082]"
            title="جاري رفع التعديلات لقاعدة بيانات Firebase"
          >
            <CloudUpload className="w-3 h-3 animate-pulse" />
            <span className="truncate">{syncStatusLabel}</span>
          </span>
        );
      case 'local':
        return (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#0277BD] text-[10px] font-bold border border-[#81D4FA]"
            title="البيانات محفوظة محلياً في الذاكرة التخزينية"
          >
            <HardDrive className="w-3 h-3" />
            <span className="truncate">{syncStatusLabel}</span>
          </span>
        );
      case 'error':
        return (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#C62828] text-[10px] font-bold border border-[#FFCDD2]"
            title="تعذر الاتصال بـ Firebase"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="truncate">{syncStatusLabel}</span>
          </span>
        );
      case 'synced':
      default:
        return (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-bold border border-[#A5D6A7]"
            title="البيانات متزامنة بالكامل مع سحابة Firebase"
          >
            <Cloud className="w-3 h-3 text-[#2E7D32]" />
            <span className="truncate">{syncStatusLabel}</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#2E7D32] text-white shadow-md transition-all border-b border-[#1B5E20] w-full">
      {/* Top Utility Bar */}
      <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#1B5E20] flex items-center justify-between text-xs text-[#E8F5E9] border-b border-[#2E7D32]/40 w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          {renderSyncBadge()}
          <span className="opacity-40 shrink-0">•</span>
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#A5D6A7] truncate">
            <Calendar className="w-3 h-3 text-[#A5D6A7] shrink-0" />
            <span className="truncate">{todayArabicDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Admin link button if user is Admin */}
          {isAdmin && (
            <button
              onClick={() => setCurrentScreen(currentScreen === 'admin_halaqas' ? 'home' : 'admin_halaqas')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-colors shadow-xs ${
                currentScreen === 'admin_halaqas'
                  ? 'bg-[#FFF9C4] text-[#827717]'
                  : 'bg-[#1B5E20] text-[#E8F5E9] border border-[#A5D6A7]/40 hover:bg-[#2E7D32]'
              }`}
              title="إدارة الحلقات والمعلمين"
            >
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              <span>إدارة الحلقات</span>
            </button>
          )}

          {/* Kotlin Jetpack Compose Code Inspector Toggle */}
          <button
            onClick={() => setIsCodeInspectorOpen(!isCodeInspectorOpen)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[10px] sm:text-[11px] font-bold text-[#2E7D32] transition-colors shadow-xs"
            title="عرض كود Kotlin Jetpack Compose البرمجي"
          >
            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2E7D32]" />
            <span className="hidden xs:inline sm:inline">Compose</span>
          </button>

          {/* Toggle Mobile/Fullscreen Mode */}
          <button
            onClick={() => setDeviceViewMode(deviceViewMode === 'mobile' ? 'fullscreen' : 'mobile')}
            className="p-1 rounded-full hover:bg-[#2E7D32] text-[#A5D6A7] hover:text-white transition-colors"
            title={deviceViewMode === 'mobile' ? 'تكبير للشاشة الكاملة' : 'معاينة جهاز الجوال'}
          >
            {deviceViewMode === 'mobile' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Material 3 Top App Bar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isDetailScreen ? (
            <button
              onClick={handleBack}
              className="p-1.5 -mr-1 rounded-full hover:bg-[#1B5E20] active:bg-[#0E3D12] transition-colors text-white focus:outline-none shrink-0"
              aria-label="الرجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-[#1B5E20] border border-[#A5D6A7]/40 flex items-center justify-center text-white shadow-inner shrink-0">
              <BookOpen className="w-4 h-4 text-[#FFF9C4]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight truncate font-['Cairo',sans-serif]">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-[11px] sm:text-xs text-[#A5D6A7] truncate mt-0.5">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions & Halaqa Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Halaqa Dropdown Selector */}
          {currentScreen !== 'admin_halaqas' && (
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isHalaqaDropdownOpen}
                aria-controls="halaqa-dropdown-menu"
                aria-label="اختيار الحلقة القرآنية"
                onClick={() => {
                  updatePosition();
                  setIsHalaqaDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-1.5 bg-[#1B5E20] hover:bg-[#0E3D12] active:bg-[#082B0C] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[#A5D6A7]/40 shadow-xs transition-colors cursor-pointer"
                title="التبديل بين الحلقات القرآنية"
              >
                <Building2 className="w-3.5 h-3.5 text-[#FFF9C4]" />
                <span className="max-w-[90px] sm:max-w-[140px] truncate">
                  {selectedHalaqa?.name || 'اختر الحلقة'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#A5D6A7] transition-transform duration-200 ${isHalaqaDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {actions}

          {currentScreen === 'home' && (
            <div className="flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-[#A5D6A7] shadow-xs">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2E7D32]" />
              <span>{todayCompletedCount}/{students.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Render Halaqa Dropdown Menu via Portal to document.body */}
      {isHalaqaDropdownOpen && dropdownPosition && createPortal(
        <div
          id="halaqa-dropdown-menu"
          role="listbox"
          aria-label="قائمة الحلقات القرآنية المتاحة"
          ref={dropdownMenuRef}
          dir="rtl"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-2xl shadow-2xl border border-[#E0E4E0] py-2 text-right text-xs animate-in fade-in zoom-in-95 duration-150 font-['Cairo',sans-serif]"
        >
          <div className="px-3 py-1.5 border-b border-[#F1F5F1] text-[11px] font-bold text-[#5C615C] flex items-center justify-between">
            <span>الحلقات القرآنية المتاحة:</span>
            <span className="text-[10px] bg-[#F1F5F1] text-[#2E7D32] font-semibold px-2 py-0.5 rounded-full">
              {availableHalaqas.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-[#F8FAF8]">
            {availableHalaqas.length > 0 ? (
              availableHalaqas.map((h) => {
                const isSelected = selectedHalaqaId === h.id;
                return (
                  <button
                    key={h.id}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => {
                      setSelectedHalaqaId(h.id);
                      setIsHalaqaDropdownOpen(false);
                      showToast(`تم التبديل إلى ${h.name}`);
                    }}
                    className={`w-full px-3 py-2.5 text-right flex items-center justify-between gap-2 hover:bg-[#F1F5F1] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#E8F5E9] text-[#2E7D32] font-bold' : 'text-[#1B1C17]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{h.name}</span>
                      <span className="text-[10px] text-[#5C615C] block truncate mt-0.5">
                        {h.mosqueName} • {h.city}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-center text-xs">
                <Building2 className="w-6 h-6 text-[#A5D6A7] mx-auto mb-1.5 opacity-60" />
                <p className="font-bold text-[#1B1C17]">لا توجد حلقات متاحة</p>
                <p className="text-[10px] text-[#5C615C] mt-0.5">
                  {isAdmin ? 'يرجى إنشاء حلقة جديدة من لوحة التحكم' : 'لم يتم إسناد أي حلقة لهذا الحساب بعد'}
                </p>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="border-t border-[#F1F5F1] pt-1.5 px-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsHalaqaDropdownOpen(false);
                  setCurrentScreen('admin_halaqas');
                }}
                className="w-full py-2 px-2.5 rounded-xl text-center font-bold text-[11px] text-[#2E7D32] bg-[#E8F5E9]/60 hover:bg-[#E8F5E9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                <span>إدارة وإنشاء الحلقات...</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </header>
  );
};


