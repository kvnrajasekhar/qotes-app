import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { mapPage } from '../../../features/feed/api/feedApi';
import type { FeedPage } from '../../../features/feed/types/feed.types';
import type {
  FollowListKind,
  FollowListPage,
  FollowListUser,
  SuggestedWriter,
  UserProfile,
} from '../../../features/profile/types/profile.types';
import { ApiRequestError, apiRequest } from '../client';

/** Collections has no controller routes yet; see SERVER_PATCHES.md. */
export const SAVED_QUOTES_PATH = '/collections/default/items';

/* ------------------------------ mappers ------------------------------ */

type Raw = Record<string, unknown>;
const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const count = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

function withQuery(path: string, query: Record<string, string | number | undefined>): string {
  const params = Object.entries(query)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length ? `${path}?${params.join('&')}` : path;
}

function displayNameOf(first: string, last: string, username: string): string {
  return `${first} ${last}`.trim() || username;
}

export function mapProfile(raw: unknown): UserProfile {
  if (!isRecord(raw) || !str(raw._id) || !str(raw.username)) {
    throw new ApiRequestError(502, 'Unexpected profile response from the server.');
  }
  const stats = isRecord(raw.stats) ? raw.stats : {};
  const firstName = str(raw.firstName);
  const lastName = str(raw.lastName);
  const username = str(raw.username);
  const avatarUrl = str(raw.avatarUrl);

  return {
    _id: str(raw._id),
    username,
    firstName,
    lastName,
    displayName: displayNameOf(firstName, lastName, username),
    bio: str(raw.bio),
    ...(avatarUrl ? { avatarUrl } : {}),
    stats: {
      quoteCount: count(stats.quoteCount),
      followerCount: count(stats.followerCount),
      followingCount: count(stats.followingCount),
    },
    joinedAt: str(raw.createdAt) || undefined,
    isFollowing: raw.isFollowing === true,
    followsYou: raw.followsYou === true,
  };
}

function mapFollowUser(raw: unknown, kind: FollowListKind, isOwnList: boolean): FollowListUser | null {
  if (!isRecord(raw) || !str(raw._id) || !str(raw.username)) return null;
  const username = str(raw.username);
  const avatarUrl = str(raw.avatarUrl);
  return {
    _id: str(raw._id),
    username,
    displayName: displayNameOf(str(raw.firstName), str(raw.lastName), username),
    bio: str(raw.bio),
    ...(avatarUrl ? { avatarUrl } : {}),
    // The server only reports one direction per list; the other is implied when it's the viewer's own list.
    isFollowing: kind === 'following' && isOwnList ? true : raw.isFollowing === true,
    followsYou: kind === 'followers' && isOwnList ? true : raw.followsYou === true,
  };
}

function mapFollowPage(data: unknown, kind: FollowListKind, isOwnList: boolean): FollowListPage {
  const src = isRecord(data) ? data : {};
  // Followers come back as `users`, following as `following`.
  const rows = Array.isArray(src.users) ? src.users : Array.isArray(src.following) ? src.following : [];
  const pagination = isRecord(src.pagination) ? src.pagination : {};
  const cursor = str(pagination.nextCursor ?? pagination.cursor) || null;
  return {
    users: rows.map((r) => mapFollowUser(r, kind, isOwnList)).filter((u): u is FollowListUser => u !== null),
    pagination: { cursor, hasMore: pagination.hasMore === true && cursor !== null },
  };
}

function mapSuggestedWriter(raw: unknown): SuggestedWriter | null {
  if (!isRecord(raw) || !str(raw._id) || !str(raw.username)) return null;
  const stats = isRecord(raw.stats) ? raw.stats : {};
  const username = str(raw.username);
  const avatarUrl = str(raw.avatarUrl ?? raw.avatar);
  return {
    _id: str(raw._id),
    username,
    displayName: displayNameOf(str(raw.firstName), str(raw.lastName), username),
    ...(avatarUrl ? { avatarUrl } : {}),
    followerCount: count(stats.followerCount),
    isFollowing: false,
  };
}

/* ------------------------------ uploads ------------------------------ */

async function buildAvatarForm(asset: ImagePickerAsset): Promise<FormData> {
  const form = new FormData();
  const mime = asset.mimeType ?? 'image/jpeg';
  let name = asset.fileName ?? `avatar-${Date.now()}`;
  // The server derives the stored extension from the original name.
  if (!/\.[a-z0-9]+$/i.test(name)) name += `.${mime.split('/')[1] ?? 'jpg'}`;

  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    form.append('avatar', blob, name);
  } else {
    form.append('avatar', { uri: asset.uri, name, type: mime } as unknown as Blob);
  }
  return form;
}

/* -------------------------------- API -------------------------------- */

export const userApiV1 = {
  /** GET /user/u/:username (public; a token is attached when available). */
  async getProfile(username: string, signal?: AbortSignal): Promise<UserProfile> {
    const data = await apiRequest(`/user/u/${encodeURIComponent(username)}`, { signal });
    return mapProfile(data);
  },

  /** The current server's /user/profile/me handler is broken; resolve the authenticated user's username via the profile route. */
  async getCurrentProfile(username: string, signal?: AbortSignal): Promise<UserProfile> {
    const data = await apiRequest(`/user/u/${encodeURIComponent(username)}`, { signal });
    return mapProfile(data);
  },

  /** PATCH /user/profile/me */
  async updateProfile(fields: { firstName: string; lastName: string; bio: string }): Promise<void> {
    await apiRequest('/user/profile/me', { method: 'PATCH', body: fields });
  },

  /** PUT /user/avatar (multipart, field "avatar") */
  async uploadAvatar(asset: ImagePickerAsset): Promise<{ avatarUrl: string }> {
    const form = await buildAvatarForm(asset);
    const data = await apiRequest<{ avatarUrl?: string }>('/user/avatar', {
      method: 'PUT',
      body: form,
    });
    return { avatarUrl: data?.avatarUrl ?? '' };
  },

  /** POST /user/follow/:id. The server TOGGLES; `followed` is the resulting state. */
  async toggleFollow(targetUserId: string): Promise<{ followed: boolean }> {
    const data = await apiRequest<{ followed?: boolean }>(`/user/follow/${encodeURIComponent(targetUserId)}`, {
      method: 'POST',
    });
    return { followed: data?.followed === true };
  },

  /** GET /user/:userId/followers | /user/:userId/following */
  async getFollowList(
    userId: string,
    kind: FollowListKind,
    opts: { cursor?: string; limit?: number; viewerId?: string; signal?: AbortSignal } = {},
  ): Promise<FollowListPage> {
    const data = await apiRequest(withQuery(`/user/${encodeURIComponent(userId)}/${kind}`, {
      cursor: opts.cursor,
      limit: opts.limit ?? 20,
    }), {
      signal: opts.signal,
    });
    return mapFollowPage(data, kind, opts.viewerId === userId);
  },

  /** GET /feed/q/:userId: quotes created or echoed by a user. */
  async getUserQuotes(
    userId: string,
    opts: { cursor?: string; limit?: number; signal?: AbortSignal } = {},
  ): Promise<FeedPage> {
    const data = await apiRequest(withQuery(`/feed/q/${encodeURIComponent(userId)}`, {
      cursor: opts.cursor,
      limit: opts.limit ?? 10,
    }), {
      signal: opts.signal,
    });
    return mapPage(data);
  },

  /** Saved quotes for the signed-in user. A 404 (endpoint not deployed yet) reads as "nothing saved". */
  async getSavedQuotes(opts: { cursor?: string; limit?: number; signal?: AbortSignal } = {}): Promise<FeedPage> {
    try {
      const data = await apiRequest<Raw>(withQuery(SAVED_QUOTES_PATH, {
        cursor: opts.cursor,
        limit: opts.limit ?? 10,
      }), {
        signal: opts.signal,
      });
      const rows = isRecord(data) ? (data.items ?? data.quotes) : undefined;
      return mapPage({ quotes: rows, pagination: isRecord(data) ? data.pagination : undefined });
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        return { quotes: [], pagination: { cursor: null, hasMore: false } };
      }
      throw err;
    }
  },

  /** GET /user/suggested/public: most-followed writers; used by the "Your feed is quiet" state. */
  async getSuggestedWriters(limit = 8, signal?: AbortSignal): Promise<SuggestedWriter[]> {
    const data = await apiRequest<unknown>(withQuery('/user/suggested/public', { limit }), { signal });
    return (Array.isArray(data) ? data : []).map(mapSuggestedWriter).filter((w): w is SuggestedWriter => w !== null);
  },
};
