/**
 * Enables development-only suggested-writer samples when the API returns no writers.
 * Turn it off with EXPO_PUBLIC_FEED_DEV_FALLBACK=false to see the real empty state.
 * Always false in production builds.
 */
export const IS_DEV_FALLBACK: boolean =
  __DEV__ && process.env.EXPO_PUBLIC_FEED_DEV_FALLBACK !== 'false';

/** Mock-prefixed IDs are local-only and must never be sent to the API. */
export const isMockQuoteId = (id: string): boolean => id.startsWith('mock-');
