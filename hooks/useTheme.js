import { createContext, useContext, useMemo } from 'react';

import baseTheme from '../constants/theme';

const typography = {
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
};

const darkTheme = {
  ...baseTheme,
  mode: 'dark',
  typography,
};

const lightTheme = {
  ...baseTheme,
  mode: 'light',
  colors: {
    ...baseTheme.colors,
    background: '#F6F8FC',
    backgroundElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardSoft: 'rgba(7, 17, 31, 0.05)',
    border: 'rgba(15, 23, 42, 0.12)',
    text: '#07111F',
    textMuted: '#526173',
  },
  typography,
};

const themes = {
  dark: darkTheme,
  light: lightTheme,
};

function createThemeValue(theme) {
  return {
    mode: theme.mode,
    theme,
    colors: theme.colors,
    spacing: theme.spacing,
    radius: theme.radius,
    typography: theme.typography,
    shadows: theme.shadows,
  };
}

const defaultThemeValue = createThemeValue(darkTheme);

const ThemeContext = createContext(defaultThemeValue);

export function ThemeProvider({ children, mode = 'dark' }) {
  const value = useMemo(() => {
    const selectedTheme = themes[mode] ?? themes.dark;

    return createThemeValue(selectedTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
