'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Badge,
  Chip,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSystemOverview } from '@/app/hooks/useSystemOverview';
import { signOut } from 'next-auth/react';
import type { Role } from '@prisma/client';
import { useState } from 'react';

const navItems: { href: string; label: string; requireAdmin?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin Console', requireAdmin: true },
  { href: '/', label: 'Product Tour' }
];

interface AppShellProps {
  children: ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const { health, notifications } = useSystemOverview();
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: '/login' });
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/deck');
    if (href === '/dashboard') return isDashboardRoute;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const filteredNavItems = navItems.filter((item) => !item.requireAdmin || user.role === 'ADMIN');

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontFamily: 'var(--font-serif)' }}>
        DeckForge Studio
      </Typography>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              sx={{
                backgroundColor: isActive(item.href) ? 'rgba(140, 92, 255, 0.18)' : 'transparent',
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        sx={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(135deg, rgba(18, 14, 36, 0.92), rgba(9, 7, 22, 0.88))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                    letterSpacing: '0.04em',
                  }}
                >
                  DeckForge Studio
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8rem',
                    color: 'rgba(213, 210, 255, 0.7)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Automation cockpit
                </Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, justifyContent: 'center' }}>
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      color: isActive(item.href) ? 'text.primary' : 'text.secondary',
                      backgroundColor: isActive(item.href) ? 'rgba(140, 92, 255, 0.18)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(140, 92, 255, 0.15)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Badge badgeContent={unreadNotifications} color="primary" sx={{ ml: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'rgba(213, 210, 255, 0.7)' }}>
                    alerts
                  </Typography>
                </Badge>
              </Stack>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center">
              {!isMobile && (
                <>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'rgba(213, 210, 255, 0.65)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSignOut}
                    sx={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                  >
                    Sign out
                  </Button>
                </>
              )}
              <Chip
                icon={
                  <Box
                    sx={{
                      width: '0.55rem',
                      height: '0.55rem',
                      borderRadius: '50%',
                      background: health.outOfOrder ? '#FF6F91' : '#24E4CE',
                    }}
                  />
                }
                label={health.outOfOrder ? 'Service interruption' : 'All systems operational'}
                size="small"
                sx={{
                  backgroundColor: health.outOfOrder ? 'rgba(255, 111, 145, 0.18)' : 'rgba(36, 228, 206, 0.14)',
                  color: health.outOfOrder ? '#FF8BA3' : '#8AFFE2',
                  fontSize: '0.8rem',
                  height: 'auto',
                  py: 0.5,
                  '& .MuiChip-icon': {
                    marginLeft: 0.5,
                  },
                }}
              />
            </Stack>
          </Toolbar>
        </Container>
        {health.outOfOrder && (
          <Alert
            severity="warning"
            sx={{
              backgroundColor: 'linear-gradient(135deg, rgba(255, 111, 145, 0.2), rgba(255, 90, 90, 0.16))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 0,
            }}
          >
            {health.message ?? 'A dependent service is unavailable. Generation actions are temporarily paused.'}
          </Alert>
        )}
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            backgroundColor: 'rgba(21, 18, 42, 0.95)',
            backdropFilter: 'blur(16px)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: { xs: 2, sm: 3 },
          pb: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
