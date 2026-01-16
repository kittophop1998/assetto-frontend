'use client';

import { AppThemeProvider } from "@/src/theme/theme";
import I18nProvider from "@/app/providers/I18nProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </I18nProvider>
  );
}
