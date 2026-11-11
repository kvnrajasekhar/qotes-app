import { mapPage, mapQuote } from '../../../features/feed/api/feedApi';
import type { FeedPage, QuoteItem } from '../../../features/feed/types/feed.types';
import { ApiRequestError, apiRequest } from '../client';

/** Server mounts the quote controller at /quote (no /v1 prefix today; see SERVER_PATCHES.md). */
export const QUOTE_PATH = '/quote';

export interface CreateQuotePayload {
  text: string;
  author?: string;
  category?: string;
  /** Without the leading "#". */
  hashtags: string[];
}

function toQuote(data: unknown): QuoteItem {
  const quote = mapQuote(data);
  if (!quote) throw new ApiRequestError(502, 'Unexpected quote response from the server.');
  return quote;
}

export const quoteApiV1 = {
  /** POST /quote */
  async create(payload: CreateQuotePayload): Promise<QuoteItem> {
    return toQuote(await apiRequest(QUOTE_PATH, { method: 'POST', body: payload }));
  },

  /** GET /quote/:id */
  async getById(id: string, signal?: AbortSignal): Promise<QuoteItem> {
    return toQuote(await apiRequest(`${QUOTE_PATH}/${encodeURIComponent(id)}`, { signal }));
  },

  /** POST /quote with isRequote. Empty `commentary` = "requote to profile". */
  async requote(parentQuoteId: string, commentary?: string): Promise<QuoteItem> {
    return toQuote(
      await apiRequest(QUOTE_PATH, {
        method: 'POST',
        body: { isRequote: true, parentQuoteId, text: commentary?.trim() ?? '' },
      }),
    );
  },

  /** GET /quote/:id/reflections: requotes-with-commentary of a quote. A 404 reads as "none yet". */
  async getReflections(
    id: string,
    opts: { cursor?: string; limit?: number; signal?: AbortSignal } = {},
  ): Promise<FeedPage> {
    try {
      const params = new URLSearchParams();
      if (opts.cursor) params.set('cursor', opts.cursor);
      params.set('limit', String(opts.limit ?? 10));

      const query = params.toString();
      const data = await apiRequest(
        `${QUOTE_PATH}/${encodeURIComponent(id)}/reflections${query ? `?${query}` : ''}`,
        { signal: opts.signal },
      );
      return mapPage(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        return { quotes: [], pagination: { cursor: null, hasMore: false } };
      }
      throw err;
    }
  },
};
