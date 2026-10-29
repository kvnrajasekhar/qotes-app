import { Pressable, Text, View } from 'react-native';

import type { ProfileTabKey } from '../types/profile.types';

const LABELS: Record<ProfileTabKey, string> = { quotes: 'Quotes', saved: 'Saved' };

type ProfileTabsProps = {
  tabs: readonly ProfileTabKey[];
  value: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

/** Underlined segmented control. Has an opaque background so it can stick under the top bar. */
export function ProfileTabs({ tabs, value, onChange }: ProfileTabsProps) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
    >
      {tabs.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center active:opacity-70"
          >
            <Text
              className={`py-3.5 text-[15px] ${
                selected
                  ? 'font-bold text-neutral-900 dark:text-neutral-100'
                  : 'font-medium text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {LABELS[tab]}
            </Text>
            <View
              className={`h-[2px] w-full ${selected ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-transparent'}`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
