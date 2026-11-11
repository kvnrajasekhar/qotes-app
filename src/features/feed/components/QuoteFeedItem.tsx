import { memo } from 'react';

import type { QuoteHandlers, QuoteItem } from '../types/feed.types';
import { CompositeQuoteCard } from './CompositeQuoteCard';
import { QuoteCard } from './QuoteCard';

type QuoteFeedItemProps = { quote: QuoteItem; handlers: QuoteHandlers };

/**
 * Picks the right card for a feed entry:
 * - requote with commentary -> CompositeQuoteCard
 * - plain requote ("requote to profile") -> the original quote under a "@user requoted" banner
 * - anything else -> QuoteCard
 */
function QuoteFeedItemBase({ quote, handlers }: QuoteFeedItemProps) {
  if (quote.isRequote && quote.parent) {
    if (quote.text.trim()) return <CompositeQuoteCard quote={quote} handlers={handlers} />;
    return <QuoteCard quote={quote.parent} requotedBy={quote.creator.username} {...handlers} />;
  }
  return <QuoteCard quote={quote} {...handlers} />;
}

export const QuoteFeedItem = memo(QuoteFeedItemBase);
