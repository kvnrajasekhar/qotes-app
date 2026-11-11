import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { reactionApiV1 } from '../../../core/api/v1/reaction.api';
import { isMockQuoteId } from '../../feed/data/mockQuotes';
import { MOCK_REACTORS } from '../data/mockReactors';
import type { ReactionFilter, ReactionUser, ReactionUsersPage } from '../types/reaction.types';

const PAGE_SIZE = 20;

/** People who reacted to a quote, filtered by emotion ("all" = everyone). Only runs while `enabled`. */
export function useReactionUsers(quoteId: string | null, filter: ReactionFilter, enabled: boolean) {
  const query = useInfiniteQuery<ReactionUsersPage, Error, { pages: ReactionUsersPage[] }, readonly unknown[], string | undefined>({
    queryKey: ['reaction-users', quoteId, filter],
    enabled: enabled && Boolean(quoteId),
    initialPageParam: undefined,
    queryFn: async ({ pageParam, signal }) => {
      if (quoteId && isMockQuoteId(quoteId)) {
        const users = MOCK_REACTORS.filter((u) => filter === 'all' || u.type === filter);
        return { users, pagination: { cursor: null, hasMore: false } };
      }
      return reactionApiV1.getUsers(quoteId as string, {
        type: filter === 'all' ? undefined : filter,
        cursor: pageParam,
        limit: PAGE_SIZE,
        signal,
      });
    },
    getNextPageParam: (last) => (last.pagination.hasMore ? (last.pagination.cursor ?? undefined) : undefined),
    retry: 1,
  });

  const users = useMemo(() => {
    const seen = new Set<string>();
    const out: ReactionUser[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const user of page.users) {
        if (seen.has(user.id)) continue;
        seen.add(user.id);
        out.push(user);
      }
    }
    return out;
  }, [query.data?.pages]);

  return {
    users,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
