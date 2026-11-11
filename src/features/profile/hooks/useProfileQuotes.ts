import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { userApiV1 } from '../../../core/api/v1/user.api';
import type { QuoteItem } from '../../feed/types/feed.types';
import type { ProfileTabKey } from '../types/profile.types';
import { profileKeys } from './profileKeys';

const PAGE_SIZE = 20;

export function useProfileQuotes(userId: string, tab: ProfileTabKey) {
  const query = useInfiniteQuery({
    queryKey: [...profileKeys.quotes(userId), tab],
    enabled: Boolean(userId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => {
      const options = { cursor: pageParam, limit: PAGE_SIZE, signal };
      return tab === 'saved' ? userApiV1.getSavedQuotes(options) : userApiV1.getUserQuotes(userId, options);
    },
    getNextPageParam: (last) => (last.pagination.hasMore ? (last.pagination.cursor ?? undefined) : undefined),
    retry: 1,
  });

  const quotes = useMemo<QuoteItem[]>(
    () => query.data?.pages.flatMap((page) => page.quotes) ?? [],
    [query.data?.pages],
  );

  return { ...query, quotes };
}
