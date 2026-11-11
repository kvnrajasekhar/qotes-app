import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { userApiV1 } from '../../../core/api/v1/user.api';
import { useCurrentIdentity } from '../../profile/hooks/useCurrentIdentity';
import type { SuggestedWriter } from '../../profile/types/profile.types';
import { MOCK_WRITERS } from '../data/mockWriters';
import { IS_DEV_FALLBACK } from '../data/mockQuotes';

/** Most-followed writers, excluding the viewer. Falls back to sample writers in development. */
export function useSuggestedWriters(limit = 8) {
  const { identity } = useCurrentIdentity();
  const query = useQuery<SuggestedWriter[], Error>({
    queryKey: ['suggested-writers', limit],
    queryFn: ({ signal }) => userApiV1.getSuggestedWriters(limit, signal),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const writers = useMemo(() => {
    const fetched = query.data ?? [];
    const base = fetched.length === 0 && IS_DEV_FALLBACK && !query.isLoading ? MOCK_WRITERS : fetched;
    return base.filter((w) => w._id !== identity?.userId && w.username !== identity?.username);
  }, [query.data, query.isLoading, identity]);

  return { writers, isLoading: query.isLoading };
}
