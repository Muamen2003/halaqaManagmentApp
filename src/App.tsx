import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/common/DeviceFrame';
import { MaterialAppBar } from './components/common/MaterialAppBar';
import { MaterialBottomNav } from './components/common/MaterialBottomNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { StudentsListScreen } from './components/screens/StudentsListScreen';
import { DailyRecordScreen } from './components/screens/DailyRecordScreen';
import { MonthlyReportsScreen } from './components/screens/MonthlyReportsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AdminHalaqasScreen } from './components/screens/AdminHalaqasScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { AddEditStudentModal } from './components/screens/AddEditStudentModal';
import { StudentDetailModal } from './components/screens/StudentDetailModal';
import { ComposeCodeViewerModal } from './components/screens/ComposeCodeViewerModal';
import { PwaReloadPrompt } from './components/common/PwaReloadPrompt';

const AppContent: React.FC = () => {
  const { currentScreen, teacher } = useApp();

  // Screen routing
  const renderScreen = () => {
    if (!teacher.isLoggedIn || currentScreen === 'login') {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'students':
        return <StudentsListScreen />;
      case 'record':
        return <DailyRecordScreen />;
      case 'reports':
        return <MonthlyReportsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin_halaqas':
        return <AdminHalaqasScreen />;
      default:
        return <HomeScreen />;
    }
  };


  return (
    <DeviceFrame>
      {teacher.isLoggedIn && currentScreen !== 'login' && <MaterialAppBar />}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {renderScreen()}
      </div>
      {teacher.isLoggedIn && currentScreen !== 'login' && <MaterialBottomNav />}

      {/* Shared Global Modals & PWA Prompts */}
      <PwaReloadPrompt />
      <AddEditStudentModal />
      <StudentDetailModal />
      <ComposeCodeViewerModal />
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
