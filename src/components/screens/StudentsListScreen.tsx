import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  MessageCircle, 
  BookMarked, 
  Edit3, 
  Trash2, 
  UserPlus, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getSurahByNumber } from '../../data/quranData';
import { Student } from '../../types';

export const StudentsListScreen: React.FC = () => {
  const { 
    students, 
    isStudentsLoading,
    setCurrentScreen, 
    setSelectedStudentForRecord,
    setSelectedStudentForDetail,
    setEditingStudent,
    setIsAddStudentModalOpen,
    deleteStudent,
    getTodayRecordForStudent,
    getTodayAttendanceForStudent,
    settings
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('الكل');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('الكل');

  const groups = [
    'الكل',
    'المستوى الأول (جزء عم)',
    'المستوى الثاني (جزء تبارك)',
    'المستوى المتوسط',
    'المستوى المتقدم',
    'حفظة القرآن كاملاً'
  ];

  const statuses = ['الكل', 'متميز', 'نشط', 'متعثر', 'منقطع'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.parentPhone.includes(searchQuery);
    const matchesGroup = selectedGroupFilter === 'الكل' || student.group === selectedGroupFilter;
    const matchesStatus = selectedStatusFilter === 'الكل' || student.status === selectedStatusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const handleStartRecord = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setSelectedStudentForRecord(student);
    setCurrentScreen('record');
  };

  const handleEditStudent = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setEditingStudent(student);
    setIsAddStudentModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    if (confirm(`هل أنت متأكد من رغبتك في حذف بيانات الطالب "${student.name}"؟`)) {
      deleteStudent(student.id);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const surah = getSurahByNumber(student.currentSurahNumber);
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب المحترم: ${student.name}\nنحيطكم علماً بأن الطالب يتابع الحفظ في سورة ${surah.name}، وأتم بفضل الله ${student.completedJuz} جزءاً.\nمع تحيات: ${settings.circleName}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 pb-24 max-w-2xl mx-auto w-full relative overflow-x-hidden" dir="rtl">
      
      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الطالب أو رقم الهاتف..."
          className="w-full pl-4 pr-11 py-3 sm:py-3.5 rounded-2xl bg-white border border-[#E0E4E0] text-[#1B1C17] placeholder-[#5C615C] text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] font-medium transition-all"
        />
        <Search className="w-4 h-4 text-[#2E7D32] absolute right-4 top-3.5" />
      </div>

      {/* Filter Horizontal Scrolling Chips */}
      <div className="flex flex-col gap-2 max-w-full overflow-hidden">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs max-w-full">
          <span className="text-[#5C615C] text-[11px] shrink-0 font-bold ml-1">الحالة:</span>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-all ${
                selectedStatusFilter === st
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'bg-white text-[#5C615C] border border-[#E0E4E0] hover:bg-[#F1F5F1]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs max-w-full">
          <span className="text-[#5C615C] text-[11px] shrink-0 font-bold ml-1">المستوى:</span>
          {groups.map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedGroupFilter(grp)}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all ${
                selectedGroupFilter === grp
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white text-[#5C615C] border border-[#E0E4E0] hover:bg-[#F1F5F1]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Students Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#5C615C] px-1 font-medium">
        <span>عرض {filteredStudents.length} من {students.length} طالباً</span>
        <button
          onClick={() => {
            setEditingStudent(null);
            setIsAddStudentModalOpen(true);
          }}
          className="text-[#2E7D32] font-bold hover:underline flex items-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Students List */}
      {isStudentsLoading ? (
        <div className="bg-white rounded-[28px] p-8 text-center border border-[#E0E4E0] shadow-sm">
          <div className="w-8 h-8 border-3 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h3 className="text-sm font-bold text-[#1B1C17]">جاري تحميل بيانات الطلاب من السحابة...</h3>
          <p className="text-xs text-[#5C615C] mt-1">يتم جلب أحدث بيانات الطلاب وقوائم التسميع</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-[28px] p-8 text-center border border-[#E0E4E0] shadow-sm">
          <BookOpen className="w-12 h-12 text-[#2E7D32]/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#1B1C17]">لا يوجد طلاب مطابقون للبحث</h3>
          <p className="text-xs text-[#5C615C] mt-1">
            جرب تعديل كلمات البحث أو الفلاتر أعلاه
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const surah = getSurahByNumber(student.currentSurahNumber);
            const todayRec = getTodayRecordForStudent(student.id);

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudentForDetail(student)}
                className="bg-white hover:bg-[#F8FAF8] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-4.5 border border-[#E0E4E0] shadow-sm transition-all cursor-pointer group"
              >
                {/* Top Row: Avatar + Info + Today Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-sm sm:text-base border border-[#A5D6A7] shrink-0 shadow-xs">
                      {student.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-[#1B1C17] truncate font-['Cairo',sans-serif]">
                          {student.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                          student.status === 'متميز'
                            ? 'bg-[#FFF9C4] text-[#827717] border border-[#FFF59D]'
                            : student.status === 'متعثر'
                            ? 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                            : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                        }`}>
                          {student.status}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[#5C615C] mt-0.5 truncate">
                        {student.group} • العمر: {student.age} سنة
                      </p>
                    </div>
                  </div>

                  {/* Today Badge */}
                  <div className="shrink-0">
                    {todayRec ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] shadow-xs">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2E7D32]" />
                        <span>تم التسميع: {todayRec.grade}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FFF9C4] text-[#827717] border border-[#FFF59D]">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#827717]" />
                        <span>بانتظار التسميع</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Visualizer Bar */}
                <div className="mt-3 p-2.5 sm:p-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-0.5 mb-1.5">
                    <span className="text-[#1B1C17] truncate text-[11px] sm:text-xs">
                      موضع الحفظ: <strong className="text-[#2E7D32]">سورة {surah.name} (آية {student.currentAyah})</strong>
                    </span>
                    <span className="text-[#5C615C] text-[10px] sm:text-[11px] shrink-0">
                      أتم {student.completedJuz} / 30 جزءاً
                    </span>
                  </div>

                  {/* 30 Juz Progress Bar */}
                  <div className="w-full h-2 bg-[#E0E4E0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (student.completedJuz / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-3 pt-2.5 border-t border-[#E0E4E0] flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={(e) => handleWhatsApp(e, student)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="مراسلة ولي الأمر عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                      <span className="hidden sm:inline">واتساب</span>
                    </button>

                    <button
                      onClick={(e) => handleEditStudent(e, student)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#F8FAF8] hover:bg-[#F1F5F1] text-[#5C615C] border border-[#E0E4E0] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="تعديل بيانات الطالب"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, student)}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#FFCDD2] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="حذف الطالب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleStartRecord(e, student)}
                    className="py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>تسجيل تسميع</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) for Adding Student */}
      <button
        onClick={() => {
          setEditingStudent(null);
          setIsAddStudentModalOpen(true);
        }}
        className="fixed bottom-20 left-4 sm:left-6 z-40 p-3.5 sm:p-4 rounded-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-xl shadow-[#2E7D32]/30 flex items-center gap-2 font-bold text-xs transition-all active:scale-95 group"
        aria-label="إضافة طالب جديد"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-['Cairo',sans-serif]">إضافة طالب</span>
      </button>

    </div>
  );
};
