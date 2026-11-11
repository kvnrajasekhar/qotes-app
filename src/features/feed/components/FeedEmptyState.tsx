import { Pressable, Text, View } from 'react-native';

import { fonts } from '../../../shared/tokens/typography';

type FeedEmptyStateProps = {
  onWrite: () => void;
  /** Present when the request failed rather than returned nothing. */
  errorMessage?: string;
  onRetry?: () => void;
};

export function FeedEmptyState({ onWrite, errorMessage, onRetry }: FeedEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ fontFamily: fonts.serifBold, fontSize: 112, lineHeight: 112, fontWeight: '700' }}
        className="text-neutral-300 dark:text-neutral-700"
      >
        {'\u201C'}
      </Text>

      <Text
        accessibilityRole="header"
        style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
        className="mt-2 text-center text-[26px] text-neutral-900 dark:text-neutral-100"
      >
        The feed is quiet.
      </Text>
      <Text className="mt-3 max-w-[300px] text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
        Be the first to curate an enduring quote or explore suggested writers.
      </Text>

      <Pressable
        onPress={onWrite}
        accessibilityRole="button"
        accessibilityLabel="Write a quote"
        className="mt-8 h-[52px] items-center justify-center rounded-full bg-black px-8 active:opacity-85 dark:bg-white"
      >
        <Text className="text-[16px] font-bold tracking-tight text-white dark:text-black">Write a Quote</Text>
      </Pressable>

      {errorMessage ? (
        <View className="mt-6 items-center gap-2">
          <Text className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">{errorMessage}</Text>
          {onRetry ? (
            <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8} className="active:opacity-70">
              <Text className="text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">Try again</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
