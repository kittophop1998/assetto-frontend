'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AppThemeProvider } from '@/src/theme/theme';
import I18nProvider from '@/app/providers/I18nProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <I18nProvider>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </I18nProvider>
    </AppRouterCacheProvider>
  );
}
