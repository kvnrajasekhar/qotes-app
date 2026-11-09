import { useRouter } from 'expo-router';
import { Feather } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';

export const FAB_SIZE = 56;
/** FAB height + its bottom offset (24) + breathing room: use as list bottom padding. */
export const FAB_CLEARANCE = FAB_SIZE + 24 + 16;

type FloatingComposeButtonProps = {
  /** Defaults to router.push('/compose'). */
  onPress?: () => void;
};

/** Pinned bottom-right, above the tab bar. Mount it inside the screen's relatively-positioned container. */
export function FloatingComposeButton({ onPress }: FloatingComposeButtonProps) {
  const router = useRouter();
  const { colors } = useThemeColors('app');

  return (
    <Pressable
      onPress={onPress ?? (() => router.push('/compose'))}
      accessibilityRole="button"
      accessibilityLabel="Write a quote"
      style={{
        width: FAB_SIZE,
        height: FAB_SIZE,
        shadowColor: '#000000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
      className="absolute bottom-6 right-6 z-50 items-center justify-center rounded-full bg-black active:opacity-85 dark:bg-white"
    >
      <Feather size={24} color={colors.buttonText} strokeWidth={2} />
    </Pressable>
  );
}
