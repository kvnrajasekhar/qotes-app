import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../../../shared/lib/env';
import { authStorage } from '../../../shared/lib/storage';
import {
  REACTION_TYPES,
  type FeedCategory,
  type FeedPage,
  type FeedType,
  type QuoteCreator,
  type QuoteItem,
  type ReactionCounts,
  type ReactionType,
} from '../types/feed.types';

/** The current server has no global `v1` prefix; see SERVER_PATCHES.md. */
export const FEED_PATHS: Record<FeedType, string> = {
  global: '/feed/global',
  following: '/feed/following',
  discover: '/feed/discover',
};
export const FEED_GLOBAL_PATH = FEED_PATHS.global;

export class FeedApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'FeedApiError';
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Defensive mapping: accept the documented contract AND the shape the */
/* server emits today (hashtags / saves / requotes / nextCursor).      */
/* ------------------------------------------------------------------ */

type Raw = Record<string, unknown>;
const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const asCount = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

function mapReactions(v: unknown): ReactionCounts {
  const src = isRecord(v) ? v : {};
  return REACTION_TYPES.reduce((acc, type) => {
    acc[type] = asCount(src[type]);
    return acc;
  }, {} as ReactionCounts);
}

function mapUserReaction(v: unknown): ReactionType | null {
  return typeof v === 'string' && (REACTION_TYPES as readonly string[]).includes(v) ? (v as ReactionType) : null;
}

function mapCreator(v: unknown): QuoteCreator {
  if (isRecord(v)) {
    const avatarUrl = asString(v.avatarUrl);
    return {
      _id: asString(v._id),
      username: asString(v.username, 'unknown'),
      ...(avatarUrl ? { avatarUrl } : {}),
    };
  }
  return { _id: asString(v), username: 'unknown' };
}

function mapTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`));
}

function mapQuoteAt(raw: unknown, depth: number): QuoteItem | null {
  if (!isRecord(raw)) return null;
  const _id = asString(raw._id);
  const text = asString(raw.text);
  const isRequote = raw.isRequote === true;
  // A plain requote ("requote to profile") carries no text of its own.
  if (!_id || (!text && !isRequote)) return null;

  const parentRaw = raw.parentQuote ?? raw.parent;
  const parent = depth === 0 && isRecord(parentRaw) ? mapQuoteAt(parentRaw, 1) : null;

  return {
    _id,
    text,
    author: asString(raw.author).trim() || 'Anonymous',
    creator: mapCreator(raw.creator),
    category: asString(raw.category),
    tags: mapTags(raw.tags ?? raw.hashtags),
    reactions: mapReactions(raw.reactions),
    userReaction: mapUserReaction(raw.userReaction),
    savesCount: asCount(raw.savesCount ?? raw.saves),
    repostsCount: asCount(raw.repostsCount ?? raw.requotes),
    isSaved: raw.isSaved === true,
    createdAt: asString(raw.createdAt),
    isRequote,
    parentQuoteId: asString(raw.parentQuoteId) || parent?._id || undefined,
    parent: parent ?? undefined,
    viewerRequoted: raw.viewerRequoted === true,
  };
}

export function mapQuote(raw: unknown): QuoteItem | null {
  return mapQuoteAt(raw, 0);
}

export function mapPage(data: unknown): FeedPage {
  const src = isRecord(data) ? data : {};
  const pagination = isRecord(src.pagination) ? src.pagination : {};
  const quotes = (Array.isArray(src.quotes) ? src.quotes : [])
    .map((q) => mapQuote(q))
    .filter((q): q is QuoteItem => q !== null);

  const cursor = asString(pagination.cursor ?? pagination.nextCursor) || null;
  return { quotes, pagination: { cursor, hasMore: pagination.hasMore === true && cursor !== null } };
}

/* ------------------------------------------------------------------ */

export interface FetchFeedParams {
  type?: FeedType;
  cursor?: string;
  limit: number;
  category?: FeedCategory;
  signal?: AbortSignal;
}

export async function fetchFeed({ type = 'global', cursor, limit, category, signal }: FetchFeedParams): Promise<FeedPage> {
  const { accessToken } = await authStorage.getTokens();

  const query = [`limit=${limit}`];
  if (cursor) query.push(`cursor=${encodeURIComponent(cursor)}`);
  if (category && category !== 'All') query.push(`category=${encodeURIComponent(category)}`);

  // Combine caller cancellation (TanStack Query) with our own timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort());

  let res: Response;
  try {
    const headers: HeadersInit = { Accept: 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    res = await fetch(`${API_BASE_URL}${FEED_PATHS[type]}?${query.join('&')}`, {
      headers,
      signal: controller.signal,
    });
  } catch {
    throw new FeedApiError(0, 'Network error. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  const json = (await res.json().catch(() => null)) as { message?: unknown; data?: unknown } | null;
  if (!res.ok) {
    const message = typeof json?.message === 'string' ? json.message : 'Could not load your feed.';
    throw new FeedApiError(res.status, message);
  }
  return mapPage(json?.data);
}
