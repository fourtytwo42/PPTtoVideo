'use client';

import { Card as MuiCard, CardProps as MuiCardProps, CardContent } from '@mui/material';
import { forwardRef } from 'react';

export interface CardProps extends MuiCardProps {
  elevation?: number;
  content?: boolean; // If true, wrap children in CardContent
}

/**
 * Unified card component that matches the app's design system.
 * Replaces all custom styled card/panel components.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 2, children, sx, content = false, ...props }, ref) => {
    return (
      <MuiCard
        ref={ref}
        elevation={elevation}
        sx={{
          background: 'rgba(21, 18, 42, 0.72)',
          borderRadius: 3, // lg radius (24px)
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          ...sx,
        }}
        {...props}
      >
        {content ? <CardContent sx={{ padding: '0 !important' }}>{children}</CardContent> : children}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';

export default Card;

