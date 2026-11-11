import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { ReactionPickerSheet } from '../../reactions/components/ReactionPickerSheet';
import { RequoteChoiceSheet } from '../components/RequoteChoiceSheet';
import type { QuoteCreator, QuoteHandlers, QuoteItem } from '../types/feed.types';

/**
 * Default behaviour for every surface that lists quotes: React opens the reaction picker, Requote opens the
 * choice sheet, tapping a quote opens its detail, tapping a name opens the profile.
 * Render `sheets` once somewhere inside the screen.
 */
export function useQuoteInteractions(): { handlers: QuoteHandlers; sheets: ReactNode } {
  const router = useRouter();
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [requoting, setRequoting] = useState<QuoteItem | null>(null);

  const onPressReact = useCallback((quote: QuoteItem) => setReactingId(quote._id), []);
  const onPressRepost = useCallback((quote: QuoteItem) => setRequoting(quote), []);
  const onPressQuote = useCallback((quote: QuoteItem) => router.push(`/quote/${quote._id}`), [router]);
  const onPressUser = useCallback(
    (creator: QuoteCreator) => {
      if (creator.username && creator.username !== 'unknown') router.push(`/u/${creator.username}`);
    },
    [router],
  );

  const handlers = useMemo<QuoteHandlers>(
    () => ({ onPressReact, onPressRepost, onPressQuote, onPressUser }),
    [onPressReact, onPressRepost, onPressQuote, onPressUser],
  );

  const sheets = (
    <>
      <ReactionPickerSheet quoteId={reactingId} onClose={() => setReactingId(null)} />
      <RequoteChoiceSheet quote={requoting} onClose={() => setRequoting(null)} />
    </>
  );

  return { handlers, sheets };
}
