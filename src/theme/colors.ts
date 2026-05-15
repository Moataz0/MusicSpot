export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  tabBar: string;
  gradient: [string, string, ...string[]];
}

export const darkColors: ThemeColors = {
  background: '#050505',
  surface: '#151515',
  primary: '#00F0FF',
  secondary: '#0080FF',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#1C1C1E',
  tabBar: '#0A0A0A',
  gradient: ['#00F0FF', '#0080FF'],
};

export const lightColors: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#007AFF', // More readable blue for light mode
  secondary: '#00F0FF',
  text: '#121212',
  textSecondary: '#666666',
  border: '#E0E0E0',
  tabBar: '#FFFFFF',
  gradient: ['#007AFF', '#00F0FF'],
};

// Default to dark for backward compatibility if needed, 
// but components should use useTheme context
export const colors = darkColors;

