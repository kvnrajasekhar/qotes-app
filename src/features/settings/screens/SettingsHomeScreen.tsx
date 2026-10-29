import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../shared/hooks/useTheme';

export function SettingsHomeScreen() {
  const router = useRouter();
  const { colors } = useThemeColors('app');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <View className="w-full max-w-md flex-1 self-center px-4">
        <View className="h-14 flex-row items-center gap-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text accessibilityRole="header" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings/edit-profile')}
          accessibilityRole="button"
          className="h-14 flex-row items-center gap-4 border-b border-neutral-200 dark:border-neutral-800"
        >
          <UserRound size={20} color={colors.text} />
          <Text className="flex-1 text-base text-neutral-900 dark:text-neutral-100">Edit profile</Text>
          <ChevronRight size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
