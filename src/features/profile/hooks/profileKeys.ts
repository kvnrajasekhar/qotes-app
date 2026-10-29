export const profileKeys = {
  all: ['profile'] as const,
  user: (username: string) => ['profile', 'user', username.toLowerCase()] as const,
  followLists: ['profile', 'follow-list'] as const,
  followList: (userId: string, kind: string) => ['profile', 'follow-list', userId, kind] as const,
  quotes: (userId: string) => ['profile', 'quotes', userId] as const,
};
