import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';
import { fonts } from '../../../shared/tokens/typography';

type ScreenStatusProps =
  | { kind: 'loading' }
  | {
      kind: 'message';
      title: string;
      message?: string;
      onRetry?: () => void;
      retryLabel?: string;
      secondaryAction?: { label: string; onPress: () => void };
      onBack?: () => void;
    };

/** Full-screen loading / error / not-found state shared by the profile screens. */
export function ScreenStatus(props: ScreenStatusProps) {
  const { colors } = useThemeColors('app');

  if (props.kind === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
      <Text
        style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
        className="text-center text-[24px] text-neutral-900 dark:text-neutral-100"
      >
        {props.title}
      </Text>
      {props.message ? (
        <Text className="mt-2 text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
          {props.message}
        </Text>
      ) : null}
      <View className="mt-6 flex-row gap-3">
        {props.onBack ? (
          <Pressable
            onPress={props.onBack}
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-full border border-neutral-900 px-6 active:opacity-80 dark:border-neutral-100"
          >
            <Text className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">Go back</Text>
          </Pressable>
        ) : null}
        {props.onRetry ? (
          <Pressable
            onPress={props.onRetry}
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-full bg-black px-6 active:opacity-80 dark:bg-white"
          >
            <Text className="text-[14px] font-bold text-white dark:text-black">{props.retryLabel ?? 'Try again'}</Text>
          </Pressable>
        ) : null}
        {props.secondaryAction ? (
          <Pressable
            onPress={props.secondaryAction.onPress}
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-full border border-neutral-900 px-6 active:opacity-80 dark:border-neutral-100"
          >
            <Text className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">
              {props.secondaryAction.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
