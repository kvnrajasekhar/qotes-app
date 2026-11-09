import { Pressable, ScrollView, Text } from 'react-native';

import { COMPOSE_CATEGORIES } from '../types/compose.types';

type CategoryChipsProps = {
  value: string | null;
  /** Tapping the selected chip clears the choice. */
  onChange: (category: string | null) => void;
};

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-2 pr-6"
    >
      {COMPOSE_CATEGORIES.map((category) => {
        const selected = category === value;
        return (
          <Pressable
            key={category}
            onPress={() => onChange(selected ? null : category)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Category ${category}`}
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
