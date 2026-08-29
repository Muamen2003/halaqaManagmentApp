import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  User, 
  Phone, 
  BookOpen, 
  Calendar, 
  Layers, 
  Check, 
  Save, 
  Award,
  Sparkles
} from 'lucide-react';
import { SURAH_LIST } from '../../data/quranData';
import { Student } from '../../types';

export const AddEditStudentModal: React.FC = () => {
  const { 
    isAddStudentModalOpen, 
    setIsAddStudentModalOpen, 
    editingStudent, 
    setEditingStudent,
    addStudent, 
    updateStudent 
  } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(12);
  const [parentPhone, setParentPhone] = useState('');
  const [group, setGroup] = useState<Student['group']>('المستوى الأول (جزء عم)');
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(78);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [completedJuz, setCompletedJuz] = useState<number>(1);
  const [targetDailyPages, setTargetDailyPages] = useState<number>(1);
  const [status, setStatus] = useState<Student['status']>('نشط');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setAge(editingStudent.age);
      setParentPhone(editingStudent.parentPhone);
      setGroup(editingStudent.group);
      setCurrentSurahNumber(editingStudent.currentSurahNumber);
      setCurrentAyah(editingStudent.currentAyah);
      setCompletedJuz(editingStudent.completedJuz);
      setTargetDailyPages(editingStudent.targetDailyPages);
      setStatus(editingStudent.status);
      setNotes(editingStudent.notes || '');
    } else {
      setName('');
      setAge(11);
      setParentPhone('+9665');
      setGroup('المستوى الأول (جزء عم)');
      setCurrentSurahNumber(78);
      setCurrentAyah(1);
      setCompletedJuz(1);
      setTargetDailyPages(1);
      setStatus('نشط');
      setNotes('');
    }
  }, [editingStudent, isAddStudentModalOpen]);

  if (!isAddStudentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name,
        age: Number(age),
        parentPhone,
        group,
        currentSurahNumber: Number(currentSurahNumber),
        currentAyah: Number(currentAyah),
        completedJuz: Number(completedJuz),
        targetDailyPages: Number(targetDailyPages),
        status,
        notes
      });
    } else {
      addStudent({
        name,
        age: Number(age),
        parentPhone,
        group,
        currentSurahNumber: Number(currentSurahNumber),
        currentAyah: Number(currentAyah),
        completedJuz: Number(completedJuz),
        targetDailyPages: Number(targetDailyPages),
        status,
        notes
      });
    }

    setIsAddStudentModalOpen(false);
    setEditingStudent(null);
  };

  const groupsList: Student['group'][] = [
    'المستوى الأول (جزء عم)',
    'المستوى الثاني (جزء تبارك)',
    'المستوى المتوسط',
    'المستوى المتقدم',
    'حفظة القرآن كاملاً'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white text-[#1B1C17] w-full max-w-lg rounded-[24px] sm:rounded-[28px] shadow-xl border border-[#E0E4E0] flex flex-col max-h-[90vh] overflow-hidden overflow-x-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#2E7D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#1B5E20]">
              <User className="w-4 sm:w-5 h-4 sm:h-5 text-[#FFF9C4]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-['Cairo',sans-serif]">
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد للحلقة'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#E8F5E9] font-medium">
                تسجيل بيانات الحفظ ومعلومات ولي الأمر
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAddStudentModalOpen(false);
              setEditingStudent(null);
            }}
            className="p-1.5 rounded-full hover:bg-[#1B5E20] text-[#E8F5E9] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          
          {/* Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
                اسم الطالب الثلاثي *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عبد الله أحمد المنصور"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
                العمر (سنوات)
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17] text-center"
              />
            </div>
          </div>

          {/* Parent Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
                هاتف ولي الأمر (واتساب) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+9665xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17]"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-[#5C615C] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
                حالة الطالب في الحلقة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Student['status'])}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17]"
              >
                <option value="نشط">نشط ومستمر</option>
                <option value="متميز">متميز ومتفوق ⭐</option>
                <option value="متعثر">متعثر ويحتاج متابعة</option>
                <option value="منقطع">منقطع مؤقتاً</option>
              </select>
            </div>
          </div>

          {/* Group / Level */}
          <div>
            <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
              مستوى الحلقة / الفئة التعليمية
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as Student['group'])}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17]"
            >
              {groupsList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Quran Progress Fields */}
          <div className="p-4 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] space-y-3">
            <h4 className="text-xs font-bold text-[#2E7D32] flex items-center gap-1.5 font-['Cairo',sans-serif]">
              <BookOpen className="w-4 h-4" />
              <span>موضع الحفظ الحالي والمستهدف</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#5C615C] mb-1 font-medium">
                  السورة الحالية
                </label>
                <select
                  value={currentSurahNumber}
                  onChange={(e) => setCurrentSurahNumber(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E0E4E0] text-xs text-[#1B1C17] focus:ring-2 focus:ring-[#2E7D32]"
                >
                  {SURAH_LIST.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.type} - {s.ayahsCount} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#5C615C] mb-1 font-medium">
                  الآية الحالية
                </label>
                <input
                  type="number"
                  min={1}
                  max={286}
                  value={currentAyah}
                  onChange={(e) => setCurrentAyah(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E0E4E0] text-xs text-[#1B1C17] focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#5C615C] mb-1 font-medium">
                  الأجزاء المكتملة حفظاً (من 30)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  value={completedJuz}
                  onChange={(e) => setCompletedJuz(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E0E4E0] text-xs text-[#1B1C17] focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5C615C] mb-1 font-medium">
                  المعدل اليومي المستهدف (أوجه / صفحات)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  max={10}
                  value={targetDailyPages}
                  onChange={(e) => setTargetDailyPages(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E0E4E0] text-xs text-[#1B1C17] focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#1B1C17] mb-1 font-['Cairo',sans-serif]">
              ملاحظات المعلم وتوصيات التسميع
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: حفظه متقن، التركيز على ترقيق الراء المكسورة..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E0E4E0] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B1C17]"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-3.5 px-4 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all font-['Cairo',sans-serif]"
            >
              <Save className="w-4 h-4" />
              <span>{editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب للحلقة'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAddStudentModalOpen(false);
                setEditingStudent(null);
              }}
              className="py-3.5 px-4 rounded-2xl bg-[#F8FAF8] text-[#5C615C] hover:bg-[#E0E4E0] text-xs font-bold border border-[#E0E4E0] transition-all font-['Cairo',sans-serif]"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
