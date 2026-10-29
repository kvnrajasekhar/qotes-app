import { useQuery } from '@tanstack/react-query';

import { ApiRequestError } from '../../../core/api/client';
import { authStorage } from '../../../shared/lib/storage';
import { SESSION_IDENTITY_KEY, type SessionIdentity } from '../../../shared/lib/session';

function readIdentity(token: string): SessionIdentity {
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) {
    throw new ApiRequestError(401, 'Your session is invalid. Please sign in again.');
  }

  let payload: unknown;
  try {
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    payload = JSON.parse(atob(paddedBase64)) as unknown;
  } catch {
    throw new ApiRequestError(401, 'Your session is invalid. Please sign in again.');
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('userId' in payload) ||
    typeof payload.userId !== 'string' ||
    !payload.userId ||
    !('username' in payload) ||
    typeof payload.username !== 'string' ||
    !payload.username
  ) {
    throw new ApiRequestError(401, 'Your session is invalid. Please sign in again.');
  }

  return { userId: payload.userId, username: payload.username };
}

export function useCurrentIdentity() {
  const query = useQuery<SessionIdentity | null, ApiRequestError>({
    queryKey: SESSION_IDENTITY_KEY,
    queryFn: async () => {
      const { accessToken } = await authStorage.getTokens();
      if (!accessToken) return null;
      // Token claims identify the session; current profile data is fetched separately via /user/profile/me.
      return readIdentity(accessToken);
    },
    staleTime: 60_000,
    retryOnMount: false,
    retry: (failures, error) => error.status !== 401 && failures < 1,
  });

  return {
    identity: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
