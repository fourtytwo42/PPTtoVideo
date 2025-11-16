'use client';

import { Box, Typography, Stack } from '@mui/material';
import { Card } from '@/app/components/ui/Card';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  return (
    <Card sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.5, height: '100%' }}>
      <Box>
        <Typography variant="h5" component="h3" sx={{ fontFamily: 'var(--font-serif)', margin: 0, mb: 0.5 }}>
          Operations feed
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.7)' }}>
          Track health alerts, job completions, and admin interventions in real time.
        </Typography>
      </Box>
      <Stack spacing={1}>
        {notifications.length === 0 && (
          <Typography variant="body2" sx={{ color: 'rgba(213,210,255,0.6)' }}>
            No alerts yet.
          </Typography>
        )}
        {notifications.map((notification) => (
          <Box
            key={notification.id}
            sx={{
              display: 'grid',
              gap: 0.5,
              padding: '0.85rem 1rem',
              borderRadius: 2,
              background: 'rgba(36, 30, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {notification.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.75)' }}>
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              {new Date(notification.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
