import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';

import { MOCK_QUOTES } from '../data/mockQuotes';
import { quoteKeys } from '../hooks/quoteKeys';
import type { FeedPage, QuoteItem } from '../types/feed.types';

/** Every cache root that holds paginated lists of quotes. */
const LIST_ROOTS: readonly QueryKey[] = [['feed'], ['profile', 'quotes'], ['profile', 'saved']];

export type CacheSnapshot = [QueryKey, unknown];

/** Looks for a quote in the detail cache, then any cached list, then dev sample data. */
export function findCachedQuote(queryClient: QueryClient, id: string): QuoteItem | undefined {
  const detail = queryClient.getQueryData<QuoteItem>(quoteKeys.detail(id));
  if (detail) return detail;

  for (const root of LIST_ROOTS) {
    for (const [, data] of queryClient.getQueriesData<InfiniteData<FeedPage>>({ queryKey: root })) {
      for (const page of data?.pages ?? []) {
        const hit = page.quotes.find((q) => q._id === id);
        if (hit) return hit;
      }
    }
  }
  return MOCK_QUOTES.find((q) => q._id === id);
}

/** Makes sure ['quote', id] exists so optimistic edits (and rollbacks) have something to act on. */
export function seedQuoteDetail(queryClient: QueryClient, id: string): void {
  if (queryClient.getQueryData(quoteKeys.detail(id))) return;
  const found = findCachedQuote(queryClient, id);
  if (found) queryClient.setQueryData(quoteKeys.detail(id), found);
}

export function snapshotQuoteCaches(queryClient: QueryClient): CacheSnapshot[] {
  return [
    ...queryClient.getQueriesData({ queryKey: ['quote'] }),
    ...LIST_ROOTS.flatMap((root) => queryClient.getQueriesData({ queryKey: root })),
  ];
}

export function restoreQuoteCaches(queryClient: QueryClient, snapshots: CacheSnapshot[]): void {
  snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

/** Applies `updater` to one quote everywhere it is cached: detail view and every paginated list. */
export function patchQuoteEverywhere(
  queryClient: QueryClient,
  id: string,
  updater: (quote: QuoteItem) => QuoteItem,
): void {
  queryClient.setQueryData<QuoteItem>(quoteKeys.detail(id), (old) => (old ? updater(old) : old));

  for (const root of LIST_ROOTS) {
    queryClient.setQueriesData<InfiniteData<FeedPage>>({ queryKey: root }, (old) =>
      old && Array.isArray(old.pages)
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              quotes: page.quotes.map((q) => (q._id === id ? updater(q) : q)),
            })),
          }
        : old,
    );
  }
}
