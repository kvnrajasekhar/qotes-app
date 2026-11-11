import { Text, View } from 'react-native';

import { fonts } from '../../../shared/tokens/typography';

type CategoryEmptyStateProps = { category: string };

/** Shown when a category filter has no quotes. */
export function CategoryEmptyState({ category }: CategoryEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-24">
      <Text style={{ fontFamily: fonts.serif }} className="text-center text-xl leading-8 text-neutral-900 dark:text-neutral-100">
        {`Nothing in ${category} yet.`}
      </Text>
      <Text className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Try another category, or be the first to share a quote here.
      </Text>
    </View>
  );
}
