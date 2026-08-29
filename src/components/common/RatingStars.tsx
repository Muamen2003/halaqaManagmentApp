import React from 'react';
import { EvaluationGrade } from '../../types';
import { Star, Award, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RatingStarsProps {
  grade: EvaluationGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const getGradeColor = (grade: EvaluationGrade) => {
  switch (grade) {
    case 'ممتاز':
      return {
        bg: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
        starColor: 'text-amber-500 fill-amber-400',
        badgeBg: 'bg-[#2E7D32] text-white',
        stars: 5
      };
    case 'جيد جداً':
      return {
        bg: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
        starColor: 'text-amber-500 fill-amber-400',
        badgeBg: 'bg-[#1B5E20] text-white',
        stars: 4
      };
    case 'جيد':
      return {
        bg: 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]',
        starColor: 'text-amber-500 fill-amber-400',
        badgeBg: 'bg-[#00695C] text-white',
        stars: 3
      };
    case 'مقبول':
      return {
        bg: 'bg-[#FFF9C4] text-[#827717] border-[#FFF59D]',
        starColor: 'text-amber-500 fill-amber-400',
        badgeBg: 'bg-[#FBC02D] text-[#1B1C17]',
        stars: 2
      };
    case 'إعادة':
      return {
        bg: 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]',
        starColor: 'text-rose-400 fill-rose-300',
        badgeBg: 'bg-[#C62828] text-white',
        stars: 1
      };
  }
};

export const GradeBadge: React.FC<{ grade: EvaluationGrade; className?: string }> = ({ grade, className = '' }) => {
  const config = getGradeColor(grade);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.bg} ${className}`}>
      {grade === 'ممتاز' && <Award className="w-3.5 h-3.5 text-amber-500" />}
      {grade === 'جيد جداً' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
      {grade === 'إعادة' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
      <span>{grade}</span>
    </span>
  );
};

export const RatingStars: React.FC<RatingStarsProps> = ({ grade, size = 'md', showLabel = false }) => {
  const config = getGradeColor(grade);
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-1.5" dir="ltr">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(starIdx => (
          <Star
            key={starIdx}
            className={`${iconSize} ${
              starIdx <= config.stars
                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                : 'text-slate-200 fill-slate-100 dark:text-slate-700 dark:fill-slate-800'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1" dir="rtl">
          {grade}
        </span>
      )}
    </div>
  );
};
