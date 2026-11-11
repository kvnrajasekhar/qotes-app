import { Pressable, Text, View } from 'react-native';

import { fonts } from '../../../shared/tokens/typography';
import { SuggestedWritersList } from './SuggestedWritersList';

type FollowingEmptyStateProps = {
  errorMessage?: string;
  onRetry?: () => void;
};

/** "Your feed is quiet" plus a Suggested writers module. */
export function FollowingEmptyState({ errorMessage, onRetry }: FollowingEmptyStateProps) {
  return (
    <View className="w-full max-w-md self-center px-4 pb-10 pt-12">
      <View className="items-center">
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{ fontFamily: fonts.serifBold, fontSize: 72, lineHeight: 72, fontWeight: '700' }}
          className="text-neutral-300 dark:text-neutral-700"
        >
          {'\u201C'}
        </Text>
        <Text accessibilityRole="header" className="mt-1 text-[20px] font-bold text-neutral-900 dark:text-neutral-100">
          Your feed is quiet
        </Text>
        <Text className="mt-2 text-center text-[15px] text-neutral-600 dark:text-neutral-400">
          Follow writers to see their quotes here.
        </Text>
        {errorMessage ? (
          <View className="mt-4 items-center gap-1.5">
            <Text className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">{errorMessage}</Text>
            {onRetry ? (
              <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
                <Text className="text-[14px] font-bold text-neutral-900 underline dark:text-neutral-100">Try again</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="mt-10">
        <SuggestedWritersList />
      </View>
    </View>
  );
}
