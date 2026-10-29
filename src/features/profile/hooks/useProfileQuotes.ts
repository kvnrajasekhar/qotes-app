import { useInfiniteQuery } from '@tanstack/react-query';

import { apiClient } from '../../../core/api/client';
import { mapQuote } from '../../feed/api/feedApi';
import type { FeedPage } from '../../feed/types/feed.types';
import { profileKeys } from './profileKeys';

const PAGE_SIZE = 20;

function mapPage(value: unknown): FeedPage {
  const raw = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const paginationValue = raw.pagination ?? raw.meta;
  const pagination = typeof paginationValue === 'object' && paginationValue !== null
    ? paginationValue as Record<string, unknown>
    : {};
  const quotes = Array.isArray(raw.quotes) ? raw.quotes : [];
  const cursor = typeof pagination.cursor === 'string' ? pagination.cursor :
    typeof pagination.nextCursor === 'string' ? pagination.nextCursor : null;
  return {
    quotes: quotes.map(mapQuote).filter((quote) => quote !== null),
    pagination: { cursor, hasMore: pagination.hasMore === true && cursor !== null },
  };
}

export function useProfileQuotes(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: profileKeys.quotes(userId),
    enabled: Boolean(userId) && enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (pageParam) query.set('cursor', pageParam);
      const data = await apiClient.get(
        `/feed/q/${encodeURIComponent(userId)}?${query.toString()}`,
        signal,
      );
      return mapPage(data);
    },
    getNextPageParam: (last) => last.pagination.hasMore ? last.pagination.cursor ?? undefined : undefined,
    retry: 1,
  });
}
