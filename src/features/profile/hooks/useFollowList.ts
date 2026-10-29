import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { userApiV1 } from '../../../core/api/v1/user.api';
import type { FollowListKind, FollowListPage, FollowListUser } from '../types/profile.types';
import { profileKeys } from './profileKeys';
import { useUserProfile } from './useUserProfile';

const PAGE_SIZE = 20;

/** Cursor-paginated followers / following of `username`. Resolves the username to a user id first. */
export function useFollowList(username: string | undefined, kind: FollowListKind) {
  const profileState = useUserProfile(username);
  const userId = profileState.profile?._id;

  const query = useInfiniteQuery<FollowListPage, Error, { pages: FollowListPage[] }, readonly unknown[], string | undefined>({
    queryKey: profileKeys.followList(userId ?? '', kind),
    enabled: Boolean(userId),
    initialPageParam: undefined,
    queryFn: ({ pageParam, signal }) =>
      userApiV1.getFollowList(userId as string, kind, {
        cursor: pageParam,
        limit: PAGE_SIZE,
        signal,
      }),
    getNextPageParam: (last) => (last.pagination.hasMore ? (last.pagination.cursor ?? undefined) : undefined),
  });

  const users = useMemo(() => {
    const seen = new Set<string>();
    const out: FollowListUser[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const user of page.users) {
        if (seen.has(user._id)) continue;
        seen.add(user._id);
        out.push(user);
      }
    }
    return out;
  }, [query.data?.pages]);

  return {
    profile: profileState.profile,
    users,
    total: query.data?.pages[0]?.pagination.total,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching && !query.isFetchingNextPage,
    isLoading: profileState.isLoading || query.isLoading,
    isError: profileState.isError || query.isError,
    error: profileState.error ?? query.error,
    notFound: profileState.notFound,
    refetch: async () => {
      await Promise.all([profileState.refetch(), query.refetch()]);
    },
  };
}
