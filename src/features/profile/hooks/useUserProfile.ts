import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ApiRequestError } from '../../../core/api/client';
import { userApiV1 } from '../../../core/api/v1/user.api';
import type { UserProfile, ViewerProfile } from '../types/profile.types';
import { profileKeys } from './profileKeys';
import { useCurrentIdentity } from './useCurrentIdentity';

export function useUserProfile(username?: string) {
  const { identity } = useCurrentIdentity();

  const query = useQuery<UserProfile, ApiRequestError>({
    queryKey: profileKeys.user(username ?? ''),
    queryFn: ({ signal }) => userApiV1.getProfile(username as string, signal),
    enabled: Boolean(username),
    staleTime: 60_000,
    retry: (failures, err) => err.status !== 404 && failures < 2,
  });

  const profile = useMemo<ViewerProfile | undefined>(() => {
    if (!query.data) return undefined;
    const isSelf =
      identity?.userId === query.data._id ||
      identity?.username.toLowerCase() === query.data.username.toLowerCase();
    return { ...query.data, isSelf: Boolean(isSelf) };
  }, [query.data, identity]);

  return {
    profile,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    notFound: query.error?.status === 404,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

/** The signed-in user's own profile (username comes from the access token). */
export function useCurrentUserProfile() {
  const queryClient = useQueryClient();
  const identityState = useCurrentIdentity();
  const { identity } = identityState;
  const query = useQuery<UserProfile, ApiRequestError>({
    queryKey: ['profile', 'current', identity?.userId ?? ''],
    queryFn: async ({ signal }) => {
      const profile = await userApiV1.getCurrentProfile(signal);
      queryClient.setQueryData(profileKeys.user(profile.username), profile);
      return profile;
    },
    enabled: Boolean(identity),
    staleTime: 60_000,
    retry: (failures, err) => err.status !== 404 && failures < 2,
  });

  const profile = useMemo<ViewerProfile | undefined>(
    () => query.data ? { ...query.data, isSelf: true } : undefined,
    [query.data],
  );

  return {
    profile,
    isLoading: identityState.isLoading || query.isLoading,
    isError: !profile && (identityState.error !== undefined || query.isError),
    error: identity ? query.error : identityState.error,
    refetch: identity ? query.refetch : identityState.refetch,
    signedOut: !identityState.isLoading && !identity && !identityState.error,
  };
}
