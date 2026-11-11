import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { quoteApiV1 } from '../../../core/api/v1/quote.api';
import { isMockQuoteId } from '../../feed/data/mockQuotes';
import { quoteKeys } from '../../feed/hooks/quoteKeys';
import type { QuoteItem } from '../../feed/types/feed.types';
import {
  patchQuoteEverywhere,
  restoreQuoteCaches,
  seedQuoteDetail,
  snapshotQuoteCaches,
  type CacheSnapshot,
} from '../../feed/utils/quoteCache';

export interface RequoteVariables {
  parent: QuoteItem;
  /** Omit for "requote to profile"; provide for "requote with commentary". */
  commentary?: string;
}

/** Optimistic requote: the counter ticks up and the quote is marked as requoted before the request settles. */
export function useRequote() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, RequoteVariables, { snapshots: CacheSnapshot[] }>({
    mutationFn: async ({ parent, commentary }) => {
      if (isMockQuoteId(parent._id)) return; // dev sample data: local only
      await quoteApiV1.requote(parent._id, commentary);
    },
    onMutate: async ({ parent }) => {
      await queryClient.cancelQueries({ queryKey: quoteKeys.detail(parent._id) });
      seedQuoteDetail(queryClient, parent._id);
      const snapshots = snapshotQuoteCaches(queryClient);
      patchQuoteEverywhere(queryClient, parent._id, (q) => ({
        ...q,
        repostsCount: q.repostsCount + 1,
        viewerRequoted: true,
      }));
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context) restoreQuoteCaches(queryClient, context.snapshots);
    },
    onSuccess: (_data, { parent, commentary }) => {
      // The new requote should appear in feeds and on the viewer's profile.
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (commentary?.trim()) void queryClient.invalidateQueries({ queryKey: quoteKeys.reflections(parent._id) });
    },
  });
}
