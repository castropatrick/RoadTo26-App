export const colors = {
  background: '#07111F',
  backgroundElevated: '#0E1A2B',
  card: '#111F33',
  cardSoft: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(226, 232, 240, 0.14)',
  text: '#F8FAFC',
  textMuted: '#A8B3C7',
  gold: '#F5C542',
  red: '#E94B5F',
  green: '#24C875',
  blue: '#4F8CFF',
  white: '#FFFFFF',
  gray: '#64748B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
};

export default theme;
