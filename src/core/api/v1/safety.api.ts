import { apiRequest } from '../client';

export const safetyApiV1 = {
  /** POST /safety/report */
  async reportUser(input: { username: string; reason?: string }): Promise<void> {
    await apiRequest('/safety/report', { method: 'POST', body: input, authenticated: 'optional' });
  },
};
