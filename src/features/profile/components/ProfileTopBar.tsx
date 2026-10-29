import { ArrowLeft, MoreHorizontal } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';

type ProfileTopBarProps = {
  title: string;
  onBack?: () => void;
  onMore?: () => void;
};

export function ProfileTopBar({ title, onBack, onMore }: ProfileTopBarProps) {
  const { colors } = useThemeColors('app');
  return (
    <View className="h-14 w-full max-w-md flex-row items-center justify-between self-center border-b border-neutral-200 bg-white px-2 dark:border-neutral-800 dark:bg-black">
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" className="h-11 w-11 items-center justify-center">
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
      ) : <View className="w-11" />}
      <Text accessibilityRole="header" numberOfLines={1} className="flex-1 text-center text-[16px] font-bold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      {onMore ? (
        <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel="More profile options" className="h-11 w-11 items-center justify-center">
          <MoreHorizontal size={22} color={colors.text} />
        </Pressable>
      ) : <View className="w-11" />}
    </View>
  );
}
