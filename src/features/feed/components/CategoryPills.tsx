import { memo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { FEED_CATEGORIES, type FeedCategory } from '../types/feed.types';

type CategoryPillsProps = {
  value: FeedCategory;
  onChange: (category: FeedCategory) => void;
  categories?: readonly FeedCategory[];
};

function CategoryPillsBase({ value, onChange, categories = FEED_CATEGORIES }: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      directionalLockEnabled
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="tablist"
      contentContainerClassName="gap-2 px-4 py-3"
    >
      {categories.map((category) => {
        const selected = category === value;
        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${category} quotes`}
            className={`rounded-full px-4 py-2 active:opacity-80 ${
              selected ? 'bg-black dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected ? 'text-white dark:text-black' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const CategoryPills = memo(CategoryPillsBase);
