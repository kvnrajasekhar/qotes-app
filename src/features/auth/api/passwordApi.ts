import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../components/config';
import { ApiError } from './authApi';

async function post(path: string, body: Record<string, string>): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, 'Network error. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.ok) return;

  const json = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  if (res.status === 429) {
    throw new ApiError(429, 'Too many attempts. Please wait a minute and try again.');
  }
  const message = Array.isArray(json?.message) ? json?.message.join(' ') : json?.message;
  throw new ApiError(res.status, message || 'Something went wrong. Try again.');
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
