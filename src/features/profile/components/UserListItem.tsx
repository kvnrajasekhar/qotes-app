import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FollowListUser } from '../types/profile.types';
import { MonogramAvatar } from '../../../shared/components/MonogramAvatar';
import { FollowButton, type FollowState } from './FollowButton';

type UserListItemProps = {
  user: FollowListUser;
  /** True when this row is the signed-in user: no follow button is rendered. */
  isSelf: boolean;
  onPress: (user: FollowListUser) => void;
  onToggleFollow: (user: FollowListUser) => void;
  pending?: boolean;
};

function stateOf(user: FollowListUser): FollowState {
  if (user.isFollowing) return 'following';
  return user.followsYou ? 'follow-back' : 'follow';
}

function UserListItemBase({ user, isSelf, onPress, onToggleFollow, pending = false }: UserListItemProps) {
  return (
    <View className="w-full max-w-md flex-row items-center gap-3 self-center border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <Pressable
        onPress={() => onPress(user)}
        accessibilityRole="button"
        accessibilityLabel={`View @${user.username}`}
        className="flex-1 flex-row items-center gap-3 active:opacity-70"
      >
        <MonogramAvatar username={user.username} displayName={user.displayName} avatarUrl={user.avatarUrl} size={44} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15px] font-bold text-neutral-900 dark:text-neutral-100">
            @{user.username}
          </Text>
          {user.displayName !== user.username ? (
            <Text numberOfLines={1} className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
              {user.displayName}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {isSelf ? null : (
        <FollowButton
          size="sm"
          state={stateOf(user)}
          loading={pending}
          accessibilityName={`@${user.username}`}
          onPress={() => onToggleFollow(user)}
        />
      )}
    </View>
  );
}

export const UserListItem = memo(UserListItemBase);
