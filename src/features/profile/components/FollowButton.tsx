import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useThemeColors } from '../../../shared/hooks/useTheme';

export type FollowState = 'follow' | 'following' | 'follow-back';

const LABEL: Record<FollowState, string> = {
  follow: 'Follow',
  following: 'Following',
  'follow-back': 'Follow Back',
};

type FollowButtonProps = {
  state: FollowState;
  onPress: () => void;
  loading?: boolean;
  size?: 'sm' | 'md';
  accessibilityName?: string;
};

/** Filled for "Follow" / "Follow Back", outlined for "Following". */
export function FollowButton({ state, onPress, loading = false, size = 'md', accessibilityName }: FollowButtonProps) {
  const { colors } = useThemeColors('app');
  const filled = state !== 'following';
  const label = LABEL[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityName ? `${label} ${accessibilityName}` : label}
      accessibilityState={{ selected: state === 'following', busy: loading }}
      className={`items-center justify-center rounded-full active:opacity-80 ${
        size === 'sm' ? 'h-9 min-w-[96px] px-4' : 'h-10 min-w-[104px] px-5'
      } ${filled ? 'bg-black dark:bg-white' : 'border border-neutral-900 bg-transparent dark:border-neutral-100'}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={filled ? colors.buttonText : colors.text} />
      ) : (
        <Text className={`text-[14px] font-bold ${filled ? 'text-white dark:text-black' : 'text-neutral-900 dark:text-neutral-100'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
