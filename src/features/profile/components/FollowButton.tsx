import { ActivityIndicator, Pressable, Text } from 'react-native';

export type FollowState = 'follow' | 'following' | 'follow-back';

type FollowButtonProps = {
  state: FollowState;
  accessibilityName: string;
  onPress: () => void;
  loading?: boolean;
  size?: 'md' | 'sm';
};

const labels: Record<FollowState, string> = {
  follow: 'Follow',
  following: 'Following',
  'follow-back': 'Follow back',
};

export function FollowButton({
  state,
  accessibilityName,
  onPress,
  loading = false,
  size = 'md',
}: FollowButtonProps) {
  const following = state === 'following';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={`${labels[state]} ${accessibilityName}`}
      accessibilityState={{ disabled: loading, selected: following, busy: loading }}
      className={`min-h-11 items-center justify-center rounded-full active:opacity-70 ${
        size === 'sm' ? 'min-w-[96px] px-4' : 'min-w-[112px] px-5'
      } ${
        following
          ? 'border border-neutral-500 bg-white dark:border-neutral-500 dark:bg-black'
          : 'bg-neutral-900 dark:bg-neutral-100'
      }`}
    >
      {loading ? (
        <ActivityIndicator color={following ? '#737373' : '#FFFFFF'} />
      ) : (
        <Text className={`text-[14px] font-bold ${
          following ? 'text-neutral-900 dark:text-neutral-100' : 'text-white dark:text-black'
        }`}>
          {labels[state]}
        </Text>
      )}
    </Pressable>
  );
}
