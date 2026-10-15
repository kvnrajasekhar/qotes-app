export const REACTION_TYPES = ['insightful', 'empowering', 'resonant', 'artistic', 'clap'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];
export type ReactionCounts = Record<ReactionType, number>;

export const FEED_CATEGORIES = ['All', 'Philosophy', 'Literature', 'Stoicism', 'Poetry', 'Science', 'Art'] as const;
export type FeedCategory = (typeof FEED_CATEGORIES)[number];

export interface QuoteCreator {
  _id: string;
  username: string;
  avatarUrl?: string;
}

export interface QuoteItem {
  _id: string;
  /** 10–500 characters. */
  text: string;
  /** Defaults to "Anonymous". */
  author: string;
  creator: QuoteCreator;
  /** e.g. "Philosophy". Empty string when uncategorised. */
  category: string;
  /** Hashtags including the leading "#", e.g. "#stoic". */
  tags: string[];
  reactions: ReactionCounts;
  userReaction?: ReactionType | null;
  savesCount: number;
  repostsCount: number;
  isSaved?: boolean;
  createdAt: string;
}

export interface FeedPagination {
  cursor: string | null;
  hasMore: boolean;
}

export interface FeedPage {
  quotes: QuoteItem[];
  pagination: FeedPagination;
}

/** Standard API envelope for GET /v1/feed/global. */
export interface FeedResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: FeedPage;
}
