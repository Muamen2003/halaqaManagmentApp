import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.halaqa.management',
  appName: 'إدارة حلقة التحفيظ',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#176b35',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      backgroundColor: '#176b35',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#176b35',
    },
  },
};

export default config;
