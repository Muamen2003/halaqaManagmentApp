import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Share2, 
  TrendingUp, 
  Users, 
  BookMarked, 
  Sparkles, 
  ChevronLeft,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { GradeBadge, RatingStars } from '../common/RatingStars';
import { getSurahByNumber } from '../../data/quranData';

export const MonthlyReportsScreen: React.FC = () => {
  const { students, dailyRecords, attendance, settings, setSelectedStudentForDetail } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('هذا الشهر');
  const [reportFilterGroup, setReportFilterGroup] = useState<string>('الكل');

  const months = ['هذا الشهر', 'الشهر السابق', 'الربع السنوي الأول'];

  // Overall computations
  const totalMemorizationSessions = dailyRecords.length;
  const newMemorizationCount = dailyRecords.filter(r => r.type === 'حفظ جديد').length;
  const reviewCount = dailyRecords.filter(r => r.type.includes('مراجعة')).length;

  const totalExcellent = dailyRecords.filter(r => r.grade === 'ممتاز').length;
  const totalVeryGood = dailyRecords.filter(r => r.grade === 'جيد جداً').length;
  const totalGood = dailyRecords.filter(r => r.grade === 'جيد').length;
  const totalNeedsReview = dailyRecords.filter(r => r.grade === 'إعادة' || r.grade === 'مقبول').length;

  const totalAttendances = attendance.length;
  const presentAttendances = attendance.filter(a => a.status === 'حاضر').length;
  const overallAttendancePercent = totalAttendances > 0 
    ? Math.round((presentAttendances / totalAttendances) * 100) 
    : 95;

  // Student monthly performance mapping
  const studentReports = students.map(student => {
    const sRecords = dailyRecords.filter(r => r.studentId === student.id);
    const sAttendance = attendance.filter(a => a.studentId === student.id);
    const sPresent = sAttendance.filter(a => a.status === 'حاضر').length;
    const attPercent = sAttendance.length > 0 ? Math.round((sPresent / sAttendance.length) * 100) : 100;
    
    // Total pages estimate
    const newPages = sRecords.filter(r => r.type === 'حفظ جديد').length * student.targetDailyPages;
    const excellentGrades = sRecords.filter(r => r.grade === 'ممتاز').length;
    const score = sRecords.length > 0 ? Math.round((excellentGrades / sRecords.length) * 100) : 85;

    return {
      student,
      sessionsCount: sRecords.length,
      estimatedPages: newPages,
      attendancePercent: attPercent,
      score,
      lastRecord: sRecords[0]
    };
  }).sort((a, b) => b.score - a.score || b.student.completedJuz - a.student.completedJuz);

  const studentOfTheMonth = studentReports[0]?.student;

  const handlePrint = () => {
    window.print();
  };

  const handleShareMonthlySummary = () => {
    const text = encodeURIComponent(
      `📊 *التقرير الشهري لحلقة التحفيظ*\n` +
      `🕌 ${settings.circleName} - ${settings.mosqueName}\n\n` +
      `• إجمالي الطلاب: ${students.length} طالباً\n` +
      `• جلسات التسميع المنجزة: ${totalMemorizationSessions} جلسة\n` +
      `• نسبة الحضور العامة: ${overallAttendancePercent}%\n` +
      (studentOfTheMonth ? `🌟 *نجم الشهر*: الطالب ${studentOfTheMonth.name} (${studentOfTheMonth.group})\n\n` : '') +
      `سائلين المولى عز وجل التوفيق والسداد لجميع أبنائنا الطلاب.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 pb-24 max-w-2xl mx-auto w-full overflow-x-hidden" dir="rtl">
      
      {/* Month Filter and Export Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E0E4E0] shadow-xs max-w-full overflow-x-auto no-scrollbar">
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                selectedMonth === m
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-[#5C615C] hover:text-[#2E7D32]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShareMonthlySummary}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            title="مشاركة التقرير عبر واتساب"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white border border-[#E0E4E0] text-[#1B1C17] text-xs font-semibold hover:bg-[#F1F5F1] transition-colors"
            title="طباعة التقرير الشهري"
          >
            <Printer className="w-4 h-4 text-[#2E7D32]" />
          </button>
        </div>
      </div>

      {/* Student of the Month Hero Card */}
      {studentOfTheMonth && (
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-l from-amber-600 via-amber-500 to-amber-700 text-white p-4 sm:p-5 shadow-sm border border-amber-400/40">
          <div className="absolute top-0 left-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner shrink-0">
                👑
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFF9C4]" />
                  <span className="text-[11px] sm:text-xs font-bold text-amber-100 font-['Cairo',sans-serif] truncate">نجم الحلقة لهذا الشهر</span>
                </div>
                <h3 className="text-sm sm:text-lg font-extrabold font-['Cairo',sans-serif] truncate text-white mt-0.5">
                  {studentOfTheMonth.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-amber-100 truncate mt-0.5">
                  {studentOfTheMonth.group} • أتم {studentOfTheMonth.completedJuz} جزءاً
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudentForDetail(studentOfTheMonth)}
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-xs shrink-0 hover:bg-amber-50 transition-colors"
            >
              عرض السجل
            </button>
          </div>
        </div>
      )}

      {/* Monthly KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm">
          <span className="text-[#5C615C] text-xs font-semibold block mb-1">جلسات التسميع</span>
          <span className="text-xl sm:text-3xl font-black text-[#2E7D32] font-['Cairo',sans-serif]">
            {totalMemorizationSessions}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#2E7D32] font-bold block mt-1 truncate">{newMemorizationCount} حفظ + {reviewCount} مراجعة</span>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm">
          <span className="text-[#5C615C] text-xs font-semibold block mb-1">نسبة الحضور</span>
          <span className="text-xl sm:text-3xl font-black text-[#2E7D32] font-['Cairo',sans-serif]">
            {overallAttendancePercent}%
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#2E7D32] font-bold block mt-1 truncate">انضباط متميز</span>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm">
          <span className="text-[#5C615C] text-xs font-semibold block mb-1">تقديرات ممتاز</span>
          <span className="text-xl sm:text-3xl font-black text-[#827717] font-['Cairo',sans-serif]">
            {totalExcellent}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#827717] font-bold block mt-1 truncate">
            {totalMemorizationSessions > 0 ? Math.round((totalExcellent / totalMemorizationSessions) * 100) : 0}% من الجلسات
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white border border-[#E0E4E0] shadow-sm">
          <span className="text-[#5C615C] text-xs font-semibold block mb-1">الأجزاء المراجعة</span>
          <span className="text-xl sm:text-3xl font-black text-[#1B1C17] font-['Cairo',sans-serif]">
            {students.reduce((acc, s) => acc + s.completedJuz, 0)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#5C615C] font-semibold block mt-1 truncate">جزءاً في الحلقة</span>
        </div>
      </div>

      {/* Grade Distribution Bar Visualizer */}
      <div className="p-5 rounded-[28px] bg-white border border-[#E0E4E0] shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-[#1B1C17] flex items-center justify-between font-['Cairo',sans-serif]">
          <span>توزيع مستويات الإتقان والتجويد للشهر</span>
          <span className="text-[11px] font-normal text-[#5C615C]">إجمالي {totalMemorizationSessions} جلسة</span>
        </h3>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3.5 bg-[#E0E4E0] rounded-full overflow-hidden flex" dir="ltr">
          <div
            style={{ width: `${totalMemorizationSessions > 0 ? (totalExcellent / totalMemorizationSessions) * 100 : 60}%` }}
            className="bg-[#2E7D32] h-full"
            title={`ممتاز: ${totalExcellent}`}
          ></div>
          <div
            style={{ width: `${totalMemorizationSessions > 0 ? (totalVeryGood / totalMemorizationSessions) * 100 : 25}%` }}
            className="bg-[#00695C] h-full"
            title={`جيد جدا: ${totalVeryGood}`}
          ></div>
          <div
            style={{ width: `${totalMemorizationSessions > 0 ? (totalGood / totalMemorizationSessions) * 100 : 10}%` }}
            className="bg-[#0284c7] h-full"
            title={`جيد: ${totalGood}`}
          ></div>
          <div
            style={{ width: `${totalMemorizationSessions > 0 ? (totalNeedsReview / totalMemorizationSessions) * 100 : 5}%` }}
            className="bg-[#C62828] h-full"
            title={`إعادة: ${totalNeedsReview}`}
          ></div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] shrink-0"></span>
            <span className="text-[#5C615C]">ممتاز: <strong className="text-[#1B1C17]">{totalExcellent}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00695C] shrink-0"></span>
            <span className="text-[#5C615C]">جيد جداً: <strong className="text-[#1B1C17]">{totalVeryGood}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shrink-0"></span>
            <span className="text-[#5C615C]">جيد: <strong className="text-[#1B1C17]">{totalGood}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] shrink-0"></span>
            <span className="text-[#5C615C]">إعادة: <strong className="text-[#1B1C17]">{totalNeedsReview}</strong></span>
          </div>
        </div>
      </div>

      {/* Student Ranking Table / List */}
      <div className="bg-white rounded-[28px] p-5 border border-[#E0E4E0] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
            <Users className="w-4 h-4 text-[#2E7D32]" />
            <span>جدول تقييم أداء طلاب الحلقة</span>
          </h3>
          <span className="text-[11px] text-[#5C615C] font-semibold">مرتب حسب أعلى تفوق</span>
        </div>

        <div className="space-y-2.5">
          {studentReports.map((item, index) => {
            const surah = getSurahByNumber(item.student.currentSurahNumber);
            return (
              <div
                key={item.student.id}
                onClick={() => setSelectedStudentForDetail(item.student)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#E8F5E9]/50 border border-[#E0E4E0] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] flex items-center justify-center font-extrabold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#1B1C17] truncate">
                        {item.student.name}
                      </h4>
                      {index < 3 && <span className="text-[10px]">⭐</span>}
                    </div>
                    <p className="text-[11px] text-[#5C615C] truncate">
                      سورة {surah.name} • أتم {item.student.completedJuz} جزءاً • {item.student.group}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-left" dir="ltr">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#2E7D32] block">
                      {item.score}% إتقان
                    </span>
                    <span className="text-[10px] text-[#5C615C]">
                      حضور {item.attendancePercent}%
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#5C615C]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
