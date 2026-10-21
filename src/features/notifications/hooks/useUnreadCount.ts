import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '../../../shared/lib/env';
import { authStorage } from '../../../shared/lib/storage';

async function fetchUnreadCount(): Promise<number> {
  const { accessToken } = await authStorage.getTokens();
  if (!accessToken) return 0;

  const res = await fetch(`${API_BASE_URL}/notification/unread-count`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Unread count failed: ${res.status}`);

  const json = (await res.json()) as { data?: { unreadCount?: unknown } };
  const value = json.data?.unreadCount;
  return typeof value === 'number' && value > 0 ? value : 0;
}

/** Drives the tab-bar badge. Fails silently to 0 so a flaky endpoint never breaks navigation. */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });
  return data ?? 0;
}
