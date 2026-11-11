import { Text, View } from 'react-native';

/** Centered title strip used by the secondary feeds ("Following", "Discover"). */
export function ScreenTitleBar({ title }: { title: string }) {
  return (
    <View className="h-14 items-center justify-center border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      <Text accessibilityRole="header" className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
    </View>
  );
}
