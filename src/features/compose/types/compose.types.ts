import { FEED_CATEGORIES, type FeedCategory } from '../../feed/types/feed.types';

export const QUOTE_MIN_LENGTH = 10;
export const QUOTE_MAX_LENGTH = 500;
export const AUTHOR_MAX_LENGTH = 80;
export const MAX_TAGS = 5;
export const TAG_MAX_LENGTH = 24;

/** Everything in the feed's filter rail except "All". */
export const COMPOSE_CATEGORIES: readonly Exclude<FeedCategory, 'All'>[] = FEED_CATEGORIES.filter(
  (c): c is Exclude<FeedCategory, 'All'> => c !== 'All',
);

export type QuoteValidity = 'empty' | 'too-short' | 'valid' | 'too-long';

export function quoteValidity(text: string): QuoteValidity {
  const length = text.trim().length;
  if (length === 0) return 'empty';
  if (length < QUOTE_MIN_LENGTH) return 'too-short';
  if (length > QUOTE_MAX_LENGTH) return 'too-long';
  return 'valid';
}

export interface ComposeQuoteInput {
  text: string;
  author: string;
  category: string | null;
  /** Without the leading "#". */
  tags: string[];
}

/** "Requote with thoughts" reflections. */
export const REQUOTE_COMMENTARY_MAX = 200;
