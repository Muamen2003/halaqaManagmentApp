import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Award, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  FileText,
  User,
  Star,
  PlayCircle
} from 'lucide-react';
import { getSurahByNumber, JUZ_NAMES } from '../../data/quranData';
import { GradeBadge, RatingStars } from '../common/RatingStars';

export const StudentDetailModal: React.FC = () => {
  const { 
    selectedStudentForDetail, 
    setSelectedStudentForDetail, 
    setSelectedStudentForRecord,
    setCurrentScreen,
    setEditingStudent,
    setIsAddStudentModalOpen,
    getStudentRecords,
    getStudentAttendance,
    deleteDailyRecord,
    settings
  } = useApp();

  if (!selectedStudentForDetail) return null;

  const student = selectedStudentForDetail;
  const surah = getSurahByNumber(student.currentSurahNumber);
  const records = getStudentRecords(student.id);
  const attendanceList = getStudentAttendance(student.id);

  const presentCount = attendanceList.filter(a => a.status === 'حاضر').length;
  const attendanceRate = attendanceList.length > 0 
    ? Math.round((presentCount / attendanceList.length) * 100) 
    : 100;

  const handleStartRecord = () => {
    setSelectedStudentForRecord(student);
    setSelectedStudentForDetail(null);
    setCurrentScreen('record');
  };

  const handleEdit = () => {
    setEditingStudent(student);
    setSelectedStudentForDetail(null);
    setIsAddStudentModalOpen(true);
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،\nتقرير متابعة حفظ القرآن الكريم للطالب: ${student.name}\n` +
      `- الحلقة: ${settings.circleName}\n` +
      `- المستوى: ${student.group}\n` +
      `- موضع الحفظ: سورة ${surah.name} (آية ${student.currentAyah})\n` +
      `- الأجزاء المكتملة: ${student.completedJuz} / 30 جزءاً\n` +
      `- نسبة الحضور: ${attendanceRate}%\n` +
      `- الحالة العامة: ${student.status}\n` +
      (student.notes ? `- ملاحظات المحفّظ: ${student.notes}\n` : '') +
      `بارك الله فيكم وفي جهودكم الطيبة.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white text-[#1B1C17] w-full max-w-xl rounded-[24px] sm:rounded-[28px] shadow-xl border border-[#E0E4E0] flex flex-col max-h-[92vh] overflow-hidden overflow-x-hidden">
        
        {/* Header Profile Summary */}
        <div className="p-4 sm:p-6 bg-gradient-to-l from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white relative">
          <button
            onClick={() => setSelectedStudentForDetail(null)}
            className="absolute top-3.5 left-3.5 p-1.5 rounded-full hover:bg-white/10 text-[#E8F5E9] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/25 text-[#E8F5E9] flex items-center justify-center font-bold text-lg sm:text-xl shadow-inner shrink-0">
              {student.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold font-['Cairo',sans-serif] truncate">
                  {student.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9C4]/20 text-[#FFF9C4] border border-[#FFF9C4]/40 font-['Cairo',sans-serif]">
                  {student.status}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#E8F5E9] mt-0.5 font-medium truncate">
                {student.group} • {student.age} سنة • انضم في {student.joinDate}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-[#C8E6C9] flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{student.parentPhone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Buttons on Header */}
          <div className="mt-3.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handleStartRecord}
              className="flex-1 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl bg-white text-[#1B5E20] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all hover:bg-[#E8F5E9] font-['Cairo',sans-serif] min-w-[130px]"
            >
              <PlayCircle className="w-4 h-4 text-[#2E7D32]" />
              <span>بدء جلسة تسميع</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8F5E9] text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20 font-['Cairo',sans-serif]"
            >
              <MessageCircle className="w-4 h-4 text-[#A5D6A7]" />
              <span>تقرير واتساب</span>
            </button>
            <button
              onClick={handleEdit}
              className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8F5E9] text-xs font-semibold transition-all border border-white/20"
              title="تعديل"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          
          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center">
              <span className="text-[9px] sm:text-[10px] text-[#5C615C] block font-medium truncate">الأجزاء</span>
              <span className="text-base sm:text-lg font-extrabold text-[#2E7D32] font-['Cairo',sans-serif]">
                {student.completedJuz} <span className="text-[10px] sm:text-xs font-normal text-[#5C615C]">من 30</span>
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center">
              <span className="text-[9px] sm:text-[10px] text-[#5C615C] block font-medium truncate">الحضور</span>
              <span className="text-base sm:text-lg font-extrabold text-[#2E7D32] font-['Cairo',sans-serif]">
                {attendanceRate}%
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center">
              <span className="text-[9px] sm:text-[10px] text-[#5C615C] block font-medium truncate">المعدل اليومي</span>
              <span className="text-base sm:text-lg font-extrabold text-[#827717] font-['Cairo',sans-serif]">
                {student.targetDailyPages} <span className="text-[10px] sm:text-xs font-normal text-[#5C615C]">أوجه</span>
              </span>
            </div>
          </div>

          {/* 30 Juz Progress Matrix Visualizer */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif] truncate">
                <BookOpen className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>خريطة حفظ أجزاء القرآن (30 جزءاً)</span>
              </h4>
              <span className="text-[11px] font-bold text-[#2E7D32] shrink-0">
                {Math.round((student.completedJuz / 30) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mt-2">
              {Array.from({ length: 30 }).map((_, idx) => {
                const juzNum = idx + 1;
                const isCompleted = juzNum <= Math.floor(student.completedJuz);
                const isPartial = juzNum === Math.ceil(student.completedJuz) && student.completedJuz % 1 !== 0;

                return (
                  <div
                    key={juzNum}
                    title={`جزء ${juzNum}: ${JUZ_NAMES[idx]}`}
                    className={`h-6 sm:h-7 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : isPartial
                        ? 'bg-[#A5D6A7] text-[#1B5E20] border border-dashed border-[#2E7D32]'
                        : 'bg-[#E0E4E0] text-[#5C615C]'
                    }`}
                  >
                    {juzNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Notes */}
          {student.notes && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9C4]/60 border border-[#FFF59D] text-xs">
              <span className="font-bold text-[#827717] block mb-1 font-['Cairo',sans-serif]">
                توجيهات وملاحظات المعلم:
              </span>
              <p className="text-[#5C615C] leading-relaxed font-medium">
                {student.notes}
              </p>
            </div>
          )}

          {/* Memorization History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
                <Clock className="w-4 h-4 text-[#2E7D32]" />
                <span>سجل التسميع والمراجعات ({records.length})</span>
              </h4>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-[#5C615C] text-center py-4 bg-[#F8FAF8] border border-[#E0E4E0] rounded-2xl">
                لا توجد سجلات تسميع مسجلة بعد لهذا الطالب.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {records.map(rec => {
                  const sInfo = getSurahByNumber(rec.surahNumber);
                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1B1C17]">
                            {rec.type}
                          </span>
                          <GradeBadge grade={rec.grade} />
                        </div>
                        <p className="text-[11px] text-[#5C615C] mt-0.5">
                          سورة {sInfo.name} • من آية {rec.fromAyah} إلى {rec.toAyah} • التاريخ: {rec.date}
                        </p>
                        {rec.teacherNotes && (
                          <p className="text-[11px] text-[#2E7D32] mt-1 font-medium italic">
                            "{rec.teacherNotes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RatingStars grade={rec.grade} size="sm" />
                        <button
                          onClick={() => deleteDailyRecord(rec.id)}
                          className="p-1 rounded-lg text-[#5C615C] hover:text-[#C62828] hover:bg-[#FFEBEE]"
                          title="حذف هذا السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAF8] border-t border-[#E0E4E0] flex justify-end">
          <button
            onClick={() => setSelectedStudentForDetail(null)}
            className="px-4 py-2 rounded-xl bg-white border border-[#E0E4E0] text-[#1B1C17] text-xs font-bold hover:bg-[#E0E4E0] transition-colors font-['Cairo',sans-serif]"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
