import { Platform } from 'react-native';

/**
 * Single place to point the app at Merriweather. Until the font is loaded with
 * `useFonts` in the root layout, these fall back to each platform's serif.
 * Once loaded, change to e.g. 'Merriweather_400Regular' / 'Merriweather_700Bold'
 * (and drop fontWeight on the bold usages).
 */
const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Merriweather, Georgia, "Times New Roman", serif',
}) as string;

export const fonts = {
  serif,
  serifBold: serif,
} as const;
