import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { quoteApiV1 } from '../../../core/api/v1/quote.api';
import { isMockQuoteId } from '../data/mockQuotes';
import type { FeedPage, QuoteItem } from '../types/feed.types';
import { quoteKeys } from './quoteKeys';

const PAGE_SIZE = 10;

/** Community commentary written about one quote. Only runs while `enabled` (i.e. the tab is open). */
export function useReflections(quoteId: string | undefined, enabled: boolean) {
  const query = useInfiniteQuery<FeedPage, Error, { pages: FeedPage[] }, readonly unknown[], string | undefined>({
    queryKey: quoteKeys.reflections(quoteId ?? ''),
    enabled: enabled && Boolean(quoteId),
    initialPageParam: undefined,
    queryFn: async ({ pageParam, signal }) => {
      if (quoteId && isMockQuoteId(quoteId)) return { quotes: [], pagination: { cursor: null, hasMore: false } };
      return quoteApiV1.getReflections(quoteId as string, { cursor: pageParam, limit: PAGE_SIZE, signal });
    },
    getNextPageParam: (last) => (last.pagination.hasMore ? (last.pagination.cursor ?? undefined) : undefined),
    retry: 1,
  });

  const reflections = useMemo(() => {
    const seen = new Set<string>();
    const out: QuoteItem[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const quote of page.quotes) {
        if (seen.has(quote._id)) continue;
        seen.add(quote._id);
        out.push(quote);
      }
    }
    return out;
  }, [query.data?.pages]);

  return {
    reflections,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
