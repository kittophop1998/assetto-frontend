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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Path ที่ user ที่ไม่ approved ไม่สามารถเข้าได้
    const restrictedPaths = ['/dashboard', '/assets', '/approved', '/requests', '/users', '/settings'];

    // ตรวจสอบ authentication และ authorization
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      // ถ้าไม่มี token และไม่ได้อยู่ที่หน้า login ให้ redirect ไป login
      if (!token && pathname !== '/login') {
        router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
        setLoading(false);
        return;
      }

      // ถ้าอยู่หน้า login และมี token แล้ว ให้ redirect ไปหน้าที่เหมาะสม
      if (token && pathname === '/login') {
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user?.is_approved === 1) {
              router.push('/dashboard');
            } else {
              router.push('/my_assets');
            }
          } catch {
            router.push('/my_assets');
          }
        }
        setLoading(false);
        return;
      }

      // ตรวจสอบ authorization สำหรับ user ที่ไม่ approved
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const isApproved = user?.is_approved === 1;

          // ถ้าไม่ approved และพยายามเข้าหน้าที่ restricted
          if (!isApproved && restrictedPaths.some(path => pathname?.startsWith(path))) {
            router.push('/my_assets');
            setLoading(false);
            return;
          }

          // ถ้าผ่านการตรวจสอบทั้งหมด
          setAuthorized(true);
          setLoading(false);
        } catch {
          // ถ้า parse user ไม่ได้ ให้ไปหน้า my_assets
          if (pathname !== '/my_assets') {
            router.push('/my_assets');
          } else {
            setAuthorized(true);
          }
          setLoading(false);
        }
      } else if (token) {
        // มี token แต่ไม่มี user data
        setAuthorized(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // แสดง loading state
  if (loading) {
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

  // ถ้า authorized แล้วให้แสดง children
  return authorized ? <>{children}</> : null;
}
