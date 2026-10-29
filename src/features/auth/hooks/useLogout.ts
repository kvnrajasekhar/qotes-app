import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ApiRequestError } from '../../../core/api/client';
import { authApiV1 } from '../../../core/api/v1/auth.api';
import { clearPersistentCache } from '../../../shared/lib/storage';
import { useAuth } from '../auth/AuthProvider';

export type LogoutResult = {
  serverLogoutSucceeded: boolean;
  localCleanupError?: unknown;
};

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async (): Promise<LogoutResult> => {
    if (isLoggingOut) return { serverLogoutSucceeded: false };
    setIsLoggingOut(true);

    let serverLogoutSucceeded = true;
    let localCleanupError: unknown;
    let localCleanupFailed = false;
    try {
      await authApiV1.logout();
    } catch (error) {
      serverLogoutSucceeded = false;
      if (error instanceof ApiRequestError) {
        console.error(`POST /auth/logout failed (${error.status}): ${error.message}`);
      } else {
        console.error('Server logout failed; signing out locally.', error);
      }
    } finally {
      try {
        await signOut();
      } catch (error) {
        localCleanupFailed = true;
        localCleanupError = error;
        console.error('Could not clear stored authentication credentials.', error);
      } finally {
        try {
          clearPersistentCache();
        } catch (error) {
          localCleanupFailed = true;
          localCleanupError ??= error;
          console.error('Could not clear the persisted application cache.', error);
        } finally {
          queryClient.clear();
          router.replace('/auth');
          setIsLoggingOut(false);
        }
      }
    }

    return { serverLogoutSucceeded, ...(localCleanupFailed ? { localCleanupError } : {}) };
  };

  return { logout, isLoggingOut };
}
