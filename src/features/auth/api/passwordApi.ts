import { ApiRequestError, apiClient } from '../../../core/api/client';
import { ApiError } from './authApi';

async function post(path: string, body: Record<string, string>): Promise<void> {
  try {
    await apiClient.post<void>(path, body, undefined, false);
  } catch (error) {
    if (!(error instanceof ApiRequestError)) throw error;
    if (error.status === 429) {
      throw new ApiError(429, 'Too many attempts. Please wait a minute and try again.');
    }
    throw new ApiError(error.status, error.message);
  }
}

/** POST /auth/forgot-password. The server answers generically whether or not the account exists. */
export function requestPasswordReset(email: string): Promise<void> {
  return post('/auth/forgot-password', { email });
}

/** POST /auth/forgotpassword/:userId/:token */
export function resetPassword(params: {
  userId: string;
  token: string;
  newPassword: string;
  cnfPassword: string;
}): Promise<void> {
  const { userId, token, newPassword, cnfPassword } = params;
  return post(
    `/auth/forgotpassword/${encodeURIComponent(userId)}/${encodeURIComponent(token)}`,
    { newPassword, cnfPassword },
  );
}
