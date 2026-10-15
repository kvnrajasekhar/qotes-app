import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';

type AuthLayoutProps = {
  children: ReactNode;
  /** When provided, a back chevron is rendered. A spacer is kept otherwise so titles align across screens. */
  onBack?: () => void;
};

/** Keyboard-safe, scrollable, centred (max-w-md) shell shared by the password-recovery screens. */
export function AuthLayout({ children, onBack }: AuthLayoutProps) {
  const { colors } = useTheme('auth');
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 32,
          }}
        >
          <View className="w-full max-w-md gap-6 px-6">
            <View className="h-10 justify-center">
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  className="h-10 w-10 justify-center active:opacity-70"
                >
                  <Text style={{ color: colors.text, fontSize: 32, lineHeight: 36 }}>‹</Text>
                </Pressable>
              ) : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
