import type { FeedCategory, QuoteItem } from '../types/feed.types';

/**
 * Development-only fallback shown when the API returns no quotes (or is unreachable).
 * Turn it off with EXPO_PUBLIC_FEED_DEV_FALLBACK=false to see the real empty state.
 * Always false in production builds.
 */
export const IS_DEV_FALLBACK: boolean =
  __DEV__ && process.env.EXPO_PUBLIC_FEED_DEV_FALLBACK !== 'false';

const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const MOCK_QUOTES: QuoteItem[] = [
  {
    _id: 'mock-marcus-aurelius',
    text: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    creator: { _id: 'mock-user-1', username: 'stoa_daily' },
    category: 'Stoicism',
    tags: ['#Philosophy', '#Stoicism'],
    reactions: { insightful: 128, empowering: 94, resonant: 41, artistic: 6, clap: 22 },
    userReaction: null,
    savesCount: 212,
    repostsCount: 57,
    isSaved: false,
    createdAt: ago(2 * HOUR),
  },
  {
    _id: 'mock-albert-camus',
    text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
    author: 'Albert Camus',
    creator: { _id: 'mock-user-2', username: 'maya' },
    category: 'Literature',
    tags: ['#Literature'],
    reactions: { insightful: 36, empowering: 52, resonant: 119, artistic: 74, clap: 9 },
    userReaction: 'resonant',
    savesCount: 340,
    repostsCount: 88,
    isSaved: true,
    createdAt: ago(5 * HOUR),
  },
  {
    _id: 'mock-will-durant',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    creator: { _id: 'mock-user-3', username: 'leo' },
    category: 'Philosophy',
    tags: ['#Philosophy', '#Habits'],
    reactions: { insightful: 83, empowering: 61, resonant: 18, artistic: 2, clap: 31 },
    userReaction: null,
    savesCount: 95,
    repostsCount: 24,
    isSaved: false,
    createdAt: ago(26 * HOUR),
  },
];

export function getMockQuotes(category: FeedCategory = 'All'): QuoteItem[] {
  if (category === 'All') return MOCK_QUOTES;
  return MOCK_QUOTES.filter((q) => q.category.toLowerCase() === category.toLowerCase());
}
