import { TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  cyan: '#19E8F5',
  cyanBright: '#2CE8FF',
  azure: '#08BFEF',
  blue: '#075CFF',
  blueBright: '#3D7BFF',
  primary: '#2CE8FF',

  background: '#050819',
  backgroundDeep: '#04061A',
  backgroundRaised: '#0A1030',

  surface: 'rgba(255,255,255,0.07)',
  surfaceStrong: 'rgba(255,255,255,0.12)',
  surfaceWeak: 'rgba(255,255,255,0.045)',
  secondaryBackground: 'rgba(255,255,255,0.10)',
  inputBackground: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.26)',
  highlight: 'rgba(255,255,255,0.45)',

  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.72)',
  textHint: 'rgba(255,255,255,0.45)',
  inactive: 'rgba(255,255,255,0.32)',

  waiting: 'rgba(255,214,10,0.16)',
  waitingBorder: 'rgba(255,214,10,0.45)',
  waitingText: '#FFD60A',
  error: '#FF453A',
  errorSurface: 'rgba(255,69,58,0.16)',
  errorBorder: 'rgba(255,69,58,0.45)',
  success: '#32D74B',
  successSurface: 'rgba(48,209,88,0.15)',
  successBorder: 'rgba(48,209,88,0.45)',
};

export const SPACING = {
  zero: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  ms: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const TYPOGRAPHY: Record<string, TextStyle> = {
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textHint,
    lineHeight: 17,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caption: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORS.textHint,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  } as ViewStyle,
  glow: {
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  } as ViewStyle,
};
