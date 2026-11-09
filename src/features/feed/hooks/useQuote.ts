import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { quoteApiV1 } from '../../../core/api/v1/quote.api';
import { isMockQuoteId } from '../data/mockQuotes';
import type { QuoteItem } from '../types/feed.types';
import { findCachedQuote } from '../utils/quoteCache';
import { quoteKeys } from './quoteKeys';

/**
 * One quote by id. Paints instantly from whatever list already contains it, then revalidates.
 * Dev sample quotes (ids starting "mock-") are served from memory and never fetched.
 */
export function useQuote(id: string | null | undefined) {
  const queryClient = useQueryClient();

  return useQuery<QuoteItem, ApiRequestError>({
    queryKey: quoteKeys.detail(id ?? ''),
    enabled: Boolean(id) && !isMockQuoteId(id ?? ''),
    queryFn: ({ signal }) => quoteApiV1.getById(id as string, signal),
    initialData: () => (id ? findCachedQuote(queryClient, id) : undefined),
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    retry: (failures, err) => err.status !== 404 && failures < 2,
  });
}
