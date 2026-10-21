import { useMemo } from 'react';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { feedStorage } from '../../../shared/lib/storage';
import { fetchGlobalFeed } from '../api/feedApi';
import type { FeedCategory, FeedPage, QuoteItem } from '../types/feed.types';

export const FEED_PAGE_SIZE = 10;
const SNAPSHOT_KEY = 'last_global_feed_snapshot';
const SNAPSHOT_VERSION = 1;

export const feedKeys = {
  global: (category: FeedCategory, limit: number) => ['feed', 'global', category, limit] as const,
};

/* ----------------------- MMKV snapshot (sync) ----------------------- */

function readSnapshot(): FeedPage | null {
  try {
    const raw = feedStorage.getString(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: number; page?: FeedPage };
    if (parsed.v !== SNAPSHOT_VERSION || !parsed.page || !Array.isArray(parsed.page.quotes)) return null;
    return parsed.page.quotes.length > 0 ? parsed.page : null;
  } catch {
    return null; // corrupt snapshot: behave like a cold cache
  }
}

function writeSnapshot(page: FeedPage): void {
  try {
    if (page.quotes.length === 0) return;
    feedStorage.set(SNAPSHOT_KEY, JSON.stringify({ v: SNAPSHOT_VERSION, page }));
  } catch {
    // Disk cache is best-effort; never fail a network success because of it.
  }
}

/** Call on sign-out so the next user never paints the previous user's feed. */
export function clearFeedSnapshot(): void {
  feedStorage.delete(SNAPSHOT_KEY);
}

/* ------------------------------ helpers ------------------------------ */

const matchesCategory = (quote: QuoteItem, category: FeedCategory) =>
  category === 'All' || quote.category.toLowerCase() === category.toLowerCase();

function flattenUnique(pages: FeedPage[] | undefined, category: FeedCategory): QuoteItem[] {
  if (!pages) return [];
  const seen = new Set<string>();
  const out: QuoteItem[] = [];
  for (const page of pages) {
    for (const quote of page.quotes) {
      if (seen.has(quote._id) || !matchesCategory(quote, category)) continue;
      seen.add(quote._id);
      out.push(quote);
    }
  }
  return out;
}

/* -------------------------------- hook -------------------------------- */

export function useInfiniteFeed(category: FeedCategory = 'All', limit: number = FEED_PAGE_SIZE) {
  // Read once per category, synchronously, so the first render already has content.
  const snapshot = useMemo(() => (category === 'All' ? readSnapshot() : null), [category]);

  const query = useInfiniteQuery({
    queryKey: feedKeys.global(category, limit),
    queryFn: async ({ pageParam, signal }) => {
      const page = await fetchGlobalFeed({ cursor: pageParam, limit, category, signal });
      if (!pageParam && category === 'All') writeSnapshot(page);
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pagination.hasMore ? (last.pagination.cursor ?? undefined) : undefined),
    initialData: snapshot
      ? ({ pages: [snapshot], pageParams: [undefined] } satisfies InfiniteData<FeedPage, string | undefined>)
      : undefined,
    // Mark hydrated data as already stale so it paints instantly AND revalidates on mount.
    initialDataUpdatedAt: 0,
    // Fail fast so an unreachable server falls through to the empty state, not a 7s spinner.
    retry: 1,
  });

  const quotes = useMemo(() => flattenUnique(query.data?.pages, category), [query.data?.pages, category]);

  return {
    quotes,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
    // isRefetching is also true while paginating; expose the "real" refetch only.
    isRefetching: query.isRefetching && !query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}