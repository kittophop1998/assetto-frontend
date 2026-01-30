'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const restrictedPaths = ['/dashboard', '/assets', '/approved', '/requests', '/users', '/settings'];
    
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      // Public path - login page
      if (pathname === '/login') {
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            const targetPath = user?.is_approved === 1 ? '/dashboard' : '/my_assets';
            router.replace(targetPath);
            return;
          } catch {
            router.replace('/my_assets');
            return;
          }
        }
        // No token - show login page
        setAuthorized(true);
        return;
      }

      // Root path
      if (pathname === '/') {
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            const targetPath = user?.is_approved === 1 ? '/dashboard' : '/my_assets';
            router.replace(targetPath);
          } catch {
            router.replace('/my_assets');
          }
        } else if (token) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
        return;
      }

      // Protected paths - require token
      if (!token) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check user approval for restricted paths
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const isApproved = user?.is_approved === 1;
          const isRestrictedPath = restrictedPaths.some(path => pathname.startsWith(path));

          if (!isApproved && isRestrictedPath) {
            router.replace('/my_assets');
            return;
          }
        } catch {
          // Silently handle parse errors
        }
      }

      // Allow access
      setAuthorized(true);
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized) {
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
