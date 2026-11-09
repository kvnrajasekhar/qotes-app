import { mapQuote } from '../../../features/feed/api/feedApi';
import type { QuoteItem } from '../../../features/feed/types/feed.types';
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
};
