import { MoreHorizontal } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileTopBarProps = {
  title: string;
  onBack?: () => void;
  onMore?: () => void;
};

/** Fixed dark bar (stays put while the list scrolls) so light status-bar icons are always legible. */
export function ProfileTopBar({ title, onBack, onMore }: ProfileTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="bg-neutral-900 dark:bg-neutral-800">
      <View className="h-14 items-center justify-center px-14">
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="absolute left-3 h-9 w-9 items-center justify-center rounded-full bg-black/50 active:opacity-70"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 26, lineHeight: 30 }}>‹</Text>
          </Pressable>
        ) : null}
        <Text numberOfLines={1} accessibilityRole="header" className="text-[16px] font-bold text-white">
          {title}
        </Text>
        {onMore ? (
          <Pressable
            onPress={onMore}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More options"
            className="absolute right-3 h-9 w-9 items-center justify-center active:opacity-70"
          >
            <MoreHorizontal size={22} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
