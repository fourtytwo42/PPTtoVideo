import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      surfaceStrong: string;
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      muted: string;
    };
    layout: {
      maxWidth: string;
    };
    radius: {
      xl: string;
      lg: string;
      md: string;
      sm: string;
    };
    shadows: {
      glow: string;
      soft: string;
    };
  }
}
