import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../shared/hooks/useTheme';

type ScreenStatusProps = {
  kind: 'loading' | 'message';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
};

export function ScreenStatus({ kind, title, message, onRetry, onBack }: ScreenStatusProps) {
  const { colors } = useTheme('app');
  if (kind === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator accessibilityLabel="Loading" color={colors.text} />
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white px-8 dark:bg-black">
      <Text accessibilityRole="header" className="text-center text-lg font-bold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      {message ? <Text className="text-center text-sm leading-5 text-neutral-600 dark:text-neutral-400">{message}</Text> : null}
      <View className="mt-2 flex-row gap-3">
        {onBack ? <Pressable onPress={onBack} accessibilityRole="button" className="min-h-11 justify-center px-4"><Text className="font-semibold text-neutral-700 dark:text-neutral-300">Go back</Text></Pressable> : null}
        {onRetry ? <Pressable onPress={onRetry} accessibilityRole="button" className="min-h-11 justify-center rounded-full bg-neutral-900 px-5 dark:bg-neutral-100"><Text className="font-bold text-white dark:text-black">Try again</Text></Pressable> : null}
      </View>
    </View>
  );
}
