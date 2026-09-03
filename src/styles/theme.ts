import { TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  primary: '#007AFF',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  textHint: '#999999',
  border: '#E5E5EA',
  inputBackground: '#FAFAFA',
  secondaryBackground: '#F0F0F2',
  waiting: "#FEF3C7",
  waitingText: "#B45309",
  error: '#FF3B30',
  inactive: '#CCCCCC',
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

export const TYPOGRAPHY: Record<string, TextStyle> = {
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textHint,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
};

export const COMMON_STYLES: Record<string, ViewStyle> = {
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
};
