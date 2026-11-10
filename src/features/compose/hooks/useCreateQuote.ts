import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { quoteApiV1 } from '../../../core/api/v1/quote.api';
import { profileKeys, type UserProfile } from '../../profile';
import type { QuoteItem } from '../../feed/types/feed.types';
import type { ComposeQuoteInput } from '../types/compose.types';

/** POST /quote, then refresh every list that could now contain the new quote. */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem, ApiRequestError, ComposeQuoteInput>({
    mutationFn: ({ text, author, category, tags }) =>
      quoteApiV1.create({
        text: text.trim(),
        author: author.trim() || 'Anonymous',
        category: category ?? undefined,
        hashtags: tags,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.setQueriesData<UserProfile>({ queryKey: profileKeys.currentRoot }, (profile) =>
        profile
          ? {
              ...profile,
              stats: { ...profile.stats, quoteCount: profile.stats.quoteCount + 1 },
            }
          : profile,
      );
      void queryClient.invalidateQueries({ queryKey: ['profile', 'quotes'] });
    },
  });
}
