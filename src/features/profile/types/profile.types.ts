import type { ImagePickerAsset } from 'expo-image-picker';

export const BIO_MAX_LENGTH = 200;
export const NAME_MAX_LENGTH = 50;

export type ProfileTabKey = 'quotes' | 'saved';
export type FollowListKind = 'followers' | 'following';

export interface UserStats {
  quoteCount: number;
  followerCount: number;
  followingCount: number;
}

export interface UserProfile {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  /** "First Last", falling back to the username. */
  displayName: string;
  bio: string;
  avatarUrl?: string;
  stats: UserStats;
  /** ISO date the account was created. */
  joinedAt?: string;
  /** Does the signed-in viewer follow this user? (false when the server doesn't say) */
  isFollowing: boolean;
  /** Does this user follow the signed-in viewer? */
  followsYou: boolean;
  isBlocked?: boolean;
}

export interface ViewerProfile extends UserProfile {
  /** True when this profile belongs to the signed-in user. */
  isSelf: boolean;
}

export interface FollowListUser {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  isFollowing: boolean;
  followsYou: boolean;
}

export interface FollowListPage {
  users: FollowListUser[];
  pagination: { cursor: string | null; hasMore: boolean; total?: number };
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  bio: string;
  /** Newly picked image. Omit to keep the current avatar. */
  avatar?: ImagePickerAsset | null;
}
