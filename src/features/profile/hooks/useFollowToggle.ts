import { useMutation, useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { userApiV1 } from '../../../core/api/v1/user.api';
import { SESSION_IDENTITY_KEY, type SessionIdentity } from '../../../shared/lib/session';
import type { FollowListPage, UserProfile } from '../types/profile.types';
import { profileKeys } from './profileKeys';

export interface FollowTarget {
  _id: string;
  username: string;
}

interface Variables {
  user: FollowTarget;
  /** The state the user wants: true = follow, false = unfollow. */
  follow: boolean;
}

/** Writes the follow state into every cache that shows it: target profile, my following count, list rows. */
function applyFollow(queryClient: QueryClient, target: FollowTarget, follow: boolean): void {
  const prior = queryClient.getQueryData<UserProfile>(profileKeys.user(target.username))?.isFollowing;
  const delta = prior === follow ? 0 : follow ? 1 : -1;

  queryClient.setQueryData<UserProfile>(profileKeys.user(target.username), (old) =>
    old
      ? {
          ...old,
          isFollowing: follow,
          stats: { ...old.stats, followerCount: Math.max(0, old.stats.followerCount + delta) },
        }
      : old,
  );

  const me = queryClient.getQueryData<SessionIdentity | null>(SESSION_IDENTITY_KEY);
  if (me && delta !== 0) {
    queryClient.setQueryData<UserProfile>(profileKeys.user(me.username), (old) =>
      old
        ? { ...old, stats: { ...old.stats, followingCount: Math.max(0, old.stats.followingCount + delta) } }
        : old,
    );
  }

  queryClient.setQueriesData<InfiniteData<FollowListPage, string | undefined>>(
    { queryKey: profileKeys.followLists },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          users: page.users.map((u) => (u._id === target._id ? { ...u, isFollowing: follow } : u)),
        })),
      },
  );
}

/**
 * Optimistic follow / unfollow. The server endpoint toggles, so the response's `followed`
 * is treated as the source of truth and corrects the UI if it disagrees.
 */
export function useFollowToggle() {
  const queryClient = useQueryClient();

  return useMutation<
    { followed: boolean },
    ApiRequestError,
    Variables,
    { snapshots: ReturnType<QueryClient['getQueriesData']> }
  >({
    mutationFn: ({ user }) => userApiV1.toggleFollow(user._id),
    onMutate: async ({ user, follow }) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });
      const snapshots = queryClient.getQueriesData({ queryKey: profileKeys.all });
      applyFollow(queryClient, user, follow);
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (data, { user, follow }) => {
      if (data.followed !== follow) applyFollow(queryClient, user, data.followed);
    },
    onSettled: (_data, _err, { user }) => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.user(user.username) });
      const me = queryClient.getQueryData<SessionIdentity | null>(SESSION_IDENTITY_KEY);
      if (me) void queryClient.invalidateQueries({ queryKey: profileKeys.user(me.username) });
    },
  });
}
