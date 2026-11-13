export const REACTION_TYPES = ['insightful', 'empowering', 'resonant', 'artistic', 'clap'] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];
export type ReactionFilter = 'all' | ReactionType;

export interface ReactionUser {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionUsersPage {
  users: ReactionUser[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
  };
}