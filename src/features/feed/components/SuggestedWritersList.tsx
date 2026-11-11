import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { useThemeColors } from '../../../shared/hooks/useTheme';
import { FollowButton } from '../../profile/components/FollowButton';
import { useFollowToggle } from '../../profile/hooks/useFollowToggle';
import type { SuggestedWriter } from '../../profile/types/profile.types';
import { useSuggestedWriters } from '../hooks/useSuggestedWriters';
import { formatCount } from '../utils/format';

/** "Suggested writers": avatar, @handle, follower count, inline Follow button. */
export function SuggestedWritersList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useThemeColors('app');
  const { writers, isLoading } = useSuggestedWriters();
  const toggle = useFollowToggle();
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isFollowing = (w: SuggestedWriter) => followState[w._id] ?? w.isFollowing;

  const onToggle = (writer: SuggestedWriter) => {
    const next = !isFollowing(writer);
    setFollowState((s) => ({ ...s, [writer._id]: next }));

    // Dev sample writers are local-only.
    if (writer._id.startsWith('mock-')) return;

    setPendingId(writer._id);
    toggle.mutate(
      { user: writer, follow: next },
      {
        onSuccess: (result) => {
          setFollowState((s) => ({ ...s, [writer._id]: result.followed }));
          // New follows change what the Following feed should contain.
          void queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
        onError: () => setFollowState((s) => ({ ...s, [writer._id]: !next })),
        onSettled: () => setPendingId(null),
      },
    );
  };

  if (isLoading) {
    return (
      <View className="py-8">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }
  if (writers.length === 0) return null;

  return (
    <View>
      <Text accessibilityRole="header" className="mb-1 text-[18px] font-bold text-neutral-900 dark:text-neutral-100">
        Suggested writers
      </Text>
      {writers.map((writer) => (
        <View
          key={writer._id}
          className="flex-row items-center gap-3 border-b border-neutral-200 py-3 dark:border-neutral-800"
        >
          <Pressable
            onPress={() => router.push(`/u/${writer.username}`)}
            accessibilityRole="button"
            accessibilityLabel={`View @${writer.username}`}
            className="flex-1 flex-row items-center gap-3 active:opacity-70"
          >
            <MonogramAvatar username={writer.username} displayName={writer.displayName} avatarUrl={writer.avatarUrl} size={48} />
            <View className="flex-1">
              <Text numberOfLines={1} className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
                @{writer.username}
              </Text>
              <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                {formatCount(writer.followerCount)} followers
              </Text>
            </View>
          </Pressable>
          <FollowButton
            size="sm"
            state={isFollowing(writer) ? 'following' : 'follow'}
            loading={pendingId === writer._id}
            accessibilityName={`@${writer.username}`}
            onPress={() => onToggle(writer)}
          />
        </View>
      ))}
    </View>
  );
}
