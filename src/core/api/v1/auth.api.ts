import { apiClient } from '../client';

export const authApiV1 = {
  logout: () => apiClient.post<void>('/auth/logout'),
};
