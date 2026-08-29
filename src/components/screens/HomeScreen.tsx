import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  BookMarked, 
  Award, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowLeft, 
  ChevronLeft, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  PlayCircle,
  MessageCircle,
  PhoneCall,
  Flame,
  Check,
  X
} from 'lucide-react';
import { DAILY_HADITHS, getSurahByNumber } from '../../data/quranData';
import { GradeBadge, RatingStars } from '../common/RatingStars';
import { Student } from '../../types';

export const HomeScreen: React.FC = () => {
  const { 
    students, 
    isStudentsLoading,
    dailyRecords, 
    attendance, 
    setCurrentScreen, 
    setSelectedStudentForRecord,
    setSelectedStudentForDetail,
    setIsAddStudentModalOpen,
    getTodayRecordForStudent,
    getTodayAttendanceForStudent,
    setStudentAttendance,
    triggerCelebration,
    settings
  } = useApp();

  const [hadithIndex, setHadithIndex] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate daily stats
  const totalStudents = students.length;
  const todayRecords = dailyRecords.filter(r => r.date === todayStr);
  const todayAttendanceList = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendanceList.filter(a => a.status === 'حاضر').length;
  
  // Pending students for today
  const pendingStudents = students.filter(s => !getTodayRecordForStudent(s.id));
  const completedStudents = students.filter(s => !!getTodayRecordForStudent(s.id));

  // Top students (most completed juz or best status)
  const topStudents = [...students].sort((a, b) => b.completedJuz - a.completedJuz).slice(0, 3);

  const handleStartRecord = (student: Student) => {
    setSelectedStudentForRecord(student);
    setCurrentScreen('record');
  };

  const handleQuickPresent = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    setStudentAttendance(studentId, 'حاضر');
  };

  const handleQuickAbsent = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    setStudentAttendance(studentId, 'غائب');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 pb-20 max-w-2xl mx-auto w-full overflow-x-hidden" dir="rtl">
      
      {/* Daily Quranic Hadith Banner */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#2E7D32] text-white p-4 sm:p-5 shadow-sm border border-[#1B5E20]">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col">
          <div className="flex items-center justify-between text-xs text-[#E8F5E9] mb-2 font-medium">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#FFF9C4]" />
              حديث اليوم في فضل القرآن
            </span>
            <button
              onClick={() => setHadithIndex((hadithIndex + 1) % DAILY_HADITHS.length)}
              className="text-[11px] text-[#A5D6A7] hover:text-white underline decoration-dotted font-semibold"
            >
              حديث آخر
            </button>
          </div>
          <p className="font-['Amiri',serif] text-base sm:text-lg leading-relaxed text-[#FFF9C4] font-bold mb-2">
            "{DAILY_HADITHS[hadithIndex].text}"
          </p>
          <span className="text-[11px] text-[#A5D6A7] self-end font-medium">
            رواه: {DAILY_HADITHS[hadithIndex].narrator}
          </span>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C615C] text-xs font-semibold mb-1">
            <span>إجمالي الطلاب</span>
            <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-3xl font-black text-[#2E7D32] font-['Cairo',sans-serif]">
              {totalStudents}
            </span>
            <span className="text-xs text-[#5C615C]">طالباً</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-[#2E7D32] font-bold truncate">
            {students.filter(s => s.status === 'متميز').length} متميزون ⭐
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C615C] text-xs font-semibold mb-1">
            <span>حضور اليوم</span>
            <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-3xl font-black text-[#2E7D32] font-['Cairo',sans-serif]">
              {presentCount}
            </span>
            <span className="text-xs text-[#5C615C]">من {totalStudents}</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-[#2E7D32] font-bold truncate">
            نسبة {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C615C] text-xs font-semibold mb-1">
            <span>تم التسميع</span>
            <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-[#FFF9C4] text-[#827717] flex items-center justify-center">
              <BookMarked className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-3xl font-black text-[#1B1C17] font-['Cairo',sans-serif]">
              {todayRecords.length}
            </span>
            <span className="text-xs text-[#5C615C]">تسميعاً</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-[#827717] font-bold truncate">
            متبقي {pendingStudents.length} اليوم
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C615C] text-xs font-semibold mb-1">
            <span>أجزاء مكتملة</span>
            <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-3xl font-black text-[#2E7D32] font-['Cairo',sans-serif]">
              {students.reduce((sum, s) => sum + s.completedJuz, 0)}
            </span>
            <span className="text-xs text-[#5C615C]">جزءاً</span>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] text-[#2E7D32] font-bold truncate">
            مجموع الحلقة
          </div>
        </div>
      </div>

      {/* Action Shortcut Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            setSelectedStudentForRecord(null);
            setCurrentScreen('record');
          }}
          className="flex items-center gap-2 p-3 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-sm active:scale-98 transition-all justify-center"
        >
          <BookMarked className="w-4 h-4" />
          <span>تسميع جديد</span>
        </button>

        <button
          onClick={() => setIsAddStudentModalOpen(true)}
          className="flex items-center gap-2 p-3 rounded-2xl bg-white hover:bg-[#F1F5F1] border border-[#E0E4E0] text-[#1B1C17] font-bold text-xs shadow-xs active:scale-98 transition-all justify-center"
        >
          <Plus className="w-4 h-4 text-[#2E7D32]" />
          <span>إضافة طالب</span>
        </button>

        <button
          onClick={() => setCurrentScreen('students')}
          className="flex items-center gap-2 p-3 rounded-2xl bg-white hover:bg-[#F1F5F1] border border-[#E0E4E0] text-[#1B1C17] font-bold text-xs shadow-xs active:scale-98 transition-all justify-center"
        >
          <Users className="w-4 h-4 text-[#2E7D32]" />
          <span>قائمة الطلاب</span>
        </button>

        <button
          onClick={() => setCurrentScreen('reports')}
          className="flex items-center gap-2 p-3 rounded-2xl bg-white hover:bg-[#F1F5F1] border border-[#E0E4E0] text-[#1B1C17] font-bold text-xs shadow-xs active:scale-98 transition-all justify-center"
        >
          <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
          <span>التقرير الشهري</span>
        </button>
      </div>

      {/* Pending Students Section (Need Recording Today) */}
      <div className="bg-white rounded-[28px] p-5 border border-[#E0E4E0] shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse"></div>
            <h2 className="text-sm font-bold text-[#1B1C17] font-['Cairo',sans-serif]">
              طلاب بانتظار التسميع اليوم ({pendingStudents.length})
            </h2>
          </div>
          {pendingStudents.length > 0 && (
            <span className="text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full font-bold">
              يرجى رصد تسميعهم
            </span>
          )}
        </div>

        {isStudentsLoading ? (
          <div className="p-6 text-center text-[#2E7D32] bg-[#F8FAF8] rounded-2xl border border-[#E0E4E0]">
            <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold text-[#1B1C17]">جاري مزامنة بيانات الحلقة...</p>
          </div>
        ) : pendingStudents.length === 0 ? (
          <div className="p-6 text-center text-[#2E7D32] bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7]">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D32] mx-auto mb-1.5" />
            <p className="text-xs font-bold">ما شاء الله! اكتمل تسميع جميع طلاب الحلقة اليوم</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingStudents.map((student) => {
              const surah = getSurahByNumber(student.currentSurahNumber);
              const att = getTodayAttendanceForStudent(student.id);

              return (
                <div
                  key={student.id}
                  onClick={() => handleStartRecord(student)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#E8F5E9]/50 border border-[#E0E4E0] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-sm shrink-0 border border-[#A5D6A7]">
                      {student.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#1B1C17] truncate">
                          {student.name}
                        </h3>
                        {student.status === 'متميز' && (
                          <span className="text-[10px] text-amber-500">⭐</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C615C] truncate">
                        سورة {surah.name} • الآية {student.currentAyah} • {student.group}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Attendance Chips */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        title="تسجيل حاضر"
                        onClick={(e) => handleQuickPresent(e, student.id)}
                        className={`p-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          att?.status === 'حاضر'
                            ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                            : 'bg-white text-[#5C615C] hover:text-[#2E7D32] border-[#E0E4E0]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="تسجيل غائب"
                        onClick={(e) => handleQuickAbsent(e, student.id)}
                        className={`p-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          att?.status === 'غائب'
                            ? 'bg-[#C62828] text-white border-[#C62828]'
                            : 'bg-white text-[#5C615C] hover:text-[#C62828] border-[#E0E4E0]'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRecord(student);
                      }}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#2E7D32] group-hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>تسميع</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Today Sessions */}
      {todayRecords.length > 0 && (
        <div className="bg-white rounded-[28px] p-5 border border-[#E0E4E0] shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold text-[#1B1C17] font-['Cairo',sans-serif] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>سجلات التسميع المنجزة اليوم ({todayRecords.length})</span>
            </h2>
            <span className="text-[11px] text-[#2E7D32] font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-full">
              اليوم
            </span>
          </div>

          <div className="space-y-2">
            {todayRecords.map(rec => {
              const student = students.find(s => s.id === rec.studentId);
              const surah = getSurahByNumber(rec.surahNumber);
              if (!student) return null;

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedStudentForDetail(student)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs cursor-pointer hover:bg-[#E8F5E9]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {student.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#1B1C17] truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-[#5C615C]">
                        {rec.type} • سورة {surah.name} ({rec.fromAyah} - {rec.toAyah})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <GradeBadge grade={rec.grade} />
                    <RatingStars grade={rec.grade} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Honor Board / Top Students */}
      <div className="bg-gradient-to-br from-[#FFF9C4]/40 via-[#E8F5E9]/50 to-white rounded-[28px] p-5 border border-[#FFF59D] shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5 text-[#1B1C17] font-bold text-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="font-['Cairo',sans-serif]">لوحة الشرف والمتميزين</h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF9C4] text-[#827717] border border-[#FFF59D]">
            أعلى إنجاز في الحفظ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {topStudents.map((std, idx) => (
            <div
              key={std.id}
              onClick={() => setSelectedStudentForDetail(std)}
              className="p-3.5 rounded-2xl bg-white border border-[#E0E4E0] shadow-xs flex items-center gap-3 cursor-pointer hover:border-[#2E7D32] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-[#1B1C17] truncate">
                  {std.name}
                </div>
                <div className="text-[10px] text-[#2E7D32] font-semibold">
                  أتم {std.completedJuz} جزءاً • {std.group}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
