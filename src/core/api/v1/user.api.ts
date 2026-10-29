import type { ImagePickerAsset } from 'expo-image-picker';

import { apiClient } from '../client';
import type { FollowListKind, FollowListPage, FollowListUser, UserProfile } from '../../../features/profile/types/profile.types';

type Raw = Record<string, unknown>;
const record = (value: unknown): Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Raw : {};
const string = (value: unknown): string => typeof value === 'string' ? value : '';
const count = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;

function mapProfile(value: unknown): UserProfile {
  const raw = record(value);
  const stats = record(raw.stats);
  const username = string(raw.username);
  const firstName = string(raw.firstName);
  const lastName = string(raw.lastName);
  const avatarUrl = string(raw.avatarUrl);
  return {
    _id: string(raw._id),
    username,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim() || username,
    bio: string(raw.bio),
    ...(avatarUrl ? { avatarUrl } : {}),
    stats: {
      quoteCount: count(stats.quoteCount),
      followerCount: count(stats.followerCount),
      followingCount: count(stats.followingCount),
    },
    ...(typeof raw.createdAt === 'string' ? { joinedAt: raw.createdAt } : {}),
    isFollowing: raw.isFollowing === true,
    followsYou: raw.followsYou === true,
    isBlocked: raw.isBlocked === true,
  };
}

function mapFollowList(value: unknown): FollowListPage {
  const raw = record(value);
  const pagination = record(raw.pagination);
  const users = Array.isArray(raw.users) ? raw.users : [];
  return {
    users: users.map((item): FollowListUser => {
      const user = record(item);
      const username = string(user.username);
      const firstName = string(user.firstName);
      const lastName = string(user.lastName);
      const avatarUrl = string(user.avatarUrl);
      return {
        _id: string(user._id),
        username,
        displayName: `${firstName} ${lastName}`.trim() || username,
        bio: string(user.bio),
        ...(avatarUrl ? { avatarUrl } : {}),
        isFollowing: user.isFollowing === true,
        followsYou: user.followsYou === true,
      };
    }).filter((user) => Boolean(user._id && user.username)),
    pagination: {
      cursor: typeof pagination.cursor === 'string' ? pagination.cursor :
        typeof pagination.nextCursor === 'string' ? pagination.nextCursor : null,
      hasMore: pagination.hasMore === true,
      ...(typeof pagination.total === 'number' ? { total: count(pagination.total) } : {}),
    },
  };
}

export const userApiV1 = {
  async getProfile(username: string, signal?: AbortSignal): Promise<UserProfile> {
    return mapProfile(await apiClient.get(`/user/u/${encodeURIComponent(username)}`, signal, false));
  },

  async getCurrentProfile(signal?: AbortSignal): Promise<UserProfile> {
    return mapProfile(await apiClient.get('/user/profile/me', signal));
  },

  async updateProfile(input: { firstName: string; lastName: string; bio: string }): Promise<UserProfile> {
    return mapProfile(await apiClient.patch('/user/profile/me', input));
  },

  async uploadAvatar(asset: ImagePickerAsset): Promise<string> {
    const form = new FormData();
    form.append('avatar', {
      uri: asset.uri,
      name: asset.fileName ?? 'avatar.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
    const result = record(await apiClient.put<{ avatarUrl?: unknown }>('/user/avatar', form));
    if (typeof result.avatarUrl !== 'string' || !result.avatarUrl) {
      throw new Error('The server did not return the updated avatar.');
    }
    return result.avatarUrl;
  },

  async toggleFollow(userId: string): Promise<{ followed: boolean; followerCount?: number }> {
    const result = record(await apiClient.post('/user/' + encodeURIComponent(userId) + '/follow'));
    return {
      followed: result.followed === true,
      ...(typeof result.followerCount === 'number' ? { followerCount: count(result.followerCount) } : {}),
    };
  },

  async getFollowList(
    userId: string,
    kind: FollowListKind,
    options: { cursor?: string; limit: number; signal?: AbortSignal },
  ): Promise<FollowListPage> {
    const query = new URLSearchParams({ limit: String(options.limit) });
    if (options.cursor) query.set('cursor', options.cursor);
    const result = await apiClient.get(
      `/user/${encodeURIComponent(userId)}/${kind}?${query.toString()}`,
      options.signal,
    );
    return mapFollowList(result);
  },
};
