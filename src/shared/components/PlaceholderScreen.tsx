import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../hooks/useTheme';
import { fonts } from '../tokens/typography';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  onBack?: () => void;
};

/** Stand-in for screens that are designed but not built yet. Replace the route delegate when ready. */
export function PlaceholderScreen({ title, description, onBack }: PlaceholderScreenProps) {
  const { colors } = useThemeColors('app');
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <View className="w-full max-w-md flex-1 self-center px-6">
        <View className="h-14 justify-center">
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" className="h-10 w-10 justify-center">
              <Text style={{ color: colors.text, fontSize: 32, lineHeight: 36 }}>‹</Text>
            </Pressable>
          ) : null}
        </View>
        <View className="flex-1 items-center justify-center pb-24">
          <Text
            accessibilityRole="header"
            style={{ fontFamily: fonts.serifBold, fontWeight: '700' }}
            className="text-center text-[26px] text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </Text>
          <Text className="mt-3 text-center text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
