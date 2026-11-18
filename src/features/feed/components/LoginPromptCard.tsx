import { Modal, Pressable, Text, View } from 'react-native';

type LoginPromptCardProps = {
  visible: boolean;
  action?: string;
  onDismiss: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
};

export function LoginPromptCard({ visible, action = 'react', onDismiss, onSignIn, onSignUp }: LoginPromptCardProps) {
  return (
    <Modal transparent animationType="fade" statusBarTranslucent visible={visible} onRequestClose={onDismiss}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable
          className="absolute inset-0"
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss sign-in prompt"
        />
        <View
          className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
          accessibilityViewIsModal
          accessibilityLabel={`Sign in to ${action}`}
        >
          <Text
            accessibilityRole="header"
            className="text-[20px] font-bold text-neutral-900 dark:text-neutral-100"
          >
            Sign in to {action}
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
            Sign in or create an account to continue. You can dismiss this and keep reading quotes.
          </Text>
          <Pressable
            onPress={onSignIn}
            accessibilityRole="button"
            className="mt-6 h-12 items-center justify-center rounded-full bg-neutral-900 active:opacity-80 dark:bg-white"
          >
            <Text className="text-[15px] font-bold text-white dark:text-black">Sign in</Text>
          </Pressable>
          <Pressable
            onPress={onSignUp}
            accessibilityRole="button"
            className="mt-3 h-12 items-center justify-center rounded-full border border-neutral-300 active:bg-neutral-100 dark:border-neutral-700 dark:active:bg-neutral-900"
          >
            <Text className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">Create account</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            className="mt-3 h-11 items-center justify-center"
          >
            <Text className="text-[14px] font-medium text-neutral-600 dark:text-neutral-400">Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
