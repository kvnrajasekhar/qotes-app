import type { ReactionType } from '../../../features/feed/types/feed.types';
import { apiRequest } from '../client';

export type ReactionAction = 'add' | 'remove' | 'update';

export const reactionApiV1 = {
  /** POST /reaction/:quoteId/toggle. The server decides add / remove / update from its own state. */
  async toggle(quoteId: string, payload: { type: ReactionType; action: ReactionAction }): Promise<void> {
    await apiRequest(`/reaction/${encodeURIComponent(quoteId)}/toggle`, { method: 'POST', body: payload });
  },
};
