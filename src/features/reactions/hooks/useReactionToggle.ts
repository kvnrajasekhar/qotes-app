import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { reactionApiV1, type ReactionAction } from '../../../core/api/v1/reaction.api';
import { isMockQuoteId } from '../../feed/data/mockQuotes';
import { quoteKeys } from '../../feed/hooks/quoteKeys';
import type { QuoteItem, ReactionType } from '../../feed/types/feed.types';
import {
  patchQuoteEverywhere,
  restoreQuoteCaches,
  seedQuoteDetail,
  snapshotQuoteCaches,
  type CacheSnapshot,
} from '../../feed/utils/quoteCache';

export interface ToggleReactionVariables {
  quoteId: string;
  type: ReactionType;
  /** The viewer's reaction before this tap (from the quote on screen). */
  current: ReactionType | null;
}

/** Pure: moves the viewer's single reaction to `type` (or clears it if it's already `type`). */
export function withToggledReaction(quote: QuoteItem, type: ReactionType): QuoteItem {
  const previous = quote.userReaction ?? null;
  const reactions = { ...quote.reactions };
  if (previous) reactions[previous] = Math.max(0, reactions[previous] - 1);
  const next = previous === type ? null : type;
  if (next) reactions[next] = reactions[next] + 1;
  return { ...quote, reactions, userReaction: next };
}

function actionFor({ current, type }: ToggleReactionVariables): ReactionAction {
  if (!current) return 'add';
  return current === type ? 'remove' : 'update';
}

/**
 * Optimistic reaction toggle. Counters change in every cache that shows the quote before the
 * request settles; a failure restores the previous state.
 */
export function useReactionToggle() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiRequestError, ToggleReactionVariables, { snapshots: CacheSnapshot[] }>({
    mutationFn: async (vars) => {
      if (isMockQuoteId(vars.quoteId)) return; // dev sample data: local only
      await reactionApiV1.toggle(vars.quoteId, { type: vars.type, action: actionFor(vars) });
    },
    onMutate: async ({ quoteId, type }) => {
      await queryClient.cancelQueries({ queryKey: quoteKeys.detail(quoteId) });
      seedQuoteDetail(queryClient, quoteId);
      const snapshots = snapshotQuoteCaches(queryClient);
      patchQuoteEverywhere(queryClient, quoteId, (q) => withToggledReaction(q, type));
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context) restoreQuoteCaches(queryClient, context.snapshots);
    },
    onSettled: (_data, _err, { quoteId }) => {
      // Server counts are written behind (Redis -> Kafka -> Mongo): mark stale but don't refetch now,
      // or the optimistic numbers would briefly snap back.
      void queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId), refetchType: 'none' });
    },
  });
}
