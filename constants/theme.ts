export const colors = {
  primary: '#E17055',
  background: '#1A1A2E',
  surface: '#16213E',
  accent: '#0F3460',
  text: '#E8E8E8',
  muted: '#888888',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF6B6B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  card: 12,
  button: 24,
  avatar: 999,
};

export const typography = {
  display: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 22 },
  subtitle: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  micro: { fontFamily: 'Inter_500Medium', fontSize: 10 },
};

// NEW: Modern UI Additions
export const gradients = {
  primary: ['#E17055', '#d65d43'] as const,
  dark: ['#1A1A2E', '#0B0B14'] as const,
  card: ['rgba(22, 33, 62, 0.8)', 'rgba(22, 33, 62, 1)'] as const,
  glass: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)'] as const,
};

export const glows = {
  primary: {
    shadowColor: '#E17055',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  surface: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};