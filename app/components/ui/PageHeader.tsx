'use client';

import { Typography, Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface PageHeaderProps extends Omit<BoxProps, 'title'> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Consistent page header component with title, optional subtitle, and action area.
 */
export function PageHeader({ title, subtitle, action, ...props }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        mb: 3,
        ...props.sx,
      }}
      {...props}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontFamily: 'var(--font-serif)',
              fontSize: { xs: '2rem', sm: '2.3rem', md: '2.6rem' },
              margin: 0,
              mb: subtitle ? 0.75 : 0,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(213, 210, 255, 0.76)',
                maxWidth: '48rem',
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}

export default PageHeader;

