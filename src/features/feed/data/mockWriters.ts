import type { SuggestedWriter } from '../../profile/types/profile.types';

/** Dev-only suggested writers, shown when the API has none. Ids starting "mock-" never hit the network. */
export const MOCK_WRITERS: SuggestedWriter[] = [
  { _id: 'mock-writer-leo', username: 'leo', displayName: 'Leo Marin', followerCount: 1800, isFollowing: false },
  { _id: 'mock-writer-ana', username: 'ana', displayName: 'Ana Ruiz', followerCount: 921, isFollowing: false },
  { _id: 'mock-writer-sam', username: 'sam', displayName: 'Sam Okoye', followerCount: 340, isFollowing: false },
  { _id: 'mock-writer-ravi', username: 'ravi', displayName: 'Ravi Patel', followerCount: 212, isFollowing: false },
];
