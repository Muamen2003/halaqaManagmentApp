import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookMarked, 
  User, 
  Award, 
  MessageCircle, 
  Save, 
  BookOpen,
  Star,
  Calendar
} from 'lucide-react';
import { SURAH_LIST, getSurahByNumber } from '../../data/quranData';
import { EvaluationGrade, RecordType, Student } from '../../types';
import { GradeBadge, RatingStars } from '../common/RatingStars';

export const DailyRecordScreen: React.FC = () => {
  const { 
    students, 
    selectedStudentForRecord, 
    setSelectedStudentForRecord,
    addDailyRecord, 
    setCurrentScreen,
    settings
  } = useApp();

  const [studentId, setStudentId] = useState<string>(
    selectedStudentForRecord?.id || (students.length > 0 ? students[0].id : '')
  );

  const [recordType, setRecordType] = useState<RecordType>('حفظ جديد');
  const [surahNumber, setSurahNumber] = useState<number>(
    selectedStudentForRecord?.currentSurahNumber || 2
  );
  const [fromAyah, setFromAyah] = useState<number>(
    selectedStudentForRecord?.currentAyah || 1
  );
  const [toAyah, setToAyah] = useState<number>(
    (selectedStudentForRecord?.currentAyah || 1) + 7
  );
  const [pageFrom, setPageFrom] = useState<number>(1);
  const [pageTo, setPageTo] = useState<number>(1);
  const [grade, setGrade] = useState<EvaluationGrade>('ممتاز');
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState<boolean>(false);

  const currentStudent = students.find(s => s.id === studentId);
  const selectedSurah = getSurahByNumber(surahNumber);

  // When student changes, sync surah and ayah
  useEffect(() => {
    if (selectedStudentForRecord) {
      setStudentId(selectedStudentForRecord.id);
      setSurahNumber(selectedStudentForRecord.currentSurahNumber);
      setFromAyah(selectedStudentForRecord.currentAyah);
      setToAyah(Math.min(selectedStudentForRecord.currentAyah + 7, getSurahByNumber(selectedStudentForRecord.currentSurahNumber).ayahsCount));
    }
  }, [selectedStudentForRecord]);

  const handleStudentSelectChange = (newStudentId: string) => {
    setStudentId(newStudentId);
    const std = students.find(s => s.id === newStudentId);
    if (std) {
      setSelectedStudentForRecord(std);
      setSurahNumber(std.currentSurahNumber);
      setFromAyah(std.currentAyah);
      setToAyah(Math.min(std.currentAyah + 7, getSurahByNumber(std.currentSurahNumber).ayahsCount));
    }
  };

  const handleSurahChange = (num: number) => {
    setSurahNumber(num);
    const sur = getSurahByNumber(num);
    setFromAyah(1);
    setToAyah(Math.min(7, sur.ayahsCount));
    setPageFrom(sur.startPage);
    setPageTo(sur.startPage);
  };

  const handleGradeSelect = (g: EvaluationGrade) => {
    setGrade(g);
  };

  const recordTypes: { type: RecordType; label: string; icon: string; desc: string }[] = [
    { type: 'حفظ جديد', label: 'حفظ جديد', icon: '🌟', desc: 'المقرر اليومي الجديد' },
    { type: 'مراجعة صغرى', label: 'مراجعة صغرى', icon: '🔄', desc: 'آخر 5 أوجه أو جزء' },
    { type: 'مراجعة كبرى', label: 'مراجعة كبرى', icon: '📖', desc: 'سرد الأجزاء السابقة' },
    { type: 'تلاوة وتجويد', label: 'تجويد وتلاوة', icon: '🎙️', desc: 'تصحيح التلاوة والأحكام' },
  ];

  const gradesList: { grade: EvaluationGrade; label: string; stars: number; color: string }[] = [
    { grade: 'ممتاز', label: 'ممتاز (متقن)', stars: 5, color: 'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]' },
    { grade: 'جيد جداً', label: 'جيد جداً', stars: 4, color: 'border-[#1B5E20] bg-[#E8F5E9] text-[#1B5E20]' },
    { grade: 'جيد', label: 'جيد (يحتاج تثبيت)', stars: 3, color: 'border-[#00695C] bg-[#E0F2F1] text-[#00695C]' },
    { grade: 'مقبول', label: 'مقبول', stars: 2, color: 'border-[#FBC02D] bg-[#FFF9C4] text-[#827717]' },
    { grade: 'إعادة', label: 'إعادة تسميع', stars: 1, color: 'border-[#C62828] bg-[#FFEBEE] text-[#C62828]' },
  ];

  const generateWhatsAppMessage = () => {
    if (!currentStudent) return '';
    return (
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `ولي أمر الطالب العزيز: ${currentStudent.name}\n` +
      `يسرنا إحاطتكم بنتيجة تسميع اليوم في ${settings.circleName}:\n` +
      `• نوع التسميع: ${recordType}\n` +
      `• السورة: سورة ${selectedSurah.name} (من آية ${fromAyah} إلى ${toAyah})\n` +
      `• مستوى الأداء: ${grade} ⭐\n` +
      `نرجو تشجيعه ومتابعته في المنزل. بارك الله فيكم.`
    );
  };

  const handleSendWhatsApp = () => {
    if (!currentStudent) return;
    const cleanPhone = currentStudent.parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    addDailyRecord({
      studentId,
      type: recordType,
      surahNumber,
      fromAyah: Number(fromAyah),
      toAyah: Number(toAyah),
      pageFrom: Number(pageFrom),
      pageTo: Number(pageTo),
      grade,
      mistakesCount: 0,
      hesitationsCount: 0,
      teacherNotes: '',
      audioRecorded: false
    });

    setCurrentScreen('home');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 pb-24 max-w-2xl mx-auto w-full overflow-x-hidden" dir="rtl">
      
      {/* Student Selection Header */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm">
        <label className="block text-xs font-bold text-[#1B1C17] mb-2 flex items-center gap-1.5 font-['Cairo',sans-serif]">
          <User className="w-4 h-4 text-[#2E7D32]" />
          <span>اختر الطالب المستمع:</span>
        </label>
        
        <select
          value={studentId}
          onChange={(e) => handleStudentSelectChange(e.target.value)}
          className="w-full px-3.5 py-3 sm:py-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs sm:text-sm font-bold text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
        >
          {students.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name} ({st.group} • {st.completedJuz} جزء)
            </option>
          ))}
        </select>

        {currentStudent && (
          <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-[#5C615C] px-1 font-medium">
            <span>المستوى: <strong className="text-[#2E7D32]">{currentStudent.group}</strong></span>
            <span>المعدل اليومي: <strong className="text-[#1B1C17]">{currentStudent.targetDailyPages} أوجه</strong></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3.5 sm:space-y-4">
        
        {/* Record Type Segmented Buttons */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#E0E4E0] shadow-sm">
          <label className="block text-xs font-bold text-[#1B1C17] mb-2.5 font-['Cairo',sans-serif]">
            نوع جلسة التسميع
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {recordTypes.map((item) => {
              const isSelected = recordType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setRecordType(item.type)}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-sm scale-[1.02]'
                      : 'bg-[#F8FAF8] border-[#E0E4E0] text-[#1B1C17] hover:border-[#2E7D32]'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bold font-['Cairo',sans-serif]">{item.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#E8F5E9]' : 'text-[#5C615C]'}`}>
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Surah & Ayah / Page Selector */}
        <div className="bg-white rounded-[28px] p-5 border border-[#E0E4E0] shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
            <BookOpen className="w-4 h-4 text-[#2E7D32]" />
            <span>تحديد موضع السورة والآيات</span>
          </h3>

          <div>
            <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
              اسم السورة الكريمة
            </label>
            <select
              value={surahNumber}
              onChange={(e) => handleSurahChange(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-sm font-semibold text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name} ({s.type} - {s.ayahsCount} آية - جزء {s.juz})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
                من آية
              </label>
              <input
                type="number"
                min={1}
                max={selectedSurah.ayahsCount}
                value={fromAyah}
                onChange={(e) => setFromAyah(Number(e.target.value))}
                className="w-full px-3 py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-sm font-bold text-center text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5C615C] mb-1.5 font-medium">
                إلى آية (أقصى: {selectedSurah.ayahsCount})
              </label>
              <input
                type="number"
                min={fromAyah}
                max={selectedSurah.ayahsCount}
                value={toAyah}
                onChange={(e) => setToAyah(Number(e.target.value))}
                className="w-full px-3 py-3 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-sm font-bold text-center text-[#1B1C17] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        {/* Evaluation Grade Picker */}
        <div className="bg-white rounded-[28px] p-5 border border-[#E0E4E0] shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1B1C17] flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <Award className="w-4 h-4 text-[#2E7D32]" />
              <span>تقييم مستوى الإتقان والتجويد</span>
            </label>
            <RatingStars grade={grade} size="md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {gradesList.map((item) => {
              const isSelected = grade === item.grade;
              return (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => handleGradeSelect(item.grade)}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-[#2E7D32] shadow-sm ' + item.color
                      : 'bg-[#F8FAF8] border-[#E0E4E0] text-[#1B1C17] hover:border-[#2E7D32]'
                  }`}
                >
                  <span className="text-xs font-bold font-['Cairo',sans-serif]">{item.label}</span>
                  <div className="flex items-center gap-0.5 mt-1 text-amber-500">
                    {Array.from({ length: item.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Message Preview Accordion */}
        <div className="bg-[#E8F5E9]/60 rounded-[28px] p-5 border border-[#A5D6A7]/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B5E20] flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
              <span>إشعار ولي الأمر عبر تطبيق واتساب</span>
            </span>
            <button
              type="button"
              onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
              className="text-xs text-[#2E7D32] font-bold hover:underline"
            >
              {showWhatsAppPreview ? 'إخفاء المعاينة' : 'معاينة الرسالة'}
            </button>
          </div>

          {showWhatsAppPreview && (
            <div className="mt-3 p-3.5 rounded-2xl bg-white text-xs text-[#1B1C17] whitespace-pre-line border border-[#E0E4E0] shadow-xs font-sans">
              {generateWhatsAppMessage()}
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال تقرير التسميع للواتساب الآن</span>
            </button>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 py-4 px-4 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all font-['Cairo',sans-serif]"
          >
            <Save className="w-4 h-4" />
            <span>حفظ جلسة التسميع اليومية</span>
          </button>
        </div>
      </form>
    </div>
  );
};
