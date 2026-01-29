'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { AppThemeProvider } from '@/src/theme/theme';
import I18nProvider from '@/app/providers/I18nProvider';

const PUBLIC_PATHS = ['/login'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = useMemo(() => {
    if (!pathname) return true;
    return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token && !isPublic) {
      const redirectParam = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirectParam}`);
      return;
    }

    if (token && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [isPublic, pathname, router]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!isPublic && !token) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AppThemeProvider>
        <AuthGuard>{children}</AuthGuard>
      </AppThemeProvider>
    </I18nProvider>
  );
}
