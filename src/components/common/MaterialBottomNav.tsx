import React from 'react';
import { useApp, ScreenType } from '../../context/AppContext';
import { 
  Home, 
  Users, 
  BookMarked, 
  BarChart3, 
  Settings
} from 'lucide-react';

interface NavItem {
  key: ScreenType;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const MaterialBottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, students, getTodayRecordForStudent } = useApp();

  if (currentScreen === 'login') {
    return null;
  }

  // Count how many students still need recording today
  const pendingCount = students.filter(s => !getTodayRecordForStudent(s.id)).length;

  const navItems: NavItem[] = [
    { key: 'home', label: 'الرئيسية', icon: Home },
    { key: 'students', label: 'الطلاب', icon: Users, badge: students.length },
    { key: 'record', label: 'التسميع', icon: BookMarked, badge: pendingCount > 0 ? pendingCount : undefined },
    { key: 'reports', label: 'التقارير', icon: BarChart3 },
    { key: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E0E4E0] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] transition-colors w-full overflow-hidden">
      <div className="flex items-center justify-between px-1 py-1 max-w-lg mx-auto w-full">
        {navItems.map((item) => {
          const isActive = currentScreen === item.key;
          const IconComponent = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => setCurrentScreen(item.key)}
              className="group relative flex-1 flex flex-col items-center justify-center py-1 px-0.5 min-w-0 transition-all duration-200 focus:outline-none"
              aria-label={item.label}
            >
              {/* Material 3 Active Indicator Pill */}
              <div
                className={`relative flex items-center justify-center w-10 sm:w-12 h-7 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#2E7D32] scale-105 shadow-xs font-bold'
                    : 'text-[#5C615C] group-hover:bg-[#F1F5F1]'
                }`}
              >
                <IconComponent
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4] text-[#2E7D32]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge if present */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[8px] sm:text-[9px] font-bold text-white bg-[#2E7D32] rounded-full shadow-xs ring-1 ring-white animate-in zoom-in">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[9px] sm:text-[11px] mt-0.5 transition-all font-['Cairo',sans-serif] truncate max-w-full ${
                  isActive
                    ? 'font-bold text-[#2E7D32]'
                    : 'font-medium text-[#5C615C] group-hover:text-[#1B1C17]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
