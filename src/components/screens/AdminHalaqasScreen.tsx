import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Halaqa, TeacherProfile } from '../../types';
import { 
  Building2, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Users, 
  BookMarked, 
  ShieldCheck, 
  RotateCw, 
  AlertTriangle, 
  Play, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  UserCheck, 
  ArrowRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export const AdminHalaqasScreen: React.FC = () => {
  const {
    halaqas,
    selectedHalaqaId,
    setSelectedHalaqaId,
    createHalaqa,
    updateHalaqa,
    toggleHalaqaStatus,
    teachersList,
    assignTeacherHalaqas,
    allStudents,
    allDailyRecords,
    teacher,
    isAdmin,
    setCurrentScreen,
    migrationStatus,
    runManualMigration,
    showToast
  } = useApp();

  // Tab State: 'halaqas' | 'teachers' | 'migration'
  const [activeTab, setActiveTab] = useState<'halaqas' | 'teachers' | 'migration'>('halaqas');
  
  // Halaqa Modal State
  const [isHalaqaModalOpen, setIsHalaqaModalOpen] = useState(false);
  const [editingHalaqa, setEditingHalaqa] = useState<Halaqa | null>(null);
  const [halaqaForm, setHalaqaForm] = useState({
    name: '',
    mosqueName: '',
    city: '',
    description: '',
    isActive: true
  });
  const [isSubmittingHalaqa, setIsSubmittingHalaqa] = useState(false);

  // Teacher Assignment Modal State
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<TeacherProfile | null>(null);
  const [assignedHalaqaIds, setAssignedHalaqaIds] = useState<string[]>([]);
  const [defaultHalaqaId, setDefaultHalaqaId] = useState<string>('');
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  // Search filter for halaqas
  const [searchQuery, setSearchQuery] = useState('');

  // Handle open add halaqa
  const handleOpenAddHalaqa = () => {
    setEditingHalaqa(null);
    setHalaqaForm({
      name: '',
      mosqueName: teacher.mosqueName || 'جامع الهدى الكبير',
      city: teacher.city || 'الرياض',
      description: '',
      isActive: true
    });
    setIsHalaqaModalOpen(true);
  };

  // Handle open edit halaqa
  const handleOpenEditHalaqa = (h: Halaqa) => {
    setEditingHalaqa(h);
    setHalaqaForm({
      name: h.name,
      mosqueName: h.mosqueName,
      city: h.city,
      description: h.description || '',
      isActive: h.isActive !== false
    });
    setIsHalaqaModalOpen(true);
  };

  // Submit Halaqa Form
  const handleSubmitHalaqa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!halaqaForm.name.trim()) {
      showToast('يرجى كتابة اسم الحلقة', 'error');
      return;
    }

    setIsSubmittingHalaqa(true);
    try {
      if (editingHalaqa) {
        await updateHalaqa(editingHalaqa.id, {
          name: halaqaForm.name.trim(),
          mosqueName: halaqaForm.mosqueName.trim(),
          city: halaqaForm.city.trim(),
          description: halaqaForm.description.trim(),
          isActive: halaqaForm.isActive
        });
      } else {
        await createHalaqa({
          name: halaqaForm.name.trim(),
          mosqueName: halaqaForm.mosqueName.trim(),
          city: halaqaForm.city.trim(),
          description: halaqaForm.description.trim(),
          isActive: halaqaForm.isActive
        });
      }
      setIsHalaqaModalOpen(false);
    } finally {
      setIsSubmittingHalaqa(false);
    }
  };

  // Open Teacher Assignment
  const handleOpenAssignTeacher = (t: TeacherProfile) => {
    setSelectedTeacherForAssign(t);
    setAssignedHalaqaIds(t.halaqaIds || []);
    setDefaultHalaqaId(t.defaultHalaqaId || t.halaqaIds?.[0] || '');
  };

  // Save Teacher Assignment
  const handleSaveTeacherAssignment = async () => {
    if (!selectedTeacherForAssign) return;
    if (assignedHalaqaIds.length === 0) {
      showToast('يرجى تعيين حلقة واحدة على الأقل للمعلم', 'warning');
      return;
    }

    const resolvedDefault = assignedHalaqaIds.includes(defaultHalaqaId) 
      ? defaultHalaqaId 
      : assignedHalaqaIds[0];

    setIsSavingTeacher(true);
    try {
      await assignTeacherHalaqas(selectedTeacherForAssign.id, assignedHalaqaIds, resolvedDefault);
      setSelectedTeacherForAssign(null);
    } finally {
      setIsSavingTeacher(false);
    }
  };

  // Toggle halaqa id in assigned list
  const toggleTeacherHalaqa = (id: string) => {
    setAssignedHalaqaIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      if (!updated.includes(defaultHalaqaId)) {
        setDefaultHalaqaId(updated[0] || '');
      }
      return updated;
    });
  };

  // Filter halaqas
  const filteredHalaqas = halaqas.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.mosqueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActiveHalaqas = halaqas.filter(h => h.isActive).length;

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-4 pb-24 max-w-4xl mx-auto w-full overflow-x-hidden" dir="rtl">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] flex items-center justify-center text-[#2E7D32] shadow-inner shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#1B1C17] font-['Cairo',sans-serif]">
                إدارة الحلقات القرآنية
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold border border-[#A5D6A7]">
                لوحة المشرف العام
              </span>
            </div>
            <p className="text-xs text-[#5C615C] mt-0.5">
              إدارة الحلقات، تعيين المعلمين، والترقية السحابية لقاعدة البيانات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddHalaqa}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حلقة جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E0E4E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5C615C] text-[11px] mb-1">
            <span>إجمالي الحلقات</span>
            <Building2 className="w-3.5 h-3.5 text-[#2E7D32]" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#1B1C17] font-mono">{halaqas.length}</p>
          <span className="text-[10px] text-[#2E7D32] font-medium">{totalActiveHalaqas} حلقة نشطة</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E0E4E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5C615C] text-[11px] mb-1">
            <span>إجمالي الطلاب</span>
            <Users className="w-3.5 h-3.5 text-[#0277BD]" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#1B1C17] font-mono">{allStudents.length}</p>
          <span className="text-[10px] text-[#0277BD] font-medium">عبر جميع الحلقات</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E0E4E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5C615C] text-[11px] mb-1">
            <span>سجلات التسميع</span>
            <BookMarked className="w-3.5 h-3.5 text-[#E65100]" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#1B1C17] font-mono">{allDailyRecords.length}</p>
          <span className="text-[10px] text-[#E65100] font-medium">سجل تسميع موثق</span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E0E4E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5C615C] text-[11px] mb-1">
            <span>المعلمون المسجلون</span>
            <UserCheck className="w-3.5 h-3.5 text-[#6A1B9A]" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#1B1C17] font-mono">{teachersList.length || 1}</p>
          <span className="text-[10px] text-[#6A1B9A] font-medium">محفّظ ومشرف</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center bg-[#F1F5F1] p-1 rounded-2xl border border-[#E0E4E0]">
        <button
          onClick={() => setActiveTab('halaqas')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'halaqas'
              ? 'bg-white text-[#2E7D32] shadow-xs'
              : 'text-[#5C615C] hover:text-[#1B1C17]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>قائمة الحلقات ({halaqas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'teachers'
              ? 'bg-white text-[#2E7D32] shadow-xs'
              : 'text-[#5C615C] hover:text-[#1B1C17]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>تعيينات المعلمين</span>
        </button>

        <button
          onClick={() => setActiveTab('migration')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'migration'
              ? 'bg-white text-[#2E7D32] shadow-xs'
              : 'text-[#5C615C] hover:text-[#1B1C17]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>ترقية البيانات السحابية</span>
        </button>
      </div>

      {/* Tab 1: Halaqas List */}
      {activeTab === 'halaqas' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="البحث باسم الحلقة، المسجد، أو المدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white rounded-2xl border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
            <Search className="w-4 h-4 text-[#5C615C] absolute right-3.5 top-3" />
          </div>

          {/* Halaqas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredHalaqas.map((h) => {
              const isSelected = selectedHalaqaId === h.id;
              return (
                <div
                  key={h.id}
                  className={`bg-white rounded-[24px] p-4 border transition-all shadow-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 bg-[#F8FAF8]'
                      : 'border-[#E0E4E0] hover:border-[#A5D6A7]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          h.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#EEEEEE] text-[#757575]'
                        }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#1B1C17] leading-tight">
                            {h.name}
                          </h3>
                          <p className="text-[11px] text-[#5C615C] mt-0.5">
                            {h.mosqueName} • {h.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {h.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold border border-[#A5D6A7]">
                            نشطة
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#C62828] text-[10px] font-bold border border-[#FFCDD2]">
                            معطلة
                          </span>
                        )}
                      </div>
                    </div>

                    {h.description && (
                      <p className="text-[11px] text-[#5C615C] bg-[#F8FAF8] p-2 rounded-xl mb-3 leading-relaxed">
                        {h.description}
                      </p>
                    )}

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 my-2.5">
                      <div className="bg-[#F1F5F1] p-2 rounded-xl text-center">
                        <span className="text-[10px] text-[#5C615C] block">الطلاب</span>
                        <span className="text-xs font-bold text-[#1B1C17] font-mono">{h.studentsCount || 0}</span>
                      </div>
                      <div className="bg-[#F1F5F1] p-2 rounded-xl text-center">
                        <span className="text-[10px] text-[#5C615C] block">سجلات التسميع</span>
                        <span className="text-xs font-bold text-[#1B1C17] font-mono">{h.recordsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#F1F5F1] flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditHalaqa(h)}
                        className="p-2 rounded-xl bg-[#F1F5F1] hover:bg-[#E0E4E0] text-[#1B1C17] text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="تعديل بيانات الحلقة"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => toggleHalaqaStatus(h.id, !h.isActive)}
                        className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          h.isActive 
                            ? 'bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]' 
                            : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'
                        }`}
                        title={h.isActive ? 'تعطيل الحلقة' : 'تفعيل الحلقة'}
                      >
                        {h.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{h.isActive ? 'تعطيل' : 'تفعيل'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedHalaqaId(h.id);
                        showToast(`تم التبديل إلى "${h.name}" بنجاح`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#2E7D32] text-white shadow-xs'
                          : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isSelected ? 'الحلقة المحددة حالياً' : 'تحديد والعمل عليها'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Teachers Assignments */}
      {activeTab === 'teachers' && (
        <div className="space-y-3">
          <div className="bg-[#E8F5E9]/60 p-3.5 rounded-2xl border border-[#A5D6A7] text-xs text-[#1B5E20] flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
            <p className="leading-relaxed">
              يمكنك تخصيص وتعيين الحلقات المتاحة لكل معلم، وتحديد الحلقة الافتراضية التي تفتح تلقائياً عند دخوله للنظام.
            </p>
          </div>

          <div className="space-y-2.5">
            {teachersList.map((t) => {
              const assignedCount = t.halaqaIds?.length || 0;
              const defaultHalaqaObj = halaqas.find(h => h.id === t.defaultHalaqaId);

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-[24px] p-4 border border-[#E0E4E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F1F5F1] flex items-center justify-center font-bold text-xs text-[#2E7D32]">
                      {t.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1B1C17]">{t.name}</h4>
                        {t.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FFF9C4] text-[#827717] text-[10px] font-bold border border-[#FFF59D]">
                            مشرف نظام
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C615C] mt-0.5">
                        {t.email} • {t.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F1]">
                    <div className="text-right">
                      <span className="text-[10px] text-[#5C615C] block">الحلقات المخصصة:</span>
                      <span className="text-xs font-bold text-[#2E7D32]">
                        {assignedCount > 0 ? `${assignedCount} حلقات` : 'غير معين'}
                      </span>
                      {defaultHalaqaObj && (
                        <span className="text-[10px] text-[#5C615C] block">
                          الافتراضية: {defaultHalaqaObj.name}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAssignTeacher(t)}
                      className="px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>تعديل الصلاحيات</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {teachersList.length === 0 && (
              <div className="bg-white rounded-[24px] p-6 text-center border border-[#E0E4E0] text-xs text-[#5C615C]">
                <Users className="w-8 h-8 mx-auto text-[#A5D6A7] mb-2" />
                <p className="font-bold text-[#1B1C17]">جاري تحميل بيانات المعلمين من السحابة...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Cloud Database Migration Engine */}
      {activeTab === 'migration' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-center text-[#E65100]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1B1C17] font-['Cairo',sans-serif]">
                    أداة ترقية ومزامنة قاعدة البيانات السحابية
                  </h3>
                  <p className="text-[11px] text-[#5C615C] mt-0.5">
                    ربط الطلاب والسجلات القديمة بالحلقات الجديدة بأمان تام ودون تكرار أو حذف
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في بدء تدقيق وترقية قاعدة البيانات السحابية؟ العملية آمنة تماماً.')) {
                    runManualMigration();
                  }
                }}
                disabled={migrationStatus.isRunning}
                className="px-4 py-2.5 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-[#A5D6A7] text-white text-xs font-bold shadow-xs flex items-center gap-2 active:scale-98 transition-all"
              >
                {migrationStatus.isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الترقية...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>بدء الترقية الآن</span>
                  </>
                )}
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B1C17]">
                <span>حالة تقدم الترقية:</span>
                <span className="font-mono text-[#2E7D32]">{migrationStatus.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F1] rounded-full overflow-hidden border border-[#E0E4E0]">
                <div 
                  className="h-full bg-[#2E7D32] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${migrationStatus.progress}%` }}
                />
              </div>
            </div>

            {/* Summary Box if completed */}
            {migrationStatus.summary && (
              <div className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center animate-in fade-in">
                <div>
                  <span className="text-[10px] text-[#2E7D32] font-medium block">حلقات أُنشئت</span>
                  <span className="text-sm font-bold text-[#1B5E20] font-mono">{migrationStatus.summary.halaqasCreated}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#2E7D32] font-medium block">طلاب حُدثوا</span>
                  <span className="text-sm font-bold text-[#1B5E20] font-mono">{migrationStatus.summary.studentsUpdated}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#2E7D32] font-medium block">سجلات رُبطت</span>
                  <span className="text-sm font-bold text-[#1B5E20] font-mono">{migrationStatus.summary.recordsUpdated}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#2E7D32] font-medium block">معلمون حُدثوا</span>
                  <span className="text-sm font-bold text-[#1B5E20] font-mono">{migrationStatus.summary.teachersUpdated}</span>
                </div>
              </div>
            )}

            {/* Real-time Logs Console */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#5C615C]">سجل العمليات المباشر (Audit Log):</h4>
              <div className="bg-[#1B1C17] text-[#E8F5E9] p-3.5 rounded-2xl text-[11px] font-mono space-y-1.5 max-h-56 overflow-y-auto leading-relaxed border border-black/20">
                {migrationStatus.logs.length === 0 ? (
                  <p className="text-[#A5D6A7]/60">جاهز لبدء الترقية اليدوية عند الضغط على الزر أعلاه...</p>
                ) : (
                  migrationStatus.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#A5D6A7] shrink-0">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'success' ? 'text-[#8EF7BE] font-bold' :
                        log.type === 'warning' ? 'text-[#FFE082]' :
                        log.type === 'error' ? 'text-[#FF8A80] font-bold' : 'text-[#E8F5E9]'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Firestore Rules Quick Guide */}
            <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                  <h4 className="text-xs font-bold text-[#1B1C17]">قواعد أمان Firebase Firestore الموصى بها</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isValidId(id) { return id is string && id.size() > 0 && id.size() <= 128; }
    match /{document=**} { allow read, write: if false; }
    match /halaqas/{halaqaId} { allow read, write: if isSignedIn(); }
    match /teachers/{teacherId} { allow read, write: if isSignedIn(); }
    match /students/{studentId} { allow read, write: if isSignedIn(); }
    match /memorization_records/{recordId} { allow read, write: if isSignedIn(); }
    match /settings/{settingId} { allow read, write: if isSignedIn(); }
  }
}`;
                    navigator.clipboard.writeText(rules);
                    showToast('تم نسخ قواعد الحماية لـ Firebase Console بنجاح 📋');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#C8E6C9] rounded-lg transition-colors flex items-center gap-1"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>نسخ القواعد</span>
                </button>
              </div>
              <p className="text-[11px] text-[#5C615C] leading-relaxed">
                في حال ظهور رسالة نقص في الصلاحيات في السحابة، يمكنك نسخ القواعد ولصقها في تبويب <strong>Firestore Database &gt; Rules</strong> في لوحة تحكم Firebase ونشرها بضغطة زر.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Create/Edit Halaqa Modal */}
      {isHalaqaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 border border-[#E0E4E0] shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F1] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="text-sm sm:text-base font-bold text-[#1B1C17] font-['Cairo',sans-serif]">
                  {editingHalaqa ? 'تعديل بيانات الحلقة' : 'إضافة حلقة جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setIsHalaqaModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F1F5F1] text-[#5C615C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHalaqa} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#5C615C] mb-1">اسم الحلقة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حلقة الإمام الشاطبي (المستوى المتقدم)"
                  value={halaqaForm.name}
                  onChange={(e) => setHalaqaForm({ ...halaqaForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C615C] mb-1">اسم المسجد / المركز *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: جامع الهدى الكبير"
                    value={halaqaForm.mosqueName}
                    onChange={(e) => setHalaqaForm({ ...halaqaForm, mosqueName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C615C] mb-1">المدينة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الرياض"
                    value={halaqaForm.city}
                    onChange={(e) => setHalaqaForm({ ...halaqaForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C615C] mb-1">وصف أو تخصص الحلقة</label>
                <textarea
                  rows={2}
                  placeholder="وصف موجز للمستوى أو الفئة العمرية المستهدفة..."
                  value={halaqaForm.description}
                  onChange={(e) => setHalaqaForm({ ...halaqaForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#F8FAF8] rounded-2xl border border-[#E0E4E0]">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={halaqaForm.isActive}
                  onChange={(e) => setHalaqaForm({ ...halaqaForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-[#1B1C17] cursor-pointer">
                  تفعيل الحلقة واستقبال الطلاب والتسميع اليومي
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F1]">
                <button
                  type="button"
                  onClick={() => setIsHalaqaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C615C] hover:bg-[#F1F5F1]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHalaqa}
                  className="px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmittingHalaqa ? 'جاري الحفظ...' : (editingHalaqa ? 'حفظ التعديلات' : 'إنشاء الحلقة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Teacher Modal */}
      {selectedTeacherForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 border border-[#E0E4E0] shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F1] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="text-sm sm:text-base font-bold text-[#1B1C17]">
                  تعيين الحلقات للمعلم: {selectedTeacherForAssign.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacherForAssign(null)}
                className="p-1.5 rounded-full hover:bg-[#F1F5F1] text-[#5C615C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#1B1C17]">
                حدد الحلقات المصرح للمعلم بالاطلاع عليها وإدارتها:
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {halaqas.map((h) => {
                  const isChecked = assignedHalaqaIds.includes(h.id);
                  const isDefault = defaultHalaqaId === h.id;

                  return (
                    <div
                      key={h.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isChecked ? 'bg-[#E8F5E9]/50 border-[#A5D6A7]' : 'bg-[#F8FAF8] border-[#E0E4E0]'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTeacherHalaqa(h.id)}
                          className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#1B1C17] block">{h.name}</span>
                          <span className="text-[10px] text-[#5C615C]">{h.mosqueName}</span>
                        </div>
                      </label>

                      {isChecked && (
                        <button
                          type="button"
                          onClick={() => setDefaultHalaqaId(h.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            isDefault
                              ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                              : 'bg-white text-[#5C615C] border-[#E0E4E0] hover:bg-[#F1F5F1]'
                          }`}
                        >
                          {isDefault ? 'الحلقة الافتراضية ★' : 'تعيين كافتراضية'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F1]">
              <button
                type="button"
                onClick={() => setSelectedTeacherForAssign(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C615C] hover:bg-[#F1F5F1]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherAssignment}
                disabled={isSavingTeacher}
                className="px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs transition-colors"
              >
                {isSavingTeacher ? 'جاري الحفظ...' : 'حفظ تعيينات المعلم'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
