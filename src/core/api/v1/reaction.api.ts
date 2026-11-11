import type { ReactionType } from '../../../features/feed/types/feed.types';
import { REACTION_TYPES } from '../../../features/feed/types/feed.types';
import type { ReactionUser, ReactionUsersPage } from '../../../features/reactions/types/reaction.types';
import { ApiRequestError, apiRequest } from '../client';

export type ReactionAction = 'add' | 'remove' | 'update';

type Raw = Record<string, unknown>;
const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

function mapReactionUser(raw: unknown, index: number): ReactionUser | null {
  if (!isRecord(raw)) return null;
  const type = str(raw.type);
  if (!(REACTION_TYPES as readonly string[]).includes(type)) return null;

  // The server nests the person under `user` and has used both `avatar` and `avatarUrl`.
  const user = isRecord(raw.user) ? raw.user : raw;
  const userId = str(user._id ?? raw.userId);
  const username = str(user.username);
  if (!userId || !username) return null;

  const avatarUrl = str(user.avatarUrl ?? user.avatar);
  return {
    id: str(raw._id) || `${userId}-${index}`,
    userId,
    username,
    ...(avatarUrl ? { avatarUrl } : {}),
    type: type as ReactionType,
    createdAt: str(raw.createdAt),
  };
}

export const reactionApiV1 = {
  /** POST /reaction/:quoteId/toggle. The server decides add / remove / update from its own state. */
  async toggle(quoteId: string, payload: { type: ReactionType; action: ReactionAction }): Promise<void> {
    await apiRequest(`/reaction/${encodeURIComponent(quoteId)}/toggle`, { method: 'POST', body: payload });
  },

  /** GET /reaction/:quoteId?type&cursor&limit: who reacted, optionally filtered by emotion. */
  async getUsers(
    quoteId: string,
    opts: { type?: ReactionType; cursor?: string; limit?: number; signal?: AbortSignal } = {},
  ): Promise<ReactionUsersPage> {
    try {
      const query = new URLSearchParams();
      if (opts.type !== undefined) query.set('type', opts.type);
      if (opts.cursor !== undefined) query.set('cursor', opts.cursor);
      query.set('limit', String(opts.limit ?? 20));
      const queryString = query.toString();
      const data = await apiRequest<unknown>(`/reaction/${encodeURIComponent(quoteId)}`, {
        ...(queryString ? { url: `/reaction/${encodeURIComponent(quoteId)}?${queryString}` } : {}),
        signal: opts.signal,
      });
      const src = isRecord(data) ? data : {};
      const pagination = isRecord(src.pagination) ? src.pagination : {};
      const cursor = str(pagination.nextCursor ?? pagination.cursor) || null;
      const rows = Array.isArray(src.users) ? src.users : [];
      return {
        users: rows.map(mapReactionUser).filter((u): u is ReactionUser => u !== null),
        pagination: { cursor, hasMore: pagination.hasMore === true && cursor !== null },
      };
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        return { users: [], pagination: { cursor: null, hasMore: false } };
      }
      throw err;
    }
  },
};
