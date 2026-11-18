import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../core/api/client';
import { quoteApiV1 } from '../../../core/api/v1/quote.api';
import type { QuoteItem } from '../../feed';
import type { ComposeQuoteInput } from '../types/compose.types';

type UpdateQuoteVariables = {
  quoteId: string;
  input: ComposeQuoteInput;
};

/** PATCH /quote/:id, then refresh every cached list that can show the edited quote. */
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem, ApiRequestError, UpdateQuoteVariables>({
    mutationFn: ({ quoteId, input }) =>
      quoteApiV1.update(quoteId, {
        text: input.text.trim(),
        author: input.author.trim() || 'Anonymous',
        category: input.category ?? '',
        hashtags: input.tags,
      }),
    onSuccess: (updated, { quoteId }) => {
      queryClient.setQueryData<QuoteItem>(['quote', quoteId], (current) =>
        current
          ? {
              ...current,
              text: updated.text,
              author: updated.author,
              category: updated.category,
              tags: updated.tags,
            }
          : updated,
      );
      void queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', 'quotes'] });
    },
  });
}
