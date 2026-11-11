import type { ReactionType } from '../../feed/types/feed.types';

export interface ReactionUser {
  /** Unique row id. */
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionUsersPage {
  users: ReactionUser[];
  pagination: { cursor: string | null; hasMore: boolean };
}

export type ReactionFilter = 'all' | ReactionType;
