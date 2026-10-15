import { useEffect } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';
import { useColorScheme as useNativeWindScheme } from 'nativewind';

import { useThemeStore, type ThemePreference } from '../stores/theme.store';

/**
 * 'auth' -> unauthenticated screens. No in-app toggle exists here, so the
 *           device theme always wins and the stored preference is ignored.
 * 'app'  -> authenticated screens. Follows the persisted System / Light / Dark setting.
 */
export type ThemeScope = 'auth' | 'app';
export type ResolvedScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  buttonBg: string;
  buttonText: string;
}

/** Monochrome tokens only: black / white / neutral scale, plus one red reserved for errors. */
export const THEME_COLORS: Record<ResolvedScheme, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    border: '#8A8A8A',
    danger: '#B91C1C',
    buttonBg: '#000000',
    buttonText: '#FFFFFF',
  },
  dark: {
    background: '#000000',
    surface: '#121212',
    text: '#FFFFFF',
    textMuted: '#A3A3A3',
    border: '#FFFFFF',
    danger: '#FF6B6B',
    buttonBg: '#FFFFFF',
    buttonText: '#000000',
  },
};

export interface UseThemeResult {
  scheme: ResolvedScheme;
  isDark: boolean;
  colors: ThemeColors;
  /** Stored user preference (meaningful for scope 'app'). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Side-effect-free reader. Use it in leaf components (list rows, icons) that only need
 * resolved colours; call `useTheme` once per screen so NativeWind's `dark:` variants stay in sync.
 */
export function useThemeColors(scope: ThemeScope = 'app') {
  const system: ResolvedScheme = useSystemScheme() === 'dark' ? 'dark' : 'light';
  const preference = useThemeStore((s) => s.preference);
  const effective: ThemePreference = scope === 'auth' ? 'system' : preference;
  const scheme: ResolvedScheme = effective === 'system' ? system : effective;
  return { scheme, isDark: scheme === 'dark', colors: THEME_COLORS[scheme], effective };
}

export function useTheme(scope: ThemeScope = 'app'): UseThemeResult {
  const { scheme, effective } = useThemeColors(scope);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const { setColorScheme } = useNativeWindScheme();

  // Keep NativeWind's `dark:` variants in sync with what we resolved. Auth screens
  // explicitly reset to 'system' so a previous in-app override cannot leak into login.
  useEffect(() => {
    setColorScheme(effective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effective]);

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: THEME_COLORS[scheme],
    preference,
    setPreference,
  };
}
