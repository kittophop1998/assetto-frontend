'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  open?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export default function Sidebar({ open: externalOpen, mobileOpen = false, onMobileToggle }: SidebarProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [internalOpen] = useState(true);
  const [isApprovedUser] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return false;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser?.is_approved === 1;
    } catch {
      return false;
    }
  });

  // ใช้ external open ถ้ามี ไม่งั้นใช้ internal open
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const menuItems: MenuItem[] = [
    {
      name: t('menu.dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      name: t('menu.assets'),
      icon: <InventoryIcon />,
      path: '/assets',
    },
    {
      name: t('menu.myAsset'),
      icon: <AssignmentIcon />,
      path: '/my_assets',
    },
    {
      name: t('menu.assetRequest'),
      icon: <AssignmentIcon />,
      path: '/requests',
    },
    {
      name: t('menu.assetApproved'),
      icon: <AssignmentIcon />,
      path: '/approved',
    },
    // {
    //   name: t('menu.users'),
    //   icon: <PeopleIcon />,
    //   path: '/users',
    // },
  ];

  const menuFiltered = menuItems.filter((item) => item.path !== '/approved' || isApprovedUser);

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  const drawerContent = (
    <>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        {(isOpen || isMobile) && (
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              letterSpacing: -0.5,
              whiteSpace: 'nowrap',
            }}
          >
            {t('app.name')}
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {menuFiltered.map((item) => {
          const isApprovedMenu = item.path === '/approved';
          const isDisabled = isApprovedMenu && !isApprovedUser;
          console.log('isDisabled for', item.path, ':', isDisabled);
          const isActive = !isDisabled && (pathname === item.path || pathname?.startsWith(item.path + '/'));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                disabled={isDisabled}
                sx={{
                  borderRadius: 1.5,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'grey.700',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'grey.50',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'white' : 'grey.600',
                    minWidth: (isOpen || isMobile) ? 40 : 'auto',
                  },
                  '&.Mui-disabled': {
                    color: 'grey.400',
                    opacity: 0.7,
                    backgroundColor: 'transparent',
                    '& .MuiListItemIcon-root': {
                      color: 'grey.400',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {(isOpen || isMobile) && (
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 15,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Toggle Button - แสดงเฉพาะบน desktop */}
      {/* {!isMobile && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={handleToggle}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  color: 'grey.700',
                },
              }}
            >
              {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Box>
        </>
      )} */}
    </>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'grey.200',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop Drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'grey.200',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: theme.zIndex.drawer,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
